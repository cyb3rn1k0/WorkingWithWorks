
# Working with Works - Final Project Folder

A lightweight web application for cataloguing classical music works using MEI (Music Encoding Initiative)
 files. The system parses MEI files, transforms them into JSON-LD
 following the schema.org/MusicComposition
 vocabulary, and provides both a REST API and a simple Bootstrap-styled web interface.

## Structure

----MEI ingestion

  . Load .mei or .xml files from a designated folder.

  . Upload new MEI files directly through the web interface.

----Metadata transformation
 
  . Extracts title, composer, and date from MEI files.

  . Generates structured JSON-LD metadata compliant with schema.org.

----Web API (Flask)
 
  . GET /api/works - list all works.
 
  . GET /api/works/<identifier> - fetch metadata for a single work.
 
  . POST /api/upload (or /upload ) - upload a new MEI file.

  . POST /reload - rescan the MEI folder.

----User interface

  · Works grouped by composer and displayed in Bootstrap cards.
  
  · Instant search by title or composer.

  · Toggle light/dark mode.

  · View and download JSON-LD for each work.


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
- Bootstrap is loaded via CDN; if you need a completely offline use, copy Bootstrap CSS locally.
