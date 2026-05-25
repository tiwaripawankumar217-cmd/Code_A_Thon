const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// --- Register ---
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res, next) => {
    try {
        const { username, password, firstName, lastName } = req.body;
        const user = new User({ username, firstName, lastName });
        const registeredUser = await User.register(user, password);
        
        // Log them in immediately after registration
        req.login(registeredUser, err => {
            if (err) return next(err);
            // res.flash('success', 'Welcome to FraudGuard!'); // if flash was setup
            res.redirect('/dashboard');
        });
    } catch (e) {
        // res.flash('error', e.message);
        console.error(e);
        res.redirect('/auth/register');
    }
});

// --- Login ---
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login',
    // failureFlash: true // if flash was setup
}), (req, res) => {
    // res.flash('success', 'Welcome back!');
    res.redirect('/dashboard');
});

// --- Logout ---
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        // res.flash('success', 'Logged out successfully');
        res.redirect('/auth/login');
    });
});

module.exports = router;
