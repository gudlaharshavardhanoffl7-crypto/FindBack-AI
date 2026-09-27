import { NextRequest, NextResponse } from 'next/server';
import { getItems, saveItem, findMatchesForItem } from '@/lib/items-store';
import { generateMultimodalEmbedding } from '@/lib/gemini';
import { ItemType } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as ItemType | null;
    const items = await getItems(type || undefined);
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type,
      title,
      category,
      description,
      image_url,
      imageBase64,
      mimeType,
      latitude,
      longitude,
      location_name,
      contact_email,
      contact_phone,
      user_id,
    } = body;

    if (!title || !description || !type || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, type, category.' },
        { status: 400 }
      );
    }

    // Generate multimodal embedding via Gemini API or fallback
    const { embedding, features } = await generateMultimodalEmbedding(
      description,
      imageBase64,
      mimeType || 'image/jpeg'
    );

    // Save item
    const newItem = await saveItem({
      type,
      title,
      category: features?.category || category,
      description,
      image_url: image_url || (imageBase64 ? imageBase64 : undefined),
      latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
      longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
      location_name,
      contact_email,
      contact_phone,
      user_id,
      embedding,
    });

    // Check for potential matches immediately
    const immediateMatches = await findMatchesForItem(newItem, 0.5);

    return NextResponse.json({
      success: true,
      item: newItem,
      features,
      immediateMatches,
    });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
