'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Waves, MapPin, Phone } from 'lucide-react';
import { signIn } from '@/lib/auth';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await signIn(email, password);
      
      // If there's a redirect URL, go there immediately
      if (redirectUrl) {
        router.replace(redirectUrl);
        return;
      }
      
      // Check if user is admin
      const { getUserProfile } = await import('@/lib/auth');
      const profile = await getUserProfile(user.uid);
      
      // Check for both 'admin' and 'Admin' (case-insensitive)
      if (profile?.role?.toLowerCase() === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <Image
        src="https://i.ytimg.com/vi/GNAkv2CTl_8/maxresdefault.jpg"
        alt="Balatasan Beach Background"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-teal-900/90 to-slate-900/95 -z-10" />

      <div className="w-full max-w-md space-y-6 relative">
        {/* Header Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-3 rounded-full">
                <Waves className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              BALATASAN
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium mt-2">
              PLEASE LOGIN TO YOUR ACCOUNT
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Login Form Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-blue-600">LOGIN</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Firebase: Error (auth/invalid-credential).</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600 font-medium">
                  * EMAIL ADDRESS
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-2 border-gray-300 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-600 font-medium flex items-center gap-2">
                  🔒 PASSWORD
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-2 border-gray-300 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  FORGOT PASSWORD?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg"
                disabled={loading}
              >
                {loading ? 'LOGGING IN...' : '🔓 LOGIN TO YOUR ACCOUNT'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-500 hover:text-blue-600 font-semibold">
                  REGISTER HERE
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="pt-6 pb-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
              <MapPin className="h-4 w-4" />
              <span>BARANGAY BALATASAN, BULALACAO, ORIENTAL MINDORO</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
              <Phone className="h-4 w-4" />
              <span>CONTACT: +63 917 123 4567</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
