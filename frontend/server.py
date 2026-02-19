#!/usr/bin/env python3
import http.server
import socketserver
import os
import urllib.request
import urllib.parse
import json
from urllib.error import URLError

PORT = 3001

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            # Serve static files
            if self.path == '/':
                self.path = '/index.html'
            elif self.path == '/login':
                self.path = '/login.html'
            elif self.path == '/register':
                self.path = '/register.html'
            elif self.path == '/dashboard':
                self.path = '/dashboard.html'
            elif self.path == '/shops':
                self.path = '/shops.html'
            elif self.path == '/shop-products':
                self.path = '/shop-products.html'
            
            return super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            self.send_error(404, "File not found")
    
    def do_PUT(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            self.send_error(404, "File not found")
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            self.send_error(404, "File not found")
    
    def do_DELETE(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            self.send_error(404, "File not found")
    
    def proxy_request(self):
        try:
            # Remove /api prefix and proxy to backend
            backend_url = f'http://localhost:8090{self.path}'
            
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else None
            
            req = urllib.request.Request(backend_url, data=post_data, method=self.command)
            
            # Copy headers
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'content-length']:
                    req.add_header(header, value)
            
            with urllib.request.urlopen(req) as response:
                self.send_response(response.getcode())
                
                # Copy response headers
                for header, value in response.headers.items():
                    if header.lower() not in ['connection', 'transfer-encoding']:
                        self.send_header(header, value)
                
                self.end_headers()
                self.wfile.write(response.read())
                
        except URLError as e:
            self.send_error(500, f"Proxy error: {e}")
        except Exception as e:
            self.send_error(500, f"Server error: {e}")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
        httpd.serve_forever()
