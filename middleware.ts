import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/', '/login'];

/**
 * Redirects users from non-public routes to the /login page
 */
export const middleware = (request: NextRequest) => {
  const parsedURL = new URL(request.url);

  if (publicRoutes.includes(parsedURL.pathname)) {
    return;
  }

  const session = cookies().get('session');

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
};

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
