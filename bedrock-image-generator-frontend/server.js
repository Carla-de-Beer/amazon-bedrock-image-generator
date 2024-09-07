// For AWS ElasticBeanstalk deployment point the start entrypoint to this node server:
// "start": "node server.js"

const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'build', req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    const contentType = getContentType(extname) || 'text/html';

    fs.exists(filePath, exists => {
        if (exists) {
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error');
                } else {
                    res.writeHead(200, {'Content-Type': contentType});
                    res.end(content);
                }
            });
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    });
});

function getContentType(extname) {
    switch (extname) {
        case '.js':
            return 'text/javascript';
        case '.css':
            return 'text/css';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
            return 'image/jpeg';
        case '.gif':
            return 'image/gif';
        case '.svg':
            return 'image/svg+xml';
        default:
            return 'text/html';
    }
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
}).on('error', err => {
    console.error('Server error:', err);
});
