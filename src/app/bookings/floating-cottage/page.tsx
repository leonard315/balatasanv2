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

const cottageTypes = [
  { value: 'half-day', label: 'Half Day (4 hours)', price: 1500 },
  { value: 'whole-day', label: 'Whole Day (8 hours)', price: 2500 },
  { value: 'overnight', label: 'Overnight Stay', price: 3500 },
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
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-10" />
      
      <div className="container mx-auto py-8 px-4 max-w-2xl relative">
      <Link
        href="/accommodations/floating-cottage"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Floating Cottage
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Book Floating Cottage</CardTitle>
          <CardDescription>Reserve your floating paradise experience</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Booking created successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cottageType">Cottage Type</Label>
              <Select name="cottageType" required onValueChange={handleCottageTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cottage type" />
                </SelectTrigger>
                <SelectContent>
                  {cottageTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - ₱{type.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bookingDate">Booking Date</Label>
              <Input id="bookingDate" name="bookingDate" type="date" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="participants">Number of Participants (Max 8)</Label>
              <Input id="participants" name="participants" type="number" min="1" max="8" defaultValue="1" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea id="specialRequests" name="specialRequests" rows={3} placeholder="Any special requests or requirements?" />
            </div>

            {totalAmount > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select name="paymentMethod" required onValueChange={(value) => setSelectedPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GCash">GCash</SelectItem>
                  <SelectItem value="PayMaya">PayMaya</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash on Arrival</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Instructions */}
            {selectedPaymentMethod && selectedPaymentMethod !== 'Cash' && (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <AlertCircle className="h-4 w-4" />
                    Payment Instructions
                  </h4>
                  {selectedPaymentMethod === 'GCash' && (
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">Send payment to:</p>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                        <p className="text-lg font-bold text-blue-600">0917 123 4567</p>
                        <p className="text-xs text-muted-foreground">Account Name: Balatasan Resort</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        • Take a screenshot of your payment confirmation<br />
                        • Upload it below for faster approval
                      </p>
                    </div>
                  )}
                  {selectedPaymentMethod === 'PayMaya' && (
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">Send payment to:</p>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                        <p className="text-lg font-bold text-pink-600">0917 123 4567</p>
                        <p className="text-xs text-muted-foreground">Account Name: Balatasan Resort</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        • Take a screenshot of your payment confirmation<br />
                        • Upload it below for faster approval
                      </p>
                    </div>
                  )}
                  {selectedPaymentMethod === 'Bank Transfer' && (
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">Bank Details:</p>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border space-y-1">
                        <p><span className="text-muted-foreground">Bank:</span> <span className="font-semibold">BDO</span></p>
                        <p><span className="text-muted-foreground">Account Number:</span> <span className="font-bold">1234-5678-9012</span></p>
                        <p className="text-xs text-muted-foreground">Account Name: Balatasan Beach Resort</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        • Upload deposit slip or transfer confirmation below
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid gap-2">
              <Label htmlFor="paymentProof">
                Payment Proof (Screenshot/Photo)
                {selectedPaymentMethod !== 'Cash' && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="paymentProof"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                  required={selectedPaymentMethod !== 'Cash'}
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {paymentProof && (
                <p className="text-xs text-green-600">✓ File selected: {paymentProof.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {selectedPaymentMethod === 'Cash' 
                  ? 'Payment proof not required for cash payment'
                  : 'Upload proof of payment for faster approval (Required)'}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !selectedType || !selectedPaymentMethod}>
              {loading ? 'Creating Booking...' : 'Submit Booking'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
