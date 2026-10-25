import { cognito } from "@/app/lib/cognito";
import { ACCESS, accessOpts, REFRESH, refreshOpts } from "@/app/lib/cookies";
import { loginSchema } from "@/app/lib/validation";
import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const parsedResult = loginSchema.safeParse(await request.json());
    if (!parsedResult.success) {
      return NextResponse.json(
        {
          error: parsedResult.error.issues[0]?.message ?? "Invalid credentials",
        },
        { status: 400 },
      );
    }

    const authResult = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.COGNITO_CLIENT_ID!,
        AuthParameters: {
          USERNAME: parsedResult.data.email,
          PASSWORD: parsedResult.data.password,
        },
      }),
    );

    const auth = authResult.AuthenticationResult;

    if (!auth?.AccessToken || !auth.RefreshToken) {
      return NextResponse.json(
        { error: "Additional authentication required" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      ACCESS,
      auth.AccessToken,
      accessOpts(auth.ExpiresIn ?? 900),
    );
    response.cookies.set(REFRESH, auth.RefreshToken, refreshOpts());

    return response;
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "";
    const errors: Record<string, { message: string; status: number }> = {
      NotAuthorizedException: {
        message: "Invalid email or password.",
        status: 401,
      },
      UserNotFoundException: {
        message: "Invalid email or password.",
        status: 401,
      },
      UserNotConfirmedException: {
        message: "Please confirm your email address before signing in.",
        status: 403,
      },
      PasswordResetRequiredException: {
        message: "You must reset your password before signing in.",
        status: 403,
      },
      TooManyRequestsException: {
        message: "Too many sign-in attempts. Please wait and try again.",
        status: 429,
      },
      LimitExceededException: {
        message: "Too many sign-in attempts. Please wait and try again.",
        status: 429,
      },
    };
    const mappedError = errors[errorName];

    return NextResponse.json(
      {
        error:
          mappedError?.message ??
          "Unable to sign in right now. Please try again.",
      },
      { status: mappedError?.status ?? 500 },
    );
  }
}
