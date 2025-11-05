'use client';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Mountain } from 'lucide-react';
import { useUser } from '@/firebase';
import { useUserById } from '@/lib/data';
import { logout } from '@/app/actions';

export function Header() {
  const { user, isUserLoading } = useUser();
  const { data: userProfile } = useUserById(user?.uid || null);

  const isAdmin = userProfile?.userType === 'admin';

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              Balatasan Resort Hub
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/accommodations"
              className="transition-colors hover:text-primary"
            >
              Accommodations
            </Link>
            <Link
              href="/tours"
              className="transition-colors hover:text-primary"
            >
              Tours
            </Link>
            <Link
              href="/watersports"
              className="transition-colors hover:text-primary"
            >
              Water Sports
            </Link>
            {user && (
              <Link
                href="/bookings"
                className="transition-colors hover:text-primary"
              >
                My Bookings
              </Link>
            )}
             {isAdmin && (
              <Link
                href="/admin"
                className="font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Mountain className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline">
                  Balatasan Resort Hub
                </span>
              </Link>
              <div className="grid gap-2 py-6">
                <Link
                  href="/accommodations"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                >
                  Accommodations
                </Link>
                <Link
                  href="/tours"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                >
                  Tours
                </Link>
                <Link
                  href="/watersports"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                >
                  Water Sports
                </Link>
                 {user && (
                  <Link
                    href="/bookings"
                    className="flex w-full items-center py-2 text-lg font-semibold"
                  >
                    My Bookings
                  </Link>
                )}
                 {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex w-full items-center py-2 text-lg font-semibold text-primary"
                  >
                    Admin
                  </Link>
                )}
              </div>
              <div className="mt-auto flex flex-col gap-2">
                {!user ? (
                  <>
                    <Button asChild variant="ghost">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                ) : (
                   <form action={logout}>
                      <Button type="submit" variant="ghost" className="w-full justify-start">Logout</Button>
                   </form>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden">
              <Mountain className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline">
                Balatasan Resort Hub
              </span>
            </Link>
          </div>
          <div className="hidden items-center space-x-2 md:flex">
            {isUserLoading ? null : !user ? (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback>
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">My Bookings</Link>
                  </DropdownMenuItem>
                   {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <form action={logout} className="w-full">
                    <button type="submit" className="w-full">
                      <DropdownMenuItem className="w-full cursor-pointer">
                        Log out
                      </DropdownMenuItem>
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
