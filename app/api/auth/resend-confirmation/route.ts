import { ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";
import { cognito } from "@/app/lib/cognito";
import { resendConfirmationSchema } from "@/app/lib/validation";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = resendConfirmationSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    await cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: result.data.email,
      }),
    );

    return NextResponse.json({
      success: true,
      message:
        "If your email hasn't been verified yet, you'll receive a new confirmation code shortly.",
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "";
    const errors: Record<string, { message: string; status: number }> = {
      LimitExceededException: {
        message:
          "Too many requests. Please wait before requesting another code.",
        status: 429,
      },
      TooManyRequestsException: {
        message:
          "Too many requests. Please wait before requesting another code.",
        status: 429,
      },
      UserNotFoundException: {
        message: "Unable to resend the confirmation code for this account.",
        status: 400,
      },
      NotAuthorizedException: {
        message: "This account is already confirmed. You can sign in.",
        status: 400,
      },
      InvalidParameterException: {
        message: "This account cannot receive a confirmation code.",
        status: 400,
      },
    };
    const mappedError = errors[errorName];

    return NextResponse.json(
      {
        error:
          mappedError?.message ??
          "Unable to resend the confirmation code. Please try again.",
      },
      { status: mappedError?.status ?? 500 },
    );
  }
}
