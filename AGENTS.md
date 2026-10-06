# AGENTS.md — ToDo App

## Project
Full-stack todo app. Backend: Python FastAPI + SQLite (stdlib `sqlite3`, no ORM).
Frontend: React 18 via CDN in `frontend/` (plain `React.createElement`, no JSX,
no Node/npm build step). Backend serves the frontend on one URL (port 8000).

## Layout
- `backend/main.py` — all API routes + SQLite (incl. schema `init_db`,
  auto-migration via `ensure_column`) + static serving of `frontend/`
- `backend/requirements.txt` — `fastapi`, `uvicorn` (root `requirements.txt`
  mirrors it for Vercel)
- `frontend/` — `index.html`, `app.js`, `styles.css`, `manifest.json`, `icon.svg`
- `api/index.py` — Vercel serverless entry (re-exports `app`)
- `vercel.json` — Vercel routing
- `backend/todos.db` — local database, auto-created, NEVER committed (see `.gitignore`)

## Run locally
```
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
App: http://127.0.0.1:8000/ · Docs: http://127.0.0.1:8000/docs

## API endpoints
- `GET /api/health`
- `GET /api/todos` (optional `?q=` search) · `POST /api/todos`
- `PUT /api/todos/{id}` (completing a recurring task spawns the next occurrence)
- `DELETE /api/todos/{id}` · `POST /api/todos/reorder` · `POST /api/todos/clear-completed`
- `GET /api/settings` · `PUT /api/settings` (keys allowlisted by `DEFAULT_SETTINGS`)
- `GET /api/export` · `POST /api/wipe` (destructive: deletes all todos, resets settings)

## Conventions
- **i18n:** all user-facing text lives in `STRINGS` (`frontend/app.js`, 10
  languages: en es fr de pt it nl sv tr id). New UI copy must be added in
  ALL 10 languages — keep entries short; sound names stay English via
  `SOUND_NAMES`/`SOUND_LABEL` (only `off` is translated).
- **Themes:** via `body[data-theme]` (`colourful` default, `light`, `dark`);
  add new theme styling in `frontend/styles.css`, never inline.
- **Settings keys** (`DEFAULT_SETTINGS` in `backend/main.py`): theme,
  language, notification_sound, notifications_enabled, profile_name,
  profile_pic, sort, show_completed. `profile_pic` is a ≤128px JPEG data URL
  (frontend downscales on upload, 5MB input cap) — never store full-size photos.
- **DB changes:** use `ensure_column` auto-migration + update `row_to_todo`,
  the Pydantic schemas, and cleaners (`clean_*`). Recurrence rollover happens
  server-side in `PUT /api/todos/{id}` via `advance_due`.
- **Git:** repo initialized, identity set locally (`git config user.*`).
  Commit locally on request; the user pushes (branch: rename `master`→`main`
  on first push). Never commit `backend/todos.db`.
- **Vercel:** `TODO_DB_PATH=/tmp/todos.db` env; filesystem is ephemeral so
  SQLite resets there — demo-only (see README).

## Rules for agents
1. **Write tests for every endpoint you create or change, and always validate
   that those endpoints work.** Add/extend a throwaway script under
   `C:\Users\ANITA\AppData\Local\Temp\opencode\` (never in the repo) that
   exercises each endpoint — happy path plus invalid input (expect 400s) —
   run it against the live server, and only report success when it passes.
   If a test is destructive (e.g. `/api/wipe`, `/api/todos/clear-completed`),
   back up via `GET /api/export` first and restore afterwards so user data
   is never lost.
2. **Restart the backend after changing `backend/`** — uvicorn here runs
   without `--reload`. Kill the process on port 8000, start it again, and
   confirm `/api/health` before testing.
3. **Check the browser console** (`browser.console`, error level) after
   changing `frontend/` — reload the app tab and fix any errors.
4. Keep the no-build-step frontend: plain JS + `React.createElement`, no
   imports/bundlers. All JS balance checks: parens/braces/brackets must net
   to zero; `backend/main.py` must pass `ast.parse`.
5. No Node.js on this machine — never assume `node`/`npm` exist.
6. Never commit `backend/todos.db` or user credentials.
7. Update `README.md` whenever a user-facing feature changes (tabs, settings
   options, API list) so docs never drift from the app.
