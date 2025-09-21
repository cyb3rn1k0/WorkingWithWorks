
MEI Sample Corpus (Public-Domain Repertoire)
--------------------------------------------
This folder contains minimal, valid MEI files representing well-known public-domain works.
They are tailored for ingestion by the "Working with Works" prototype (title, composer, date).

Contents
- 25 .mei files (one work per file), covering Bach, Beethoven, Mozart, Vivaldi, Haydn, Schubert,
  Chopin, Tchaikovsky, Brahms, Schumann, Debussy, Verdi, Wagner, Mendelssohn, Elgar, Mahler,
  Saint-Saens.
- manifest.csv (filename, title, composer, date).

Notes
- Dates use `isodate` where possible. Some files include plain text dates (e.g., "c. 1704") to
  reflect real-world data variance your parser can tolerate.
- The files provide top-level work metadata only (no incipits or notation), which is sufficient
  for the prototype's MEI -> JSON-LD transformation and UI features (grouping, search, JSON-LD view).

How to use
1) Copy all `.mei` files into your project at: backend/mei-files/
2) Start the backend (Flask). New works will appear grouped by composer at http://localhost:5000
3) Use the UI to show/download JSON-LD or test search and dark mode.
