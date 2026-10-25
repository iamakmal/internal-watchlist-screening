import { GetTokensFromRefreshTokenCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "./cognito";

export async function refreshAccessToken(refreshToken: string) {
  const out = await cognito.send(
    new GetTokensFromRefreshTokenCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      RefreshToken: refreshToken,
    }),
  );

  const auth = out.AuthenticationResult;
  if (!auth?.AccessToken) {
    throw new Error("Failed to refresh access token");
  }

  return {
    accessToken: auth.AccessToken,
    expiresIn: auth.ExpiresIn ?? 900,
    refreshToken: auth.RefreshToken ?? null,
  };
}
