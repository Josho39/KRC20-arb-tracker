import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export async function POST(request: Request) {
  console.log('Starting user save...');
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    const userData = await request.json();
    console.log('Received user data:', userData);
    
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('users');
    const collection = db.collection('telegram_users');
    const telegramId = userData.id; 

    const userDocument = {
      telegramId: telegramId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      photo_url: userData.photo_url,
      auth_date: userData.auth_date,
      lastLogin: new Date(),
      updatedAt: new Date()
    };

    console.log('Attempting to save:', userDocument);

    const result = await collection.updateOne(
      { telegramId: telegramId },
      {
        $set: userDocument,
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    await client.close();
    console.log('Save operation result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'User data saved successfully'
    });

  } catch (error) {
    console.error('Detailed save error:', error);
    return NextResponse.json(
      { error: 'Failed to save user data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}