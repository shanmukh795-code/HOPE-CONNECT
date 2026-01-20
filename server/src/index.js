require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: true, // Allow any origin for development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Webhook handling must be before express.json() if we implement Stripe webhooks properly.
// For now, we are skipping webhooks or will add raw body parsing later if needed.

app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('NGO Donation Server is running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/admin', require('./routes/admin'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
