'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle,
  Home,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
  Waves,
  Clock,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import NotificationBell from '@/components/shared/NotificationBell';

const quickActions = [
  {
    icon: Calendar,
    title: 'Itinerary Planner',
    description: 'Plan your perfect day',
    href: '/itinerary-planner',
    bgColor: 'bg-orange-500/80',
    iconColor: 'text-white',
  },
  {
    icon: Briefcase,
    title: 'New Booking',
    description: 'Book cottage, tour, or activity',
    href: '/bookings/new',
    bgColor: 'bg-blue-600/80',
    iconColor: 'text-white',
  },
  {
    icon: BookOpen,
    title: 'My Bookings',
    description: 'View all reservations',
    href: '/profile?tab=bookings',
    bgColor: 'bg-teal-600/80',
    iconColor: 'text-white',
  },
  {
    icon: User,
    title: 'My Profile',
    description: 'Update your information',
    href: '/profile?tab=profile',
    bgColor: 'bg-purple-600/80',
    iconColor: 'text-white',
  },
  {
    icon: Star,
    title: 'Feedback & Ratings',
    description: 'Share your experience',
    href: '/feedback',
    bgColor: 'bg-yellow-500/80',
    iconColor: 'text-white',
  },
  {
    icon: Mail,
    title: 'Contact Us',
    description: 'Get support anytime',
    href: '#contact',
    bgColor: 'bg-pink-600/80',
    iconColor: 'text-white',
  },
];

const amenities = [
  {
    title: 'Floating Cottage',
    description: 'Relax on water',
    href: '/accommodations/floating-cottage',
    bgColor: 'from-cyan-500 to-blue-600',
    icon: Home,
  },
  {
    title: 'Tour Packages',
    description: 'Island hopping',
    href: '/tours',
    bgColor: 'from-orange-500 to-red-600',
    icon: MapPin,
  },
  {
    title: 'Water Activities',
    description: 'Adventure awaits',
    href: '/water-activities',
    bgColor: 'from-purple-500 to-pink-600',
    icon: Waves,
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, spending: 0, upcoming: 0 });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Real-time listener for user profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data());
          }
        });

        // Simple query without orderBy (works without index)
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid)
        );

        const calculateStats = (userBookings: any[]) => {
          const confirmed = userBookings.filter(b => b.status === 'approved' || b.status === 'confirmed').length;
          const spending = userBookings
            .filter(b => b.status === 'approved' || b.status === 'completed' || b.status === 'confirmed')
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
          const upcoming = userBookings.filter(b => 
            (b.status === 'approved' || b.status === 'confirmed') && 
            new Date(b.activityDate || b.bookingDate) > new Date()
          ).length;
          
          setStats({
            total: userBookings.length,
            confirmed,
            spending,
            upcoming,
          });
        };

        const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
          const userBookings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              bookingDate: data.bookingDate?.toDate?.() || new Date(data.bookingDate),
              activityDate: data.activityDate?.toDate?.() || (data.activityDate ? new Date(data.activityDate) : undefined),
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
              updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
            };
          });
          // Sort manually in JavaScript
          userBookings.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
          });
          setBookings(userBookings);
          calculateStats(userBookings);
        }, (error) => {
          console.error('Error fetching bookings:', error);
        });

        return () => {
          unsubscribeProfile();
          unsubscribeBookings();
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="relative min-h-screen">
      <Image
        src="https://i.ytimg.com/vi/GNAkv2CTl_8/maxresdefault.jpg"
        alt="Balatasan Beach Background"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95 -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 relative max-w-7xl">
        {/* Welcome Banner */}
        <Alert className="bg-gradient-to-r from-green-600/90 to-emerald-600/90 border-green-500 text-white shadow-xl backdrop-blur-sm">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <AlertTitle className="font-bold text-lg sm:text-xl">Welcome Back!</AlertTitle>
            <AlertDescription className="text-green-50 text-sm sm:text-base">
              Hello, {profile?.displayName || user?.displayName || 'Guest'}! Ready for your next adventure?
            </AlertDescription>
          </div>
          {user && <NotificationBell userId={user.uid} />}
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-gradient-to-br from-blue-600/90 to-blue-700/90 border-blue-500 text-white backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-100 text-xs sm:text-sm font-medium">My Bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl font-bold mb-1">{stats.total}</div>
              <p className="text-xs sm:text-sm text-blue-100">{stats.confirmed} confirmed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/90 to-emerald-600/90 border-green-500 text-white backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-100 text-xs sm:text-sm font-medium">Total Spent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl font-bold mb-1">₱{stats.spending.toLocaleString()}</div>
              <p className="text-xs sm:text-sm text-green-100">Lifetime spending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/90 to-purple-700/90 border-purple-500 text-white backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-100 text-xs sm:text-sm font-medium">Upcoming Trips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl font-bold mb-1">{stats.upcoming}</div>
              <p className="text-xs sm:text-sm text-purple-100">Adventures ahead</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/90 to-orange-700/90 border-orange-500 text-white backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-orange-100 text-xs sm:text-sm font-medium">Rewards Points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl font-bold mb-1">250</div>
              <p className="text-xs sm:text-sm text-orange-100">Available points</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-xl sm:text-2xl">
              <Briefcase className="h-6 w-6 text-orange-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-slate-300 text-sm sm:text-base">Choose an action below</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className={`${action.bgColor} border-0 hover:scale-105 hover:shadow-2xl transition-all cursor-pointer h-full`}>
                    <CardContent className="p-5 sm:p-6">
                      <action.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${action.iconColor} mb-3`} />
                      <h3 className="font-bold text-white mb-1 text-base sm:text-lg">{action.title}</h3>
                      <p className="text-xs sm:text-sm text-white/80">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Explore Amenities */}
        <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-white text-xl sm:text-2xl">Explore Our Amenities</CardTitle>
                <CardDescription className="text-slate-300 text-sm sm:text-base">Discover what we offer</CardDescription>
              </div>
              <Link href="/">
                <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {amenities.map((amenity, index) => (
                <Link key={index} href={amenity.href}>
                  <Card className={`bg-gradient-to-br ${amenity.bgColor} border-0 hover:scale-105 hover:shadow-2xl transition-all cursor-pointer overflow-hidden h-full`}>
                    <CardContent className="p-6 sm:p-8 text-center text-white">
                      <amenity.icon className="h-14 w-14 sm:h-16 sm:w-16 mx-auto mb-4 opacity-90" />
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">{amenity.title}</h3>
                      <p className="text-sm sm:text-base text-white/90">{amenity.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resort Information */}
        <Card className="bg-gradient-to-br from-teal-700/90 to-cyan-700/90 border-teal-600 backdrop-blur-sm shadow-xl" id="contact">
          <CardHeader>
            <CardTitle className="text-white text-xl sm:text-2xl">Resort Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
              <div className="flex items-start gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-teal-200 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2 text-base sm:text-lg">Location</h4>
                  <p className="text-xs sm:text-sm text-teal-100">Barangay Balatasan, Bulalacao</p>
                  <p className="text-xs sm:text-sm text-teal-100">Oriental Mindoro, Philippines</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-teal-200 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2 text-base sm:text-lg">Contact</h4>
                  <p className="text-xs sm:text-sm text-teal-100">+63 917 123 4567</p>
                  <p className="text-xs sm:text-sm text-teal-100">info@balatasan-resort.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm sm:col-span-2 lg:col-span-1">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-teal-200 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2 text-base sm:text-lg">Operating Hours</h4>
                  <p className="text-xs sm:text-sm text-teal-100">24/7 Reception</p>
                  <p className="text-xs sm:text-sm text-teal-100">Check-in: 2PM | Check-out: 12PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm py-4">
          <p>© 2025 Balatasan Beach Resort. All rights reserved.</p>
          <p className="text-xs mt-1">Bulalacao, Oriental Mindoro, Philippines</p>
        </div>
      </div>
    </div>
  );
}
