import { NextResponse } from 'next/server';
import { suggestSubtasks } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const result = await suggestSubtasks(title, description || '');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in AI breakdown API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
