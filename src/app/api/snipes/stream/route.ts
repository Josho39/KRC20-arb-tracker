import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const client = new MongoClient(MONGODB_URI);
      
      try {
        await client.connect();
        const db = client.db('botdata');
        const collection = db.collection('snipes');
        
        const changeStream = collection.watch([], {
          fullDocument: 'updateLookup'
        });
        
        changeStream.on('change', async (change) => {
          if (change.operationType === 'insert') {
            const data = `data: ${JSON.stringify(change.fullDocument)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        });
        
        request.signal.addEventListener('abort', () => {
          changeStream.close();
          client.close();
        });
        
      } catch (error) {
        controller.error(error);
        client?.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}