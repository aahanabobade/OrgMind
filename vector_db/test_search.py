# vector_db/test_search.py
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def search(query, top_k=3):
    print(f"Query: '{query}'")
    
    # Embed the query
    response = openai_client.embeddings.create(
        input=query,
        model="text-embedding-3-small"
    )
    query_vector = response.data[0].embedding
    
    # Search Pinecone
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        include_metadata=True
    )
    
    for i, match in enumerate(results.matches):
        print(f"\n  Result #{i+1} (score: {match.score:.3f})")
        print(f"  Title:  {match.metadata['title']}")
        print(f"  Author: {match.metadata['author']}")
        print(f"  Date:   {match.metadata['date']}")

# --- Test with different queries ---
search("TLS encryption and API security")
search("how does the checkout process work")
search("who is responsible for user authentication")
search("data processing and kafka pipelines")