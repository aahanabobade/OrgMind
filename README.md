# OrgMind — Company Intelligence Assistant

> **Hybrid Knowledge Graph + Vector Search RAG** &nbsp;·&nbsp; Neo4j &nbsp;·&nbsp; Pinecone &nbsp;·&nbsp; GPT-4o &nbsp;·&nbsp; LangChain &nbsp;·&nbsp; React &nbsp;·&nbsp; Python

<br/>

![Architecture](https://img.shields.io/badge/Architecture-Hybrid%20GraphRAG-4285f4?style=for-the-badge)
![Neo4j](https://img.shields.io/badge/Neo4j-AuraDB-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-00B388?style=for-the-badge)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)

<br/>

---

## What Is This?

Most company knowledge is trapped across two completely separate systems that never talk to each other.

**Org charts and HR tools** know who reports to whom, who owns which project, and how teams are structured — but they cannot search what people have actually written.

**Search tools** like Google Drive or Confluence can find documents that mention a keyword — but they have no concept of relationships, ownership, or structure.

OrgMind closes this gap by combining both into a single intelligent assistant. Ask it anything that touches *who* and *what* simultaneously:

```
"Who should I talk to about the payments feature,
 and what have they written about security?"
```

OrgMind responds in under 5 seconds:

> *"Alice leads the Payments team. In her March 2024 architecture doc, she specifically argued that all payment APIs must enforce TLS 1.3 — here's the relevant section."*

No manual org chart digging. No keyword searching. One question, one answer, with cited sources.

<br/>

---

## How It Works

Every query runs through a 4-stage pipeline:

```
User Question
      │
      ▼
┌──────────────────────────────┐
│  Stage 1: Query Decomposition │  ← LLM extracts entities + classifies intent
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌────────────┐    ┌─────────────────┐
│   Neo4j    │    │    Pinecone     │
│  Graph DB  │    │   Vector Store  │
│ Traversal  │    │   Retrieval     │
└─────┬──────┘    └──────┬──────────┘
      │                  │
      └─────────┬─────────┘
                ▼
┌──────────────────────────────┐
│  Stage 4: Context Fusion     │  ← GPT-4o writes a grounded, cited answer
└──────────────────────────────┘
```

**Stage 1 — Query Decomposition**
The user's natural language question is parsed by an LLM that extracts named entities (people, projects, teams) and classifies intent as relational, semantic, or hybrid.

**Stage 2 — Graph Traversal**
Named entities are used to construct a Cypher query against Neo4j AuraDB. The graph returns structured relationship paths — for example `(Alice)-[:MANAGES]->(Bob)-[:WORKS_ON]->(ProjectApollo)`.

**Stage 3 — Vector Retrieval**
The original question is embedded using OpenAI `text-embedding-3-small` and queried against Pinecone. Metadata filters (author, team, date) derived from Stage 2 boost precision significantly.

**Stage 4 — Context Fusion & Generation**
Graph paths and top-k document chunks are merged into a structured prompt. GPT-4o generates a grounded answer with traceable provenance for every claim.

<br/>

---

## Why Two Databases?

| Question | Neo4j (Graph) | Pinecone (Vector) |
|---|---|---|
| Who owns the payments service? | ✅ Instant traversal | ❌ Not its job |
| What has Alice written about security? | ❌ Not its job | ✅ Semantic similarity |
| Who manages the team that owns Project Apollo? | ✅ Multi-hop graph query | ❌ Not its job |
| Find docs about TLS even if I ask about "endpoint protection" | ❌ Not its job | ✅ Meaning-based retrieval |
| Who wrote the most about authentication this quarter? | ✅ Hybrid | ✅ Hybrid |

Standard RAG handles rows 2 and 4. OrgMind handles all five.

<br/>

---

## Tech Stack

| Layer | Tool | Purpose |
|---|---|---|
| Knowledge Graph | Neo4j AuraDB | Stores relationships between people, teams, projects, documents |
| Vector Database | Pinecone | Stores semantic embeddings of all organizational documents |
| Embeddings | OpenAI text-embedding-3-small | Converts text into meaning vectors for similarity search |
| Orchestration | LangChain | Chains all pipeline stages and manages prompt templates |
| LLM | GPT-4o | Query decomposition, entity extraction, answer generation |
| Frontend | React | Chat interface with source citations and pipeline trace |
| Backend | Python 3.11 + FastAPI | API layer connecting frontend to pipeline |

<br/>

---

## Project Structure

```
orgmind/
├── frontend/               # React chat interface
├── backend/                # FastAPI server and API routes
├── pipeline/               # 4-stage query pipeline
│   ├── decompose.py        # Stage 1: LLM query decomposition
│   ├── graph_retriever.py  # Stage 2: Neo4j Cypher traversal
│   ├── vector_retriever.py # Stage 3: Pinecone semantic search
│   └── fusion.py           # Stage 4: Context fusion and generation
├── graph_db/               # Neo4j schema and data loading scripts
├── vector_db/              # Embedding generation and Pinecone indexing
├── data/                   # Synthetic company dataset
├── tests/                  # Test suite
├── test_connections.py     # Verify all service connections
├── .env.example            # Environment variable template
└── README.md
```

<br/>

---

## Getting Started

### Prerequisites

```
Python 3.11+
Node.js 18+
Neo4j AuraDB account  (free tier works)
Pinecone account      (free tier works)
OpenAI API key
```

### 1. Clone and install

```bash
git clone https://github.com/aahanabobade/OrgMind.git
cd OrgMind

# Python dependencies
pip install -r requirements.txt

# Frontend dependencies
cd frontend && npm install
```

### 2. Configure environment variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_key

NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=orgmind-docs
```

### 3. Verify all connections

```bash
python test_connections.py
```

### 4. Load data

```bash
python graph_db/load_graph.py
python vector_db/embed_documents.py
```

### 5. Run

```bash
# Terminal 1 — backend
uvicorn backend.main:app --reload

# Terminal 2 — frontend
cd frontend && npm run dev
```

<br/>

---

## Dataset

Synthetic company dataset simulating a realistic mid-size technology organization:

```
50 employees    8 teams    15 projects    100+ internal documents
```

Documents include architecture notes, meeting summaries, and technical proposals.

**Graph Schema**

```
Nodes:         Person · Team · Project · Document · Skill

Relationships: MANAGES · BELONGS_TO · WORKS_ON · WROTE · HAS_SKILL · OWNS · RELATED_TO
```

<br/>

---

## Example Queries

```
"Who owns the payments service and what have they written about fraud detection?"

"Which team is responsible for Kubernetes infrastructure, and who leads it?"

"Find all documents written by engineers on the Platform team about performance."

"Who should I contact about authentication — and what is their stance on OAuth vs SAML?"
```

<br/>

---

## Why This Is Different From Standard RAG

The typical RAG project: **chunk a PDF → store in Pinecone → query with GPT**. This works for document-only questions but fails when the answer requires understanding organizational relationships.

OrgMind implements **GraphRAG** — a technique being actively explored at:

| Organization | Work |
|---|---|
| Microsoft | GraphRAG (open-sourced 2024) |
| Google DeepMind | KG-RAG research papers |
| Neo4j | LLM Graph Builder |

Building this demonstrates architectural thinking: knowing where standard tools fall short and designing a system that routes different sub-problems to specialized backends.

<br/>

---



<div align="center">

Built by [Aahana Bobade](https://github.com/aahanabobade)

**Neo4j &nbsp;·&nbsp; Pinecone &nbsp;·&nbsp; LangChain &nbsp;·&nbsp; OpenAI &nbsp;·&nbsp; React &nbsp;·&nbsp; Python**

*If this helped you, drop a ⭐*

</div>
