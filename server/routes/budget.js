const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { isLoggedIn } = require('../middleware/auth');

// Protect all budget routes
router.use(isLoggedIn);

// Helper to get start and end dates of the current month
function getCurrentMonthRange() {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setSeconds(end.getSeconds() - 1);

    return { start, end };
}

// --- GET budgets page ---
router.get('/', async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const { start: monthStart, end: monthEnd } = getCurrentMonthRange();

        // 1. Fetch all budgets for the current month
        const budgets = await Budget.find({ user: userId, periodMonth: currentMonth, periodYear: currentYear });

        // 2. Fetch expenses in the current month to compute spending per category
        const monthlyExpenses = await Transaction.find({
            user: userId,
            type: 'expense',
            date: { $gte: monthStart, $lte: monthEnd }
        });

        const categorySpent = {};
        let spentTotal = 0;

        monthlyExpenses.forEach(t => {
            categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
            spentTotal += t.amount;
        });

        const limitTotal = budgets.reduce((sum, b) => sum + b.limitAmount, 0);

        res.render('budgets', {
            budgets,
            categorySpent,
            spentTotal,
            limitTotal
        });
    } catch (e) {
        console.error("Error loading budgets:", e);
        res.status(500).send("Error loading budgets");
    }
});

// --- POST create/update budget limit ---
router.post('/', async (req, res) => {
    try {
        const { category, limitAmount, alertThreshold } = req.body;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        await Budget.findOneAndUpdate(
            { user: req.user._id, category, periodMonth: currentMonth, periodYear: currentYear },
            {
                limitAmount: parseFloat(limitAmount),
                alertThreshold: alertThreshold ? parseInt(alertThreshold) : 80
            },
            { upsert: true, new: true }
        );

        res.redirect('/budgets');
    } catch (e) {
        console.error("Error setting budget limit:", e);
        res.redirect('/budgets');
    }
});

// --- DELETE budget limit ---
router.delete('/:id', async (req, res) => {
    try {
        await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.redirect('/budgets');
    } catch (e) {
        console.error("Error deleting budget:", e);
        res.redirect('/budgets');
    }
});

module.exports = router;
