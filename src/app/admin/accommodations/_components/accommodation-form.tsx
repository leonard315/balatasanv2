'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveAccommodation, type AccommodationState } from '../actions';
import { useFormState } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import type { Accommodation } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const AccommodationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['floating_cottage', 'cottage', 'glamping_tent', 'villa', 'room']),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  price_per_night: z.coerce.number().min(1, 'Price must be greater than 0'),
  amenities: z.string().min(1, 'Please add at least one amenity.'),
});

type AccommodationFormValues = z.infer<typeof AccommodationSchema>;

interface AccommodationFormProps {
  isOpen: boolean;
  onClose: () => void;
  accommodation: Accommodation | null;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Save Changes' : 'Create Accommodation'}
    </Button>
  );
}

export function AccommodationForm({
  isOpen,
  onClose,
  accommodation,
}: AccommodationFormProps) {
  const { toast } = useToast();
  const form = useForm<AccommodationFormValues>({
    resolver: zodResolver(AccommodationSchema),
    defaultValues: {
      id: accommodation?.id || undefined,
      name: accommodation?.name || '',
      description: accommodation?.description || '',
      type: accommodation?.type || 'cottage',
      capacity: accommodation?.capacity || 1,
      price_per_night: accommodation?.price_per_night || 0,
      amenities: accommodation?.amenities.join(', ') || '',
    },
  });

  const initialState: AccommodationState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(saveAccommodation, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      onClose();
      form.reset();
    } else if (state.message && !state.success) {
       toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.message,
      });
    }
  }, [state, toast, onClose, form]);
  
  useEffect(() => {
    // Reset form when the accommodation prop changes
    if (accommodation) {
        form.reset({
            id: accommodation.id,
            name: accommodation.name,
            description: accommodation.description,
            type: accommodation.type,
            capacity: accommodation.capacity,
            price_per_night: accommodation.price_per_night,
            amenities: accommodation.amenities.join(', '),
        });
    } else {
        form.reset({
            id: undefined,
            name: '',
            description: '',
            type: 'cottage',
            capacity: 1,
            price_per_night: 0,
            amenities: '',
        });
    }
  }, [accommodation, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {accommodation ? 'Edit Accommodation' : 'Add New Accommodation'}
          </DialogTitle>
           <DialogDescription>
            {accommodation ? 'Update the details for this accommodation.' : 'Fill out the form to add a new accommodation.'}
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch} className="grid gap-4 py-4">
          {accommodation && <input type="hidden" name="id" value={accommodation.id} />}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={form.getValues('name')} />
             {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
             {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={form.getValues('description')} />
             {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
             {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={form.getValues('type')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="floating_cottage">Floating Cottage</SelectItem>
                        <SelectItem value="cottage">Cottage</SelectItem>
                        <SelectItem value="glamping_tent">Glamping Tent</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="room">Room</SelectItem>
                    </SelectContent>
                </Select>
                 {form.formState.errors.type && <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>}
                 {state?.errors?.type && <p className="text-sm text-destructive">{state.errors.type[0]}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" defaultValue={form.getValues('capacity')} />
                 {form.formState.errors.capacity && <p className="text-sm text-destructive">{form.formState.errors.capacity.message}</p>}
                 {state?.errors?.capacity && <p className="text-sm text-destructive">{state.errors.capacity[0]}</p>}
            </div>
          </div>
           <div className="space-y-2">
                <Label htmlFor="price_per_night">Price per Night (₱)</Label>
                <Input id="price_per_night" name="price_per_night" type="number" step="0.01" defaultValue={form.getValues('price_per_night')} />
                 {form.formState.errors.price_per_night && <p className="text-sm text-destructive">{form.formState.errors.price_per_night.message}</p>}
                 {state?.errors?.price_per_night && <p className="text-sm text-destructive">{state.errors.price_per_night[0]}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input id="amenities" name="amenities" defaultValue={form.getValues('amenities')} placeholder="e.g. Aircon, Wi-Fi, TV" />
                 {form.formState.errors.amenities && <p className="text-sm text-destructive">{form.formState.errors.amenities.message}</p>}
                 {state?.errors?.amenities && <p className="text-sm text-destructive">{state.errors.amenities[0]}</p>}
            </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <SubmitButton isEditing={!!accommodation} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    