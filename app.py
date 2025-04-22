import http.server, socketserver, os

PORT = int(os.environ.get("PORT", 8000))

Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)

print(f"Serving at port {PORT}")
httpd.serve_forever()
