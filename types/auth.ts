export type Role = "ADMIN" | "ANALYST";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: Role;
};
