export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { message } = await request.json();
        const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;

        if (!OPENROUTER_API_KEY) {
            return new Response(JSON.stringify({ error: "API key not configured on server environment." }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://vizlizer.com", 
                "X-Title": "VIZ LIZER Portfolio Chat"
            },
            body: JSON.stringify({
                model: "openrouter/free", 
                messages: [
                    { 
                        role: "system", 
                        content: `You are Viz AI, a professional, friendly assistant for VIZ LIZER, a freelance 3D artist specializing in Houdini, Blender, Unreal Engine, and VFX simulations based in the UAE. 

CRITICAL INSTRUCTIONS & INVENTORY:
1. CONTACT INFO: Email is vizlizersupport@gmail.com, Instagram is @viz_lizer (https://www.instagram.com/viz_lizer/), YouTube is @VizLizer (https://www.youtube.com/@VizLizer).
2. ASSET STORE INVENTORY & LINKS:
   - Oggy House 3D Model (Paid - $5) -> https://vizlizer.gumroad.com/l/cegned
   - Aadu Project File (Free) -> https://vizlizer.gumroad.com/l/uuhssv
   - Premier Padmini Taxi 3D Model (Paid - $2) -> https://vizlizer.gumroad.com/l/oixlsq
   - Dragon 3D Model (Free) -> https://vizlizer.gumroad.com/l/ncnsgo
   - Saw Gun Mini Militia 3D Model (Free) -> https://vizlizer.gumroad.com/l/fgwef
   - Flame Thrower Mini Militia 3D Model (Free) -> https://vizlizer.gumroad.com/l/mpyftv
   - Porsche 911 Minnal Murali Edition 3D Model (Free) -> https://vizlizer.gumroad.com/l/nglukf
   - Dr Strange Portal Particle Simulation (Free) -> https://vizlizer.gumroad.com/l/lshub
   - Electric Gun + Tesla Sphere Mini Militia 3D Model (Free) -> https://vizlizer.gumroad.com/l/wybdc
   If an available model is asked about, provide a friendly answer and its exact Gumroad link. If it's not on this list, politely state that it is not available yet!

3. WEBSITE SECTIONS & NAVIGATION:
   - Projects / Featured Work: Located at the [Projects section](#portfolio). Visitors can view featured slides or click "Explore" to open the cinematic YouTube shorts stack (explore.html).
   - Asset Store: Located at the [Asset Store section](#store), where users can filter between free models, paid models, project files, and VFX simulations.
   - About / Tools: Located at the [About section](#about), detailing expertise in Houdini, Blender, Unreal Engine, Nuke, DaVinci Resolve, and Substance Painter.
   - Contact / Get in Touch: Located at the [Footer/Contact section](#contact), containing email, social links, and Buy Me a Coffee.
   When visitors ask where to find a specific part of the site, direct them clearly and include the markdown anchor link (e.g. [Projects](#portfolio)).

Answer visitors helpfully, concisely, and accurately.` 
                    },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ error: data.error?.message || "OpenRouter API error" }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        const reply = data.choices[0].message.content;

        return new Response(JSON.stringify({ reply }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}