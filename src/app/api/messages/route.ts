import { NextRequest, NextResponse } from 'next/server';
import { getMessages, saveMessage, getItemById } from '@/lib/items-store';
import { ItemType } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId') || undefined;
    const messages = await getMessages(itemId);
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      item_id,
      item_title,
      item_type,
      sender_name,
      sender_contact,
      recipient_contact,
      message,
    } = body;

    if (!item_id || !sender_name || !sender_contact || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: item_id, sender_name, sender_contact, message.',
        },
        { status: 400 }
      );
    }

    // Try to resolve item metadata if not provided
    let resolvedTitle = item_title;
    let resolvedType: ItemType = item_type || 'lost';
    let resolvedRecipient = recipient_contact;

    if (!resolvedTitle || !resolvedRecipient) {
      const item = await getItemById(item_id);
      if (item) {
        resolvedTitle = resolvedTitle || item.title;
        resolvedType = item.type;
        resolvedRecipient = resolvedRecipient || item.contact_email || item.contact_phone;
      }
    }

    const saved = await saveMessage({
      item_id,
      item_title: resolvedTitle || 'Item Reference',
      item_type: resolvedType,
      sender_name: sender_name.trim(),
      sender_contact: sender_contact.trim(),
      recipient_contact: resolvedRecipient,
      message: message.trim(),
      status: 'sent',
    });

    return NextResponse.json({
      success: true,
      message: saved,
    });
  } catch (error: any) {
    console.error('Error saving item message:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
