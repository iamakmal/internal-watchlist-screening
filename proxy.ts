import { CognitoJwtVerifier } from "aws-jwt-verify";
import { NextRequest, NextResponse } from "next/server";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID!,
});

const protectedRoutes = ["/", "/single-screen", "/batch-screen", "/evaluate"];

const adminRoutes = ["/evaluate"];

const matches = (pathname: string, routes: string[]) =>
  routes.some(
    (route) =>
      pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!matches(pathname, protectedRoutes)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  let groups: string[] | null = null;

  if (token) {
    try {
      const claims = await verifier.verify(token);
      groups = (claims["cognito:groups"] ?? []) as string[];
    } catch {
      groups = null;
    }
  }

  if (!groups) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const res = NextResponse.redirect(loginUrl);
    if (token) res.cookies.delete("session");
    return res;
  }

  if (matches(pathname, adminRoutes) && !groups.includes("admin")) {
    return NextResponse.redirect(new URL("/single-screen", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/single-screen/:path*",
    "/batch-screen/:path*",
    "/evaluate/:path*",
  ],
};
