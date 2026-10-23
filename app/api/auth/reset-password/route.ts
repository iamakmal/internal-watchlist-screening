import { NextRequest, NextResponse } from "next/server";
import { ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "@/app/lib/cognito";
import { resetPasswordSchema } from "@/app/lib/validation";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = resetPasswordSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    await cognito.send(
      new ConfirmForgotPasswordCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: result.data.email,
        ConfirmationCode: result.data.code,
        Password: result.data.newPassword,
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "";
    const errors: Record<string, { message: string; status: number }> = {
      CodeMismatchException: {
        message: "The reset code is incorrect.",
        status: 400,
      },
      ExpiredCodeException: {
        message: "The reset code has expired. Request a new code.",
        status: 400,
      },
      InvalidPasswordException: {
        message: "This password does not meet the account password policy.",
        status: 400,
      },
      UserNotFoundException: {
        message: "Unable to reset the password for this account.",
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
          "Unable to reset your password. Please try again.",
      },
      { status: mappedError?.status ?? 500 },
    );
  }
}
