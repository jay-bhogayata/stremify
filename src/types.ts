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
}
