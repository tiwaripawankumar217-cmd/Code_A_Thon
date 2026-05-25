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

        const budgets = await Budget.find({ user: userId, periodMonth: currentMonth, periodYear: currentYear });

        const [monthlyExpenses, monthlyIncomeTxns] = await Promise.all([
            Transaction.find({ user: userId, type: 'expense', date: { $gte: monthStart, $lte: monthEnd } }),
            Transaction.find({ user: userId, type: 'income', date: { $gte: monthStart, $lte: monthEnd } })
        ]);

        const categorySpent = {};
        let spentTotal = 0;
        monthlyExpenses.forEach(t => {
            categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
            spentTotal += t.amount;
        });

        const limitTotal = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
        const monthlyIncome = monthlyIncomeTxns.reduce((s, t) => s + t.amount, 0);

        const error = req.query.error || null;
        const errorIncome = req.query.income ? parseFloat(req.query.income) : null;
        const errorAttempted = req.query.attempted ? parseFloat(req.query.attempted) : null;

        res.render('budgets', {
            budgets,
            categorySpent,
            spentTotal,
            limitTotal,
            monthlyIncome,
            error,
            errorIncome,
            errorAttempted
        });
    } catch (e) {
        console.error("Error loading budgets:", e);
        res.status(500).send("Error loading budgets");
    }
});

// --- POST reset all budgets for current month ---
router.post('/reset', async (req, res) => {
    try {
        const now = new Date();
        await Budget.deleteMany({
            user: req.user._id,
            periodMonth: now.getMonth() + 1,
            periodYear: now.getFullYear()
        });
        res.redirect('/budgets');
    } catch (e) {
        console.error("Error resetting budgets:", e);
        res.redirect('/budgets');
    }
});

// --- POST create/update budget limit ---
router.post('/', async (req, res) => {
    try {
        const { limitAmount, alertThreshold } = req.body;
        const category = 'Global'; // Hardcoded global budget
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Validate: total budget must not exceed monthly income
        const [monthlyIncomeTxns] = await Promise.all([
            Transaction.find({ user: req.user._id, type: 'income', date: { $gte: monthStart, $lte: monthEnd } })
        ]);

        const totalIncome = monthlyIncomeTxns.reduce((s, t) => s + t.amount, 0);
        const newTotal = parseFloat(limitAmount);

        if (totalIncome > 0 && newTotal > totalIncome) {
            return res.redirect(`/budgets?error=exceeds_income&income=${totalIncome.toFixed(2)}&attempted=${newTotal.toFixed(2)}`);
        }

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
