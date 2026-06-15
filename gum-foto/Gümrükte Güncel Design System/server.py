#!/usr/bin/env python3
"""
Gümrükte Güncel — Post Editor sunucusu.

Ne yapar:
  1. Tüm proje dosyalarını (editor.html, assets, bundle...) yerel olarak servis eder.
  2. /save adresine gelen PNG'leri doğrudan output/ klasörüne yazar.

Çalıştırmak için:
    python3 server.py
Sonra tarayıcıda aç:
    http://localhost:8000/editor.html
"""

import base64
import json
import os
import re
import webbrowser
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(ROOT, "output")
PORT = 8000


def safe_name(name: str) -> str:
    """Dosya adını güvenli hale getir (klasör kaçışı vb. engelle)."""
    name = os.path.basename(name or "")
    name = re.sub(r"[^A-Za-z0-9._-]", "-", name).strip("-")
    return name or "post"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Geliştirme sırasında önbelleği kapat ki değişiklikler hemen görünsün.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if self.path.rstrip("/") != "/save":
            self.send_error(404, "Bilinmeyen adres")
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length) or b"{}")

            data_url = payload.get("dataUrl", "")
            if "," not in data_url:
                raise ValueError("Geçersiz görüntü verisi")
            header, b64 = data_url.split(",", 1)
            ext = "png"
            if "image/jpeg" in header:
                ext = "jpg"

            base = safe_name(payload.get("name", "post"))
            stamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
            filename = f"{base}-{stamp}.{ext}"

            os.makedirs(OUTPUT_DIR, exist_ok=True)
            with open(os.path.join(OUTPUT_DIR, filename), "wb") as fh:
                fh.write(base64.b64decode(b64))

            self._json(200, {"ok": True, "file": f"output/{filename}"})
        except Exception as exc:  # noqa: BLE001
            self._json(500, {"ok": False, "error": str(exc)})

    def _json(self, status, body):
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        # Sadece /save isteklerini ve hataları göster, statik dosyaları sustur.
        msg = fmt % args
        if "/save" in msg or " 4" in msg or " 5" in msg:
            super().log_message(fmt, *args)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    url = f"http://127.0.0.1:{PORT}/editor.html"
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("Gümrükte Güncel Post Editor")
    print(f"  Editör : {url}")
    print(f"  Çıktı  : {OUTPUT_DIR}")
    print("  Durdurmak için Ctrl+C")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSunucu durduruldu.")
        server.shutdown()


if __name__ == "__main__":
    main()
