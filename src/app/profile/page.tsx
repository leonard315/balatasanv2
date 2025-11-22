'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Lock, Camera, Loader2, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface UserProfile {
  displayName: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Booking {
  id: string;
  bookingType: string;
  activityDate: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: any;
}

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Check URL parameter for tab
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'bookings', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserProfile({
          displayName: user.displayName || 'User',
          email: user.email || '',
          phone: user.phoneNumber || '',
          address: ''
        });
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    // Real-time listener for user profile
    const userDocRef = doc(db, 'users', userId);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserProfile({
          displayName: data.displayName || data.email?.split('@')[0] || 'User',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    });

    // Simple query without orderBy (works without index)
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', userId)
    );

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      console.log('Bookings snapshot received, count:', snapshot.docs.length);
      const bookingsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Booking data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          bookingType: data.bookingType || '',
          activityDate: data.activityDate?.toDate?.() || (data.activityDate ? new Date(data.activityDate) : new Date()),
          status: data.status || 'pending',
          paymentMethod: data.paymentMethod || '',
          totalAmount: data.totalAmount || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        } as Booking;
      });
      // Sort manually in JavaScript
      bookingsData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      console.log('Setting bookings:', bookingsData);
      setBookings(bookingsData);
    }, (error) => {
      console.error('Error fetching bookings:', error);
    });

    return () => {
      unsubscribeUser();
      unsubscribeBookings();
    };
  }, [userId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/avatars/user.png" />
                    <AvatarFallback className="text-2xl">
                      {userProfile ? getInitials(userProfile.displayName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{userProfile?.displayName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={userProfile?.displayName || ''}
                    disabled={!isEditing}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, displayName: e.target.value} : null)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile?.email || ''}
                    disabled={true}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userProfile?.phone || ''}
                    disabled={!isEditing}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={userProfile?.address || ''}
                    disabled={!isEditing}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={() => setIsEditing(false)}>
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>
                View and manage your reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {booking.bookingType}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Booking Date: {new Date(booking.activityDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm">
                        Payment: {booking.paymentMethod} - ₱{booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No bookings yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="currentPassword"
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Current Password
                </Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive booking confirmations and updates
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get text messages for important updates
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 max-w-4xl flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
