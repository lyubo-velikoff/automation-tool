'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from './button';
import { Icons } from './icons';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { session, loading, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center m-auto">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <Icons.logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Automation Tool
            </span>
          </Link>
          <Link className="mr-6 flex items-center space-x-2" href="/workflows">
            <span className="hidden sm:inline-block">
              Workflows
            </span>
          </Link>
          <Link className="mr-6 flex items-center space-x-2" href="/connections">
            <span className="hidden sm:inline-block">
              Connections
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add any additional header items here */}
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            {loading ? (
              <Button variant="ghost" size="sm" disabled>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            ) : session ? (
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={signIn}>
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 
