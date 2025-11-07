import api from './api';
import type {
  SavedToken,
  GenerateAppTokenRequest,
  StartUserTokenRequest,
  DeviceFlowResponse,
  PollUserTokenRequest,
  PollUserTokenResponse,
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
   * Start User Access Token Device Flow
   */
  async startUserToken(data: StartUserTokenRequest): Promise<DeviceFlowResponse> {
    const response = await api.post<DeviceFlowResponse>('/tokens/user/start', data);
    return response.data;
  },

  /**
   * Poll for User Access Token completion
   */
  async pollUserToken(data: PollUserTokenRequest): Promise<PollUserTokenResponse> {
    const response = await api.post<PollUserTokenResponse>('/tokens/user/poll', data);
    return response.data;
  },

  /**
   * Delete a saved token
   */
  async deleteToken(id: string): Promise<void> {
    await api.delete(`/tokens/${id}`);
  },
};

export default tokenService;
