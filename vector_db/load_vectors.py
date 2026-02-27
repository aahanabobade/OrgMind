# vector_db/load_vectors.py
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
from data.company_data import DOCUMENTS, PEOPLE

load_dotenv()

# --- Clients ---
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

# --- Step 1: Create index if it doesn't exist ---
existing_indexes = pc.list_indexes().names()

if INDEX_NAME not in existing_indexes:
    print(f"Creating Pinecone index: {INDEX_NAME}...")
    pc.create_index(
        name=INDEX_NAME,
        dimension=1536,          # text-embedding-3-small outputs 1536 dimensions
        metric="cosine",         # cosine similarity — best for semantic search
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    print(" Index created!")
else:
    print(f" Index '{INDEX_NAME}' already exists")

index = pc.Index(INDEX_NAME)

# --- Helper: build author lookup ---
author_lookup = {p["id"]: p["name"] for p in PEOPLE}

# --- Step 2: Embed and upsert each document ---
def embed_text(text):
    response = openai_client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

print(f"\nEmbedding and uploading {len(DOCUMENTS)} documents...")

vectors = []
for doc in DOCUMENTS:
    print(f"  Embedding: {doc['title']}...")
    
    # What we embed: title + content together for richer meaning
    text_to_embed = f"{doc['title']}\n\n{doc['content'].strip()}"
    embedding = embed_text(text_to_embed)
    
    vectors.append({
        "id": doc["id"],
        "values": embedding,
        "metadata": {
            "title":     doc["title"],
            "author_id": doc["author_id"],
            "author":    author_lookup.get(doc["author_id"], "Unknown"),
            "project_id":doc["project_id"],
            "date":      doc["date"],
            "content":   doc["content"].strip()
        }
    })

# Upsert all vectors in one batch
index.upsert(vectors=vectors)
print(f"\n{len(vectors)} documents loaded into Pinecone!")

# --- Step 3: Verify ---
stats = index.describe_index_stats()
print(f"Index stats: {stats.total_vector_count} vectors stored")
print("\n Vector DB ready!")