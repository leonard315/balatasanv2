'use client';
import Image from 'next/image';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Waves, Ship, BedDouble } from 'lucide-react';
import { getAccommodations, getTours } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/utils';
import { StarRating } from '@/components/star-rating';

export default function Home() {
  const allAccommodations = getAccommodations();
  const allTours = getTours();

  const featuredAccommodations = allAccommodations.slice(0, 3);
  const featuredTours = allTours.slice(0, 3);

  return (
    <div className="flex min-h-dvh flex-col">
      <section className="relative h-[60vh] min-h-[400px] w-full">
        <Image
          src={getPlaceholderImage('hero-background').imageUrl}
          alt="Balatasan Beach"
          fill
          className="object-cover"
          priority
          data-ai-hint="beach resort background"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <h1 className="font-headline text-4xl font-bold md:text-6xl lg:text-7xl">
            Your Seaside Sanctuary Awaits
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl">
            Discover the pristine beauty of Balatasan Resort in Bulalacao. Unwind,
            explore, and create unforgettable memories.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/accommodations">
              Book Your Stay <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="w-full bg-background py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                Escape to Paradise
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We are famous for our unique floating cottages and serve as a perfect jump-off point for island hopping adventures.
                Whether you're looking for a relaxing getaway or an
                action-packed holiday, we have something for everyone.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            <div className="grid gap-1 text-center">
              <BedDouble className="mx-auto h-10 w-10 text-primary" />
              <h3 className="text-lg font-bold">Unique Stays</h3>
              <p className="text-sm text-muted-foreground">
                Experience our famous floating cottages or relax in our beachfront rooms.
              </p>
            </div>
            <div className="grid gap-1 text-center">
              <Ship className="mx-auto h-10 w-10 text-primary" />
              <h3 className="text-lg font-bold">Island Hopping</h3>
              <p className="text-sm text-muted-foreground">
                Explore the stunning beauty of nearby Aslom and Sibalat islands with our guided tours.
              </p>
            </div>
            <div className="grid gap-1 text-center">
              <Waves className="mx-auto h-10 w-10 text-primary" />
              <h3 className="text-lg font-bold">Water Sports</h3>
              <p className="text-sm text-muted-foreground">
                Relax on our white sandy beaches and enjoy activities like kayaking and paddle boating.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-secondary/50 py-12 md:py-24 lg:py-32">
        <div className="container space-y-12 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                Featured Accommodations
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose from our handpicked selection of stays, each offering a
                unique experience.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredAccommodations.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader className="p-0">
                  <Link href={`/accommodations/${item.id}`}>
                    <Image
                      src={getPlaceholderImage(item.images[0]).imageUrl}
                      alt={item.name}
                      width={600}
                      height={400}
                      className="aspect-[3/2] w-full object-cover"
                      data-ai-hint="beach cottage"
                    />
                  </Link>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="font-headline text-xl">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="mt-2 h-10 overflow-hidden text-ellipsis">
                    {item.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <div className="flex flex-col">
                    <span className="font-semibold">
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
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href="/accommodations">
                View All Accommodations <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container space-y-12 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                Popular Tour Packages
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Embark on an adventure and discover the hidden gems of the
                region.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTours.map((tour) => (
              <Card
                key={tour.id}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader className="p-0">
                  <Link href="/tours">
                    <Image
                      src={getPlaceholderImage(tour.images[0]).imageUrl}
                      alt={tour.tour_name}
                      width={600}
                      height={400}
                      className="aspect-[3/2] w-full object-cover"
                      data-ai-hint="island hopping"
                    />
                  </Link>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="font-headline text-xl">
                    {tour.tour_name}
                  </CardTitle>
                   <div className="mt-2 flex items-center">
                    <StarRating rating={tour.rating || 0} />
                    <span className="ml-2 text-sm text-muted-foreground">({tour.reviews || 0} reviews)</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                   <div className="flex flex-col">
                    <span className="font-semibold">
                      ₱{tour.price_per_person.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      per person
                    </span>
                  </div>
                  <Button asChild>
                    <Link href="/tours">Learn More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href="/tours">
                View All Tours <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
