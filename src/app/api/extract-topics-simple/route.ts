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

    // Extract text based on file type
    let text = '';
    let contentForSession = '';
    const fileName = file.name.toLowerCase();
    const fileNameForContext = file.name.replace(/\.(txt|pdf|docx)$/i, '');

    if (fileName.endsWith('.txt')) {
      text = await file.text();
      contentForSession = text; // Store actual content for TXT files
    } else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx')) {
      // For PDF/DOCX, use filename as context and ask AI to generate relevant topics
      text = `Educational study material titled: "${fileNameForContext}". 
      This document contains learning content about ${fileNameForContext}.
      Generate relevant topics that students would need to learn from a document with this title.`;
      contentForSession = text;
    } else {
      return NextResponse.json({ error: 'Please upload a TXT, PDF, or DOCX file' }, { status: 400 });
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'File appears to be empty' }, { status: 400 });
    }

    const prompt = `Analyze this educational content and extract 4-6 specific learning topics that a student would need to master. 
    
Based on the content/title, identify the KEY CONCEPTS and TOPICS that are likely covered.

For each topic, provide:
- A clear, specific name (max 6 words) directly related to the subject
- Difficulty level: easy, medium, or hard

Return ONLY valid JSON in this exact format:
[{"name":"Specific Topic Name","difficulty":"easy"}]

Content to analyze:
${text.substring(0, 5000)}

Remember: Make the topics SPECIFIC to the subject matter, not generic.`;

    const responseText = await generateText(prompt);
    
    // Clean response
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) cleanedResponse = cleanedResponse.slice(7);
    else if (cleanedResponse.startsWith('```')) cleanedResponse = cleanedResponse.slice(3);
    if (cleanedResponse.endsWith('```')) cleanedResponse = cleanedResponse.slice(0, -3);
    cleanedResponse = cleanedResponse.trim();

    const topics = JSON.parse(cleanedResponse);
    const formattedTopics = topics.map((topic: any, index: number) => ({
      id: String(index + 1),
      name: topic.name,
      difficulty: ['easy', 'medium', 'hard'].includes(topic.difficulty) ? topic.difficulty : 'medium',
      selected: index < 3,
    }));

    // Return topics AND the content for use in the session
    return NextResponse.json({ 
      topics: formattedTopics,
      content: contentForSession.substring(0, 10000) // Limit content size
    });
  } catch (error) {
    console.error('Extract topics error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract topics' },
      { status: 500 }
    );
  }
}
