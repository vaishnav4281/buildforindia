import { OpenAI } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Use server-side environment variable (no VITE_ prefix needed here)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { messages, response_format, temperature } = req.body;

        if (!messages) {
            return res.status(400).json({ error: "Messages are required" });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            response_format,
            temperature: temperature ?? 0.7,
        });

        return res.status(200).json(completion.choices[0].message);
    } catch (error: any) {
        console.error("OpenAI API Error:", error);
        return res.status(error.status || 500).json({
            error: error.message || "An error occurred during OpenAI request",
        });
    }
}
