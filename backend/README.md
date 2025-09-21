
# Working with Works - Backend

Flask backend + built-in Bootstrap UI that ingests MEI files, transforms them
into JSON-LD (schema.org/MusicComposition), and exposes a REST API.

## Quick start (Windows PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Then open [http://localhost:5000](http://localhost:5000)

## Endpoints

- `GET /api/health`
- `GET /api/works` (list all)
- `GET /api/works/<identifier>`
- `POST /api/upload` (also `/upload`) with form field `file`
- `POST /reload` (rescan `mei-files/`)

## Notes

- IDs are deterministic (UUIDv5 over `composer||title`), so re-imports update the same entry.
- If you also run the React frontend, CORS is already enabled for `/api/*`.
