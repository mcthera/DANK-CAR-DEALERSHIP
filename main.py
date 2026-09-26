from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import Optional

app = FastAPI(title="CAMO Projects API")

# Allow your frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
def init_db():
    conn = sqlite3.connect("projects.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            concept TEXT NOT NULL,
            amount REAL NOT NULL,
            timeframe TEXT NOT NULL,
            status TEXT DEFAULT 'Pending'
        )
    """)
    conn.commit()
    conn.close()

init_db()

class Project(BaseModel):
    name: str
    concept: str
    amount: float
    timeframe: str
    status: Optional[str] = "Pending"

@app.get("/api/projects")
def get_projects():
    conn = sqlite3.connect("projects.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/projects")
def add_project(project: Project):
    conn = sqlite3.connect("projects.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO projects (name, concept, amount, timeframe, status) VALUES (?, ?, ?, ?, ?)",
        (project.name, project.concept, project.amount, project.timeframe, project.status)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, **project.dict()}

@app.put("/api/projects/{project_id}")
def update_project(project_id: int, project: Project):
    conn = sqlite3.connect("projects.db")
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE projects SET name=?, concept=?, amount=?, timeframe=?, status=? WHERE id=?",
        (project.name, project.concept, project.amount, project.timeframe, project.status, project_id)
    )
    conn.commit()
    conn.close()
    return {"id": project_id, **project.dict()}

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int):
    conn = sqlite3.connect("projects.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id=?", (project_id,))
    conn.commit()
    conn.close()
    return {"message": "Project deleted successfully"}