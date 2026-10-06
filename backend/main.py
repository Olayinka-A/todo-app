"""ToDo App backend - FastAPI + SQLite/Turso (stdlib only). Beginner friendly."""
import calendar as calmod
import json
import os
import sqlite3
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

try:
    from turso_db import TursoConn, load_env  # Vercel (service root is backend/)
except ImportError:
    from backend.turso_db import TursoConn, load_env  # local (project root on path)

load_env()  # reads .env (local dev) — real env vars always win; .env is git-ignored

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

TURSO_URL = os.environ.get("TURSO_DATABASE_URL", "").strip()
TURSO_TOKEN = os.environ.get("TURSO_AUTH_TOKEN", "").strip()
USE_TURSO = bool(TURSO_URL and TURSO_TOKEN)


def _resolve_db_path() -> Path:
    """Local SQLite file: TODO_DB_PATH, else backend/todos.db (or /tmp if read-only)."""
    env = os.environ.get("TODO_DB_PATH")
    if env:
        return Path(env)
    probe = BASE_DIR / "todos.db"
    try:
        conn = sqlite3.connect(probe)
        conn.execute("CREATE TABLE IF NOT EXISTS __write_probe (x INTEGER)")
        conn.execute("DROP TABLE __write_probe")
        conn.commit()
        conn.close()
        return probe
    except sqlite3.OperationalError:
        return Path("/tmp/todos.db")


DB_PATH = _resolve_db_path()
if USE_TURSO:
    print("DB: Turso (libsql://…)", flush=True)
else:
    print(f"DB: local file {DB_PATH}", flush=True)

app = FastAPI(title="ToDo App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- DB helpers ----------
def get_db():
    if USE_TURSO:
        return TursoConn(TURSO_URL, TURSO_TOKEN)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def batch_update_positions(conn, ordered_ids):
    """One HTTP round-trip on Turso, plain loop on local SQLite."""
    if hasattr(conn, "batch"):
        conn.batch([("UPDATE todos SET position = ? WHERE id = ?", (pos, tid))
                    for pos, tid in enumerate(ordered_ids)])
    else:
        for pos, tid in enumerate(ordered_ids):
            conn.execute("UPDATE todos SET position = ? WHERE id = ?", (pos, tid))


def ensure_column(conn, table: str, column: str, ddl: str):
    cols = {r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in cols:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")


DEFAULT_SETTINGS = {
    "theme": "colourful",            # colourful | light | dark
    "language": "en",                # en | es | fr
    "notification_sound": "chime",   # off | chime | pop | ding
    "notifications_enabled": "1",    # 1 | 0 (browser Notification for due-today)
    "profile_name": "",
    "profile_pic": "",
    "sort": "manual",                # manual | due | priority | newest
    "show_completed": "1",
}


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            notes TEXT DEFAULT '',
            completed INTEGER DEFAULT 0,
            position INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    # New columns for calendar / priorities (added safely if DB already exists)
    ensure_column(conn, "todos", "due_date", "TEXT DEFAULT ''")
    ensure_column(conn, "todos", "priority", "TEXT DEFAULT 'medium'")
    ensure_column(conn, "todos", "recurrence", "TEXT DEFAULT 'none'")
    ensure_column(conn, "todos", "reminder_time", "TEXT DEFAULT ''")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        """
    )
    for k, v in DEFAULT_SETTINGS.items():
        conn.execute("INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)", (k, v))
    conn.commit()
    conn.close()


def row_to_todo(row: Any) -> dict:
    try:
        due = row["due_date"]
    except (IndexError, KeyError):
        due = ""
    try:
        prio = row["priority"]
    except (IndexError, KeyError):
        prio = "medium"
    try:
        recur = row["recurrence"]
    except (IndexError, KeyError):
        recur = "none"
    try:
        remind = row["reminder_time"]
    except (IndexError, KeyError):
        remind = ""
    return {
        "id": row["id"],
        "title": row["title"],
        "notes": row["notes"] or "",
        "completed": bool(row["completed"]),
        "position": row["position"],
        "due_date": due or "",
        "priority": (prio or "medium").lower(),
        "recurrence": (recur or "none").lower(),
        "reminder_time": remind or "",
    }


init_db()


# ---------- Schemas ----------
class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    notes: str = ""
    due_date: str = ""  # YYYY-MM-DD or ""
    priority: str = "medium"
    recurrence: str = "none"  # none | daily | weekly | monthly
    reminder_time: str = ""  # HH:MM or ""


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    notes: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    recurrence: Optional[str] = None
    reminder_time: Optional[str] = None


class ReorderRequest(BaseModel):
    ordered_ids: List[int]


class SettingsUpdate(BaseModel):
    settings: dict


def clean_priority(p: str) -> str:
    p = (p or "medium").lower()
    return p if p in ("low", "medium", "high") else "medium"


def clean_date(d: str) -> str:
    d = (d or "").strip()
    if not d:
        return ""
    # light validation: expect YYYY-MM-DD
    parts = d.split("-")
    if len(parts) != 3 or not all(x.isdigit() for x in parts):
        raise HTTPException(status_code=400, detail="due_date must be YYYY-MM-DD or empty")
    return d


def clean_recurrence(r: str) -> str:
    r = (r or "none").lower()
    return r if r in ("none", "daily", "weekly", "monthly") else "none"


def clean_time(t: str) -> str:
    t = (t or "").strip()
    if not t:
        return ""
    try:
        datetime.strptime(t, "%H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="reminder_time must be HH:MM or empty")
    return t


def advance_due(due: str, recurrence: str) -> str:
    """Next due date for a recurrence, based on `due` (or today if empty)."""
    try:
        base = datetime.strptime(due, "%Y-%m-%d").date() if due else date.today()
    except ValueError:
        base = date.today()
    if recurrence == "daily":
        return (base + timedelta(days=1)).isoformat()
    if recurrence == "weekly":
        return (base + timedelta(weeks=1)).isoformat()
    # monthly: same day next month (clamped to month end)
    y, m = base.year + (1 if base.month == 12 else 0), base.month % 12 + 1
    last = calmod.monthrange(y, m)[1]
    return date(y, m, min(base.day, last)).isoformat()


# ---------- API ----------
@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/todos")
def list_todos(q: str = ""):
    conn = get_db()
    rows = conn.execute("SELECT * FROM todos ORDER BY position ASC, id ASC").fetchall()
    conn.close()
    todos = [row_to_todo(r) for r in rows]
    if q.strip():
        needle = q.strip().lower()
        todos = [t for t in todos if needle in t["title"].lower() or needle in (t["notes"] or "").lower()]
    return todos


@app.post("/api/todos", status_code=201)
def create_todo(payload: TodoCreate):
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    conn = get_db()
    cur = conn.execute("SELECT COALESCE(MAX(position), -1) FROM todos")
    max_pos = cur.fetchone()[0]
    cur = conn.execute(
        "INSERT INTO todos (title, notes, completed, position, due_date, priority, recurrence, reminder_time) VALUES (?, ?, 0, ?, ?, ?, ?, ?)",
        (title, payload.notes or "", max_pos + 1, clean_date(payload.due_date),
         clean_priority(payload.priority), clean_recurrence(payload.recurrence),
         clean_time(payload.reminder_time)),
    )
    new_id = cur.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM todos WHERE id = ?", (new_id,)).fetchone()
    conn.close()
    return row_to_todo(row)


@app.put("/api/todos/{todo_id}")
def update_todo(todo_id: int, payload: TodoUpdate):
    conn = get_db()
    row = conn.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    if row is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Todo not found")
    cur = row_to_todo(row)
    title, notes, completed = cur["title"], cur["notes"], cur["completed"]
    due_date, priority = cur["due_date"], cur["priority"]
    recurrence, reminder_time = cur["recurrence"], cur["reminder_time"]
    if payload.title is not None:
        title = payload.title.strip()
        if not title:
            conn.close()
            raise HTTPException(status_code=400, detail="Title cannot be empty")
    if payload.notes is not None:
        notes = payload.notes
    if payload.completed is not None:
        completed = bool(payload.completed)
    if payload.due_date is not None:
        due_date = clean_date(payload.due_date)
    if payload.priority is not None:
        priority = clean_priority(payload.priority)
    if payload.recurrence is not None:
        recurrence = clean_recurrence(payload.recurrence)
    if payload.reminder_time is not None:
        reminder_time = clean_time(payload.reminder_time)
    conn.execute(
        "UPDATE todos SET title = ?, notes = ?, completed = ?, due_date = ?, priority = ?, recurrence = ?, reminder_time = ? WHERE id = ?",
        (title, notes, 1 if completed else 0, due_date, priority, recurrence, reminder_time, todo_id),
    )
    # Recurring tasks: completing one spawns the next occurrence.
    if completed and recurrence != "none":
        max_pos = conn.execute("SELECT COALESCE(MAX(position), -1) FROM todos").fetchone()[0]
        conn.execute(
            "INSERT INTO todos (title, notes, completed, position, due_date, priority, recurrence, reminder_time) VALUES (?, ?, 0, ?, ?, ?, ?, ?)",
            (title, notes, max_pos + 1, advance_due(due_date, recurrence), priority, recurrence, reminder_time),
        )
    conn.commit()
    row = conn.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    conn.close()
    return row_to_todo(row)


@app.delete("/api/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    conn = get_db()
    cur = conn.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return None


@app.post("/api/wipe")
def wipe_all():
    """Erase everything: all todos + settings back to defaults."""
    conn = get_db()
    conn.execute("DELETE FROM todos")
    for k, v in DEFAULT_SETTINGS.items():
        conn.execute(
            "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (k, v),
        )
    conn.commit()
    conn.close()
    return {"todos": [], "settings": dict(DEFAULT_SETTINGS)}


@app.post("/api/todos/clear-completed")
def clear_completed():
    conn = get_db()
    conn.execute("DELETE FROM todos WHERE completed = 1")
    conn.commit()
    rows = conn.execute("SELECT * FROM todos ORDER BY position ASC").fetchall()
    # re-number positions
    batch_update_positions(conn, [r["id"] for r in rows])
    conn.commit()
    rows = conn.execute("SELECT * FROM todos ORDER BY position ASC").fetchall()
    conn.close()
    return [row_to_todo(r) for r in rows]


@app.post("/api/todos/reorder")
def reorder_todos(payload: ReorderRequest):
    """Save a new order. Body: {"ordered_ids": [3, 1, 2]} (top to bottom)."""
    conn = get_db()
    rows = conn.execute("SELECT id FROM todos").fetchall()
    existing_ids = {r["id"] for r in rows}
    if set(payload.ordered_ids) != existing_ids:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"ordered_ids must contain exactly all todo ids. Got {payload.ordered_ids}",
        )
    batch_update_positions(conn, payload.ordered_ids)
    conn.commit()
    rows = conn.execute("SELECT * FROM todos ORDER BY position ASC").fetchall()
    conn.close()
    return [row_to_todo(r) for r in rows]


@app.get("/api/settings")
def get_settings():
    conn = get_db()
    rows = conn.execute("SELECT key, value FROM app_settings").fetchall()
    conn.close()
    data = dict(DEFAULT_SETTINGS)
    for r in rows:
        data[r["key"]] = r["value"]
    return data


@app.put("/api/settings")
def put_settings(payload: SettingsUpdate):
    allowed = set(DEFAULT_SETTINGS.keys())
    conn = get_db()
    for k, v in payload.settings.items():
        if k not in allowed:
            continue
        conn.execute(
            "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (k, str(v)),
        )
    conn.commit()
    rows = conn.execute("SELECT key, value FROM app_settings").fetchall()
    conn.close()
    data = dict(DEFAULT_SETTINGS)
    for r in rows:
        data[r["key"]] = r["value"]
    return data


@app.get("/api/export")
def export_data():
    conn = get_db()
    todos = [row_to_todo(r) for r in conn.execute("SELECT * FROM todos ORDER BY position ASC").fetchall()]
    settings = {r["key"]: r["value"] for r in conn.execute("SELECT key, value FROM app_settings").fetchall()}
    conn.close()
    return {"todos": todos, "settings": settings}


# ---------- Serve frontend (one URL: port 8000) ----------
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/", include_in_schema=False)
    def serve_index():
        return FileResponse(str(FRONTEND_DIR / "index.html"))
