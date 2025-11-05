'use client';
import Image from 'next/image';
import Link from 'next/link';
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
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getTours } from '@/lib/data';

function TourSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="h-52 w-full" />
      <CardContent className="flex-1 p-4">
        <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between bg-secondary/30 p-4">
        <div className="flex flex-col">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="mt-1 h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}


export default function ToursPage() {
  const tours = getTours();

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Our Tour Packages
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          Explore the natural wonders surrounding Balatasan. Adventure awaits!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours?.map((tour) => (
          <Card
            key={tour.id}
            className="flex flex-col overflow-hidden transition-all hover:shadow-lg"
          >
            <CardHeader className="p-0">
              <Image
                src={getPlaceholderImage(tour.images[0]).imageUrl}
                alt={tour.tour_name}
                width={600}
                height={400}
                className="aspect-video w-full object-cover"
                data-ai-hint="tropical adventure"
              />
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <CardTitle className="font-headline mb-2 text-xl">
                  {tour.tour_name}
                </CardTitle>
                <Badge variant="secondary">
                  {tour.tour_type.replace('_', ' ')}
                </Badge>
              </div>
              <CardDescription className="h-12 overflow-hidden text-ellipsis text-sm">
                {tour.description}
              </CardDescription>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <StarRating rating={tour.rating || 0} size={16} />
                  <span>({tour.reviews || 0})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{tour.duration_hours} hours</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between bg-secondary/30 p-4">
              <div className="flex flex-col">
                <span className="text-lg font-bold">
                  ₱{tour.price_per_person.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">
                  per person
                </span>
              </div>
              <Button asChild>
                <Link href={`/checkout?activityId=${tour.id}`}>Book Now</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
         {tours?.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            No tours found.
          </div>
        )}
      </div>
    </div>
  );
}
