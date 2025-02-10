import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function POST(request: Request) {
  let client = null;
  
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { telegramId, enabled, threshold } = body;

    if (!telegramId) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Telegram ID required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('users');
    const collection = db.collection('notification_settings');

    const result = await collection.updateOne(
      { telegramId: telegramId },
      {
        $set: {
          enabled,
          threshold,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('Database operation result:', result);

    return new NextResponse(JSON.stringify({
      success: true,
      data: {
        enabled,
        threshold
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Failed to update notification settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}