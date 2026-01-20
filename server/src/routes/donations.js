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

const { generatePayHereHash } = require('../utils/payhere'); // Keeping for reference if needed, but switching to Razorpay primarily
const razorpay = require('../utils/razorpay');
const crypto = require('crypto');

// Razorpay: Create Order
router.post('/create-razorpay-order', authenticateToken, async (req, res) => {
    const { amount, currency = 'INR' } = req.body;

    // Razorpay accepts amount in subunits (paise for INR), so multiply by 100
    const options = {
        amount: Math.round(parseFloat(amount) * 100),
        currency,
        receipt: `receipt_${new Date().getTime()}`
    };

    try {
        const order = await razorpay.orders.create(options);

        // Create a local donation record in PENDING state
        // We use the Razorpay order ID to track it
        const donation = await prisma.donation.create({
            data: {
                amount: parseFloat(amount),
                currency,
                status: 'PENDING',
                userId: req.user.id,
                stripePaymentIntentId: order.id // Using this field to store Razorpay Order ID for now
            }
        });

        res.json({
            orderId: order.id,
            amount: options.amount,
            currency: options.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            donationId: donation.id
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Razorpay: Verify Payment
router.post('/verify-razorpay-payment', authenticateToken, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Payment is legit
        try {
            await prisma.donation.update({
                where: { id: parseInt(donationId) },
                data: {
                    status: 'SUCCESS',
                    // Could store payment_id in a new field if schema allows, or just log it
                }
            });
            res.json({ status: 'SUCCESS' });
        } catch (error) {
            res.status(500).json({ error: 'Database update failed after success payment' });
        }
    } else {
        res.status(400).json({ error: 'Invalid signature' });
    }
});

// Razorpay: Payment Failed
router.post('/payment-failed', authenticateToken, async (req, res) => {
    const { donationId, errorDescription } = req.body;

    try {
        await prisma.donation.update({
            where: { id: parseInt(donationId) },
            data: {
                status: 'FAILED',
                // Optionally log the error description if you had a field for it
            }
        });
        res.json({ status: 'UPDATED', message: 'Payment marked as failed' });
    } catch (error) {
        console.error('Error updating payment failure:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
});

// PayHere Hash Generation (Legacy/Alternative)
router.post('/create-payhere-hash', authenticateToken, async (req, res) => {
    const { amount, currency } = req.body;
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) {
        // Fallback for demo if env vars are missing, using "12345" as dummy if not provided
        // But better to return error or explicit instructions.
        // For this user request, we want it to "work" or at least try. 
        // I will return an error if missing so the user knows to add them.
        return res.status(500).json({ error: 'PayHere credentials (PAYHERE_MERCHANT_ID, PAYHERE_MERCHANT_SECRET) not configured in server .env' });
    }

    try {
        const donation = await prisma.donation.create({
            data: {
                amount: parseFloat(amount),
                currency,
                status: 'PENDING',
                userId: req.user.id
            }
        });

        const orderId = donation.id.toString();
        const hash = generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret);

        res.json({
            hash,
            merchantId,
            orderId,
            amount: parseFloat(amount).toFixed(2), // PayHere expects 2 decimal places in hash usually, sending back strict format
            currency
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Confirm PayHere Payment (called after successful client-side flow)
router.post('/confirm-payhere-payment', authenticateToken, async (req, res) => {
    const { donationId } = req.body;

    try {
        await prisma.donation.update({
            where: { id: parseInt(donationId) },
            data: {
                status: 'SUCCESS',
                // We might want to store the PayHere payment ID if sent from client
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
