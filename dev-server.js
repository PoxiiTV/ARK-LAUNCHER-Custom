const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 1420;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.ico': 'image/x-icon',
    '.png': 'image/png'
};

const server = http.createServer((req, res) => {
    // Evitar navegación fuera de la raíz y apuntar a src-web
    let filePath = path.join(__dirname, 'src-web', req.url === '/' ? 'index.html' : req.url);
    
    // Obtener la extensión del archivo
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Error del servidor: ${error.code} ..\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Servidor de desarrollo local corriendo en http://localhost:${PORT}`);
});
