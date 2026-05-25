const { Agenda } = require('agenda');
const { MongoBackend } = require('@agendajs/mongo-backend');
const Transaction = require('../models/Transaction');
const { sendFraudAlert } = require('../utils/sse');

const agenda = new Agenda({
    backend: new MongoBackend({ 
        address: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codeathon_db',
        collection: 'agendaJobs'
    })
});

// Define the fraud detection job
agenda.define('detect-fraud', async (job) => {
    const { transactionId } = job.attrs.data;
    
    // 1. Fetch the transaction
    const txn = await Transaction.findById(transactionId);
    if (!txn) {
        console.error(`[Agenda] Transaction ${transactionId} not found`);
        return;
    }

    try {
        console.log(`[Agenda] Checking fraud for transaction ${transactionId}...`);
        
        // 1.5 Calculate Time Features
        const txnDate = new Date(txn.date);
        const day_of_week = txnDate.getDay(); // 0 (Sun) to 6 (Sat)
        const is_weekend = (day_of_week === 0 || day_of_week === 6) ? 1 : 0;
        
        // 1.6 Calculate Velocity Features (last 24 hours)
        const twentyFourHoursAgo = new Date(txnDate.getTime() - (24 * 60 * 60 * 1000));
        const recentTxns = await Transaction.find({
            user: txn.user,
            _id: { $ne: txn._id }, // Exclude current txn
            date: { $gte: twentyFourHoursAgo, $lte: txnDate }
        });
        
        const txns_last_24h = recentTxns.length;
        const amount_last_24h = recentTxns.reduce((sum, t) => sum + t.amount, 0);
        
        // 2. Call Flask ML service
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        const response = await fetch(`${mlServiceUrl}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: txn.amount,
                type: txn.type,
                category: txn.category,
                date: txn.date,
                day_of_week,
                is_weekend,
                txns_last_24h,
                amount_last_24h
            })
        });

        if (!response.ok) {
            throw new Error(`ML Service returned ${response.status}`);
        }

        const result = await response.json();

        // 3. Update the transaction with ML results
        txn.isFlagged = result.isFlagged;
        txn.fraudScore = result.fraudScore;
        txn.flagReasons = result.flagReasons;
        await txn.save();
        
        console.log(`[Agenda] Transaction ${transactionId} fraud check complete. isFlagged: ${result.isFlagged}`);
        
        // 4. Send SSE Alert if flagged
        if (result.isFlagged) {
            sendFraudAlert(txn.user, {
                type: 'fraud_alert',
                transactionId: txn._id,
                amount: txn.amount,
                category: txn.category,
                score: result.fraudScore,
                reasons: result.flagReasons
            });
        }
        
    } catch (error) {
        console.error(`[Agenda] Error during detect-fraud for transaction ${transactionId}:`, error.message);
        // Throw error so agenda can retry if necessary
        throw error;
    }
});

module.exports = agenda;
