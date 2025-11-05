'use client';
import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { useUserById, useAllBookings, useAllUsers } from '@/lib/data';
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
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Book, Users, CreditCard, BedDouble, ArrowRight } from 'lucide-react';
import type { Booking } from '@/lib/types';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartTooltipContent,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';

function AdminBookingsSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-4 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-1 h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-1 h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-20" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="ml-auto h-6 w-16" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const { data: bookingUser, isLoading } = useUserById(booking.userId);

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        </TableCell>
      </TableRow>
    );
  }

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

  return (
    <TableRow key={booking.id}>
      <TableCell>
        <div className="font-medium">
          {bookingUser?.firstName} {bookingUser?.lastName}
        </div>
        <div className="text-sm text-muted-foreground">
          {bookingUser?.email}
        </div>
      </TableCell>
      <TableCell>
        <p className="font-medium">{booking.item_name}</p>
        <p className="text-sm text-muted-foreground">
          Ref: {booking.booking_reference}
        </p>
      </TableCell>
      <TableCell>
        <div className="font-medium">
          {new Date(booking.check_in_date).toLocaleDateString()}
        </div>
        {booking.check_out_date && (
          <div className="text-sm text-muted-foreground">
            to {new Date(booking.check_out_date).toLocaleDateString()}
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
  );
}

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const { data: userProfile, isLoading: isProfileLoading } = useUserById(
    user?.uid || null
  );
  const { data: allBookings, isLoading: bookingsLoading } = useAllBookings();
  const { data: allUsers, isLoading: usersLoading } = useAllUsers();

  const isLoading =
    isUserLoading || isProfileLoading || bookingsLoading || usersLoading;
  const isAdmin = userProfile?.userType === 'admin';

  const stats = useMemo(() => {
    if (!allBookings || !allUsers) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        pendingBookings: 0,
        totalCustomers: 0,
      };
    }

    const totalRevenue = allBookings
      .filter((b) => b.booking_status === 'confirmed' || b.booking_status === 'completed')
      .reduce((acc, booking) => acc + booking.total_amount, 0);

    const pendingBookings = allBookings.filter(
      (b) => b.booking_status === 'pending'
    ).length;

    return {
      totalRevenue,
      totalBookings: allBookings.length,
      pendingBookings,
      totalCustomers: allUsers.length,
    };
  }, [allBookings, allUsers]);

  const bookingChartData = useMemo(() => {
    const data: { [key: string]: number } = {};
    if (!allBookings) return [];

    const now = new Date();
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toLocaleString('default', { month: 'short' });
      data[`${month} ${d.getFullYear()}`] = 0;
    }

    allBookings.forEach((booking) => {
      const date = new Date(booking.check_in_date);
      if (
        date >= new Date(now.getFullYear() - 1, now.getMonth(), 1)
      ) {
        const month = date.toLocaleString('default', { month: 'short' });
        const key = `${month} ${date.getFullYear()}`;
        if (key in data) {
          data[key]++;
        }
      }
    });

    return Object.entries(data).map(([name, total]) => ({ name, total }));
  }, [allBookings]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to view this page.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Admin Dashboard
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Welcome back, {userProfile.firstName}. Here's an overview of your resort.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-muted-foreground">₱</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on confirmed bookings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
             <p className="text-xs text-muted-foreground">
              Across all statuses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.pendingBookings}</div>
             <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
             <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="flex flex-col">
              <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>Manage accommodations, tours, and other site content.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <div className="flex flex-col space-y-4">
                    <Link href="/admin/accommodations" className="group">
                      <div className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted">
                          <div className="flex items-center gap-4">
                              <BedDouble className="h-6 w-6 text-primary" />
                              <p className="font-medium">Manage Accommodations</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                    {/* Add links for tours etc. here */}
                 </div>
              </CardContent>
          </Card>
           <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Bookings Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer
                config={{
                  total: {
                    label: 'Bookings',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-[250px] w-full"
              >
                <BarChart accessibilityLayer data={bookingChartData}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="total" fill="var(--color-total)" radius={8} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>


      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {bookingsLoading ? (
            <AdminBookingsSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBookings?.slice(0, 5).map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </TableBody>
            </Table>
          )}
            {allBookings?.length === 0 && !bookingsLoading && (
              <div className="py-16 text-center text-muted-foreground">
                There are no bookings yet.
              </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}

    