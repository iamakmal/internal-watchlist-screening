import { NextRequest, NextResponse } from "next/server";
import { ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "@/app/lib/cognito";
import { forgotPasswordSchema } from "@/app/lib/validation";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = forgotPasswordSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 },
      );
    }

    await cognito.send(
      new ForgotPasswordCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: result.data.email,
      }),
    );
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "";
    const errors: Record<string, { message: string; status: number }> = {
      LimitExceededException: {
        message: "Too many requests. Please wait before requesting another code.",
        status: 429,
      },
      TooManyRequestsException: {
        message: "Too many requests. Please wait before requesting another code.",
        status: 429,
      },
      UserNotFoundException: {
        message: "If an eligible account exists, a reset code will be sent.",
        status: 200,
      },
      InvalidParameterException: {
        message: "If an eligible account exists, a reset code will be sent.",
        status: 200,
      },
    };
    const mappedError = errors[errorName];

    if (mappedError?.status === 200) {
      return NextResponse.json({ message: mappedError.message });
    }

    return NextResponse.json(
      {
        error:
          mappedError?.message ??
          "Unable to request a password reset. Please try again.",
      },
      { status: mappedError?.status ?? 500 },
    );
  }

  return NextResponse.json({
    message: "If the account is eligible, a password reset code will be sent.",
  });
}
