import { NextRequest, NextResponse } from 'next/server';
import { geminiFlash } from '@/lib/gemini';
import mammoth from 'mammoth';

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid issues with Node.js environment
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  
  const pdf = await loadingTask.promise;
  const textParts: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: { str?: string }) => item.str || '')
      .join(' ');
    textParts.push(pageText);
  }
  
  return textParts.join('\n\n');
}

async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (fileName.endsWith('.txt')) {
    return await file.text();
  }

  if (fileName.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (fileName.endsWith('.pdf')) {
    try {
      return await extractTextFromPDF(buffer);
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      throw new Error('Could not extract text from PDF. Please try a different file format.');
    }
  }

  return await file.text();
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;

    let content = '';
    let title = 'Study Material';

    if (file) {
      content = await extractTextFromFile(file);
      title = file.name.replace(/\.(pdf|txt|docx)$/i, '');
      
      if (content.length > 50000) {
        content = content.substring(0, 50000);
      }
    } else if (url) {
      // Fetch URL content
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        const html = await response.text();
        
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) title = titleMatch[1].trim();
        
        // Extract text
        content = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        if (content.length > 50000) {
          content = content.substring(0, 50000);
        }
      } catch {
        return NextResponse.json(
          { error: 'Failed to fetch URL content' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'No file or URL provided' },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'The content appears to be empty' },
        { status: 400 }
      );
    }

    // Generate comprehensive notes using Gemini
    const prompt = `You are an expert educator. Analyze the following content and create comprehensive, well-structured study notes.

Create the response in this exact JSON format (no markdown, just raw JSON):
{
  "title": "A clear, concise title for the topic",
  "summary": "A 2-3 sentence overview of the main topic",
  "keyConcepts": [
    {
      "term": "Key Term 1",
      "definition": "Clear explanation of this concept"
    }
  ],
  "sections": [
    {
      "heading": "Section Title",
      "content": "Detailed explanation with examples. Use clear, simple language.",
      "keyPoints": ["Important point 1", "Important point 2"]
    }
  ],
  "flashcards": [
    {
      "question": "What is...?",
      "answer": "The answer is..."
    }
  ],
  "practiceQuestions": [
    {
      "question": "Explain the concept of...",
      "hint": "Think about..."
    }
  ],
  "mnemonics": ["Memory aid or trick to remember key concepts"],
  "realWorldExamples": ["Practical application or example"]
}

Guidelines:
- Create 3-6 sections covering the main topics
- Include 4-8 key concepts with clear definitions
- Generate 5-10 flashcards for self-testing
- Add 3-5 practice questions
- Include at least 2 mnemonics or memory aids
- Add 2-3 real-world examples
- Use simple, clear language
- Make explanations engaging and easy to understand

Content to analyze:
---
${content}
---

Return ONLY the JSON, no other text.`;

    const result = await geminiFlash.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    let notes;
    try {
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();
      notes = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      notes: {
        ...notes,
        originalTitle: title,
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Notes generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide more specific error messages
    if (errorMessage.includes('API_KEY') || errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid Gemini API key. Please check your GEMINI_API_KEY in environment variables.' },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to generate notes: ${errorMessage}` },
      { status: 500 }
    );
  }
}
