const express = require('express');
const serverless = require('serverless-http');

const app = express();

// No body-parser needed - express includes it now
app.use(express.json());

// Your API routes
app.get('/', (req, res) => {
    res.json({ message: 'API is working!' });
});

app.post('/api/ok', (req, res) => {
    res.json({ received: req.body });
});

// Error handling
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Export the serverless function temp
module.exports.handler = serverless(app);