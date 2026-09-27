import { NextRequest, NextResponse } from 'next/server';
import { generateMultimodalEmbedding } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { description, imageBase64, mimeType } = await req.json();

    if (!description && !imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Must provide either description text or image data' },
        { status: 400 }
      );
    }

    const result = await generateMultimodalEmbedding(
      description || '',
      imageBase64,
      mimeType || 'image/jpeg'
    );

    return NextResponse.json({
      success: true,
      embeddingLength: result.embedding.length,
      embeddingPreview: result.embedding.slice(0, 8),
      features: result.features,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
