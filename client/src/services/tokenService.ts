import api from './api';
import type {
  SavedToken,
  GenerateAppTokenRequest,
  TokensResponse,
  TokenResponse,
} from '../types/index';

/**
 * Token Service
 * Handles all API calls related to token generation and management
 */
const tokenService = {
  /**
   * Get all saved tokens for the authenticated user
   */
  async getAllTokens(): Promise<SavedToken[]> {
    const response = await api.get<TokensResponse>('/tokens');
    return response.data.tokens;
  },

  /**
   * Get a single token by ID (with decrypted access token)
   */
  async getToken(id: string): Promise<SavedToken> {
    const response = await api.get<TokenResponse>(`/tokens/${id}`);
    return response.data.token;
  },

  /**
   * Generate an App Access Token
   */
  async generateAppToken(data: GenerateAppTokenRequest): Promise<SavedToken> {
    const response = await api.post<TokenResponse>('/tokens/app', data);
    return response.data.token;
  },

  /**
   * Delete a saved token
   */
  async deleteToken(id: string): Promise<void> {
    await api.delete(`/tokens/${id}`);
  },
};

export default tokenService;
