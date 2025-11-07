import axios from 'axios';

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_API_URL = 'https://api.twitch.tv/helix';

/**
 * Generate an App Access Token using Client Credentials flow
 * @param clientId - Twitch application Client ID
 * @param clientSecret - Twitch application Client Secret
 * @returns Access token and expiration time
 */
export async function generateAppAccessToken(
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; expiresIn: number }> {
  try {
    const response = await axios.post(TWITCH_AUTH_URL, null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      },
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in, // seconds until expiration
    };
  } catch (error: any) {
    console.error('Twitch API error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to generate app access token'
    );
  }
}

/**
 * Validate a token with Twitch API
 * @param accessToken - Token to validate
 * @returns Token validation data
 */
export async function validateToken(accessToken: string): Promise<{
  clientId: string;
  login: string | null;
  scopes: string[];
  userId: string | null;
  expiresIn: number;
}> {
  try {
    const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });

    return {
      clientId: response.data.client_id,
      login: response.data.login || null,
      scopes: response.data.scopes || [],
      userId: response.data.user_id || null,
      expiresIn: response.data.expires_in,
    };
  } catch (error: any) {
    console.error('Token validation error:', error.response?.data || error.message);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Revoke a token
 * @param clientId - Twitch application Client ID
 * @param accessToken - Token to revoke
 */
export async function revokeToken(
  clientId: string,
  accessToken: string
): Promise<void> {
  try {
    await axios.post('https://id.twitch.tv/oauth2/revoke', null, {
      params: {
        client_id: clientId,
        token: accessToken,
      },
    });
  } catch (error: any) {
    console.error('Token revocation error:', error.response?.data || error.message);
    throw new Error('Failed to revoke token');
  }
}
