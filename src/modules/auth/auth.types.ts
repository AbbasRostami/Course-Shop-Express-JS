import { JwtPayload } from "jsonwebtoken";

// [AUTH] JWT token payload
export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

// [AUTH] Auth response structure
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}