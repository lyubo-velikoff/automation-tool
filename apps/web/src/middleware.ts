import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public and protected routes
const publicRoutes = ['/', '/login'];
const protectedRoutes = ['/workflows', '/connections'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.includes(req.nextUrl.pathname);

  // If the user is on a public route and authenticated, redirect to workflows
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/workflows', req.url));
  }

  // If the user is on a protected route and not authenticated, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

// Configure which routes use this middleware
export const config = {
  matcher: ['/', '/login', '/workflows', '/connections'],
}; 
