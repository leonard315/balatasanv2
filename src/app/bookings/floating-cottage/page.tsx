'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { createBooking, uploadPaymentProof } from '@/lib/bookings';
import { getCurrentUser } from '@/lib/auth';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';

const cottageTypes = [
  { 
    value: 'standard', 
    label: 'Standard', 
    price: 1500,
    description: 'Perfect for couples or small groups',
    image: 'cottage-view'
  },
  { 
    value: 'teenager-children', 
    label: 'Teenager/Children', 
    price: 2000,
    description: 'Ideal for families with kids',
    image: 'crystal-waters'
  },
  { 
    value: 'family', 
    label: 'Family', 
    price: 2500,
    description: 'Spacious cottage for the whole family',
    image: 'island-paradise'
  },
];

export default function FloatingCottageBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  function handleCottageTypeChange(value: string) {
    setSelectedType(value);
    const cottage = cottageTypes.find(c => c.value === value);
    setTotalAmount(cottage?.price || 0);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const user = getCurrentUser();
    if (!user) {
      setError('Please login to make a booking');
      setLoading(false);
      return;
    }

    // Validate payment proof for non-cash payments
    if (selectedPaymentMethod !== 'Cash' && !paymentProof) {
      setError('Please upload payment proof for ' + selectedPaymentMethod);
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);

    try {
      const bookingId = await createBooking({
        userId: user.uid,
        userName: formData.get('fullName') as string,
        userEmail: user.email || '',
        bookingType: 'cottage',
        itemName: cottageTypes.find(c => c.value === selectedType)?.label || '',
        bookingDate: new Date(formData.get('bookingDate') as string),
        participants: parseInt(formData.get('participants') as string),
        totalAmount: totalAmount,
        paymentMethod: selectedPaymentMethod,
        status: 'pending',
      });

      if (paymentProof) {
        await uploadPaymentProof(bookingId, paymentProof);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile?tab=bookings');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

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
      
      <div className="container mx-auto py-8 px-4 max-w-2xl relative">
      <Link
        href="/accommodations/floating-cottage"
        className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Floating Cottage
      </Link>

      <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-2xl text-white">Book Floating Cottage</CardTitle>
          <CardDescription className="text-slate-300">Reserve your floating paradise experience</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {success && (
            <Alert className="bg-green-900/50 border-green-700">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                Booking created successfully! Redirecting to your bookings...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-900/50 border-red-700">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-slate-200">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cottageType" className="text-slate-200">Cottage Type</Label>
              <Select name="cottageType" required onValueChange={handleCottageTypeChange}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select cottage type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {cottageTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                      {type.label} - ₱{type.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bookingDate" className="text-slate-200">Booking Date</Label>
              <Input 
                id="bookingDate" 
                name="bookingDate" 
                type="date" 
                className="bg-slate-900/50 border-slate-600 text-white"
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="participants" className="text-slate-200">Number of Participants (Max 8)</Label>
              <Input 
                id="participants" 
                name="participants" 
                type="number" 
                min="1" 
                max="8" 
                defaultValue="1" 
                className="bg-slate-900/50 border-slate-600 text-white"
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialRequests" className="text-slate-200">Special Requests (Optional)</Label>
              <Textarea 
                id="specialRequests" 
                name="specialRequests" 
                rows={3} 
                placeholder="Any special requests or requirements?" 
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            {totalAmount > 0 && (
              <div className="p-5 bg-blue-900/30 border border-blue-700 rounded-lg space-y-3">
                <div className="pt-2 border-t border-blue-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 font-semibold text-lg">Total Amount:</span>
                    <span className="text-3xl font-bold text-blue-400">₱{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod" className="text-slate-200 text-base font-semibold">Payment Method</Label>
              <Select name="paymentMethod" required onValueChange={(value) => setSelectedPaymentMethod(value)}>
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

            {/* Payment Instructions */}
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
              disabled={loading || !selectedType || !selectedPaymentMethod}
            >
              {loading ? 'Processing...' : 'Submit Booking Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Cottage Preview */}
      {selectedType && (() => {
        const cottage = cottageTypes.find(c => c.value === selectedType);
        const cottageImage = cottage ? placeholderImages.find(p => p.id === cottage.image) : null;
        return cottageImage ? (
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm mt-6">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-white">
                {cottage.label} Cottage
              </CardTitle>
              <CardDescription className="text-slate-300">
                {cottage.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative h-64 w-full rounded-lg overflow-hidden">
                <Image
                  src={cottageImage.imageUrl}
                  alt={cottage.label}
                  fill
                  className="object-cover"
                  data-ai-hint={cottageImage.imageHint}
                />
              </div>
            </CardContent>
          </Card>
        ) : null;
      })()}
      </div>
    </div>
  );
}
