const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            if (!path.extname(filePath)) {
                filePath += '.html';
                fs.access(filePath, fs.constants.F_OK, (err2) => {
                    if (err2) {
                        send404(res);
                        return;
                    }
                    serveFile(filePath, res);
                });
            } else {
                send404(res);
            }
            return;
        }

        serveFile(filePath, res);
    });
});

function serveFile(filePath, res) {
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            send500(res);
            return;
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.writeHead(200);
        res.end(data);
    });
}

function send404(res) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>404 - Страница не найдена</title></head>
        <body>
            <h1>404 - Страница не найдена</h1>
            <p><a href="/">На главную</a></p>
        </body>
        </html>
    `);
}

function send500(res) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>500 - Ошибка сервера</title></head>
        <body>
            <h1>500 - Внутренняя ошибка сервера</h1>
            <p><a href="/">На главную</a></p>
        </body>
        </html>
    `);
}

server.listen(PORT, HOST, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Frontend Server Started                   ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 Server running at: http://${HOST}:${PORT}                   ║
║  📁 Serving files from: ${path.resolve(__dirname)}              ║
║  🌐 Available routes:                                          ║
║     • http://${HOST}:${PORT}/ - Главная страница                ║
║     • http://${HOST}:${PORT}/index.html - Вход/Регистрация      ║
║     • http://${HOST}:${PORT}/dashboard.html - Личный кабинет    ║
║                                                              ║
║  🛑 Press Ctrl+C to stop the server                           ║
╚══════════════════════════════════════════════════════════════╝
    `);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});
