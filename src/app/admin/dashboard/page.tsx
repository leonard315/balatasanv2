'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Activity, DollarSign, Users, Calendar, TrendingUp, Star, ArrowRight } from 'lucide-react';
import NotificationBell from '@/components/shared/NotificationBell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({ totalBookings: 0, totalRevenue: 0, pendingCount: 0, approvedCount: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<any>({ totalFeedback: 0, averageRating: '0.0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const allBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRecentBookings(allBookings.slice(0, 5));
      
      // Calculate stats in real-time
      const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const pendingCount = allBookings.filter(b => b.status === 'pending').length;
      const approvedCount = allBookings.filter(b => b.status === 'approved' || b.status === 'confirmed').length;
      
      setStats({
        totalBookings: allBookings.length,
        totalRevenue,
        pendingCount,
        approvedCount
      });
      
      setLoading(false);
    }, (error) => {
      console.error('Error loading bookings:', error);
      setLoading(false);
    });

    // Real-time listener for feedback
    const feedbackQuery = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeFeedback = onSnapshot(feedbackQuery, (snapshot) => {
      const allFeedback = snapshot.docs.map(doc => doc.data());
      const totalFeedback = allFeedback.length;
      
      if (totalFeedback > 0) {
        const totalRating = allFeedback.reduce((sum, f) => sum + (f.overallRating || 0), 0);
        const averageRating = (totalRating / totalFeedback).toFixed(1);
        
        setFeedbackStats({
          totalFeedback,
          averageRating
        });
      }
    });

    return () => {
      unsubscribeBookings();
      unsubscribeFeedback();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Image
        src="https://i.ytimg.com/vi/GNAkv2CTl_8/maxresdefault.jpg"
        alt="Balatasan Beach Background"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95 -z-10" />

      <div className="container mx-auto p-6 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-300">Welcome back, Admin</p>
          </div>
          <div className="flex gap-2 items-center">
            <NotificationBell userId="admin" />
            <Link href="/admin/bookings">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Manage Bookings
              </Button>
            </Link>
            <Link href="/admin/feedback">
              <Button variant="outline" className="text-white border-white hover:bg-white/10">
                View Feedback
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/itinerary-planner">
            <Card className="bg-gradient-to-r from-pink-500 to-rose-600 border-0 hover:scale-105 transition-transform cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Itinerary Planner
                </CardTitle>
                <Calendar className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/90">Plan and organize guest itineraries</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/bookings">
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 border-0 hover:scale-105 transition-transform cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Manage Bookings
                </CardTitle>
                <Activity className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/90">Review, approve and manage bookings</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ₱{stats?.totalRevenue?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-slate-400">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                +{stats?.totalBookings || 0}
              </div>
              <p className="text-xs text-slate-400">
                {stats?.pendingCount || 0} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                +{stats?.approvedCount || 0}
              </div>
              <p className="text-xs text-slate-400">
                Confirmed bookings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Avg. Rating
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {feedbackStats?.averageRating || '0.0'}
              </div>
              <p className="text-xs text-slate-400">
                From {feedbackStats?.totalFeedback || 0} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions & Recent Signups */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Bookings */}
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Transactions</CardTitle>
                  <CardDescription className="text-slate-400">
                    Recent bookings from your users
                  </CardDescription>
                </div>
                <Link href="/admin/bookings">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    VIEW ALL
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">No bookings yet</p>
                ) : (
                  recentBookings.map((booking, index) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {booking.userName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{booking.userName}</p>
                          <p className="text-xs text-slate-400">{booking.userEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          ₱{booking.totalAmount?.toLocaleString()}
                        </p>
                        <Badge variant={booking.status === 'approved' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Signups */}
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Recent Signups</CardTitle>
              <CardDescription className="text-slate-400">
                Latest user registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.slice(0, 5).map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{booking.userName}</p>
                        <p className="text-xs text-slate-400">{booking.userEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        {booking.createdAt?.toDate ? format(booking.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/bookings">
                <Button variant="outline" className="w-full text-white border-slate-600 hover:bg-slate-700">
                  View Bookings
                </Button>
              </Link>
              <Link href="/admin/feedback">
                <Button variant="outline" className="w-full text-white border-slate-600 hover:bg-slate-700">
                  Customer Feedback
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full text-white border-slate-600 hover:bg-slate-700">
                  User Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full text-white border-slate-600 hover:bg-slate-700">
                  My Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
