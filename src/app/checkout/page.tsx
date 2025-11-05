'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getWaterSports, getTours, getAccommodations } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Landmark,
  CircleDollarSign,
  Loader2,
  Users,
} from 'lucide-react';
import { processBooking, type BookingState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { addDoc, collection, doc } from 'firebase/firestore';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Confirm & Proceed
    </Button>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activityId = searchParams.get('activityId');
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [guests, setGuests] = useState(1);
  const [showGCashDialog, setShowGCashDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('gcash');

  const allActivities = useMemoFirebase(
    () => [...getWaterSports(), ...getTours(), ...getAccommodations()],
    []
  );

  const activity = allActivities.find((a) => a.id === activityId);

  const initialState: BookingState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(processBooking, initialState);

  const pricePer =
    (activity as any)?.price_per_person || (activity as any)?.price;
  const basePrice = (activity as any)?.basePrice;

  let totalAmount = 0;
  if (activity) {
    if (pricePer) {
      totalAmount = pricePer * guests;
    } else if (basePrice) {
      const capacity = (activity as any).capacity || 0;
      const excessGuests = Math.max(0, guests - capacity);
      const excessCost = excessGuests * ((activity as any).excess || 0);
      totalAmount = basePrice + excessCost;
    }
  }

  const serviceFee = totalAmount * 0.05;
  const total = totalAmount + serviceFee;

  useEffect(() => {
    async function handleBooking() {
      if (state.success && state.data && user && firestore) {
        // Validation was successful on the server, now create booking on client
        try {
          await addDoc(collection(firestore, 'users', user.uid, 'bookings'), {
            booking_reference: doc(
              collection(firestore, 'id')
            ).id.substring(0, 8).toUpperCase(),
            item_name:
              (activity as any)?.name || (activity as any)?.tour_name,
            item_image: activity!.images[0],
            check_in_date: state.data.date,
            check_out_date: null,
            number_of_guests: state.data.guests,
            total_amount: total,
            booking_status: 'pending',
            paymentStatus: 'pending',
            userId: user.uid,
            bookingType: 'tour', // assuming all bookable things are tours for now
          });

          if (state.data.paymentMethod === 'gcash') {
            setShowGCashDialog(true);
          } else {
            toast({
              title: 'Booking Confirmed!',
              description:
                'Your booking is pending. You can view it in "My Bookings".',
            });
            router.push('/bookings');
          }
        } catch (error) {
          console.error('Booking failed:', error);
          toast({
            variant: 'destructive',
            title: 'Booking Failed',
            description: 'Failed to save your booking. Please try again.',
          });
        }
      } else if (!state.success && state.message && !state.errors) {
        // Only show toast for general errors, not validation errors
        toast({
          variant: 'destructive',
          title: 'Booking Failed',
          description: state.message,
        });
      }
    }
    handleBooking();
  }, [state, toast, router, firestore, user, activity, total]);

  if (isUserLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-semibold">Please log in</h2>
        <p className="mt-2 text-muted-foreground">
          You need to be logged in to make a booking.
        </p>
        <Button asChild className="mt-4">
          <Link href={`/login?redirect=/checkout?activityId=${activityId}`}>
            Login
          </Link>
        </Button>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto py-8 text-center md:py-12">
        <h1 className="font-headline text-2xl font-bold">Activity not found</h1>
        <p className="text-muted-foreground">
          The requested activity could not be found.
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`;

  return (
    <div className="container mx-auto py-8 md:py-12">
      <AlertDialog open={showGCashDialog} onOpenChange={setShowGCashDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your GCash Payment</AlertDialogTitle>
            <AlertDialogDescription>
              To confirm your booking, please send the total amount of{' '}
              <span className="font-bold text-foreground">
                {formatPrice(total)}
              </span>{' '}
              to the GCash number below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg border bg-secondary p-4 text-center">
            <p className="text-sm text-muted-foreground">GCash Number</p>
            <p className="text-2xl font-bold tracking-widest text-primary">
              {state.data?.gCashNumber || '0912 345 6789'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Juan Dela Cruz</p>
          </div>
          <p className="text-xs text-muted-foreground">
            After sending, your booking status will be updated within 24 hours.
            Click "Done" to see your pending booking.
          </p>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/bookings')}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto max-w-4xl">
        <h1 className="font-headline mb-8 text-3xl font-bold tracking-tight md:text-4xl">
          Complete Your Booking
        </h1>
        <form
          action={dispatch}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          <input type="hidden" name="activityId" value={activity.id} />
          <input type="hidden" name="userId" value={user.uid} />

          <div className="space-y-8 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={user.displayName || ''}
                    />
                    {state.errors?.name && (
                      <p className="text-sm font-medium text-destructive">
                        {state.errors.name[0]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={user.email || ''}
                    />
                    {state.errors?.email && (
                      <p className="text-sm font-medium text-destructive">
                        {state.errors.email[0]}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Select Date</Label>
                    <Input id="date" name="date" type="date" />
                    {state.errors?.date && (
                      <p className="text-sm font-medium text-destructive">
                        {state.errors.date[0]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input
                      id="guests"
                      name="guests"
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) =>
                        setGuests(parseInt(e.target.value, 10) || 1)
                      }
                    />
                    {state.errors?.guests && (
                      <p className="text-sm font-medium text-destructive">
                        {state.errors.guests[0]}
                      </p>
                    )}
                  </div>
                </div>
                {paymentMethod === 'gcash' && (
                  <div className="space-y-2">
                    <Label htmlFor="gCashNumber">GCash Number</Label>
                    <Input
                      id="gCashNumber"
                      name="gCashNumber"
                      type="text"
                      placeholder="e.g. 09123456789"
                    />
                    {state.errors?.gCashNumber && (
                      <p className="text-sm font-medium text-destructive">
                        {state.errors.gCashNumber[0]}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Choose how you'd like to pay for your activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  name="paymentMethod"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-2 gap-4 md:grid-cols-3"
                >
                  <div>
                    <RadioGroupItem
                      value="gcash"
                      id="gcash"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="gcash"
                      className="flex h-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <CircleDollarSign className="mb-3 h-6 w-6" />
                      GCash
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="card"
                      id="card"
                      className="peer sr-only"
                      disabled
                    />
                    <Label
                      htmlFor="card"
                      className="flex h-full cursor-not-allowed flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 opacity-50"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      Credit/Debit
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="onsite"
                      id="onsite"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="onsite"
                      className="flex h-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Landmark className="mb-3 h-6 w-6" />
                      Pay On-site
                    </Label>
                  </div>
                </RadioGroup>
                {state.errors?.paymentMethod && (
                  <p className="pt-2 text-sm font-medium text-destructive">
                    {state.errors.paymentMethod[0]}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-semibold">
                    {(activity as any).name || (activity as any).tour_name}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{guests} Guest(s)</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Price</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Service Fee (5%)
                  </span>
                  <span className="text-muted-foreground">
                    {formatPrice(serviceFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <SubmitButton />
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
