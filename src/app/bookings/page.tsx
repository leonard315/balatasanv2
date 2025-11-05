'use client';
import Image from 'next/image';
import { useUserBookings } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

function BookingsSkeleton() {
    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Item</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-[75px] w-[100px] rounded-md" />
                                <div>
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="mt-1 h-4 w-24" />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-5 w-24 md:hidden" />
                            <Skeleton className="mt-1 h-4 w-20 md:hidden" />
                            <Skeleton className="mt-1 h-4 w-16" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="mt-1 h-4 w-24" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell className="text-right">
                           <Skeleton className="h-6 w-16 ml-auto" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function BookingsPage() {
  const { user, isUserLoading } = useUser();
  const { data: bookings, isLoading: bookingsLoading } = useUserBookings();

  const isLoading = isUserLoading || bookingsLoading;

  const getStatusVariant = (
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
      case 'no_show':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!user && !isUserLoading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-semibold">Please log in</h2>
        <p className="mt-2 text-muted-foreground">
          You need to be logged in to view your bookings.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          My Bookings
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Here is a list of your past and upcoming reservations.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <BookingsSkeleton /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Item</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-4">
                        <Image
                          src={getPlaceholderImage(booking.item_image).imageUrl}
                          alt={booking.item_name}
                          width={100}
                          height={75}
                          className="rounded-md object-cover"
                          data-ai-hint="resort booking"
                        />
                        <div>
                          <p className="font-medium">{booking.item_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Ref: {booking.booking_reference}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium md:hidden">
                        {booking.item_name}
                      </div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        Ref: {booking.booking_reference}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground md:mt-0">
                        {booking.number_of_guests} Guest(s)
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {new Date(booking.check_in_date).toLocaleDateString()}
                      </div>
                      {booking.check_out_date && (
                        <div className="text-sm text-muted-foreground">
                          to{' '}
                          {new Date(
                            booking.check_out_date
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(booking.booking_status)}>
                        {booking.booking_status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₱{booking.total_amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {bookings?.length === 0 && !isLoading && (
        <div className="py-16 text-center text-muted-foreground">
          You have no bookings yet.
        </div>
      )}
    </div>
  );
}
