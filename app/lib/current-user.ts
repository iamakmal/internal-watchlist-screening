import "server-only";

import { cache } from "react";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "./cognito";
import { getAccessToken } from "./auth";
import { Role } from "@/types/auth";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export const getCurrentUser = cache(async () => {
  const token = await getAccessToken();

  if (!token) return null;

  try {
    const claims = await verifier.verify(token);

    const groups = claims["cognito:groups"] ?? [];

    const role:Role = groups.includes("admin") ? "ADMIN" : "ANALYST";

    const result = await cognito.send(
      new GetUserCommand({ AccessToken: token }),
    );

    const attributes = Object.fromEntries(
      (result.UserAttributes ?? [])
        .filter((attr) => attr.Name)
        .map((attr) => [attr.Name!, attr.Value ?? ""]),
    );

    return {
      id: claims.sub,
      username: result.Username ?? claims.username ?? "",
      email: attributes.email ?? "",
      name: attributes.name ?? "",
      role,
    };
  } catch {
    return null;
  }
});
