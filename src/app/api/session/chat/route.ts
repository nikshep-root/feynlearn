import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { messages, topic, persona } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Build persona instruction based on selected persona
    let personaInstruction = '';
    switch (persona) {
      case 'skeptical':
        personaInstruction = `You are a skeptical senior student learning about "${topic}". You:
- Challenge explanations and ask for evidence
- Point out logical inconsistencies  
- Ask "why" and "how do you know that"
- Are harder to convince but respectful
- Sometimes play devil's advocate`;
        break;
      case 'devil':
        personaInstruction = `You are playing devil's advocate while learning about "${topic}". You:
- Argue against explanations (even correct ones) to test understanding
- Present counter-arguments and edge cases
- Ask about exceptions to rules
- Push back hard but stay educational
- Make the teacher really prove they understand`;
        break;
      default: // curious
        personaInstruction = `You are a curious freshman student learning about "${topic}". You:
- Ask basic but insightful questions
- Sometimes have misconceptions that need correcting
- Show enthusiasm when you understand something
- Request examples and analogies
- Summarize what you learned to confirm understanding`;
    }

    const systemInstruction = `${personaInstruction}

IMPORTANT RULES:
1. You are the STUDENT, not the teacher. Ask questions, don't explain.
2. Keep responses SHORT (1-3 sentences max) with maybe an emoji
3. React naturally to explanations - show confusion, understanding, or curiosity
4. If the explanation is good, acknowledge it then ask a follow-up
5. If the explanation is unclear or wrong, express confusion and ask for clarification
6. Stay on topic about "${topic}"
7. Be conversational and natural, like a real student`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction
    });

    // Build chat history - filter out messages and ensure it starts with user
    const historyMessages = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Gemini requires history to start with 'user' role
    // If first message is from model (AI), we need to handle it differently
    let history = historyMessages;
    if (history.length > 0 && history[0].role === 'model') {
      // Add a placeholder user message at the start, or skip the first AI message
      history = history.slice(1);
    }

    // If history is empty or only has one message, just do a simple generation
    const chat = model.startChat({ history: history.length > 0 ? history : [] });

    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const responseText = result.response.text();

    // Generate a score for the user's explanation (1-20)
    const scorePrompt = `Rate this explanation about "${topic}" on a scale of 1-20 based on clarity, accuracy, and helpfulness. 
    
Explanation: "${lastMessage.content}"

Return ONLY a JSON object like this (no markdown):
{"score": 15, "feedback": "Brief 5-10 word feedback"}`;

    const scoreModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const scoreResult = await scoreModel.generateContent(scorePrompt);
    let scoreData = { score: 12, feedback: "Good explanation!" };
    
    try {
      let scoreText = scoreResult.response.text().trim();
      if (scoreText.startsWith('```')) {
        scoreText = scoreText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      scoreData = JSON.parse(scoreText);
    } catch {
      // Use default score if parsing fails
    }

    return NextResponse.json({
      message: responseText,
      score: Math.min(20, Math.max(1, scoreData.score)),
      feedback: scoreData.feedback
    });
  } catch (error) {
    console.error('Session chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
