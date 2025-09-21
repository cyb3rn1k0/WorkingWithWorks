
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from parser import load_mei_directory, parse_mei_file

APP_DIR = os.path.dirname(os.path.abspath(__file__))
MEI_FOLDER = os.path.join(APP_DIR, "mei-files")

app = Flask(__name__, static_folder="static", static_url_path="")
# CORS: helpful if you run the optional React frontend on a different port
CORS(app, resources={r"/api/*": {"origins": "*"}})

works_store = {}

def reload_store():
    global works_store
    works_store = load_mei_directory(MEI_FOLDER)
    return len(works_store)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "works_count": len(works_store)})

@app.route("/api/works")
def list_works():
    works = list(works_store.values())
    works.sort(key=lambda w: (w.get("composer", {}).get("name", "").lower(), w.get("name", "").lower()))
    return jsonify(works)

@app.route("/api/works/<identifier>")
def get_work(identifier):
    w = works_store.get(identifier)
    if not w:
        return jsonify({"error": "Not found"}), 404
    return jsonify(w)

def _handle_upload(file_storage):
    if not file_storage:
        return False, "No file provided."
    filename = secure_filename(file_storage.filename or "")
    if not filename:
        return False, "Missing filename."
    if not (filename.lower().endswith(".mei") or filename.lower().endswith(".xml")):
        return False, "Only .mei or .xml files are accepted."
    os.makedirs(MEI_FOLDER, exist_ok=True)
    save_path = os.path.join(MEI_FOLDER, filename)
    file_storage.save(save_path)
    new_works = parse_mei_file(save_path)
    for w in new_works:
        works_store[w["identifier"]] = w
    return True, f"Uploaded {filename}. Parsed {len(new_works)} work(s)."

@app.route("/api/upload", methods=["POST"])
def api_upload():
    ok, msg = _handle_upload(request.files.get("file"))
    status = "ok" if ok else "error"
    return jsonify({"status": status, "message": msg}), (200 if ok else 400)

# Back-compat route, as shown in the report figures/text
@app.route("/upload", methods=["POST"])
def upload():
    ok, msg = _handle_upload(request.files.get("file"))
    status = "ok" if ok else "error"
    return jsonify({"status": status, "message": msg}), (200 if ok else 400)

@app.route("/reload", methods=["POST"])
def manual_reload():
    count = reload_store()
    return jsonify({"status": "ok", "works_count": count})

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    os.makedirs(MEI_FOLDER, exist_ok=True)
    count = reload_store()
    print(f"[Working with Works] Loaded {count} work(s) from {MEI_FOLDER}")
    app.run(host="0.0.0.0", port=5000, debug=True)
