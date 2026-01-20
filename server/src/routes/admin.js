const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get Stats
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalDonationsCount = await prisma.donation.count();
        const totalAmount = await prisma.donation.aggregate({
            _sum: { amount: true },
            where: { status: 'SUCCESS' }
        });

        res.json({
            totalUsers,
            totalDonationsCount,
            totalAmount: totalAmount._sum.amount || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear All Users
router.delete('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Warning: This will delete the logged in admin too in this simple implementation
        const { count } = await prisma.user.deleteMany({});
        res.json({ message: 'All users cleared', count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Donations
router.get('/donations', authenticateToken, isAdmin, async (req, res) => {
    try {
        const donations = await prisma.donation.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear All Donations
router.delete('/donations', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { count } = await prisma.donation.deleteMany({});
        res.json({ message: 'All donations cleared', count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
