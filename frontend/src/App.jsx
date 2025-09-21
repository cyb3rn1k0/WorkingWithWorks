
import React, { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function useTheme() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-bs-theme", theme === "dark" ? "dark" : "light");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [works, setWorks] = useState([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(new Set());
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`${API}/api/works`).then(r => r.json()).then(setWorks).catch(err => setStatus(`Error: ${err.message}`));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? works.filter(w => (w.name || '').toLowerCase().includes(q) || ((w.composer?.name)||'').toLowerCase().includes(q)) : works;
  }, [works, query]);

  const groups = useMemo(() => {
    const out = {};
    for (const w of filtered) {
      const k = w.composer?.name || "Unknown";
      (out[k] ||= []).push(w);
    }
    for (const k of Object.keys(out)) out[k].sort((a,b)=> (a.name||'').localeCompare(b.name||''));
    return Object.fromEntries(Object.entries(out).sort((a,b)=> a[0].localeCompare(b[0])));
  }, [filtered]);

  async function handleUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    setStatus("Uploading…");
    try {
      let res = await fetch(`${API}/api/upload`, { method: "POST", body: fd });
      if (!res.ok) res = await fetch(`${API}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.status === "ok") {
        setStatus(data.message);
        const refreshed = await fetch(`${API}/api/works`).then(r => r.json());
        setWorks(refreshed);
      } else {
        setStatus(`Error: ${data.message || "Upload failed"}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      e.target.value = "";
      setTimeout(()=> setStatus(""), 4000);
    }
  }

  function toggleJson(id) {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  }

  function downloadJson(w) {
    const blob = new Blob([JSON.stringify(w, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(w.name || "work").replace(/\s+/g, "_")}.json`;
    a.click();
  }

  return (
    <div className="container py-3">
      <header className="mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="h4 mb-0">Working with Works</h1>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>🌓</button>
            <label className="btn btn-primary btn-sm mb-0">
              <input type="file" accept=".mei,.xml" style={{ display: "none" }} onChange={handleUpload} />
              Upload MEI
            </label>
          </div>
        </div>
        <div className="mt-2">
          <input type="search" className="form-control" placeholder="Search by title or composer…" value={query} onChange={e => setQuery(e.target.value)} />
          {status && <div className="small mt-1">{status}</div>}
        </div>
      </header>
      <main>
        {Object.entries(groups).map(([composer, list]) => (
          <section className="mb-3" key={composer}>
            <h2 className="h5 mt-4 mb-3 text-muted">{composer}</h2>
            {list.map(w => (
              <div className="card mb-3 shadow-sm" key={w.identifier}>
                <div className="card-body">
                  <div className="d-flex justify-content-between flex-wrap gap-2">
                    <div className="h6 mb-0">{w.name || "Untitled work"}</div>
                    <div className="text-muted small">
                      {w.datePublished ? `Date: ${w.datePublished}` : ""}
                      {w._sourceFile ? (w.datePublished ? " · " : "") + `File: ${w._sourceFile}` : ""}
                    </div>
                  </div>
                  <div className="mt-2 d-flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={() => toggleJson(w.identifier)}>
                      {expanded.has(w.identifier) ? "Hide JSON‑LD" : "Show JSON‑LD"}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => downloadJson(w)}>Download JSON</button>
                  </div>
                  {expanded.has(w.identifier) && <pre className="mt-3 border rounded p-2">{JSON.stringify(w, null, 2)}</pre>}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
