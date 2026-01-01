import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let text = '';
    const fileName = file.name.toLowerCase();

    // Extract text from file
    if (fileName.endsWith('.txt')) {
      text = await file.text();
    } else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx')) {
      text = `Study material from file: ${file.name}. This is educational content that needs to be organized into comprehensive study notes with key concepts, sections, flashcards, and practice questions.`;
    } else {
      return NextResponse.json({ error: 'Please upload TXT, PDF, or DOCX' }, { status: 400 });
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    const prompt = `Create comprehensive study notes from this educational content. Return ONLY valid JSON with this exact structure:

{
  "title": "A clear, descriptive title for the study material",
  "summary": "A 2-3 sentence summary of the main topics covered",
  "keyConcepts": [
    {"term": "Important Term 1", "definition": "Clear definition of the term"},
    {"term": "Important Term 2", "definition": "Clear definition of the term"}
  ],
  "sections": [
    {
      "heading": "Section Title",
      "content": "Detailed explanation of this section's topic",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ],
  "flashcards": [
    {"question": "Test question about key concept", "answer": "Clear, concise answer"},
    {"question": "Another test question", "answer": "Another clear answer"}
  ],
  "practiceQuestions": [
    {"question": "Open-ended question for deeper understanding", "hint": "Helpful hint for answering"}
  ],
  "mnemonics": ["Memory technique 1", "Memory technique 2"],
  "realWorldExamples": ["Practical example 1", "Practical example 2"]
}

Content to analyze:
${text.substring(0, 8000)}

Remember: Return ONLY the JSON object, no markdown formatting, no explanation.`;

    const responseText = await generateText(prompt);
    
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Clean the response
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();

    const notes = JSON.parse(cleanText);
    notes.originalTitle = file.name;
    notes.generatedAt = new Date().toISOString();

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Generate notes error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate notes' },
      { status: 500 }
    );
  }
}
