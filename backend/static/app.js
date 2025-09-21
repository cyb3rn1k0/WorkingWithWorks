
const content = document.getElementById('content');
const search = document.getElementById('search');
const statusEl = document.getElementById('status');
const fileInput = document.getElementById('file-input');
const toggleThemeBtn = document.getElementById('toggle-theme');

const getTheme = () => localStorage.getItem('theme') || 'light';
const setTheme = (t) => {
  localStorage.setItem('theme', t);
  document.body.classList.toggle('dark', t === 'dark');
  document.documentElement.setAttribute('data-bs-theme', t === 'dark' ? 'dark' : 'light');
};
setTheme(getTheme());
toggleThemeBtn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));

const state = { works: [], filtered: [] };

async function fetchWorks() {
  const res = await fetch('/api/works');
  const data = await res.json();
  state.works = data;
  applyFilter();
}

function applyFilter() {
  const q = search.value.trim().toLowerCase();
  state.filtered = !q ? state.works : state.works.filter(w => {
    const title = (w.name || '').toLowerCase();
    const comp = ((w.composer && w.composer.name) ? w.composer.name : '').toLowerCase();
    return title.includes(q) || comp.includes(q);
  });
  render();
}

function groupByComposer(list) {
  const groups = {};
  for (const w of list) {
    const composer = (w.composer && w.composer.name) ? w.composer.name : 'Unknown';
    groups[composer] = groups[composer] || [];
    groups[composer].push(w);
  }
  Object.values(groups).forEach(arr => arr.sort((a, b) => (a.name||'').localeCompare(b.name||'')));
  return Object.fromEntries(Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])));
}

function render() {
  content.innerHTML = '';
  const groups = groupByComposer(state.filtered);
  const tpl = document.getElementById('work-template');
  Object.entries(groups).forEach(([composer, works]) => {
    const h2 = document.createElement('h2');
    h2.textContent = composer;
    h2.className = 'h5 mt-4 mb-3 text-muted';
    content.appendChild(h2);
    for (const w of works) {
      const card = tpl.content.firstElementChild.cloneNode(true);
      card.querySelector('.work-title').textContent = w.name || 'Untitled work';
      const meta = [];
      if (w.composer && w.composer.name) meta.push(w.composer.name);
      if (w.datePublished) meta.push(`Date: ${w.datePublished}`);
      if (w._sourceFile) meta.push(`File: ${w._sourceFile}`);
      card.querySelector('.work-meta').textContent = meta.join(' · ');
      const pre = card.querySelector('.jsonld');
      pre.textContent = JSON.stringify(w, null, 2);
      card.querySelector('.toggle-json').addEventListener('click', () => {
        pre.classList.toggle('d-none');
      });
      card.querySelector('.download-json').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(w, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${(w.name || 'work').replace(/\s+/g, '_')}.json`;
        a.click();
      });
      content.appendChild(card);
    }
  });
}

search.addEventListener('input', applyFilter);

fileInput.addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const fd = new FormData();
  fd.append('file', f);
  statusEl.textContent = 'Uploading…';
  try {
    let res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      res = await fetch('/upload', { method: 'POST', body: fd });
    }
    const data = await res.json();
    if (data.status === 'ok') {
      statusEl.className = 'small text-success mt-1';
      statusEl.textContent = data.message;
      await fetchWorks();
    } else {
      statusEl.className = 'small text-danger mt-1';
      statusEl.textContent = 'Error: ' + (data.message || 'Upload failed');
    }
  } catch (err) {
    statusEl.className = 'small text-danger mt-1';
    statusEl.textContent = 'Error: ' + err.message;
  } finally {
    e.target.value = '';
    setTimeout(() => { statusEl.textContent=''; statusEl.className='small mt-1'; }, 4000);
  }
});

fetchWorks();
