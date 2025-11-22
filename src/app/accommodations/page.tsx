
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Check,
  Fish,
  Heart,
  Home,
  Info,
  Mountain,
  Package,
  PartyPopper,
  Ship,
  Sparkles,
  Ticket,
  Users,
  Waves,
  Camera,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images';

const galleryImages = [
  { id: 'cottage-view', hint: 'cottage view', title: 'Cottage View' },
  { id: 'crystal-waters', hint: 'crystal waters', title: 'Crystal Waters' },
  { id: 'island-paradise', hint: 'island paradise', title: 'Island Paradise' },
];

export default function FloatingCottagePage() {
  const heroImage = placeholderImages.find((p) => p.id === 'cottage-1');

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="overflow-hidden mb-8 shadow-lg">
          <div className="relative h-64 md:h-96 w-full">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt="Balatasan Floating Cottage"
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-4 sm:p-8">
              <div className="flex justify-end">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl"
                  asChild
                >
                  <Link href="/bookings/floating-cottage">
                    <Ticket className="mr-2 h-5 w-5" />
                    Book Now
                  </Link>
                </Button>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">
                  Balatasan Floating Cottage
                </h1>
                <p className="mt-2 text-lg text-white/90">
                  Experience paradise on water
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold font-headline mb-4">
              Balatasan Floating Cottage
            </h2>
            <p className="text-muted-foreground text-lg">
              Experience the ultimate relaxation in our authentic Balatasan
              floating cottages - traditional bamboo and nipa huts built over
              the crystal clear waters of Verde Island Passage. Perfect for
              families, groups, and special occasions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {galleryImages.map((img) => {
              const pImage = placeholderImages.find((p) => p.id === img.id);
              return (
                <div
                  key={img.id}
                  className="relative h-48 rounded-lg overflow-hidden group shadow-md"
                >
                  {pImage && (
                    <Image
                      src={pImage.imageUrl}
                      alt={pImage.description}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      data-ai-hint={pImage.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h3 className="text-white font-bold text-lg">{img.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Cottage Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">
                      Traditional Filipino Design:
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Authentic bamboo & nipa construction.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Spacious Platform:</span>
                    <p className="text-sm text-muted-foreground">
                      A 4x6 meter platform for your group to enjoy.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">360° Panoramic Views:</span>
                    <p className="text-sm text-muted-foreground">
                      Unobstructed views of the ocean and mountains.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Direct Water Access:</span>
                    <p className="text-sm text-muted-foreground">
                      A ladder provides easy access to the water.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Shade and Seating:</span>
                    <p className="text-sm text-muted-foreground">
                      Native nipa palm roof and bamboo benches.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Safety:</span>
                    <p className="text-sm text-muted-foreground">
                      Life jackets provided for all guests.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Rental Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Ticket className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">₱1,500</span>
                    <p className="text-sm text-muted-foreground">
                      4 hours (half day)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Ticket className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">₱2,500</span>
                    <p className="text-sm text-muted-foreground">
                      8 hours (whole day)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Ticket className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">₱3,500</span>
                    <p className="text-sm text-muted-foreground">
                      Overnight stay
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Capacity:</span>
                    <p className="text-sm text-muted-foreground">6-8 persons</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Availability:</span>
                    <p className="text-sm text-muted-foreground">
                      6:00 AM - 7:00 PM (Advance booking required)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Ship className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Transport:</span>
                    <p className="text-sm text-muted-foreground">
                      Boat transfer included.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12 bg-blue-50 dark:bg-blue-900/30">
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Home className="h-8 w-8 text-blue-600" />
                <span>Seating Area</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Waves className="h-8 w-8 text-blue-600" />
                <span>Swimming Access</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <span>Shade Cover</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Fish className="h-8 w-8 text-blue-600" />
                <span>Fishing Allowed</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>What Makes Balatasan Floating Cottage Special</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex gap-4">
                <Sparkles className="h-6 w-6 text-accent flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Verde Island Passage Location</h4>
                  <p className="text-sm text-muted-foreground">
                    Located in the heart of the world's marine biodiversity
                    center with crystal-clear turquoise waters.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Waves className="h-6 w-6 text-accent flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Marine Life Viewing</h4>
                  <p className="text-sm text-muted-foreground">
                    Watch colorful fish swimming beneath the cottage through the
                    clear water.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Package className="h-6 w-6 text-accent flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Authentic Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    Traditional Filipino floating cottage design using
                    sustainable local materials.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Mountain className="h-6 w-6 text-accent flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Stunning Views</h4>
                  <p className="text-sm text-muted-foreground">
                    Unobstructed views of mountains, islands, and spectacular
                    sunsets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Perfect For</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card shadow-sm">
                <Heart className="h-8 w-8 text-pink-500 mb-2" />
                <div>
                  <h4 className="font-semibold">Romantic Getaway</h4>
                  <p className="text-xs text-muted-foreground">
                    Private and intimate setting.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card shadow-sm">
                <Users className="h-8 w-8 text-green-500 mb-2" />
                <div>
                  <h4 className="font-semibold">Family Bonding</h4>
                  <p className="text-xs text-muted-foreground">
                    Quality time with loved ones.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card shadow-sm">
                <PartyPopper className="h-8 w-8 text-purple-500 mb-2" />
                <div>
                  <h4 className="font-semibold">Celebrations</h4>
                  <p className="text-xs text-muted-foreground">
                    Birthdays, anniversaries.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card shadow-sm">
                <Camera className="h-8 w-8 text-blue-500 mb-2" />
                <div>
                  <h4 className="font-semibold">Photo Sessions</h4>
                  <p className="text-xs text-muted-foreground">
                    Instagram-worthy views.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Add-On Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Food & Beverage Delivery</h4>
                      <p className="text-sm text-muted-foreground">
                        Order from our restaurant to your cottage.
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Available
                    </Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Snorkeling Equipment</h4>
                      <p className="text-sm text-muted-foreground">
                        Explore marine life around the cottage.
                      </p>
                    </div>
                    <span className="font-semibold text-sm">₱300/set</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Fishing Gear Rental</h4>
                      <p className="text-sm text-muted-foreground">
                        Try your luck at fishing.
                      </p>
                    </div>
                    <span className="font-semibold text-sm">₱200/set</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-yellow-700" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200 list-disc list-inside">
                  <li>Life jackets are mandatory for non-swimmers.</li>
                  <li>
                    Children must be supervised by adults at all times.
                  </li>
                  <li>No glass containers allowed on the cottage.</li>
                  <li>
                    Please keep the cottage clean and dispose of trash
                    properly.
                  </li>
                  <li>Cottage availability depends on weather conditions.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary text-primary-foreground rounded-xl p-8 text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-2">
              Experience Floating Paradise
            </h2>
            <p className="text-primary-foreground/90 mb-6 max-w-lg mx-auto">
              Reserve your floating cottage today and create unforgettable
              memories!
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white/90 text-primary hover:bg-white"
              asChild
            >
              <Link href="/bookings/floating-cottage">
                <Ticket className="mr-2 h-5 w-5" />
                Reserve Floating Cottage
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
