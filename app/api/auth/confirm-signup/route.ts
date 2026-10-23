import { NextRequest, NextResponse } from "next/server";
import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "@/app/lib/cognito";
import { confirmSignupSchema } from "@/app/lib/validation";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = confirmSignupSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: result.data.email,
        ConfirmationCode: result.data.code,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "";
    console.log("Confirm signup error:", errorName, error);
    const errors: Record<string, { message: string; status: number }> = {
      CodeMismatchException: {
        message:
          "The confirmation code is incorrect. Please try again. \nIf you've already verified your email, you can sign in instead.",
        status: 400,
      },
      ExpiredCodeException: {
        message: "The confirmation code has expired. Request a new code.",
        status: 400,
      },
      NotAuthorizedException: {
        message:
          "This account cannot be confirmed with that code. \nIf you've already verified your email, you can sign in instead.",
        status: 400,
      },
      UserNotFoundException: {
        message: "No account was found for this email address.",
        status: 404,
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
          "Unable to confirm your account. Please try again.",
      },
      { status: mappedError?.status ?? 500 },
    );
  }
}
