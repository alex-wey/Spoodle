import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that allows all requests through without any authentication
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
