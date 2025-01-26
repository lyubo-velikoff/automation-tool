import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    // Create OpenAI instance
    const openai = new OpenAI({ apiKey });

    // Try a simple API call to verify the key
    await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OpenAI key verification error:', error);
    return NextResponse.json({ success: false, error: 'Invalid API key' });
  }
} 
