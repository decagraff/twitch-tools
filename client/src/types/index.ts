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
  clientSecret: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTwitchConfigRequest {
  clientId: string;
  clientSecret: string;
  name?: string;
}

export interface UpdateTwitchConfigRequest {
  clientId?: string;
  clientSecret?: string;
  name?: string;
}

export interface TwitchConfigsResponse {
  configs: TwitchConfig[];
}

export interface TwitchConfigResponse {
  config: TwitchConfig;
  message?: string;
}

export interface SavedToken {
  id: string;
  tokenType: 'user' | 'app';
  accessToken?: string; // Only present when fetching a specific token
  scopes: string[];
  channelLogin: string | null;
  channelId: string | null;
  name: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  twitchConfig: {
    id: string;
    clientId: string;
    name: string | null;
  };
}

export interface GenerateAppTokenRequest {
  twitchConfigId: string;
  name?: string;
}

export interface TokensResponse {
  tokens: SavedToken[];
}

export interface TokenResponse {
  token: SavedToken;
  message?: string;
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
