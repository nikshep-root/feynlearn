import { NextRequest, NextResponse } from 'next/server';
import { geminiFlash } from '@/lib/gemini';
import mammoth from 'mammoth';

// Configure route for larger file uploads (App Router format)
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max

// OCR fallback for scanned/image-based PDFs
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const Tesseract = (await import('tesseract.js')).default;
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    const textParts: string[] = [];
    let extractedText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      textParts.push(pageText);
    }
    extractedText = textParts.join('\n\n').trim();

    // If extracted text is empty or too short, try OCR fallback
    if (!extractedText || extractedText.replace(/\s/g, '').length < 20) {
      try {
        const { createCanvas } = await import('canvas');
        let ocrText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = createCanvas(viewport.width, viewport.height);
          const context = canvas.getContext('2d');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const renderContext = { canvasContext: context, canvas, viewport } as any;
          await page.render(renderContext).promise;
          const imageBuffer = canvas.toBuffer('image/png');
          const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
          ocrText += text + '\n';
        }
        extractedText = ocrText.trim();
      } catch (ocrError) {
        console.error('OCR fallback failed:', ocrError);
        throw new Error('Scanned PDF OCR is not available on this server. Please use a text-based PDF or try again later.');
      }
    }
    return extractedText;
  } catch (err) {
    console.error('PDF extraction error:', err);
    throw new Error('Could not extract text from PDF. Details: ' + (err instanceof Error ? err.message : String(err)));
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  try {
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
        throw new Error('Could not extract text from PDF. Please try a different file format or ensure the PDF contains selectable text.');
      }
    }

    // Unsupported file type
    throw new Error('Unsupported file type. Please upload a .pdf, .docx, or .txt file.');
  } catch (err) {
    console.error('File extraction error:', err);
    throw new Error('Failed to extract content from file: ' + (err instanceof Error ? err.message : String(err)));
  }
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
    /(?:youtube\.com\/v\/)([^?\s]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function extractTextFromUrl(url: string): Promise<string> {
  // Check if it's a YouTube URL
  if (isYouTubeUrl(url)) {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      throw new Error('Could not extract YouTube video ID');
    }
    
    // Try to get video info from YouTube's oEmbed API
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);
      if (response.ok) {
        const data = await response.json();
        const title = data.title || 'Unknown Video';
        const author = data.author_name || 'Unknown Author';
        
        // Since we can't get the transcript directly without API key,
        // we'll use Gemini to help based on the title and context
        return `YouTube Video Title: ${title}\nAuthor: ${author}\n\nNote: This is a YouTube video. Topics will be extracted based on the video title and channel. For better topic extraction, consider uploading a text document, notes, or transcript of the video content.`;
      }
    } catch {
      // Fallback if oEmbed fails
    }
    
    return `YouTube Video ID: ${videoId}\n\nNote: This is a YouTube video. For best results with topic extraction, please upload a transcript or notes from the video.`;
  }
  
  // For regular web pages, fetch and extract text content
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error('URL does not point to a readable web page');
    }
    
    const html = await response.text();
    
    // Extract text content from HTML
    // Remove script and style tags first
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
    
    // Try to extract main content areas first
    const mainContentPatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/gi,
      /<main[^>]*>([\s\S]*?)<\/main>/gi,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    ];
    
    let mainContent = '';
    for (const pattern of mainContentPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        mainContent += match[1] + '\n';
      }
    }
    
    // If we found main content, use it; otherwise use the full text
    const contentToProcess = mainContent || text;
    
    // Remove HTML tags and extract text
    const plainText = contentToProcess
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract title if available
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    return `Title: ${title}\n\nContent:\n${plainText}`;
  } catch (error) {
    throw new Error(`Failed to extract content from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    try {
      // All logic in a single try block to catch any error and always return JSON
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

      if (file) {
        content = await extractTextFromFile(file);
        if (content.length > 50000) {
          content = content.substring(0, 50000);
        }
      } else if (url) {
        content = await extractTextFromUrl(url);
        if (content.length > 50000) {
          content = content.substring(0, 50000);
        }
      } else {
        return NextResponse.json(
          { error: 'No file or URL provided' },
          { status: 400 }
        );
      }

      if (!content.trim()) {
        return NextResponse.json(
          { error: 'The uploaded file appears to be empty or contains no readable text' },
          { status: 400 }
        );
      }

      // Use Gemini to extract topics from the content
      const prompt = `Analyze the following educational content and extract the main topics that a student could learn and teach to others.

For each topic:
1. Give it a clear, concise name (max 5-6 words)
2. Assess the difficulty level: "easy" (basic concepts), "medium" (requires some background), or "hard" (complex/advanced concepts)
3. Ensure topics are directly from the content provided - do NOT make up topics

Return the response as a JSON array with this exact format (no markdown, just raw JSON):
[
  {"name": "Topic Name Here", "difficulty": "easy"},
  {"name": "Another Topic", "difficulty": "medium"}
]

Extract between 4-8 key topics from the content. Only extract topics that are actually discussed in the content.

Content to analyze:
---
${content}
---

Remember: Return ONLY the JSON array, no other text or markdown formatting.`;

      const result = await geminiFlash.generateContent(prompt);
      const responseText = result.response.text();

      // Parse the JSON response
      let topics;
      try {
        // Clean up the response - remove markdown code blocks if present
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

        topics = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', responseText);
        return NextResponse.json(
          { error: 'Failed to parse AI response. Please try again.' },
          { status: 500 }
        );
      }

      // Validate and format topics
      const formattedTopics = topics.map((topic: { name: string; difficulty: string }, index: number) => ({
        id: String(index + 1),
        name: topic.name,
        difficulty: ['easy', 'medium', 'hard'].includes(topic.difficulty) ? topic.difficulty : 'medium',
        selected: index < 4, // Select first 4 by default
      }));

      return NextResponse.json({ topics: formattedTopics });
    } catch (error) {
      // Catch any error and always return JSON
      console.error('Topic extraction error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (outerError) {
    // Catch any truly unexpected error (should never return HTML)
    console.error('Global API error:', outerError);
    return NextResponse.json(
      { error: 'A server error occurred. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
