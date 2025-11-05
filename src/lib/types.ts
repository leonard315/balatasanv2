export interface Accommodation {
  id: string;
  name: string;
  description: string;
  type: 'cottage' | 'glamping_tent' | 'villa' | 'room' | 'floating_cottage';
  capacity: number;
  price_per_night: number;
  amenities: string[];
  images: string[];
  rating: number;
  reviews: number;
  isAvailable?: boolean;
}

export interface Tour {
  id: string;
  tour_name: string;
  description: string;
  tour_type: 'island_hopping' | 'snorkeling' | 'waterfall' | 'cultural' | 'diving';
  duration_hours: number;
  price_per_person: number;
  max_participants: number;
  minParticipants?: number;
  inclusions: string[];
  images: string[];
  rating?: number;
  reviews?: number;
  isActive?: boolean;
}

export interface Booking {
  id: string;
  booking_reference: string;
  item_name: string;
  item_image: string;
  check_in_date: string;
  check_out_date: string | null;
  number_of_guests: number;
  total_amount: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  userId: string;
  bookingType?: 'accommodation' | 'tour';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'partial';
}

export interface Review {
    review_id: string;
    item_id: string;
    user_name: string;
    user_avatar: string;
    rating: number;
    title: string;
    comment: string;
    created_at: string;
    userId?: string;
    isApproved?: boolean;
}

export interface WaterSport {
  id: string;
  name: string;
  description: string;
  capacity?: number;
  duration: string;
  basePrice?: number;
  excess?: number;
  price?: number;
  images: string[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: 'guest' | 'staff' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  photoURL?: string;
}
