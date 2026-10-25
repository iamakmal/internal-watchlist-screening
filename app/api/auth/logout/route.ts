import { cognito } from "@/app/lib/cognito";
import { ACCESS, accessOpts, REFRESH, refreshOpts } from "@/app/lib/cookies";
import { RevokeTokenCommand } from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const refreshToken = request.cookies.get(REFRESH)?.value;

  let revoked = !refreshToken;

  if (refreshToken) {
    try {
      await cognito.send(
        new RevokeTokenCommand({
          ClientId: process.env.COGNITO_CLIENT_ID!,
          Token: refreshToken,
        }),
      );
      revoked = true;
    } catch {
      revoked = false;
    }
  }

  const response = NextResponse.json({
    success: true,
    revoked,
  });

  response.cookies.set(ACCESS, "", { ...accessOpts(), maxAge: 0 });
  response.cookies.set(REFRESH, "", { ...refreshOpts(), maxAge: 0 });

  return response;
}
