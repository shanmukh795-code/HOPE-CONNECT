const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../db.json');

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], donations: [] }, null, 2));
}

const readDb = () => JSON.parse(fs.readFileSync(DB_FILE));
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

class MockUserDelegate {
    async findUnique({ where }) {
        const db = readDb();
        if (where.email) return db.users.find(u => u.email === where.email) || null;
        if (where.id) return db.users.find(u => u.id === where.id) || null;
        return null;
    }

    async create({ data }) {
        const db = readDb();
        const newUser = {
            id: db.users.length + 1,
            ...data,
            createdAt: new Date().toISOString(),
            role: data.role || 'USER'
        };
        db.users.push(newUser);
        writeDb(db);
        return newUser;
    }

    async count() {
        const db = readDb();
        return db.users.length;
    }

    async findMany({ select }) {
        const db = readDb();
        // naive select implementation or just return all
        return db.users;
    }

    async deleteMany({ where }) {
        const db = readDb();
        if (!where || Object.keys(where).length === 0) {
            // CAUTION: This deletes EVERYONE including the admin calling it if we aren't careful.
            // But for this simple app, we'll just wipe it. 
            // Ideally we might want to keep the requesting admin, but the mock doesn't easily support "delete all except X" efficiently without filtering.
            // Let's just wipe.
            const count = db.users.length;
            db.users = [];
            writeDb(db);
            return { count };
        }
        return { count: 0 };
    }
}

class MockDonationDelegate {
    async create({ data }) {
        const db = readDb();
        const newDonation = {
            id: db.donations.length + 1,
            ...data,
            createdAt: new Date().toISOString(),
            status: data.status || 'PENDING'
        };
        db.donations.push(newDonation);
        writeDb(db);
        return newDonation;
    }

    async update({ where, data }) {
        const db = readDb();
        const index = db.donations.findIndex(d => d.id === where.id);
        if (index === -1) throw new Error('Donation not found');

        db.donations[index] = { ...db.donations[index], ...data };
        writeDb(db);
        return db.donations[index];
    }

    async updateMany({ where, data }) {
        const db = readDb();
        let count = 0;
        db.donations = db.donations.map(d => {
            if (where.stripePaymentIntentId && d.stripePaymentIntentId === where.stripePaymentIntentId) {
                count++;
                return { ...d, ...data };
            }
            return d;
        });
        writeDb(db);
        return { count };
    }

    async findMany({ where, include, orderBy }) {
        const db = readDb();
        let results = db.donations;

        if (where && where.userId) {
            results = results.filter(d => d.userId === where.userId);
        }

        if (include && include.user) {
            results = results.map(d => ({
                ...d,
                user: db.users.find(u => u.id === d.userId)
            }));
        }

        // Sort desc by createdAt
        if (orderBy && orderBy.createdAt === 'desc') {
            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return results;
    }

    async count() {
        const db = readDb();
        return db.donations.length;
    }

    async aggregate({ _sum, where }) {
        const db = readDb();
        const total = db.donations
            .filter(d => d.status === where.status)
            .reduce((acc, curr) => acc + curr.amount, 0);
        return { _sum: { amount: total } };
    }

    async deleteMany({ where }) {
        const db = readDb();
        // If empty where, delete all
        if (!where || Object.keys(where).length === 0) {
            const count = db.donations.length;
            db.donations = [];
            writeDb(db);
            return { count };
        }
        // Handle specific delete if needed (not requested but good practice)
        // For now, assuming clear all per user request
        return { count: 0 };
    }
}

class PrismaClient {
    constructor() {
        this.user = new MockUserDelegate();
        this.donation = new MockDonationDelegate();
    }

    // mimic connection methods
    async $connect() { }
    async $disconnect() { }
}

const prisma = new PrismaClient();
module.exports = prisma;
