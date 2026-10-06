"""Turso (libSQL) access over plain HTTPS - stdlib only, no dependencies.

Uses the Hrana v2 pipeline endpoint, so it works anywhere urllib works
(including Vercel serverless, where native SQLite drivers can't build).
The adapter mimics just enough of sqlite3's Connection/Cursor for
backend/main.py: execute() with ? placeholders, fetchone/fetchall with
row["col"] AND row[0] access, lastrowid, rowcount, commit()/close() no-ops.
"""
import base64
import json
import urllib.request
from pathlib import Path


def load_env(path=None):
    """Tiny .env loader (KEY=VALUE, skips blanks/#comments). Never overwrites real env."""
    p = Path(path) if path else Path(__file__).resolve().parent.parent / ".env"
    if not p.exists():
        return
    import os

    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
            v = v[1:-1]
        os.environ.setdefault(k, v)


def _enc_val(v):
    if v is None:
        return {"type": "null"}
    if isinstance(v, bool):
        return {"type": "integer", "value": str(int(v))}
    if isinstance(v, int):
        return {"type": "integer", "value": str(v)}
    if isinstance(v, float):
        return {"type": "float", "value": v}
    if isinstance(v, (bytes, bytearray)):
        return {"type": "blob", "value": base64.b64encode(bytes(v)).decode()}
    return {"type": "text", "value": str(v)}


def _dec_val(v):
    t = v.get("type")
    if t == "null":
        return None
    if t == "integer":
        return int(v["value"])
    if t == "float":
        return float(v["value"])
    if t == "blob":
        return base64.b64decode(v["value"])
    return v.get("value")


class Row(dict):
    """dict with sqlite3.Row-style positional access (row[0])."""

    def __init__(self, cols, values):
        super().__init__(zip(cols, values))
        self._cols = list(cols)

    def __getitem__(self, key):
        if isinstance(key, int):
            return super().__getitem__(self._cols[key])
        return super().__getitem__(key)


class Cursor:
    def __init__(self, rows, lastrowid=None, rowcount=-1):
        self._rows = rows
        self.lastrowid = lastrowid
        self.rowcount = rowcount

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def fetchall(self):
        return self._rows


class TursoConn:
    """One shared remote DB. commit()/close() are no-ops (each call autocommits)."""

    def __init__(self, base_url, token, timeout=25):
        base_url = base_url.strip().rstrip("/")
        if base_url.startswith("libsql://"):
            base_url = "https://" + base_url[len("libsql://"):]
        self.url = base_url + "/v2/pipeline"
        self.token = token
        self.timeout = timeout

    def _pipeline(self, stmts):
        body = json.dumps({
            "requests": [
                {"type": "execute", "stmt": {"sql": sql, "args": [_enc_val(a) for a in params]}}
                for sql, params in stmts
            ]
        }).encode()
        req = urllib.request.Request(
            self.url, data=body,
            headers={"Content-Type": "application/json", "Authorization": "Bearer " + self.token},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            payload = json.loads(resp.read().decode())
        out = []
        for r in payload.get("results", []):
            if r.get("type") == "error":
                raise RuntimeError("turso: " + json.dumps(r.get("error")))
            res = r["response"]["result"]
            cols = [c["name"] for c in res.get("cols", [])]
            rows = [Row(cols, [_dec_val(v) for v in row]) for row in res.get("rows", [])]
            lir = res.get("last_insert_rowid")
            out.append(Cursor(rows,
                              lastrowid=int(lir) if lir not in (None, "") else None,
                              rowcount=res.get("affected_row_count", -1)))
        return out

    def execute(self, sql, params=()):
        return self._pipeline([(sql, tuple(params))])[0]

    def batch(self, stmts):
        """Many statements, one HTTP round-trip (used for reorder loops)."""
        return self._pipeline([(s, tuple(p)) for s, p in stmts])

    def commit(self):
        pass

    def close(self):
        pass
