
export type RelationType = 'FAMILY' | 'FRIEND' | 'COLLEAGUE' | 'OTHER';

export type EventType = 'WEDDING' | 'FUNERAL' | 'FIRST_BIRTHDAY' | 'OTHER';

export type TargetType = 'GROOM' | 'BRIDE' | 'GROOM_FAMILY' | 'BRIDE_FAMILY' | 'OTHER';

export interface Transaction {
  id: string;
  type: 'GIVEN' | 'RECEIVED';
  eventType: EventType; // Added to distinguish event types
  name: string;
  relation: RelationType;
  target?: TargetType; // Added: Who is the recipient? (e.g. Groom, Bride)
  amount: number;
  date: string;
  location?: string;
  hasMeal?: boolean;
  memo?: string;
  // Cheongmo Attendance Details (For GIVEN + WEDDING)
  attendedCheongmo?: boolean;
  cheongmoPriceRange?: 'LOW' | 'MEDIUM' | 'HIGH'; // LOW: ~30k, MEDIUM: 30k~50k, HIGH: 50k+
  givenCheongmoGift?: boolean;
}

export interface Cheongmo {
  id: string;
  name: string;
  date: string;
  location: string;
  totalCost: number;
  guestCount: number;
  memo?: string;
  attendees?: string; // Comma separated names
}

export interface DashboardStats {
  totalGiven: number;
  totalReceived: number;
  totalCheongmo: number;
  netAsset: number;
}
