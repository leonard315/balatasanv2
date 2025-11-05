'use client';
import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { signup, type SignupState } from '@/app/actions';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  AuthError,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { createOrUpdateUser } from '@/lib/data';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      suppressHydrationWarning
    >
      {pending && <Loader2 className="mr-2 animate-spin" />}
      Create an account
    </Button>
  );
}

export default function SignupPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const initialState: SignupState = {
    message: null,
    errors: {},
    success: false,
  };
  const [state, dispatch] = useActionState(signup, initialState);

  useEffect(() => {
    async function handleSignup() {
      if (state.success && state.data && auth && firestore) {
        const { email, password, firstName, lastName } = state.data;
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;

          await updateProfile(user, { displayName: `${firstName} ${lastName}` });
          await createOrUpdateUser(user, { firstName, lastName });

          toast({
            title: 'Success!',
            description: 'Successfully Created',
          });

          setTimeout(() => {
            router.push('/login');
          }, 1000);
        } catch (e) {
          const error = e as AuthError;
          let message = 'An unknown error occurred.';
          if (error.code === 'auth/email-already-in-use') {
            message = 'This email address is already in use.';
          }
          toast({
            variant: 'destructive',
            title: 'Sign Up Failed',
            description: message,
          });
        }
      } else if (!state.success && state.message) {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: state.message,
        });
      }
    }
    handleSignup();
  }, [state, auth, firestore, toast, router]);

  const handleGoogleSignup = async () => {
    if (!auth || !firestore) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUser(result.user);

      toast({
        title: 'Success!',
        description: 'Account created successfully with Google!',
      });
      router.push('/bookings');
    } catch (error) {
      console.error('Google signup failed:', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-up Failed',
        description: 'Could not sign up with Google. Please try again.',
      });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Max"
                  required
                  suppressHydrationWarning
                />
                {state?.errors?.firstName && (
                  <p className="text-sm font-medium text-destructive">
                    {state.errors.firstName[0]}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Robinson"
                  required
                  suppressHydrationWarning
                />
                {state?.errors?.lastName && (
                  <p className="text-sm font-medium text-destructive">
                    {state.errors.lastName[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                suppressHydrationWarning
              />
              {state?.errors?.email && (
                <p className="text-sm font-medium text-destructive">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                suppressHydrationWarning
              />
              {state?.errors?.password && (
                <p className="text-sm font-medium text-destructive">
                  {state.errors.password[0]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                suppressHydrationWarning
              />
              {state?.errors?.confirmPassword && (
                <p className="text-sm font-medium text-destructive">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>
            <SubmitButton />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              suppressHydrationWarning
            >
              Sign up with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
