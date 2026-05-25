const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const promptConfig = require('../../prompt');
const { isLoggedIn } = require('../middleware/auth');

// Initialize Gemini with the provided API Key
const apiKey = "AIzaSyCs0LRd_MPoTRSpWUcdshsMjFETfwn6QAI";
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * POST /chat/message
 * Handles incoming chatbot queries and forwards them to Gemini
 */
router.post('/message', isLoggedIn, async (req, res) => {
    try {
        const { message, chatHistory } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        // Use the highly efficient and fast gemini-2.5-flash model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: promptConfig.systemInstruction
        });

        // Format history for Gemini's structure
        const formattedHistory = (chatHistory || []).map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
        }));

        let responseText = '';
        try {
            // Start chat session with conversational history
            const chat = model.startChat({
                history: formattedHistory
            });
            const result = await chat.sendMessage(message);
            responseText = result.response.text();
        } catch (chatError) {
            console.error('Chat history session failed, falling back to stateless generation:', chatError);
            // Robust fallback to direct generation to guarantee success
            const result = await model.generateContent(message);
            responseText = result.response.text();
        }

        return res.json({ success: true, reply: responseText });
    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to generate advice from Gemini AI' });
    }
});

module.exports = router;
