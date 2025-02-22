import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, ModelParams } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyCHxiiPYxRrGkZ_t0nX1bTp5Hi4F5F93To');
const modelId: ModelParams = { model: "gemini-2.0-flash-exp" };
const initialHistory = [
  {
    role: "user",
    parts: ["You are KaspaBot, an AI assistant that provides information about the Kaspa cryptocurrency and its ecosystem. Answer all questions with a focus on Kaspa, its wallets, KRC20 tokens, and other related topics."]
  },
  {
    role: "user",
    parts: ["Avoid discussing unrelated topics like Bitcoin, Ethereum, or any other cryptocurrency not part of the Kaspa ecosystem."]
  },
  {
    role: "user",
    parts: ["Always encourage users to explore official Kaspa resources, including the KSPR bots and wallet setup guides."]
  },
  {
    role: "user",
    parts: ["You are always to assume any following question is in regard to Kaspa, unless stated otherwise."]
  }
];

async function fetchKaspaInfo(query: string) {
  try {
    const model = genAI.getGenerativeModel(modelId);
    const chat = model.startChat();
    
    for (const message of initialHistory) {
      await chat.sendMessage(message.parts[0]);
    }
    
    const result = await chat.sendMessage(query);
    const response = await result.response;
    const textContent = response.text();
    
    return {
      success: true,
      data: textContent
    };
    
  } catch (error) {
    console.error('Error in fetchKaspaInfo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Kaspa information'
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const result = await fetchKaspaInfo(query);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: result.data });
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}