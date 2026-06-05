export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  coins_balance: number;
  winning_balance: number;
  createdAt?: any;
}

export interface Tournament {
  match_id: string; // Unique identifier
  game_category: string; // "Free Fire", "PUBG/BGMI", "Ludo", etc.
  title: string;
  entry_fee: number;
  prize_pool: number;
  per_kill: number;
  time: string; // ISO date format
  room_id: string; // Revealed 10-15 mins before match
  room_password: string; // Revealed 10-15 mins before match
  joined_count: number;
  total_slots: number;
  joined_players_uids: string[];
  joined_players_details?: {
    [uid: string]: {
      inGameId: string;
      joinedAt: string;
    };
  };
  map_name?: string; // e.g., "Bermuda", "Erangel", "Classic"
  format?: string; // e.g., "Squad", "Solo", "Duo"
  winner_name?: string;
  winner_uid?: string;
  winner_prize?: number;
  winner_kills?: number;
  winner_banner_image?: string;
  winner_banner_theme?: string;
}

export interface CoinTransaction {
  transaction_id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdraw' | 'join_fee';
  amount: number;
  payment_method?: string;
  account_number?: string;
  tx_id?: string; // transaction ID entered or generated
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string; // ISO format
  match_title?: string; // If type is join_fee, track tournament name
}

export type Language = 'en' | 'bn';
