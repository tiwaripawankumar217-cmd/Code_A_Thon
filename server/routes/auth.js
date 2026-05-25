const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// --- Root redirect ---
router.get('/', (req, res) => {
    res.redirect('/auth/login');
});

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

// --- Google OAuth ---
router.get('/google', (req, res, next) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Dynamically check if the user has configured their real credentials yet
    const isConfigured = clientId && 
                         clientSecret && 
                         !clientId.includes('YOUR_REAL_') && 
                         !clientSecret.includes('YOUR_REAL_') && 
                         !clientId.startsWith('DUMMY') && 
                         clientId !== 'DUMMY_GOOGLE_CLIENT_ID';
                         
    if (!isConfigured) {
        // Intercept invalid credentials BEFORE letting Google show the raw 401 Access Blocked screen!
        console.log("⚠️ [Auth Routing] Real Google OAuth credentials not yet fully set up in .env. Redirecting to configuration setup guide...");
        return res.redirect('/auth/google/setup-required');
    }
    
    // If configured, trigger the real Google Sign-In redirect
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res, next);
});

// Setup instructions help page
router.get('/google/setup-required', (req, res) => {
    res.render('google_setup_required');
});

// Demo sandbox bypass route
router.get('/google/bypass', async (req, res, next) => {
    try {
        console.log("⚡ [Auth Sandbox] Bypassing Google OAuth. Logging in as local mock sandbox developer profile...");
        User.findOne({ googleId: 'mock_google_id_12345' })
            .then(async (user) => {
                if (!user) {
                    user = new User({
                        googleId: 'mock_google_id_12345',
                        username: 'google_test_user@gmail.com',
                        firstName: 'Google (Mock)',
                        lastName: 'Test User'
                    });
                    await user.save();
                }
                
                req.login(user, err => {
                    if (err) return next(err);
                    res.redirect('/dashboard');
                });
            })
            .catch(err => next(err));
    } catch (e) {
        next(e);
    }
});

// Local Simulated Google Sign-In Route
router.get('/google/signin', async (req, res, next) => {
    try {
        const { name, email } = req.query;
        if (!name || !email) {
            return res.redirect('/auth/login');
        }
        
        console.log(`⚡ [Google Sign-in] Local Simulated Authentication for: ${name} (${email})`);
        
        const names = name.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || 'User';
        
        let user = await User.findOne({ username: email });
        if (!user) {
            user = new User({
                googleId: `simulated_google_${Date.now()}`,
                username: email,
                firstName: firstName,
                lastName: lastName
            });
            await user.save();
        }
        
        req.login(user, err => {
            if (err) return next(err);
            res.redirect('/dashboard');
        });
    } catch (e) {
        next(e);
    }
});

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/auth/login'
}), (req, res) => {
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
