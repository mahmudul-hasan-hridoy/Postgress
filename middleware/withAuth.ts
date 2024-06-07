// middleware/withAuth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function withAuth(handler: any) {
  return async function (req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const requestWithAuth = req.clone();
    requestWithAuth.headers.set('Authorization', `Bearer ${token}`);

    return handler(requestWithAuth);
  };
}