exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!OPENROUTER_API_KEY) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "API key not configured on server environment." }) 
            };
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://vizlizer.netlify.app", 
                "X-Title": "VIZ LIZER Portfolio Chat"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat-free:free", // Free tier model
                messages: [
                    { 
                        role: "system", 
                        content: "You are Viz AI, a professional, friendly assistant for VIZ LIZER, a 3D artist specializing in Houdini, Blender, Unreal Engine, and VFX simulations based in the UAE. Answer visitors helpfully, concisely, and accurately about his artwork, simulations, and asset store." 
                    },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ error: data.error?.message || "OpenRouter API error" }) 
            };
        }

        const reply = data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message }) 
        };
    }
};