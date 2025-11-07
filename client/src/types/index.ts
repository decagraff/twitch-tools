export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  error: string;
  message: string;
  messages?: string[];
  stack?: string;
}

export interface TwitchConfig {
  id: string;
  clientId: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedToken {
  id: string;
  tokenType: 'user' | 'app';
  scopes: string[];
  channelId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Webhook {
  id: string;
  subscriptionId: string;
  type: string;
  callbackUrl: string;
  status: string;
  cost: number;
  createdAt: string;
}
