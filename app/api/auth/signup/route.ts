import { NextRequest, NextResponse } from "next/server";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "@/app/lib/cognito";
import { signupRequestSchema } from "@/app/lib/validation";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = signupRequestSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    await cognito.send(
      new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: result.data.email,
        Password: result.data.password,
        UserAttributes: [
          { Name: "email", Value: result.data.email },
          { Name: "name", Value: result.data.name },
        ],
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Check your email for a confirmation code",
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "";
    const errors: Record<string, { message: string; status: number }> = {
      UsernameExistsException: {
        message: "An account with this email already exists.",
        status: 409,
      },
      InvalidPasswordException: {
        message: "This password does not meet the account password policy.",
        status: 400,
      },
      InvalidParameterException: {
        message: "Some account details are invalid. Please check your entries.",
        status: 400,
      },
      TooManyRequestsException: {
        message: "Too many attempts. Please wait and try again.",
        status: 429,
      },
      LimitExceededException: {
        message: "Too many attempts. Please wait and try again.",
        status: 429,
      },
    };
    const mappedError = errors[errorName];

    return NextResponse.json(
      {
        error:
          mappedError?.message ??
          "Unable to complete registration. Please try again.",
      },
      { status: mappedError?.status ?? 500 },
    );
  }
}
