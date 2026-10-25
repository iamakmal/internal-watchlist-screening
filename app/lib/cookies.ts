export const ACCESS = "session";
export const REFRESH = "refresh_token";
export const REFRESH_TTL = Number(
  process.env.REFRESH_TOKEN_TTL_SECONDS ?? 24 * 60 * 60,
);

const base = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const accessOpts = (maxAge = 900) => ({ ...base, maxAge });
export const refreshOpts = () => ({ ...base, maxAge: REFRESH_TTL });
