export interface SignUpUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "guest" | "subscriber" | "admin";
  verified?: boolean;
  password?: string;
}

declare module "express-session" {
  interface SessionData {
    user: User;
    isLoggedIn: boolean;
    destroy(callback: (err: unknown) => void): void;
  }
}
