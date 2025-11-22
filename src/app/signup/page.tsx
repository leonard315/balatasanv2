'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Waves, User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms and Conditions');
      setLoading(false);
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4 py-8 sm:py-12">
      <Image
        src="https://i.ytimg.com/vi/GNAkv2CTl_8/maxresdefault.jpg"
        alt="Balatasan Beach Background"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-teal-900/90 to-slate-900/95 -z-10" />

      <div className="w-full max-w-2xl space-y-4 sm:space-y-6 relative">
        {/* Header Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 sm:p-3 rounded-full">
                <Waves className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              BALATASAN
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
              CREATE YOUR ACCOUNT AND START BOOKING YOUR DREAM VACATION
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Signup Form Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-600">CREATE ACCOUNT</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Account created successfully! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Personal Information Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">PERSONAL INFORMATION</span>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 font-medium text-xs sm:text-sm">
                    FULL NAME <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    className="h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 text-sm sm:text-base"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2 text-xs sm:text-sm">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                      EMAIL ADDRESS <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 text-sm sm:text-base"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center gap-2 text-xs sm:text-sm">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                      PHONE NUMBER
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="09171234567"
                      className="h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 text-sm sm:text-base"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500">FORMAT: 09171234567</p>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="address" className="text-gray-700 font-medium flex items-center gap-2 text-xs sm:text-sm">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    ADDRESS
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Complete address (for booking confirmation)"
                    className="border-2 border-gray-300 focus:border-blue-500 min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
                    rows={3}
                  />
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t">
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">SECURITY</span>
                </div>

                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium text-xs sm:text-sm">
                      PASSWORD <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 characters"
                        className="h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 pr-10 sm:pr-12 text-sm sm:text-base"
                        autoComplete="new-password"
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
                    <p className="text-[10px] sm:text-xs text-gray-500">AT LEAST 8 CHARACTERS</p>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-xs sm:text-sm">
                      CONFIRM PASSWORD <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className="h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 pr-10 sm:pr-12 text-sm sm:text-base"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-0.5 sm:mt-1"
                />
                <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-500 hover:text-blue-600 font-semibold">
                    TERMS AND CONDITIONS
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-500 hover:text-blue-600 font-semibold">
                    PRIVACY POLICY
                  </Link>{' '}
                  of Balatasan Beach Resort
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700 text-white font-semibold text-sm sm:text-lg"
                disabled={loading || success}
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE YOUR ACCOUNT'}
              </Button>

              <div className="text-center text-xs sm:text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-500 hover:text-blue-600 font-semibold">
                  LOGIN HERE
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center space-y-2 px-4 sm:px-6">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-600 text-[10px] sm:text-sm">
              <Waves className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="leading-tight">EXPERIENCE THE BEAUTY OF VERDE ISLAND PASSAGE</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-600 text-[10px] sm:text-sm">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="leading-tight break-all">NEED HELP? CONTACT US AT INFO@BALATASAN-RESORT.COM</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
