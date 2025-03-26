const express = require('express');
const serverless = require('serverless-http');

const app = express();

const router = express.Router();
app.use(express.json());

// Your API routes
router.get('/', (req, res) => {
    res.send('API is working!');
});

router.get('/ok', (req, res) => {
    res.send('API1 is working!');
});

router.post('/api/ok2', (req, res) => {
    res.send({ message: 'API2 is working!' });
});

app.use('/.netlify/functions/api', router);

// Export the serverless function temp
module.exports.handler = serverless(app);