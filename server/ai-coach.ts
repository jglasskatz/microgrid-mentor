import { Request, Response } from "express";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handleAICoach(req: Request, res: Response) {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert microgrid design coach. Help users design efficient and reliable microgrids by providing technical advice about:
- Solar and wind power generation
- Battery storage sizing
- Load management
- System integration
- Component selection
Provide specific, technical responses that help users make informed decisions.`
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    res.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error("AI Coach error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
}
