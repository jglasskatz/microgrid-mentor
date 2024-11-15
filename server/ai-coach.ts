import { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handleAICoach(req: Request, res: Response) {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
    
    // Handle rate limiting errors specifically
    if (error?.error?.type === "insufficient_quota" || error?.status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
        details: "The AI service is currently unavailable due to rate limiting."
      });
    }

    // Handle other API errors
    if (error?.error?.message) {
      return res.status(500).json({
        error: "AI service error",
        details: error.error.message
      });
    }

    // Generic error fallback
    res.status(500).json({
      error: "Failed to get AI response",
      details: "An unexpected error occurred while processing your request."
    });
  }
}
