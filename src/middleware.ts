import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES  = ['/login']
const PARENT_ROUTE   = '/parent'
const STUDENT_ROUTES = ['/dashboard', '/diagnostic', '/chat',
                        '/writing', '/vocabulary', '/achievements']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const rzanSession  = request.cookies.get('rzan_session')?.value
  const parentAuth   = request.cookies.get('parent_auth')?.value

  // مسارات عامة — لا حماية
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // API routes — لا حماية
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // الصفحة الرئيسية → dashboard أو login
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(rzanSession ? '/dashboard' : '/login', request.url)
    )
  }

  // لوحة الأب
  if (pathname.startsWith(PARENT_ROUTE)) {
    if (!parentAuth) {
      return NextResponse.redirect(new URL('/parent/login', request.url))
    }
    return NextResponse.next()
  }

  // صفحات الطالبة
  if (STUDENT_ROUTES.some(r => pathname.startsWith(r))) {
    if (!rzanSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
