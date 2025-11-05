'use server';

import { z } from 'zod';
import { getFirestore, doc, setDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const firestore = getFirestore();

const AccommodationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['floating_cottage', 'cottage', 'glamping_tent', 'villa', 'room']),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  price_per_night: z.coerce.number().min(1, 'Price must be greater than 0'),
  amenities: z.string().min(1, 'Please add at least one amenity.'),
});

export type AccommodationState = {
  errors?: {
    name?: string[];
    description?: string[];
    type?: string[];
    capacity?: string[];
    price_per_night?: string[];
    amenities?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function saveAccommodation(
  prevState: AccommodationState,
  formData: FormData
): Promise<AccommodationState> {
  const validatedFields = AccommodationSchema.safeParse({
    id: formData.get('id') as string | undefined,
    name: formData.get('name'),
    description: formData.get('description'),
    type: formData.get('type'),
    capacity: formData.get('capacity'),
    price_per_night: formData.get('price_per_night'),
    amenities: formData.get('amenities'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to save accommodation. Please check the fields.',
      success: false,
    };
  }

  const { id, ...data } = validatedFields.data;
  const amenitiesArray = data.amenities.split(',').map(s => s.trim()).filter(Boolean);

  try {
    if (id) {
      // Update existing document
      const accommodationRef = doc(firestore, 'accommodations', id);
      await setDoc(accommodationRef, { ...data, amenities: amenitiesArray }, { merge: true });
    } else {
      // Create new document
      await addDoc(collection(firestore, 'accommodations'), {
        ...data,
        amenities: amenitiesArray,
        // Add default values for new fields
        images: ['cottage-a-1'], // Default image
        rating: 0,
        reviews: 0,
      });
    }

    revalidatePath('/admin/accommodations');
    revalidatePath('/accommodations');

    return {
      message: `Successfully ${id ? 'updated' : 'created'} accommodation.`,
      success: true,
    };
  } catch (error) {
    console.error('Error saving accommodation:', error);
    return {
      message: 'An error occurred while saving the accommodation. Please try again.',
      success: false,
    };
  }
}


export async function deleteAccommodation(id: string): Promise<{ success: boolean; message: string }> {
    if (!id) {
        return { success: false, message: 'Accommodation ID is required.' };
    }
    try {
        await deleteDoc(doc(firestore, 'accommodations', id));
        revalidatePath('/admin/accommodations');
        revalidatePath('/accommodations');
        return { success: true, message: 'Accommodation deleted successfully.' };
    } catch (error) {
        console.error("Error deleting accommodation: ", error);
        return { success: false, message: 'Failed to delete accommodation.' };
    }
}

    