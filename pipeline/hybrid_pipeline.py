# pipeline/hybrid_pipeline.py
import os
import sys
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from neo4j import GraphDatabase
from pinecone import Pinecone
from openai import OpenAI

load_dotenv()

# --- Clients ---
driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# =============================================================
# STAGE 1 — Query Decomposition
# Ask the LLM to break the question into structured sub-queries
# =============================================================

def decompose_query(question: str) -> dict:
    """
    Uses GPT to extract:
    - people/teams/projects mentioned (for Neo4j)
    - the semantic topic to search (for Pinecone)
    - what type of query this is
    """
    prompt = f"""
You are a query analyzer for a company intelligence system.

Given a user question, extract the following as JSON:
1. "entities": list of specific names of people, teams, or projects mentioned
2. "search_topic": a clean phrase describing what content to search for in documents
3. "needs_graph": true if the question needs relationship/org data (who manages, who owns, which team)
4. "needs_vector": true if the question needs document content search

Question: {question}

Respond ONLY with valid JSON, no explanation. Example:
{{
  "entities": ["Alice Chen", "Payments Team"],
  "search_topic": "payment API security standards",
  "needs_graph": true,
  "needs_vector": true
}}
"""
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    
    raw = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


# =============================================================
# STAGE 2 — Graph Retrieval (Neo4j)
# =============================================================

def query_graph(entities: list) -> str:
    """
    Given a list of entity names, fetch all relevant relationships
    from the Neo4j graph and return them as readable text.
    """
    if not entities:
        return ""
    
    results = []
    
    with driver.session() as session:
        for entity in entities:
            # Search people
            people = session.run("""
                MATCH (p:Person)
                WHERE toLower(p.name) CONTAINS toLower($name)
                OPTIONAL MATCH (p)-[:BELONGS_TO]->(t:Team)
                OPTIONAL MATCH (p)-[:MANAGES]->(report:Person)
                OPTIONAL MATCH (manager:Person)-[:MANAGES]->(p)
                OPTIONAL MATCH (p)-[:WORKS_ON]->(proj:Project)
                OPTIONAL MATCH (p)-[:WROTE]->(d:Document)
                RETURN p.name AS person, p.role AS role,
                       t.name AS team,
                       collect(DISTINCT report.name) AS manages,
                       collect(DISTINCT manager.name) AS managed_by,
                       collect(DISTINCT proj.name) AS works_on,
                       collect(DISTINCT d.title) AS wrote
            """, name=entity)
            
            for record in people:
                r = dict(record)
                if r["person"]:
                    results.append(f"""
Person: {r['person']}
  Role: {r['role']}
  Team: {r['team']}
  Manages: {', '.join(r['manages']) or 'nobody'}
  Managed by: {', '.join(r['managed_by']) or 'nobody'}
  Works on: {', '.join(r['works_on']) or 'nothing listed'}
  Documents written: {', '.join(r['wrote']) or 'none'}""")

            # Search teams
            teams = session.run("""
                MATCH (t:Team)
                WHERE toLower(t.name) CONTAINS toLower($name)
                OPTIONAL MATCH (p:Person)-[:BELONGS_TO]->(t)
                OPTIONAL MATCH (t)-[:OWNS]->(proj:Project)
                RETURN t.name AS team,
                       collect(DISTINCT p.name) AS members,
                       collect(DISTINCT proj.name) AS projects
            """, name=entity)
            
            for record in teams:
                r = dict(record)
                if r["team"]:
                    results.append(f"""
Team: {r['team']}
  Members: {', '.join(r['members'])}
  Owns projects: {', '.join(r['projects'])}""")

            # Search projects
            projects = session.run("""
                MATCH (proj:Project)
                WHERE toLower(proj.name) CONTAINS toLower($name)
                OPTIONAL MATCH (t:Team)-[:OWNS]->(proj)
                OPTIONAL MATCH (p:Person)-[:WORKS_ON]->(proj)
                RETURN proj.name AS project,
                       t.name AS owned_by,
                       collect(DISTINCT p.name) AS engineers
            """, name=entity)
            
            for record in projects:
                r = dict(record)
                if r["project"]:
                    results.append(f"""
Project: {r['project']}
  Owned by: {r['owned_by']}
  Engineers: {', '.join(r['engineers'])}""")

    return "\n".join(results) if results else ""


# =============================================================
# STAGE 3 — Vector Retrieval (Pinecone)
# =============================================================

def query_vectors(search_topic: str, top_k: int = 3) -> list:
    """
    Embed the search topic and find the most relevant documents.
    Returns a list of document dicts with title, author, content.
    """
    response = openai_client.embeddings.create(
        input=search_topic,
        model="text-embedding-3-small"
    )
    query_vector = response.data[0].embedding
    
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        include_metadata=True
    )
    
    docs = []
    for match in results.matches:
        if match.score > 0.15:  # filter out very weak matches
            docs.append({
                "title":   match.metadata["title"],
                "author":  match.metadata["author"],
                "date":    match.metadata["date"],
                "content": match.metadata["content"],
                "score":   round(match.score, 3)
            })
    return docs


# =============================================================
# STAGE 4 — Context Fusion & Answer Generation
# =============================================================

def generate_answer(question: str, graph_context: str, doc_context: list) -> str:
    """
    Combine graph relationships + document content into a prompt
    and ask the LLM to generate a grounded, cited answer.
    """
    # Format document context
    docs_text = ""
    for i, doc in enumerate(doc_context):
        docs_text += f"""
[Document {i+1}: "{doc['title']}" by {doc['author']} ({doc['date']})]
{doc['content']}
"""

    prompt = f"""You are OrgMind, a friendly company intelligence assistant for Google.
Your goal is to give clear, helpful answers that even a brand-new employee on their first day can understand.

RULES:
- Write in plain, simple English. Avoid jargon unless you explain it.
- Use a friendly, direct tone — like a senior colleague helping a new joiner.
- Structure your answer clearly:
  * Start with a 1-2 sentence direct answer (the "bottom line up front")
  * Then give details with context
  * End with a "Why this matters" or "Good to know" line if relevant
- Always say WHERE the information comes from (which person, which document, which team)
- If something is technical, add a simple analogy or plain-English explanation in brackets
- Keep answers concise but complete — aim for 150-250 words

=== ORGANIZATIONAL RELATIONSHIPS (from graph database) ===
{graph_context if graph_context else "No relationship data retrieved."}

=== RELEVANT DOCUMENTS (from document search) ===
{docs_text if docs_text else "No documents retrieved."}

=== USER QUESTION ===
{question}

=== YOUR ANSWER (friendly, clear, fresher-friendly) ==="""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    
    return response.choices[0].message.content.strip()


# =============================================================
# MAIN — The Full Pipeline
# =============================================================

def ask(question: str) -> str:
    print(f"\n{'='*60}")
    print(f"❓ Question: {question}")
    print(f"{'='*60}")
    
    # Stage 1: Decompose
    print("\n⚙️  Stage 1: Decomposing query...")
    decomposed = decompose_query(question)
    print(f"   Entities: {decomposed.get('entities', [])}")
    print(f"   Search topic: {decomposed.get('search_topic', '')}")
    print(f"   Needs graph: {decomposed.get('needs_graph')} | Needs vector: {decomposed.get('needs_vector')}")
    
    # Stage 2: Graph retrieval
    graph_context = ""
    if decomposed.get("needs_graph"):
        print("\n🔗 Stage 2: Querying Neo4j graph...")
        graph_context = query_graph(decomposed.get("entities", []))
        print(f"   Found: {len(graph_context.splitlines())} lines of relationship data")
    
    # Stage 3: Vector retrieval
    doc_context = []
    if decomposed.get("needs_vector"):
        print("\n📄 Stage 3: Searching Pinecone vectors...")
        doc_context = query_vectors(decomposed.get("search_topic", question))
        print(f"   Found: {len(doc_context)} relevant documents")
        for doc in doc_context:
            print(f"   → {doc['title']} (score: {doc['score']})")
    
    # Stage 4: Generate answer
    print("\n✍️  Stage 4: Generating answer...")
    answer = generate_answer(question, graph_context, doc_context)
    
    print(f"\n💬 Answer:\n{answer}")
    return answer


# --- Test it! ---
if __name__ == "__main__":
    ask("Who should I talk to about the payments feature, and what have they written about security?")
    ask("Who manages the security team and what are their policies on authentication?")
    ask("Which team owns the API Gateway and what does their architecture look like?")