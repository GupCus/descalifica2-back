import Request from "express";

//requests de login y register
export interface LoginRequest {
  mail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  date_of_birth: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    user_type: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    user_type: string;
  };
}

// Información del JWT.
export interface jwtpayload {
  id: number;
  username: string;
  user_type: string;
  url_photo: string;
  iat?: number; // fecha de creación del token
  exp?: number; // fecha de expiración del token
}
