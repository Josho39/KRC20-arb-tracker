import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const telegramId = url.searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ 
        error: 'Telegram ID required',
        enabled: false,
        threshold: 5 
      });
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('users');
    const collection = db.collection('notification_settings');
    
    const settings = await collection.findOne({ telegramId: parseInt(telegramId) });
    await client.close();
    
    if (!settings) {
      return NextResponse.json({
        enabled: false,
        threshold: 5
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json({
      error: 'Failed to fetch notification settings',
      enabled: false,
      threshold: 5
    });
  }
}

export async function POST(request: Request) {
  try {
    console.log('Received POST request to /api/notifications/settings');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { telegramId, enabled, threshold } = body;
    
    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 });
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('users');
    const collection = db.collection('notification_settings');
    
    const updateResult = await collection.updateOne(
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

    await client.close();

    console.log('Update result:', updateResult);
    
    return NextResponse.json({
      success: true,
      enabled,
      threshold
    });

  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update notification settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}