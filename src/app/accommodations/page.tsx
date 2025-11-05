'use client';
import Image from 'next/image';
import Link from 'next/link';
import { getAccommodations } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/star-rating';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function AccommodationSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="h-52 w-full" />
      <CardContent className="flex-1 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-12 w-full" />
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="mt-1 h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}

export default function AccommodationsPage() {
  const accommodations = getAccommodations();

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Our Accommodations
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          From our famous floating cottages to beachfront stays, find the
          perfect retreat for your getaway.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accommodations?.map((item) => (
          <Card
            key={item.id}
            className="flex flex-col overflow-hidden transition-all hover:shadow-lg"
          >
            <CardHeader className="p-0">
              <Link href={`/accommodations/${item.id}`}>
                <Image
                  src={getPlaceholderImage(item.images[0]).imageUrl}
                  alt={item.name}
                  width={600}
                  height={400}
                  className="aspect-video w-full object-cover"
                  data-ai-hint="beach house"
                />
              </Link>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <CardTitle className="font-headline mb-2 text-xl">
                  {item.name}
                </CardTitle>
                <Badge variant="secondary">{item.type.replace('_', ' ')}</Badge>
              </div>
              <CardDescription className="h-12 overflow-hidden text-ellipsis text-sm">
                {item.description}
              </CardDescription>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <StarRating rating={item.rating} size={16} />
                  <span>({item.reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{item.capacity} Guests</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2 bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-bold">
                  ₱{item.price_per_night.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">
                  per night
                </span>
              </div>
              <Button asChild>
                <Link href={`/accommodations/${item.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       {accommodations?.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            No accommodations found.
          </div>
        )}
    </div>
  );
}
