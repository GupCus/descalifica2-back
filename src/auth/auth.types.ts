import { Request } from "express";

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
  surname?: string;
  telegram_username?: string;
  telegram_code?: string;
  fav_driver?: string;
  fav_team?: string;
  fav_circuit?: string;
  bio?: string;
  avatar_url?: string;
}

export interface LoginResponse {
  token: string;
  must_change_password?: boolean;
  user: {
    id: number;
    username: string;
    user_type: string;
    must_change_password?: boolean;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    user_type: string;
    email?: string;
    mail?: string;
    token_version?: number;
    must_change_password?: boolean;
    auth_time?: number;
    iat?: number;
    exp?: number;
  };
}

// Información del JWT.
export interface jwtpayload {
  id: number;
  username: string;
  user_type: string;
  url_photo?: string;
  email?: string;
  mail?: string;
  token_version?: number;
  must_change_password?: boolean;
  auth_time?: number; // timestamp (segundos) de la última autenticación/reautenticación
  iat?: number; // fecha de creación del token
  exp?: number; // fecha de expiración del token
}
