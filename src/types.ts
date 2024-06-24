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

export interface additionalInfo {
  origin_country: string;
  original_title: string;
  origin_country_certification: string;
  production_companies: string[];
  director: string;
}
