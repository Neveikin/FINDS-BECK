#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
from datetime import datetime

# Конфигурация
PORT = int(os.environ.get('PORT', 3000))
HOST = os.environ.get('HOST', 'localhost')
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        """Кастомное логирование с timestamp"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"{timestamp} - {format % args}")
    
    def end_headers(self):
        """Добавляем CORS заголовки"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Обработка preflight запросов"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Обработка GET запросов с автоматическим добавлением .html"""
        # Если запрос к корню, отдаем index.html
        if self.path == '/':
            self.path = '/index.html'
        # Если путь без расширения, пытаемся добавить .html
        elif '.' not in os.path.basename(self.path):
            html_path = self.path + '.html'
            full_html_path = os.path.join(DIRECTORY, html_path.lstrip('/'))
            if os.path.exists(full_html_path):
                self.path = html_path
        
        super().do_GET()

def main():
    # Проверяем наличие файлов
    required_files = ['index.html', 'config.js', 'script.js']
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(os.path.join(DIRECTORY, file)):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Отсутствуют необходимые файлы: {', '.join(missing_files)}")
        sys.exit(1)
    
    # Запуск сервера
    try:
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
    
    except KeyboardInterrupt:
        print("\n🛑 Server shutting down gracefully...")
        print("✅ Server stopped")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Порт {PORT} уже используется. Попробуйте другой порт:")
            print(f"   python3 server.py --port 3001")
        else:
            print(f"❌ Ошибка запуска сервера: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
