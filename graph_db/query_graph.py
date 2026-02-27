# graph_db/query_graph.py
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)

def run_query(title, query, params={}):
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")
    with driver.session() as session:
        results = session.run(query, params)
        for record in results:
            print(dict(record))

# --- Query 1: All teams and their members ---
run_query(
    "Who is on each team?",
    """
    MATCH (p:Person)-[:BELONGS_TO]->(t:Team)
    RETURN t.name AS team, collect(p.name) AS members
    ORDER BY t.name
    """
)

# --- Query 2: Who manages who ---
run_query(
    "Who manages who?",
    """
    MATCH (manager:Person)-[:MANAGES]->(report:Person)
    RETURN manager.name AS manager, report.name AS report
    ORDER BY manager.name
    """
)

# --- Query 3: Which team owns which project ---
run_query(
    "Which team owns which project?",
    """
    MATCH (t:Team)-[:OWNS]->(proj:Project)
    RETURN t.name AS team, proj.name AS project
    ORDER BY t.name
    """
)

# --- Query 4: What has Alice written? ---
run_query(
    "What has Alice Chen written?",
    """
    MATCH (p:Person {name: 'Alice Chen'})-[:WROTE]->(d:Document)
    RETURN p.name AS author, d.title AS document, d.date AS date
    """
)

# --- Query 5: Multi-hop — who owns payments and what did they write? ---
run_query(
    "Who belongs to the Payments Team and what docs did they write?",
    """
    MATCH (p:Person)-[:BELONGS_TO]->(t:Team {name: 'Payments Team'})
    OPTIONAL MATCH (p)-[:WROTE]->(d:Document)
    RETURN p.name AS person, p.role AS role, collect(d.title) AS documents
    """
)

# --- Query 6: Multi-hop — security team's projects and authors ---
run_query(
    "What projects does the Security Team own, and who works on them?",
    """
    MATCH (t:Team {name: 'Security Team'})-[:OWNS]->(proj:Project)
    OPTIONAL MATCH (p:Person)-[:WORKS_ON]->(proj)
    RETURN proj.name AS project, collect(p.name) AS engineers
    """
)

driver.close()
print("\nAll queries done!")