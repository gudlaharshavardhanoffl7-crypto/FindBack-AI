import { NextResponse } from 'next/server';
import { getAllMatches } from '@/lib/items-store';

export async function GET() {
  try {
    const matches = await getAllMatches();
    return NextResponse.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
