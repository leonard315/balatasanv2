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
import { AlertCircle, Waves, MapPin, Phone, Eye, EyeOff } from 'lucide-react';
import { signIn } from '@/lib/auth';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Clear error when user starts typing
  function handleEmailChange(value: string) {
    setEmail(value);
    if (error) setError('');
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (error) setError('');
  }

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
      console.log('User signed in:', user.uid);
      
      // If there's a redirect URL, go there immediately
      if (redirectUrl) {
        console.log('Redirecting to:', redirectUrl);
        router.replace(redirectUrl);
        return;
      }
      
      // Check if user is admin
      const { getUserProfile } = await import('@/lib/auth');
      const profile = await getUserProfile(user.uid);
      console.log('User profile loaded:', profile);
      
      // Check for both 'admin' and 'Admin' (case-insensitive)
      if (profile?.role?.toLowerCase() === 'admin') {
        console.log('Admin detected, redirecting to admin dashboard');
        router.replace('/admin/dashboard');
      } else {
        console.log('Regular user, redirecting to user dashboard');
        router.replace('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4">
      <Image
        src="https://i.ytimg.com/vi/GNAkv2CTl_8/maxresdefault.jpg"
        alt="Balatasan Beach Background"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-teal-900/90 to-slate-900/95 -z-10" />

      <div className="w-full max-w-md space-y-4 sm:space-y-6 relative">
        {/* Header Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 sm:p-3 rounded-full">
                <Waves className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              BALATASAN
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
              PLEASE LOGIN TO YOUR ACCOUNT
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Login Form Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-600">LOGIN</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Firebase: Error (auth/invalid-credential).</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" autoComplete="off">
              {/* Honeypot fields to trick browser autocomplete */}
              <input type="text" name="fake-username" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete="off" />
              <input type="password" name="fake-password" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete="off" />
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-gray-600 font-medium text-xs sm:text-sm">
                  * EMAIL ADDRESS
                </Label>
                <Input
                  id="email"
                  name="email-field"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 text-sm sm:text-base"
                  autoComplete="new-password"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="password" className="text-gray-600 font-medium flex items-center gap-2 text-xs sm:text-sm">
                  🔒 PASSWORD
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password-field"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 pr-10 sm:pr-12 text-sm sm:text-base"
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  FORGOT PASSWORD?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-lg"
                disabled={loading}
              >
                {loading ? 'LOGGING IN...' : 'LOGGING IN'}
              </Button>

              <div className="text-center text-xs sm:text-sm text-gray-600">
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
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-600 text-[10px] sm:text-sm px-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="leading-tight">BARANGAY BALATASAN, BULALACAO, ORIENTAL MINDORO</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-600 text-[10px] sm:text-sm">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
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
