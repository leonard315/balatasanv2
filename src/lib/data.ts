'use client';
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  getFirestore,
  type CollectionReference,
  type DocumentReference,
  type Query,
  collectionGroup,
} from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import type {
  Accommodation,
  Tour,
  Booking,
  Review,
  WaterSport,
  User,
} from './types';


// --- Data Creation/Update ---

/**
 * Creates or updates a user document in Firestore.
 * If the user document already exists, it merges the new data.
 * This is useful for creating a user profile on first login or after signup.
 *
 * @param user The Firebase Auth User object.
 * @param additionalData Optional additional data to add to the user document.
 */
export async function createOrUpdateUser(user: FirebaseUser, additionalData: Partial<User> = {}) {
    if (!user) return;
    const firestore = getFirestore();
    const userRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    let userData: User;

    if (!docSnap.exists()) {
        const [firstName, ...lastName] = user.displayName?.split(' ') || [additionalData.firstName || 'New', additionalData.lastName || 'User'];
        // Special case for the admin user
        const userType = user.email === 'admin@balatasan.com' ? 'admin' : 'guest';

        userData = {
            id: user.uid,
            firstName: firstName,
            lastName: lastName.join(' '),
            email: user.email!,
            emailVerified: user.emailVerified,
            userType: userType,
            isActive: true,
            photoURL: user.photoURL || additionalData.photoURL || '',
            ...additionalData,
        };
    } else {
        // If doc exists, just merge new data
        userData = {
            ...docSnap.data() as User,
            ...additionalData
        };
    }

    await setDoc(userRef, userData, { merge: true });
}


// --- Data Fetching Hooks ---

export function useAccommodations() {
  const firestore = useFirestore();
  const accommodationsCollection = useMemoFirebase(
    () => collection(firestore, 'accommodations') as CollectionReference<Accommodation>,
    [firestore]
  );
  return useCollection<Accommodation>(accommodationsCollection);
}

export function useAccommodationById(id: string | null | undefined) {
    const firestore = useFirestore();
    const accommodationDoc = useMemoFirebase(
        () => (id ? doc(firestore, 'accommodations', id) as DocumentReference<Accommodation> : null),
        [firestore, id]
    );
    return useDoc<Accommodation>(accommodationDoc);
}

export function useTours() {
  const firestore = useFirestore();
  const toursCollection = useMemoFirebase(
    () => collection(firestore, 'tourPackages') as CollectionReference<Tour>,
    [firestore]
  );
  return useCollection<Tour>(toursCollection);
}

export function useUserBookings() {
    const firestore = useFirestore();
    const { user } = useUser();
    const bookingsCollection = useMemoFirebase(
        () =>
            user
                ? (collection(
                    firestore,
                    'users',
                    user.uid,
                    'bookings'
                  ) as CollectionReference<Booking>)
                : null,
        [firestore, user]
    );
    return useCollection<Booking>(bookingsCollection);
}

export function useAllBookings() {
    const firestore = useFirestore();
    const bookingsQuery = useMemoFirebase(
        () => collectionGroup(firestore, 'bookings') as Query<Booking>,
        [firestore]
    );
    return useCollection<Booking>(bookingsQuery);
}

export function useUserById(userId: string | null) {
    const firestore = useFirestore();
    const userDoc = useMemoFirebase(
        () => (userId ? doc(firestore, 'users', userId) as DocumentReference<User> : null),
        [firestore, userId]
    );
    return useDoc<User>(userDoc);
}

export function useAllUsers() {
    const firestore = useFirestore();
    const usersCollection = useMemoFirebase(
        () => collection(firestore, 'users') as CollectionReference<User>,
        [firestore]
    );
    return useCollection<User>(usersCollection);
}


export function useReviewsByItemId(itemId: string | null) {
    const firestore = useFirestore();
    const reviewsQuery = useMemoFirebase(
        () =>
            itemId
                ? query(
                    collection(firestore, 'reviews'),
                    where('itemId', '==', itemId)
                  )
                : null,
        [firestore, itemId]
    );
    return useCollection<Review>(reviewsQuery as Query<Review> | null);
}

// --- Static Data (To be removed or used for seeding) ---

const waterSports: WaterSport[] = [
  {
    id: 'ws-1',
    name: 'Flying Fish',
    description: 'A thrilling ride that sends you flying over the waves.',
    capacity: 3,
    duration: '15 mins',
    basePrice: 1500,
    excess: 500,
    images: ['watersport-flying-fish'],
  },
  {
    id: 'ws-2',
    name: 'Banana Boat',
    description: 'A classic and fun-filled ride for the whole family.',
    capacity: 12,
    duration: '15 mins',
    basePrice: 3000,
    excess: 250,
    images: ['watersport-banana-boat'],
  },
  {
    id: 'ws-3',
    name: 'Hurricane',
    description: 'Get ready to spin and scream on this exhilarating water ride.',
    capacity: 6,
    duration: '15 mins',
    basePrice: 2000,
    excess: 350,
    images: ['watersport-hurricane'],
  },
  {
    id: 'ws-4',
    name: 'Crazy UFO',
    description:
      'An out-of-this-world ride that will have you bouncing on the water.',
    capacity: 6,
    duration: '15 mins',
    basePrice: 2000,
    excess: 350,
    images: ['watersport-ufo'],
  },
  {
    id: 'ws-5',
    name: 'Pedal Boat',
    description: 'A relaxing way to explore the calm waters at your own pace.',
    capacity: 4,
    duration: '1 hour',
    price: 500,
    images: ['watersport-pedal-boat'],
  },
  {
    id: 'ws-6',
    name: 'Hand Paddle Boat',
    description:
      'Perfect for a solo paddle or a fun race with a friend. Also known as kayaking.',
    duration: '1 hour',
    price: 200,
    images: ['watersport-hand-paddle'],
  },
];

const tours: Tour[] = [
    {
      id: 'tour-1',
      tour_name: 'Aslom & Sibalat Island Hopping',
      description: 'Visit the beautiful sandbar of Aslom Island and the pristine Sibalat Island. Enjoy a freshly prepared lunch on a secluded beach.',
      tour_type: 'island_hopping',
      duration_hours: 5,
      price_per_person: 1200.00,
      max_participants: 15,
      inclusions: ['Boat rental', 'Life jackets', 'Snorkeling gear', 'Lunch', 'Tour guide', 'Refreshments'],
      images: ['island-hopping-1', 'island-hopping-2'],
      rating: 4.9,
      reviews: 215
    },
    {
      id: 'tour-2',
      tour_name: 'Target Island Adventure',
      description: 'Discover the hidden gem of Target Island, with its crystal clear waters and untouched nature. Perfect for a day of swimming and relaxation.',
      tour_type: 'island_hopping',
      duration_hours: 4,
      price_per_person: 1000.00,
      max_participants: 10,
      inclusions: ['Boat rental', 'Life jackets', 'Tour guide', 'Light snacks'],
      images: ['tour-target-island'],
      rating: 4.8,
      reviews: 150
    },
    {
      id: 'tour-3',
      tour_name: 'Buyayao Island Marine Sanctuary',
      description: 'Explore the rich marine biodiversity of Buyayao Island. A must-visit for snorkelers and nature lovers alike.',
      tour_type: 'snorkeling',
      duration_hours: 6,
      price_per_person: 1500.00,
      max_participants: 12,
      inclusions: ['Boat rental', 'Life jackets', 'Snorkeling gear', 'Sanctuary fees', 'Tour guide'],
      images: ['tour-buyayao-island'],
      rating: 4.9,
      reviews: 180
    },
    {
      id: 'tour-4',
      tour_name: 'Suguicay Island Getaway',
      description: 'Relax on the long, white sandbar of Suguicay Island. A perfect spot for sunbathing, swimming, and enjoying the serene environment.',
      tour_type: 'island_hopping',
      duration_hours: 4,
      price_per_person: 900.00,
      max_participants: 20,
      inclusions: ['Boat rental', 'Life jackets', 'Tour guide', 'Entrance fees'],
      images: ['tour-suguicay-island'],
      rating: 4.7,
      reviews: 112
    },
    {
      id: 'tour-5',
      tour_name: 'Silad Island Exploration',
      description: 'Discover the tranquil beauty and clear waters of Silad Island, a perfect spot for relaxation and swimming.',
      tour_type: 'island_hopping',
      duration_hours: 4,
      price_per_person: 950.00,
      max_participants: 15,
      inclusions: ['Boat rental', 'Life jackets', 'Tour guide', 'Entrance fees'],
      images: ['tour-silad-island'],
      rating: 4.6,
      reviews: 98
    }
  ];

export const getWaterSports = (): WaterSport[] => waterSports;
export const getTours = (): Tour[] => tours;

// Mock data functions to be phased out
const accommodations: Accommodation[] = [
  {
    id: 'floating-cottage-family',
    name: 'Family Floating Cottage',
    description: 'Our largest floating cottage, perfect for families. Offers stunning 360-degree views of the sea and direct water access.',
    type: 'floating_cottage',
    capacity: 6,
    price_per_night: 2500.00,
    amenities: ['2 Bedrooms', 'Kitchenette', 'Sun deck', 'Direct water access', 'Fan-cooled'],
    images: ['floating-cottage-1'],
    rating: 4.7,
    reviews: 42
  },
   {
    id: 'floating-cottage-standard',
    name: 'Standard Floating Cottage',
    description: 'A comfortable floating cottage for small groups or couples, providing a unique on-the-water experience.',
    type: 'floating_cottage',
    capacity: 4,
    price_per_night: 2000.00,
    amenities: ['1 Bedroom', 'Seating Area', 'Sun deck', 'Direct water access', 'Fan-cooled'],
    images: ['floating-cottage-1'],
    rating: 4.6,
    reviews: 35
  },
];

const bookings: Booking[] = [];

const reviews: Review[] = [];

export const getAccommodations = (): Accommodation[] => accommodations;
export const getAccommodationById = (id: string): Accommodation | undefined => accommodations.find(item => item.id === id);

export const getBookings = (): Booking[] => bookings;
export const getReviewsByItemId = (itemId: string): Review[] => reviews.filter(review => review.item_id === itemId);
