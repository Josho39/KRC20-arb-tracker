import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function GET() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('botdata');
    const collection = db.collection('velocity');

    const velocityAlerts = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    await client.close();
    return NextResponse.json(velocityAlerts);
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch velocity data' },
      { status: 500 }
    );
  }
}