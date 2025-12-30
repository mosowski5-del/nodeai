const newrelic = require('newrelic');
require('dotenv').config(); // Load environment variables
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');

// URL: http://localhost:3000/chat
// json payload: {"prompt": "why does hunter sailboats have a bad reputation"}
//do as environment variables
//NEW_RELIC_AI_MONITORING_ENABLED=true
//NEW_RELIC_APP_NAME=nodeAI(Prod)
//NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_MAX_SAMPLES_STORED=100k
//NEW_RELIC_LICENSE_KEY=~~~~~~e4e8a56e8f944d1901cdeaaaFFFFNRAL
//NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED=10k

const app = express();
app.use(cors({
  origin: 'http://localhost:4173' 
}));

const port = 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json()); // Enable JSON body parsing for requests

// --- 1. CHAT COMPLETION ENDPOINT (Existing Logic) ---
app.post('/chat', async (req, res) => {
    try {
        console.log(req.body);
        const { prompt } = req.body; // Expect a 'prompt' in the request body
        const responseId = newrelic.getTraceMetadata().traceId;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        // Generate a unique ID for this response to link feedback later
        // Using a timestamp combined with a random number is a simple approach
        
       //gpt-5-mini
       //gpt-3.5-turbo
        const completion = await openai.chat.completions.create({
            model: "gpt-5-mini", // Or another desired model
            messages: [{ role: "user", content: prompt }],
        });

        // Add the responseId to the result so the frontend can send it back with the feedback
        res.json({ 
            response: completion.choices[0].message.content,
            responseId: responseId 
        });

    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({ error: 'Failed to get response from OpenAI' });
    }
});

// --- 2. FEEDBACK ENDPOINT (New Logic) ---
app.post('/feedback', async (req, res) => {
    try {
        const { responseId, rating, comment } = req.body;
        
        if (!responseId || !rating) {
            return res.status(400).json({ error: 'Response ID and rating are required.' });
        }

        newrelic.recordLlmFeedbackEvent({
            traceId: responseId,
            rating: rating, // Required: "-1" (thumbs down), "0" (neutral), or "1" (thumbs up) as a string or number
            category: comment  // Optional: User-provided text feedback
        });
        // In a real application, this is where you would save the feedback to a database (e.g., MongoDB, PostgreSQL)

        res.status(200).json({ message: 'Feedback received.' });

    } catch (error) {
        console.error('Error recording feedback:', error);
        res.status(500).json({ error: 'Failed to record feedback' });
    }
});

app.listen(port, () => {
    console.log(`OpenAI webservice listening at http://localhost:${port}`);
});