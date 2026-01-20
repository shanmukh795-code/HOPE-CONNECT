const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

// MOCK Payment Intent (No real Stripe dependency needed)
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
    const { amount, currency = 'usd' } = req.body;

    try {
        // Create a record in PENDING state
        const donation = await prisma.donation.create({
            data: {
                amount: parseFloat(amount),
                currency,
                status: 'FAILED', // Default to FAILED as per user request (will update to SUCCESS on payment)
                userId: req.user.id
            }
        });

        // Return a fake client secret and the donation ID
        res.json({
            clientSecret: 'mock_secret_' + new Date().getTime(),
            donationId: donation.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment intent', error: error.message });
    }
});

// Confirm Mock Donation
router.post('/confirm-payment', authenticateToken, async (req, res) => {
    const { donationId } = req.body; // Changed to expect donationId directly for mock

    try {
        await prisma.donation.update({
            where: { id: parseInt(donationId) },
            data: {
                status: 'SUCCESS',
                stripePaymentIntentId: 'mock_pi_' + new Date().getTime()
            }
        });
        res.json({ status: 'SUCCESS' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User History
router.get('/my-history', authenticateToken, async (req, res) => {
    try {
        const donations = await prisma.donation.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
