import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

const isValidRoute = createRouteMatcher([
  '/',
  '/home(.*)',
  '/patients(.*)',
  '/appointments(.*)',
  '/forms(.*)',
  '/messages(.*)',
  '/business(.*)',
  '/settings(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;
  
  if (!isValidRoute(req) && !pathname.startsWith('/_next')) {
    return NextResponse.redirect(new URL('/home', req.url));
  }
  
  if (!isPublicRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
  
  if (isPublicRoute(req) && userId) {
    if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
      return NextResponse.redirect(new URL('/home', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
