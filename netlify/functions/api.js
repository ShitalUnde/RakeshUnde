const express = require('express');
const serverless = require('serverless-http');

const app = express();

const router = express.Router();
app.use(express.json());

// Your API routes
router.get('/', (req, res) => {
    res.json({ message: 'API is working!' });
});

router.get('/ok', (req, res) => {
    res.json({ message: 'API1 is working!' });
});

router.post('/api/ok2', (req, res) => {
    res.json({ message: 'API2 is working!' });
});

// Error handling
// app.use((req, res) => {
//     res.status(404).json({ error: 'Not found' });
// });

// Export the serverless function temp
module.exports.handler = serverless(app);