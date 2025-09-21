
# Working with Works - Final Project Folder

This folder contains a complete, working implementation that matches the features and look
shown in your report: Bootstrap cards with blue buttons (Figures 4.2.1-4.2.4), upload via `/upload`,
grouping by composer, JSON-LD view/download, dark mode, and search by title **or composer**.

## Structure

- `backend/` - Flask API + built-in Bootstrap UI (recommended for assessment).
- `frontend/` - Optional React/Vite SPA consuming the API.

## Quick demo (recommended)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Open [http://localhost:5000](http://localhost:5000) and try **Upload MEI**. A green message confirms success and
the new work(s) appear grouped by composer.

## Notes

- The built-in UI posts to `/api/upload` and falls back to `/upload` for compatibility with the report.
- Search matches **title and composer** strings.
- Bootstrap is loaded via CDN; if you need completely offline use, copy Bootstrap CSS locally.
