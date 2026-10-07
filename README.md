# ToDo App 🌈

Beginner-friendly: Python FastAPI + SQLite backend, React frontend (via CDN, no Node/npm needed).

## Run it
```
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Then open: http://127.0.0.1:8000/

API docs: http://127.0.0.1:8000/docs
Health: http://127.0.0.1:8000/api/health

## Tabs
- 📋 **Tasks** — add items, check them off, edit text (✏️ or double-click),
  delete (🗑️), drag the ⠿ handle to reorder, search bar, All/Active/Done
  filters, due dates + priorities, sort (manual / due date / priority / newest).
- 📅 **Calendar** — month view with dots per due date, click a day to see its
  tasks, quick-add a task for the selected day.
- ⚙️ **Settings** — theme (colourful / light / dark), language (10: English /
  Español / Français / Deutsch / Português / Italiano / Nederlands / Svenska /
  Türkçe / Bahasa Indonesia), notification sound (10 sounds + off, preview on
  pick, played on add + complete), browser notification for tasks due today,
  username + your own profile photo (from your photo library, auto-shrunk to
  a tiny thumbnail), show-completed toggle, export backup (JSON),
  clear completed + full wipe (erase everything, double-confirmed).

## Extra nice-to-haves included
- Notes pane: click a task, view / add / edit notes
- Due badges: overdue ⚠, due-today 📅, future dates
- Priority pills (high 🔴 / medium 🟠 / low 🟢)
- 🔁 Recurring tasks (daily / weekly / monthly): completing one spawns the
  next occurrence automatically
- ⏰ Reminders: set a time (HH:MM) on a due-today task → sound + browser
  notification when it arrives (app open)
- Progress bar, installable (manifest + icon)
- Responsive layout: fluid type, stacked cards on tablets, scrollable tabs,
  compact calendar and full-width touch-friendly buttons on phones, tweaks
  for small (360px) phones and landscape mode

## Files
- backend/main.py: Python API + SQLite + serves frontend on port 8000
- backend/todos.db: SQLite database (auto-created)
- frontend/index.html, app.js (React), styles.css, manifest.json, icon.svg

## API
- GET /api/todos / POST /api/todos {"title", "notes?", "due_date?", "priority?"}
- PUT /api/todos/{id} {"title?", "notes?", "completed?", "due_date?", "priority?"}
- DELETE /api/todos/{id}
- POST /api/todos/reorder {"ordered_ids": [3,1,2]}
- POST /api/todos/clear-completed
- POST /api/wipe (erase all todos + reset settings)
- GET /api/settings / PUT /api/settings {"settings": {...}}
- GET /api/export

## Publish on Vercel
Publish link: https://vercel.com/new

Steps (beginner):
1. Put this project on GitHub (new repo, upload these files).
2. Open https://vercel.com/new → "Import" your repo.
3. Vercel auto-detects `vercel.json` (already in this project): two services
   deploy as one project — `app` (pages, everything except `/api`) and
   `backend` (API on `/api/*`), no bindings needed. Your app will be live
   at `https://<name>.vercel.app`.
4. In the Vercel dashboard for the project, go to Settings → Environment
   Variables and add both (Values → copy from your local `.env`, never
   commit that file):
   `TURSO_DATABASE_URL` = `libsql://todo-annie.aws-ap-northeast-1.turso.io`
   `TURSO_AUTH_TOKEN` = your Turso token.
   Redeploy after adding them. This replaces the old SQLite file with your
   hosted Turso database — data now persists across deploys.

⚠️ Honest warning: Vercel's filesystem is ephemeral — SQLite data written to
`/tmp` disappears on redeploys / cold starts. It works for a demo, but for
real persistent data use a host with a real disk (e.g. Render, Railway, Fly)
or switch the DB to Vercel Postgres later. Your local run
(`python -m uvicorn ...`) keeps everything in `backend/todos.db` permanently.
