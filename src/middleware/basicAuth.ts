import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from 'next/server';
import { MiddlewareFactory } from './types';

export const basicAuth: MiddlewareFactory = (next: NextMiddleware) => {
  return async (req: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = req.nextUrl;
    const staticAsset =
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/public');

    if (process.env.NEXT_ENABLE_BASIC_AUTH === 'true') {
      // Bypass authentication for the /heartbeat route
      if (pathname === '/heartbeat' || staticAsset) {
        return NextResponse.next(); // Allow the request to proceed without authentication
      }
      const basicAuthHeader = req.headers.get('authorization');

      // Default credentials, replace with environment variables on the server
      const un = process.env.BASIC_AUTH_UN ?? 'abc';
      const pw = process.env.BASIC_AUTH_PW ?? 'xyz';

      if (basicAuthHeader) {
        const authValue = basicAuthHeader.split(' ')[1];
        const [user, pwd] = Buffer.from(authValue, 'base64')
          .toString('ascii')
          .split(':');

        if (user === un && pwd === pw) {
          return NextResponse.next(); // Allow the request to proceed
        } else {
          console.log('Wrong basic auth credentials, prompting again');
        }
      }

      // Redirect to the authentication required response
      const url = req.nextUrl.clone();
      url.pathname = '/api/authentication';
      return NextResponse.rewrite(url);
    }

    return next(req, _next); // Proceed without authentication if not enabled
  };
};
