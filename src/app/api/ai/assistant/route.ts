import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const KNOWLEDGE_BASE_RESPONSES: Record<string, string> = {
  lost: 'To report a lost item: Navigate to the "Lost Log" or click "Report a Lost item" on the homepage. Provide a photo, select the category, describe key distinguishing marks, and specify the campus zone where you last had it. The system automatically creates a 768-D vector embedding to search against found inventory.',
  found: 'To report a found item: Go to the "Found Log" or click "Report a Found item". Fill in the item category, discovery location, and description. Your contact details remain shielded through our dual-blind privacy handoff system until ownership is verified.',
  matching: 'Find Back AI uses Google Gemini multimodal embeddings and Supabase pgvector. Images and descriptions are converted into 768-dimensional normalized vectors. We then execute cosine distance queries in PostgreSQL to rank matches by similarity percentage (e.g., 94% match).',
  maps: 'Our Geospatial Map allows you to visualize campus zones, recent discovery hotspots, and item coordinates on real Google Maps. You can switch between All, Lost, and Found pins, view location notes, or open direct Google Maps navigation.',
  privacy: 'Your privacy is protected by dual-blind contact obfuscation. Finder and owner personal phone numbers and emails are never exposed publicly. Custody exchanges happen through verified campus security desks or encrypted verification codes.',
  dashboard: 'The Recovery Dashboard is your mission control center. It aggregates real-time inventory statistics, your active lost and found posts, ranked match alerts, and custody handoff statuses.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const trimmedMsg = message.trim();
    const lower = trimmedMsg.toLowerCase();

    // Prepare system prompt for Gemini
    const systemPrompt = `You are the Find Back AI Assistant for an intelligent lost-and-found recovery platform.
Key facts about Find Back AI:
- Purpose: Instant AI-powered physical item recovery across campus using multimodal computer vision.
- Multimodal Matching: Generates 768-dimensional vectors from item photos and descriptions via Google Gemini, then computes cosine similarity using Supabase pgvector.
- Reporting Lost: Users submit photos, categories, descriptions, and campus location details.
- Reporting Found: Honest finders log discovered items safely.
- Privacy: Dual-blind contact obfuscation ensures phone numbers and emails are never exposed publicly.
- Google Maps: Spatial radar plots campus coordinates and discovery zones with Google Maps integration.
- Dashboard: Centralized hub to manage posts, verify claims, and inspect similarity matches.
Always answer questions politely, concisely, and accurately based on the platform's features.`;

    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key') {
      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];

      for (const model of candidateModels) {
        try {
          const contents = [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${trimmedMsg}` }],
            },
          ];

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents }),
              signal: AbortSignal.timeout(6000),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return NextResponse.json({
                success: true,
                reply: reply.trim(),
                source: 'gemini',
                model,
              });
            }
          }
        } catch {
          // Continue to next model or fallback
        }
      }
    }

    // High-accuracy fallback engine for instantaneous responsiveness
    let matchedReply = '';
    if (lower.includes('lost') || lower.includes('report') || lower.includes('missing')) {
      matchedReply = KNOWLEDGE_BASE_RESPONSES.lost;
    } else if (lower.includes('found') || lower.includes('discovered') || lower.includes('return')) {
      matchedReply = KNOWLEDGE_BASE_RESPONSES.found;
    } else if (lower.includes('match') || lower.includes('ai') || lower.includes('vector') || lower.includes('algorithm')) {
      matchedReply = KNOWLEDGE_BASE_RESPONSES.matching;
    } else if (lower.includes('map') || lower.includes('location') || lower.includes('coordinate') || lower.includes('zone')) {
      matchedReply = KNOWLEDGE_BASE_RESPONSES.maps;
    } else if (lower.includes('privacy') || lower.includes('phone') || lower.includes('number') || lower.includes('email') || lower.includes('safe')) {
      matchedReply = KNOWLEDGE_BASE_RESPONSES.privacy;
    } else if (lower.includes('dashboard') || lower.includes('status') || lower.includes('control')) {
      matchedReply = KNOWLEDGE_BASE_RESPONSES.dashboard;
    } else {
      matchedReply =
        'Welcome to Find Back AI! I can assist you with reporting lost items, registering found items, understanding our 768-D vector matching, viewing the campus Google Maps radar, or checking your recovery dashboard. What would you like help with?';
    }

    return NextResponse.json({
      success: true,
      reply: matchedReply,
      source: 'knowledge-base',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process request',
        reply:
          'Find Back AI is ready to assist. You can report lost items in the Lost Log, register discoveries in the Found Log, or inspect AI vector matches on the Matches page.',
      },
      { status: 500 }
    );
  }
}
