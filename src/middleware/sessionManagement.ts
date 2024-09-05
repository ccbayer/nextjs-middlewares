import { getIronSession } from 'iron-session';
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from 'next/server';
import { MiddlewareFactory } from './types';
import { CookiePassWord, SessionCookieName } from '@/lib/constants';
import { CustomIronSession } from '@/lib/iron-session';

export const sessionManagement: MiddlewareFactory = (next: NextMiddleware) => {
  return async (req: NextRequest, _next: NextFetchEvent) => {
    const staticAsset =
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/public');

    if (staticAsset) {
      return next(req, _next);
    }

    const res = NextResponse.next();
    const session = (await getIronSession(req, res, {
      cookieName: SessionCookieName,
      password: process.env.SECRET_COOKIE_PASSWORD ?? CookiePassWord,
    })) as CustomIronSession;

    const isAuthenticated = !!session.password;
    // assumes that "login" is public and if the user is 
    if (!isAuthenticated && req.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (isAuthenticated && req.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return next(req, _next);
  };
};
