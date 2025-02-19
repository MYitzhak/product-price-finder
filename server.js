require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001; // שימוש ב-Port של Render
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ✅ הגשת הקבצים הסטטיים מהתיקייה 'public'
app.use(express.static(path.join(__dirname, "public")));

// ✅ הצגת עמוד החיפוש כשנכנסים לכתובת הראשית
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ נתיב API לחיפוש מוצרים
app.get("/api/search", async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-2024-05-13",
                messages: [
                    {
                        role: "system",
                        content: "You are a tool that finds products online, providing the best prices, shipping costs, and links to purchase.",
                    },
                    {
                        role: "user",
                        content: `Find the best prices for "${query}" with shipping costs and purchase links.`,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        const chatResponse = response.data.choices[0].message.content;
        const parsedResults = JSON.parse(chatResponse); // Ensure the response is in JSON format
        res.json(parsedResults);
    } catch (error) {
        console.error("Error querying OpenAI:", error.response ? error.response.data : error.message);
        res.status(500).json({
            error: "Failed to fetch product data",
            details: error.response ? error.response.data : error.message
        });
    }
});

// ✅ מאזין לבקשות ב-Render
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
