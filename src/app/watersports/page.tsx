'use client';
import Image from 'next/image';
import Link from 'next/link';
import { getWaterSports } from '@/lib/data';
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
import { Badge } from '@/components/ui/badge';
import { Clock, Users, DollarSign } from 'lucide-react';

export default function WaterSportsPage() {
  const waterSports = getWaterSports();

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`;

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Water Sports Activities
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          Dive into adventure with our exciting range of water sports. Fun for everyone!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {waterSports.map((sport) => (
          <Card key={sport.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-0">
                <Image
                  src={getPlaceholderImage(sport.images[0]).imageUrl}
                  alt={sport.name}
                  width={600}
                  height={400}
                  className="aspect-video w-full object-cover"
                  data-ai-hint="water sport"
                />
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <CardTitle className="font-headline text-xl mb-2">
                {sport.name}
              </CardTitle>
              <CardDescription className="h-12 overflow-hidden text-ellipsis text-sm">
                {sport.description}
              </CardDescription>
               <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                {sport.capacity && (
                  <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{sport.capacity} pax</span>
                  </div>
                )}
                 <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{sport.duration}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between bg-secondary/30 p-4">
              <div className="flex flex-col text-sm">
                {sport.price ? (
                    <span className="font-bold text-lg">{formatPrice(sport.price)}</span>
                ) : (
                    <>
                        <span className="font-bold text-lg">{formatPrice(sport.basePrice!)}</span>
                        <span className="text-xs text-muted-foreground">
                          + {formatPrice(sport.excess!)} / extra person
                        </span>
                    </>
                )}
              </div>
              <Button asChild>
                <Link href={`/checkout?activityId=${sport.id}`}>Book Now</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
