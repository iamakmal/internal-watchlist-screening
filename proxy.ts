import { CognitoJwtVerifier } from "aws-jwt-verify";
import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/app/lib/refresh";
import { ACCESS, REFRESH, accessOpts, refreshOpts } from "@/app/lib/cookies";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID!,
});

const protectedRoutes = [
  "/",
  "/single-screen",
  "/batch-screen",
  "/evaluate",
  "/api",
];

const adminRoutes = ["/evaluate"];

const authRoutes = [
  "/login",
  "/signup",
  "/confirm-signup",
  "/forgot-password",
  "/reset-password",
];

const REFRESH_BEFORE_SECONDS = 30;

const matches = (pathname: string, routes: string[]) =>
  routes.some(
    (route) =>
      pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  const token = request.cookies.get(ACCESS)?.value;
  const refreshToken = request.cookies.get(REFRESH)?.value;

  let claims: Awaited<ReturnType<typeof verifier.verify>> | null = null;

  if (token) {
    try {
      claims = await verifier.verify(token);
    } catch {
      claims = null;
    }
  }

  if (claims && matches(pathname, authRoutes)) {
    return NextResponse.redirect(new URL("/single-screen", request.url));
  }

  if (!matches(pathname, protectedRoutes)) return NextResponse.next();

  const isApi = pathname.startsWith("/api/");

  const nearExpiry =
    !!claims &&
    claims.exp - Math.floor(Date.now() / 1000) < REFRESH_BEFORE_SECONDS;

  let refreshed: Awaited<ReturnType<typeof refreshAccessToken>> | null = null;
  let refreshRejected = false;
  let refreshAttempted = false;

  if ((!claims || nearExpiry) && refreshToken) {
    refreshAttempted = true;
    try {
      const next = await refreshAccessToken(refreshToken);
      claims = await verifier.verify(next.accessToken);
      refreshed = next;
    } catch (e: unknown) {
      refreshRejected =
        e instanceof Error && e.name === "NotAuthorizedException";
    }
  }

  const withCookies = (res: NextResponse) => {
    if (refreshed) {
      res.cookies.set(
        ACCESS,
        refreshed.accessToken,
        accessOpts(refreshed.expiresIn),
      );
      if (refreshed.refreshToken) {
        res.cookies.set(REFRESH, refreshed.refreshToken, refreshOpts());
      }
    }
    return res;
  };

  if (!claims) {
    if (isApi && refreshAttempted && !refreshRejected) {
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 },
      );
    }

    const res = isApi
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : (() => {
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("next", pathname);
          return NextResponse.redirect(loginUrl);
        })();

    if (token) res.cookies.delete(ACCESS);
    if (refreshToken && (!refreshAttempted || refreshRejected))
      res.cookies.delete(REFRESH);
    return res;
  }

  if (refreshed) {
    request.cookies.set(ACCESS, refreshed.accessToken);
    if (refreshed.refreshToken)
      request.cookies.set(REFRESH, refreshed.refreshToken);
  }

  const groups = (claims["cognito:groups"] ?? []) as string[];
  if (matches(pathname, adminRoutes) && !groups.includes("admin")) {
    return withCookies(
      NextResponse.redirect(new URL("/single-screen", request.url)),
    );
  }

  return withCookies(
    NextResponse.next({ request: { headers: request.headers } }),
  );
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/confirm-signup",
    "/forgot-password",
    "/reset-password",
    "/single-screen/:path*",
    "/batch-screen/:path*",
    "/evaluate/:path*",
    "/api/:path*",
  ],
};
