import { Item, ItemMatch, ItemType } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';
import { cosineSimilarity, generateDeterministicEmbedding } from './gemini';

// Realistic initial seeded items with geo coordinates around San Francisco / Bay Area
export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-lost-keys-01',
    type: 'lost',
    title: 'Brass Ring with 3 Keys and Blue Tag #402',
    category: 'Keys',
    description: 'Set of three Yale keys on a heavy brass circular ring. Attached is an azure blue plastic hotel-style tag stamped 402 and a miniature titanium carabiner.',
    image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
    latitude: 37.7749,
    longitude: -122.4194,
    location_name: 'Market Street Subway Station, San Francisco',
    contact_email: 'sarah.k@example.com',
    contact_phone: '+1 (555) 234-5678',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'item-found-keys-01',
    type: 'found',
    title: 'Brass Keyring with 3 Keys & Blue Number Tag',
    category: 'Keys',
    description: 'Discovered on the downtown train platform bench. Three metallic keys on brass ring with an azure plastic room tag marked 402 and small metallic clip.',
    image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
    latitude: 37.7753,
    longitude: -122.4187,
    location_name: 'Platform B Bench, Market St Station, San Francisco',
    contact_email: 'transit.officer@example.com',
    contact_phone: '+1 (555) 987-6543',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'item-lost-glasses-01',
    type: 'lost',
    title: 'Matte Black Titanium Eyeglasses',
    category: 'Eyewear',
    description: 'Rectangular prescription spectacles with matte titanium frames, thin temples, and anti-reflective lenses. Engraved model tag on inner arm.',
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
    latitude: 37.7891,
    longitude: -122.4014,
    location_name: 'Ferry Building Plaza, San Francisco',
    contact_email: 'marcus.v@example.com',
    contact_phone: '+1 (555) 345-6789',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: 'item-found-glasses-01',
    type: 'found',
    title: 'Dark Metal Frame Reading Spectacles',
    category: 'Eyewear',
    description: 'Found on table at outdoor food hall. Dark titanium lightweight glasses, rectangular frames with clear prescription glass and microfiber pouch.',
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
    latitude: 37.7889,
    longitude: -122.4018,
    location_name: 'Ferry Building South Arcade, San Francisco',
    contact_email: 'desk.host@example.com',
    contact_phone: '+1 (555) 876-5432',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
  },
  {
    id: 'item-lost-wallet-01',
    type: 'lost',
    title: 'Brown Saddle Leather Bifold Wallet',
    category: 'Wallets',
    description: 'Full grain vegetable tanned leather bifold wallet with contrast stitching. Contains transit card, student ID, and blue membership badge.',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    latitude: 37.7694,
    longitude: -122.4467,
    location_name: 'Buena Vista Park North Trail, San Francisco',
    contact_email: 'elena.r@example.com',
    contact_phone: '+1 (555) 456-7890',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
  {
    id: 'item-found-smartwatch-01',
    type: 'found',
    title: 'Midnight Black Smartwatch with Sport Loop',
    category: 'Electronics',
    description: 'Space grey aluminum case smartwatch found on a jogging trail bench. Black woven nylon sport loop band. Battery operational.',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    latitude: 37.7688,
    longitude: -122.4471,
    location_name: 'Haight & Lyon Intersection Bench, San Francisco',
    contact_email: 'trail.runner@example.com',
    contact_phone: '+1 (555) 765-4321',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
  },
  {
    id: 'item-lost-smartwatch-01',
    type: 'lost',
    title: 'Black Smartwatch Series 8 with Woven Band',
    category: 'Electronics',
    description: 'Lost during morning run. Midnight aluminum smartwatch with black sports loop band. Left near park rest area.',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    latitude: 37.7692,
    longitude: -122.4469,
    location_name: 'Buena Vista Park Jogging Track, San Francisco',
    contact_email: 'david.chen@example.com',
    contact_phone: '+1 (555) 123-9988',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
  },
];

// Pre-compute embeddings for initial items
INITIAL_ITEMS.forEach((item) => {
  if (!item.embedding) {
    item.embedding = generateDeterministicEmbedding(
      `${item.title} ${item.category} ${item.description}`
    );
  }
});

// In-memory runtime items cache
const memoryItems: Item[] = [...INITIAL_ITEMS];

export async function getItems(filterType?: ItemType): Promise<Item[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('items').select('*').order('created_at', { ascending: false });
      if (filterType) {
        query = query.eq('type', filterType);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Item[];
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using memory store:', err);
    }
  }

  if (filterType) {
    return memoryItems.filter((item) => item.type === filterType);
  }
  return memoryItems;
}

export async function getItemById(id: string): Promise<Item | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
      if (!error && data) {
        return data as Item;
      }
    } catch {
      // ignore
    }
  }
  return memoryItems.find((item) => item.id === id) || null;
}

export async function saveItem(item: Omit<Item, 'id' | 'created_at' | 'status'> & { id?: string }): Promise<Item> {
  const newItem: Item = {
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: item.type,
    title: item.title,
    category: item.category,
    description: item.description,
    image_url: item.image_url,
    latitude: item.latitude,
    longitude: item.longitude,
    location_name: item.location_name,
    contact_email: item.contact_email,
    contact_phone: item.contact_phone,
    user_id: item.user_id,
    status: 'active',
    embedding: item.embedding || generateDeterministicEmbedding(`${item.title} ${item.category} ${item.description}`),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('items').insert([newItem]).select().single();
      if (!error && data) {
        memoryItems.unshift(data as Item);
        return data as Item;
      }
    } catch (err) {
      console.warn('Supabase insert failed, storing in memory store:', err);
    }
  }

  memoryItems.unshift(newItem);
  return newItem;
}

/**
 * Calculates geographical distance in kilometers between two lat/lng coordinates
 */
export function calculateGeoDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Computes top matches between a given item and opposing items
 */
export async function findMatchesForItem(targetItem: Item, threshold = 0.55): Promise<ItemMatch[]> {
  const opposingType: ItemType = targetItem.type === 'lost' ? 'found' : 'lost';
  const candidates = await getItems(opposingType);
  const matches: ItemMatch[] = [];

  const targetEmbedding =
    targetItem.embedding ||
    generateDeterministicEmbedding(`${targetItem.title} ${targetItem.category} ${targetItem.description}`);

  for (const candidate of candidates) {
    const candidateEmbedding =
      candidate.embedding ||
      generateDeterministicEmbedding(`${candidate.title} ${candidate.category} ${candidate.description}`);

    const simScore = cosineSimilarity(targetEmbedding, candidateEmbedding);

    // Calculate geo distance if coordinates exist on both
    let geoDistance: number | undefined;
    let proximityBonus = 0;
    if (
      targetItem.latitude !== undefined &&
      targetItem.longitude !== undefined &&
      candidate.latitude !== undefined &&
      candidate.longitude !== undefined
    ) {
      geoDistance = calculateGeoDistance(
        targetItem.latitude,
        targetItem.longitude,
        candidate.latitude,
        candidate.longitude
      );
      if (geoDistance < 1.0) proximityBonus = 0.15;
      else if (geoDistance < 5.0) proximityBonus = 0.08;
    }

    const finalScore = Math.min(1.0, simScore * 0.85 + proximityBonus);

    if (finalScore >= threshold) {
      // Build reasoning breakdown
      const reasons: string[] = [];
      if (targetItem.category === candidate.category) {
        reasons.push(`Matching category: ${targetItem.category}`);
      }
      if (simScore > 0.7) {
        reasons.push('High visual and semantic feature alignment');
      } else if (simScore > 0.5) {
        reasons.push('Moderate descriptive text correlation');
      }
      if (geoDistance !== undefined && geoDistance <= 2.0) {
        reasons.push(`Geographic proximity within ${geoDistance.toFixed(1)} km`);
      }

      const lostItem = targetItem.type === 'lost' ? targetItem : candidate;
      const foundItem = targetItem.type === 'found' ? targetItem : candidate;

      matches.push({
        id: `match-${lostItem.id}-${foundItem.id}`,
        lost_item_id: lostItem.id,
        found_item_id: foundItem.id,
        lost_item: lostItem,
        found_item: foundItem,
        similarity_score: Math.round(finalScore * 100),
        visual_similarity: Math.round(simScore * 100),
        geo_distance_km: geoDistance,
        status: 'pending',
        match_reasons: reasons,
        created_at: new Date().toISOString(),
      });
    }
  }

  // Sort descending by score
  matches.sort((a, b) => b.similarity_score - a.similarity_score);
  return matches;
}

/**
 * Returns all detected matches across all lost and found items
 */
export async function getAllMatches(): Promise<ItemMatch[]> {
  const lostItems = await getItems('lost');
  const allMatches: ItemMatch[] = [];
  const seenPairs = new Set<string>();

  for (const lost of lostItems) {
    const itemMatches = await findMatchesForItem(lost, 0.55);
    for (const match of itemMatches) {
      const pairKey = `${match.lost_item_id}:${match.found_item_id}`;
      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        allMatches.push(match);
      }
    }
  }

  return allMatches.sort((a, b) => b.similarity_score - a.similarity_score);
}
