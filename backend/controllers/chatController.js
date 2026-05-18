const db = require('../config/db');
// Axios removed as we use native fetch


// Get Context Data (Menu & Info)
const getContext = async () => {
    try {
        const [menuItems] = await db.query("SELECT name, description, price, category_id, is_veg FROM menu_items");

        // Fetch Restaurant Info
        const [restaurantInfo] = await db.query("SELECT * FROM restaurant_info LIMIT 1");
        const info = restaurantInfo[0] || {};

        let context = "RESTAURANT INFO:\n";
        context += `Name: ${info.name || 'Moonstone Café'}\n`;
        context += `Address: ${info.address || 'Not available'}\n`;
        context += `Phone: ${info.phone || 'Not available'}\n`;
        context += `Email: ${info.email || 'Not available'}\n`;
        context += `Opening Hours: ${info.opening_hours || 'Not available'}\n`;
        context += `Cuisine: ${info.cuisine_type || 'Multicuisine'}\n`;
        if (info.extra_info) {
            context += `Additional Info: ${info.extra_info}\n`;
        }
        context += "Ambiance: Luxury, Fine Dining\n";

        context += "\nMENU ITEMS:\n";
        menuItems.forEach(item => {
            context += `- ${item.name} (${item.is_veg ? 'Veg' : 'Non-Veg'}): ${item.description} - ₹${item.price}\n`;
        });

        return context;
    } catch (error) {
        console.error("Error fetching context:", error);
        return "";
    }
};

exports.handleChat = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const context = await getContext();

        // Get all available keys
        const keysString = process.env.AI_API_KEYS || process.env.AI_API_KEY || "";
        const apiKeys = keysString.split(',').map(k => k.trim()).filter(k => k);

        if (apiKeys.length === 0) {
            console.log("No API Keys found. Using mock response.");
            return res.json({
                reply: "I am the Moonstone Café Digital Concierge. Please configure my API keys to enable my full intelligence!"
            });
        }

        // Fallback Loop
        let lastError = null;
        for (const apiKey of apiKeys) {
            try {
                console.log(`Attempting AI call with key ending in ...${apiKey.slice(-4)}`);

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
                const response = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `SYSTEM: You are a luxury restaurant concierge for Moonstone Café. Here is the context:\n${context}\n\nUSER: ${message}\n\nAnswer politely and briefly. If the answer is in the context, use it. If not, politely say you don't know.` }]
                        }]
                    })
                });

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error.message);
                }

                // Success!
                const reply = data.candidates[0].content.parts[0].text;
                return res.json({ reply });

            } catch (error) {
                console.error(`Key ...${apiKey.slice(-4)} failed:`, error.message);
                lastError = error;
                // Continue to next key...
            }
        }

        // If loop finishes without success
        throw new Error("All API keys failed. Last error: " + (lastError ? lastError.message : "Unknown"));

    } catch (error) {
        console.error("AI Chat Error:", error);
        return res.status(500).json({ error: "I am having trouble connecting to my knowledge base right now. Please try again later." });
    }
};
