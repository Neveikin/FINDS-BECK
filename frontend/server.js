const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Routes for serving HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/shops', (req, res) => {
    res.sendFile(path.join(__dirname, 'shops.html'));
});

app.get('/shop-products', (req, res) => {
    res.sendFile(path.join(__dirname, 'shop-products.html'));
});

// API proxy to backend
app.use('/api', (req, res) => {
    const targetUrl = `http://localhost:8080${req.originalUrl}`;
    
    // Simple proxy using fetch
    fetch(targetUrl, {
        method: req.method,
        headers: {
            'Content-Type': 'application/json',
            ...req.headers
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    })
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy error' });
    });
});

app.listen(PORT, () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
    console.log('Available pages:');
    console.log('  - http://localhost:3000/ (Главная)');
    console.log('  - http://localhost:3000/login (Вход)');
    console.log('  - http://localhost:3000/register (Регистрация)');
    console.log('  - http://localhost:3000/dashboard (Личный кабинет)');
    console.log('  - http://localhost:3000/shops (Магазины)');
    console.log('  - http://localhost:3000/shop-products (Товары)');
});
