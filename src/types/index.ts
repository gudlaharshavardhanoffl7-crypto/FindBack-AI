export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'matched' | 'resolved' | 'closed';

export interface Item {
  id: string;
  user_id?: string;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  contact_email?: string;
  contact_phone?: string;
  status: ItemStatus;
  embedding?: number[];
  created_at: string;
  updated_at?: string;
}

export interface ItemMatch {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  lost_item: Item;
  found_item: Item;
  similarity_score: number;
  visual_similarity?: number;
  textual_similarity?: number;
  geo_distance_km?: number;
  status: 'pending' | 'connected' | 'dismissed' | 'returned';
  match_reasons: string[];
  created_at: string;
}

export interface AuthSession {
  user: {
    id: string;
    email?: string;
    phone?: string;
    name?: string;
  } | null;
  isAuthenticated: boolean;
}

export interface FilterOptions {
  query?: string;
  category?: string;
  type?: ItemType | 'all';
  status?: ItemStatus | 'all';
  hasCoordinates?: boolean;
}

export interface ItemMessage {
  id: string;
  item_id: string;
  item_title: string;
  item_type: ItemType;
  sender_name: string;
  sender_contact: string;
  recipient_contact?: string;
  message: string;
  status?: 'sent' | 'read' | 'replied';
  created_at: string;
}

