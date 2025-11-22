'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, AlertCircle, Home, Waves, MapPin } from 'lucide-react';
import { cottageTypes, tours, watersports } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type BookingType = 'cottage' | 'tour' | 'watersport';

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingType, setBookingType] = useState<BookingType>('cottage');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [participants, setParticipants] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const type = searchParams.get('type') as BookingType;
    if (type && ['cottage', 'tour', 'watersport'].includes(type)) {
      setBookingType(type);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const getSelectedData = () => {
    if (bookingType === 'cottage') {
      return cottageTypes.find(c => c.id === selectedItem);
    } else if (bookingType === 'tour') {
      return tours.find(t => t.id === selectedItem);
    } else {
      return watersports.find(w => w.id === selectedItem);
    }
  };

  const selectedData = getSelectedData();
  const selectedImage = selectedData 
    ? placeholderImages.find(p => p.id === selectedData.image)
    : null;
  
  const calculateTotal = () => {
    if (!selectedData) return 0;
    if (bookingType === 'cottage') {
      return (selectedData as any).price;
    } else if (bookingType === 'tour') {
      return (selectedData as any).price * participants;
    } else {
      const ws = selectedData as any;
      return ws.basePrice + (Math.max(0, participants - ws.capacity) * ws.excessCharge);
    }
  };

  const totalAmount = calculateTotal();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!currentUser) {
      setError('You must be logged in to make a booking');
      setLoading(false);
      return;
    }

    // Validate payment proof for non-cash payments
    if (selectedPaymentMethod !== 'Cash' && !paymentProof) {
      setError('Please upload payment proof for ' + selectedPaymentMethod);
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      const fullName = formData.get('fullName') as string;
      const specialRequests = formData.get('specialRequests') as string;

      let bookingTypeName = '';
      if (bookingType === 'cottage') {
        bookingTypeName = `Floating Cottage - ${selectedData?.name}`;
      } else if (bookingType === 'tour') {
        bookingTypeName = selectedData?.name || 'Tour Package';
      } else {
        bookingTypeName = selectedData?.name || 'Water Activity';
      }

      const bookingData = {
        userId: currentUser.uid,
        userName: fullName,
        userEmail: currentUser.email,
        bookingType: bookingTypeName,
        bookingCategory: bookingType,
        itemId: selectedItem,
        activityDate: bookingDate,
        participants: participants,
        specialRequests: specialRequests || '',
        paymentMethod: selectedPaymentMethod,
        totalAmount: totalAmount,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('Creating booking with data:', bookingData);
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      console.log('Booking created successfully with ID:', docRef.id);

      // Upload payment proof if provided
      if (paymentProof) {
        const { uploadPaymentProof } = await import('@/lib/bookings');
        await uploadPaymentProof(docRef.id, paymentProof);
      }

      // Create notification for admin
      const { createNotification } = await import('@/lib/notifications');
      await createNotification({
        userId: 'admin',
        type: 'booking_created',
        title: 'New Booking Received',
        message: `${fullName} booked ${bookingTypeName} for ₱${totalAmount.toLocaleString()}`,
        bookingId: docRef.id,
        read: false,
      });

      setSuccess(true);
      setTimeout(() => router.push('/profile?tab=bookings'), 2000);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const getIcon = () => {
    if (bookingType === 'cottage') return Home;
    if (bookingType === 'tour') return MapPin;
    return Waves;
  };

  const Icon = getIcon();

  const getTitle = () => {
    if (bookingType === 'cottage') return 'Book Floating Cottage';
    if (bookingType === 'tour') return 'Book Tour Package';
    return 'Book Water Activity';
  };

  const getDescription = () => {
    if (bookingType === 'cottage') return 'Reserve your waterfront cottage';
    if (bookingType === 'tour') return 'Reserve your island adventure';
    return 'Reserve your water activity';
  };

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
      
      <div className="container mx-auto py-8 px-4 max-w-6xl relative">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Form */}
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-2xl flex items-center gap-2 text-white">
                <Icon className="h-6 w-6 text-blue-400" />
                {getTitle()}
              </CardTitle>
              <CardDescription className="text-slate-300">{getDescription()}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {success && (
                <Alert className="bg-green-900/50 border-green-700">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-200">Booking created successfully!</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert className="bg-red-900/50 border-red-700">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!searchParams.get('type') && (
                  <div className="space-y-2">
                    <Label htmlFor="bookingType" className="text-slate-200">Booking Type</Label>
                    <Select value={bookingType} onValueChange={(value: BookingType) => {
                      setBookingType(value);
                      setSelectedItem('');
                    }}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="cottage" className="text-white hover:bg-slate-700">Floating Cottage</SelectItem>
                        <SelectItem value="tour" className="text-white hover:bg-slate-700">Tour Package</SelectItem>
                        <SelectItem value="watersport" className="text-white hover:bg-slate-700">Water Activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-200">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item" className="text-slate-200">
                    Select {bookingType === 'cottage' ? 'Cottage' : bookingType === 'tour' ? 'Tour' : 'Activity'}
                  </Label>
                  <Select name="item" required onValueChange={setSelectedItem} value={selectedItem}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue placeholder={`Choose ${bookingType === 'cottage' ? 'a cottage' : bookingType === 'tour' ? 'a tour' : 'an activity'}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {bookingType === 'cottage' && cottageTypes.map((item) => (
                        <SelectItem key={item.id} value={item.id} className="text-white hover:bg-slate-700">
                          {item.name} - ₱{item.price.toLocaleString()}
                        </SelectItem>
                      ))}
                      {bookingType === 'tour' && tours.map((item) => (
                        <SelectItem key={item.id} value={item.id} className="text-white hover:bg-slate-700">
                          {item.name} - ₱{item.price.toLocaleString()} ({item.duration})
                        </SelectItem>
                      ))}
                      {bookingType === 'watersport' && watersports.map((item) => (
                        <SelectItem key={item.id} value={item.id} className="text-white hover:bg-slate-700">
                          {item.name} - ₱{item.basePrice.toLocaleString()} ({item.duration})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingDate" className="text-slate-200">Booking Date</Label>
                  <Input 
                    id="bookingDate" 
                    name="bookingDate" 
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participants" className="text-slate-200">
                    Number of {bookingType === 'cottage' ? 'Guests' : 'Participants'}
                  </Label>
                  <Input 
                    id="participants" 
                    name="participants" 
                    type="number" 
                    min="1" 
                    max="20"
                    value={participants}
                    onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests" className="text-slate-200">Special Requests (Optional)</Label>
                  <Textarea 
                    id="specialRequests" 
                    name="specialRequests" 
                    rows={3}
                    placeholder="Any special requirements?"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                {selectedData && (
                  <div className="p-5 bg-blue-900/30 border border-blue-700 rounded-lg space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">
                        {bookingType === 'cottage' ? 'Cottage type:' : bookingType === 'tour' ? 'Price per person:' : 'Base price:'}
                      </span>
                      <span className="text-slate-200 font-medium">
                        ₱{(selectedData as any).price?.toLocaleString() || (selectedData as any).basePrice?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">Number of {bookingType === 'cottage' ? 'guests' : 'participants'}:</span>
                      <span className="text-slate-200 font-medium">
                        {participants} {participants === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-blue-700/50">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-200 font-semibold text-lg">Total Amount:</span>
                        <span className="text-3xl font-bold text-blue-400">
                          ₱{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-slate-200 text-base font-semibold">Payment Method</Label>
                  <Select name="paymentMethod" required onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger className="bg-slate-900/70 border-slate-600 text-white h-12 hover:bg-slate-900 transition-colors">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="GCash" className="text-white hover:bg-slate-700 cursor-pointer">GCash</SelectItem>
                      <SelectItem value="PayMaya" className="text-white hover:bg-slate-700 cursor-pointer">PayMaya</SelectItem>
                      <SelectItem value="Bank Transfer" className="text-white hover:bg-slate-700 cursor-pointer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash" className="text-white hover:bg-slate-700 cursor-pointer">Cash on Arrival</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPaymentMethod && selectedPaymentMethod !== 'Cash' && (
                  <Alert className="bg-blue-900/30 border-blue-700">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <AlertDescription className="text-slate-200">
                      <div className="space-y-3">
                        <p className="font-semibold text-base">Payment Instructions:</p>
                        
                        {selectedPaymentMethod === 'GCash' && (
                          <div className="space-y-2">
                            <p className="text-sm">Send payment to:</p>
                            <div className="bg-slate-900/50 p-3 rounded-lg">
                              <p className="text-white font-mono text-lg">0917-123-4567</p>
                              <p className="text-slate-300 text-sm mt-1">Account Name: Balatasan Beach Resort</p>
                            </div>
                            <p className="text-sm text-slate-300">Amount to send: <span className="text-blue-400 font-bold">₱{totalAmount.toLocaleString()}</span></p>
                          </div>
                        )}
                        
                        {selectedPaymentMethod === 'PayMaya' && (
                          <div className="space-y-2">
                            <p className="text-sm">Send payment to:</p>
                            <div className="bg-slate-900/50 p-3 rounded-lg">
                              <p className="text-white font-mono text-lg">0918-765-4321</p>
                              <p className="text-slate-300 text-sm mt-1">Account Name: Balatasan Beach Resort</p>
                            </div>
                            <p className="text-sm text-slate-300">Amount to send: <span className="text-blue-400 font-bold">₱{totalAmount.toLocaleString()}</span></p>
                          </div>
                        )}
                        
                        {selectedPaymentMethod === 'Bank Transfer' && (
                          <div className="space-y-2">
                            <p className="text-sm">Transfer to:</p>
                            <div className="bg-slate-900/50 p-3 rounded-lg space-y-1">
                              <p className="text-white font-semibold">BDO Unibank</p>
                              <p className="text-white font-mono text-lg">0123-4567-8901</p>
                              <p className="text-slate-300 text-sm">Account Name: Balatasan Beach Resort</p>
                            </div>
                            <p className="text-sm text-slate-300">Amount to transfer: <span className="text-blue-400 font-bold">₱{totalAmount.toLocaleString()}</span></p>
                          </div>
                        )}
                        
                        <p className="text-xs text-yellow-300 mt-2">⚠️ Please upload your payment proof below after completing the transaction.</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="paymentProof" className="text-slate-200 text-base font-semibold">
                    Payment Proof {selectedPaymentMethod !== 'Cash' && <span className="text-red-400">*</span>}
                  </Label>
                  <div className="relative">
                    <Input 
                      id="paymentProof" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                      className="bg-slate-900/70 border-slate-600 text-slate-300 h-12 hover:bg-slate-900 transition-colors file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md file:mr-4 file:cursor-pointer file:hover:bg-blue-700 file:transition-colors cursor-pointer"
                      required={selectedPaymentMethod !== 'Cash'}
                    />
                    {paymentProof && (
                      <p className="text-xs text-green-400 mt-2">✓ File selected: {paymentProof.name}</p>
                    )}
                    {selectedPaymentMethod === 'Cash' && (
                      <p className="text-xs text-slate-400 mt-2">Payment proof not required for cash payment</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={loading || !selectedItem || !selectedPaymentMethod || !bookingDate}
                >
                  {loading ? 'Processing...' : 'Submit Booking Request'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <div className="space-y-4">
            {selectedData ? (
              <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-700">
                  <CardTitle className="text-white">{selectedData.name}</CardTitle>
                  <CardDescription className="text-slate-300">{selectedData.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedImage && (
                    <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
                      <Image
                        src={selectedImage.imageUrl}
                        alt={selectedData.name}
                        fill
                        className="object-cover"
                        data-ai-hint={selectedImage.imageHint}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3 text-sm">
                    {bookingType === 'tour' && (
                      <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-300">Duration:</span>
                        <span className="font-semibold text-white">{(selectedData as any).duration}</span>
                      </div>
                    )}
                    {bookingType === 'watersport' && (
                      <>
                        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-slate-300">Duration:</span>
                          <span className="font-semibold text-white">{(selectedData as any).duration}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-slate-300">Capacity:</span>
                          <span className="font-semibold text-white">{(selectedData as any).capacity} people</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-slate-300">
                        {bookingType === 'cottage' ? 'Price:' : bookingType === 'tour' ? 'Price per person:' : 'Base price:'}
                      </span>
                      <span className="font-bold text-blue-400 text-lg">
                        ₱{(selectedData as any).price?.toLocaleString() || (selectedData as any).basePrice?.toLocaleString()}
                      </span>
                    </div>
                    {participants > 1 && bookingType !== 'cottage' && (
                      <div className="flex justify-between items-center p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                        <span className="text-slate-200 font-medium">Total for {participants} people:</span>
                        <span className="font-bold text-blue-400 text-xl">₱{totalAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
                <CardContent className="pt-20 pb-20 text-center">
                  <Icon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">Select a {bookingType} to see details and preview</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
