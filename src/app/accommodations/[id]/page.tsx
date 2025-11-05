'use client';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAccommodationById, getReviewsByItemId } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BedDouble,
  Users,
  Check,
  Calendar,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewForm } from '@/components/review-form';
import { Skeleton } from '@/components/ui/skeleton';

function AccommodationDetailSkeleton() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="mb-2 h-6 w-24" />
              <Skeleton className="h-9 w-3/4" />
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Separator />
              <div>
                <Skeleton className="mb-2 h-6 w-32" />
                <ul className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </ul>
              </div>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AccommodationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const accommodation = getAccommodationById(params.id);
  const reviews = getReviewsByItemId(params.id);


  if (!accommodation) {
    notFound();
  }

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length
      : accommodation.rating;

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <Carousel className="w-full">
            <CarouselContent>
              {(accommodation.images || []).map((imgId, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={getPlaceholderImage(imgId).imageUrl}
                    alt={`${accommodation.name} - Image ${index + 1}`}
                    width={1200}
                    height={800}
                    className="aspect-video w-full rounded-lg object-cover"
                    data-ai-hint="accommodation interior"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <Badge className="mb-2 w-fit">{accommodation.type}</Badge>
              <CardTitle className="font-headline text-3xl">
                {accommodation.name}
              </CardTitle>
              <div className="flex items-center gap-2 pt-2">
                <StarRating rating={averageRating} />
                <span className="text-sm text-muted-foreground">
                  ({reviews?.length || accommodation.reviews} reviews)
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {accommodation.description}
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-primary" />
                  <span>{accommodation.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Up to {accommodation.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span>₱{accommodation.price_per_night.toFixed(2)}/night</span>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="mb-2 text-lg font-semibold">Amenities</h3>
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  {(accommodation.amenities || []).map((amenity, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button size="lg" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Check Availability & Book
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-headline text-3xl font-bold">
          Reviews & Ratings
        </h2>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.review_id}>
                    <CardHeader className="flex flex-row items-start gap-4">
                      <Avatar>
                        <AvatarImage
                          src={getPlaceholderImage(review.user_avatar).imageUrl}
                          alt={review.user_name}
                          data-ai-hint="person portrait"
                        />
                        <AvatarFallback>
                          {review.user_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{review.user_name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {review.created_at}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size={16} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold">{review.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No reviews yet. Be the first to leave a review!
              </p>
            )}
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Leave a Review</CardTitle>
                <CardContent className="p-0 pt-4">
                  <ReviewForm
                    itemId={accommodation.id}
                    itemType="accommodation"
                  />
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
