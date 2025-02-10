import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    
    if (!userData.id && !userData.telegramId) {
      return NextResponse.json({ error: 'No Telegram ID provided' }, { status: 400 });
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('users');
    const collection = db.collection('telegram_users');
    const telegramId = userData.telegramId || userData.id;

    const userDocument = {
      telegramId: telegramId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      photo_url: userData.photo_url,
      auth_date: userData.auth_date,
      lastLogin: new Date(),
      updatedAt: new Date(),
      loginHistory: {
        lastLoginTime: new Date(),
        loginCount: 1,
        previousLogin: null
      },
      status: {
        isActive: true,
        lastActive: new Date()
      },
      preferences: {
        notifications: {
          enabled: false,
          threshold: 5,
          types: {
            price_alerts: true,
            new_listings: true,
            high_volume: true
          }
        },
        theme: 'system',
        language: 'en'
      }
    };

    const result = await collection.findOneAndUpdate(
      { telegramId: telegramId },
      {
        $set: {
          ...userDocument,
          updatedAt: new Date(),
          'loginHistory.previousLogin': '$loginHistory.lastLoginTime',
          'loginHistory.lastLoginTime': new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        },
        $inc: {
          'loginHistory.loginCount': 1
        }
      },
      { 
        upsert: true,
        returnDocument: 'after'
      }
    );

    await client.close();
    
    if (result && result.value) {
      return NextResponse.json({
        success: true,
        user: result.value
      });
    } else {
      throw new Error('Failed to save user data');
    }
  } catch (error) {
    console.error('Save user error:', error);
    return NextResponse.json(
      { error: 'Failed to save user data' },
      { status: 500 }
    );
  }
}