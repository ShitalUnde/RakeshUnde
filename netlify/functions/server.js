const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.use(express.json());

// Example route
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Netlify!' });
});

// For local testing
if (require.main === module) {
    app.listen(3000, () => console.log('Local server running on port 3000'));
}

// Export for Netlify Functions
module.exports.handler = serverless(app);