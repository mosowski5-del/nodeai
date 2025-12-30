const newrelic = require('newrelic');
require('dotenv').config(); // Load environment variables
const express = require('express');
const OpenAI = require('openai');

//URL: http://localhost:3000/chat
//json payload: {"prompt": "why does hunter sailboats have a bad reputation"}
//do as environment variables
//NEW_RELIC_AI_MONITORING_ENABLED=true
//NEW_RELIC_APP_NAME=nodeAI(Prod)
//NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_MAX_SAMPLES_STORED=100k
//NEW_RELIC_LICENSE_KEY=~~~~~~e4e8a56e8f944d1901cdeaaaFFFFNRAL
//NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED=10k

const app = express();
const port = 3000;

const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    app.use(express.json()); // Enable JSON body parsing for requests

    // Example API endpoint for chat completions
    app.post('/chat', async (req, res) => {
        try {
            console.log(req.body);
            const { prompt } = req.body; // Expect a 'prompt' in the request body

            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }
            
            //gpt-5-mini
            //gpt-3.5-turbo

            const completion = await openai.chat.completions.create({
                model: "gpt-5-mini", // Or another desired model
                messages: [{ role: "user", content: prompt }],
            });

            res.json({ response: completion.choices[0].message.content });

        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            res.status(500).json({ error: 'Failed to get response from OpenAI' });
        }
    });

    
    app.listen(port, () => {
        console.log(`OpenAI webservice listening at http://localhost:${port}`);
    });