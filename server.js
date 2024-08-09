// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3000;

// Mengatur middleware untuk menyajikan file statis dari folder 'public'
app.use(express.static('public'));

// Mengatur proxy middleware untuk API
const apiProxy = createProxyMiddleware('/api', {
    target: 'https://suitmedia-backend.suitdev.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api',
    },
    onProxyReq: (proxyReq) => {
        // Menambahkan header Content-Type jika diperlukan
        proxyReq.setHeader('Content-Type', 'application/json');
    }
});

app.use('/api', apiProxy);

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});
