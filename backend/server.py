# backend/server.py
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pipeline.hybrid_pipeline import (
    decompose_query, query_graph, query_vectors, generate_answer
)

app = FastAPI(title="OrgMind API")

# Allow React dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

@app.get("/")
def health():
    return {"status": "OrgMind API is running"}

@app.post("/ask")
def ask(request: QuestionRequest):
    question = request.question

    # Stage 1: Decompose
    decomposed = decompose_query(question)

    # Stage 2: Graph
    graph_context = ""
    if decomposed.get("needs_graph"):
        graph_context = query_graph(decomposed.get("entities", []))

    # Stage 3: Vector
    doc_context = []
    if decomposed.get("needs_vector"):
        doc_context = query_vectors(decomposed.get("search_topic", question))

    # Stage 4: Generate
    answer = generate_answer(question, graph_context, doc_context)

    return {
        "answer": answer,
        "debug": {
            "entities":   decomposed.get("entities", []),
            "search_topic": decomposed.get("search_topic", ""),
            "needs_graph": decomposed.get("needs_graph"),
            "needs_vector": decomposed.get("needs_vector"),
            "documents": [
                {"title": d["title"], "author": d["author"], "score": d["score"]}
                for d in doc_context
            ],
            "graph_context": graph_context
        }
    }