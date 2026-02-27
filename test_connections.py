import os
from dotenv import load_dotenv
from neo4j import GraphDatabase
from pinecone import Pinecone
from openai import OpenAI

load_dotenv()

# --- Te-
print("Testing Neo4j...")
driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)
driver.verify_connectivity()
print("✅ Neo4j connected!")
driver.close()

# --- Test Pinecone ---
print("Testing Pinecone...")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
print(f"✅ Pinecone connected! Indexes: {pc.list_indexes().names()}")

# --- Test OpenAI ---
print("Testing OpenAI...")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
response = client.embeddings.create(
    input="Hello OrgMind",
    model="text-embedding-3-small"
)
print(f"✅ OpenAI connected! Embedding dimension: {len(response.data[0].embedding)}")

print("\n🚀 All systems go! Ready to build.")