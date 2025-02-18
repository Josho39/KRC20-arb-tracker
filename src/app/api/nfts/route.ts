import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function GET() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('botdata');
    const collection = db.collection('nft_alerts');

    const alerts = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    await client.close();
    return NextResponse.json(alerts);
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT alerts data' },
      { status: 500 }
    );
  }
}