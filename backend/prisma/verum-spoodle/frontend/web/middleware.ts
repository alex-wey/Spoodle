import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allow all requests to /verum without any authentication
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow /verum routes to pass through without any checks
  if (pathname.startsWith('/verum') || pathname === '/verum') {
    return NextResponse.next();
  }
  
  // For all other routes, also allow (since we're not using Clerk)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
