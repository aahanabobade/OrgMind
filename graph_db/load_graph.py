# graph_db/load_graph.py
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from neo4j import GraphDatabase
from data.company_data import PEOPLE, TEAMS, PROJECTS, MANAGES, WORKS_ON, DOCUMENTS

load_dotenv()

driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)

def clear_graph(tx):
    tx.run("MATCH (n) DETACH DELETE n")
    print("  Cleared existing graph")

def load_teams(tx):
    for team in TEAMS:
        tx.run("""
            CREATE (t:Team {id: $id, name: $name, department: $department})
        """, **team)
    print(f"Loaded {len(TEAMS)} teams")

def load_people(tx):
    for person in PEOPLE:
        tx.run("""
            CREATE (p:Person {id: $id, name: $name, role: $role})
        """, id=person["id"], name=person["name"], role=person["role"])
    print(f" Loaded {len(PEOPLE)} people")

def load_projects(tx):
    for project in PROJECTS:
        tx.run("""
            CREATE (proj:Project {id: $id, name: $name, status: $status})
        """, id=project["id"], name=project["name"], status=project["status"])
    print(f"Loaded {len(PROJECTS)} projects")

def load_documents(tx):
    for doc in DOCUMENTS:
        tx.run("""
            CREATE (d:Document {id: $id, title: $title, date: $date, content: $content})
        """, id=doc["id"], title=doc["title"], date=doc["date"], content=doc["content"])
    print(f"Loaded {len(DOCUMENTS)} documents")

def load_relationships(tx):
    # Person BELONGS_TO Team
    for person in PEOPLE:
        tx.run("""
            MATCH (p:Person {id: $person_id})
            MATCH (t:Team {id: $team_id})
            CREATE (p)-[:BELONGS_TO]->(t)
        """, person_id=person["id"], team_id=person["team_id"])

    # Person MANAGES Person
    for rel in MANAGES:
        tx.run("""
            MATCH (m:Person {id: $manager_id})
            MATCH (r:Person {id: $report_id})
            CREATE (m)-[:MANAGES]->(r)
        """, **rel)

    # Team OWNS Project
    for project in PROJECTS:
        tx.run("""
            MATCH (t:Team {id: $team_id})
            MATCH (proj:Project {id: $project_id})
            CREATE (t)-[:OWNS]->(proj)
        """, team_id=project["team_id"], project_id=project["id"])

    # Person WORKS_ON Project
    for rel in WORKS_ON:
        tx.run("""
            MATCH (p:Person {id: $person_id})
            MATCH (proj:Project {id: $project_id})
            CREATE (p)-[:WORKS_ON]->(proj)
        """, **rel)

    # Person WROTE Document
    for doc in DOCUMENTS:
        tx.run("""
            MATCH (p:Person {id: $author_id})
            MATCH (d:Document {id: $doc_id})
            CREATE (p)-[:WROTE]->(d)
        """, author_id=doc["author_id"], doc_id=doc["id"])

    print("Loaded all relationships")

# --- Run everything ---
with driver.session() as session:
    session.execute_write(clear_graph)
    session.execute_write(load_teams)
    session.execute_write(load_people)
    session.execute_write(load_projects)
    session.execute_write(load_documents)
    session.execute_write(load_relationships)

print("\nGraph fully loaded! Ready to query.")
driver.close()