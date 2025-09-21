
import os
import uuid
from xml.etree import ElementTree as ET

NS = {"mei": "http://www.music-encoding.org/ns/mei"}

def _text(el):
    if el is None:
        return ""
    t = (el.text or "").strip()
    if not t and list(el):
        return (list(el)[0].text or "").strip()
    return t

def _find_first_text(root, xpaths):
    for xp in xpaths:
        node = root.find(xp, NS)
        if node is not None:
            val = _text(node)
            if val:
                return val
    return ""

def _find_date(root):
    for el in root.findall(".//mei:date", NS):
        for attr in ("isodate", "notbefore", "notafter"):
            val = el.get(attr)
            if val:
                return val
        val = _text(el)
        if val:
            return val
    return ""

def _stable_id(title, composer):
    base = f"{(composer or '').strip()}||{(title or '').strip()}"
    if not base.strip():
        base = "unknown-work"
    return str(uuid.uuid5(uuid.NAMESPACE_URL, base))

def parse_mei_file(path):
    works = []
    try:
        tree = ET.parse(path)
    except Exception:
        return works
    root = tree.getroot()
    work_nodes = root.findall(".//mei:work", NS) or [root]
    for w in work_nodes:
        title = _find_first_text(w, [
            "mei:title",
            ".//mei:title",
            ".//mei:titleStmt/mei:title",
            ".//mei:workDesc/mei:title"
        ])
        composer = _find_first_text(w, [
            ".//mei:composer",
            ".//mei:respStmt/mei:persName",
            ".//mei:contributor/mei:persName",
            ".//mei:persName"
        ])
        if not composer:
            comp_el = w.find(".//mei:composer", NS)
            if comp_el is not None:
                composer = _text(comp_el)
        date = _find_date(w)
        if not title and not composer:
            continue
        identifier = _stable_id(title, composer)
        work = {
            "@context": "https://schema.org",
            "@type": "MusicComposition",
            "identifier": identifier,
            "name": title or "Untitled work",
            "composer": {"@type": "Person", "name": composer or "Unknown"},
            "_sourceFile": os.path.basename(path)
        }
        if date:
            work["datePublished"] = date
        works.append(work)
    return works

def load_mei_directory(folder):
    store = {}
    if not os.path.isdir(folder):
        return store
    for fname in sorted(os.listdir(folder)):
        if not (fname.lower().endswith(".mei") or fname.lower().endswith(".xml")):
            continue
        path = os.path.join(folder, fname)
        try:
            for w in parse_mei_file(path):
                store[w["identifier"]] = w
        except Exception:
            continue
    return store
