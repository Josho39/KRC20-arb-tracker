import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const telegramId = url.searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 });
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
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { telegramId, enabled, threshold } = body;
    
    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 });
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('users');
    const collection = db.collection('notification_settings');
    
    const result = await collection.updateOne(
      { telegramId: telegramId },
      { 
        $set: { 
          enabled,
          threshold,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    await client.close();
    
    if (result.acknowledged) {
      return NextResponse.json({ success: true, enabled, threshold });
    } else {
      throw new Error('Database update not acknowledged');
    }
  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}