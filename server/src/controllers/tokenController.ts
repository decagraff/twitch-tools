import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';
import {
  generateAppAccessToken,
  validateToken,
  startDeviceFlow,
  pollDeviceToken,
} from '../services/twitchApiService';

/**
 * Get all saved tokens for the authenticated user
 */
export async function getAllTokens(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const tokens = await prisma.savedToken.findMany({
      where: { userId },
      include: {
        twitchConfig: {
          select: {
            id: true,
            clientId: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Don't send the actual access tokens to the frontend
    const sanitizedTokens = tokens.map((token) => ({
      id: token.id,
      tokenType: token.tokenType,
      scopes: token.scopes,
      channelLogin: token.channelLogin,
      channelId: token.channelId,
      name: token.name,
      expiresAt: token.expiresAt?.toISOString() || null,
      createdAt: token.createdAt.toISOString(),
      updatedAt: token.updatedAt.toISOString(),
      twitchConfig: token.twitchConfig,
    }));

    res.json({ tokens: sanitizedTokens });
  } catch (error) {
    console.error('Get all tokens error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve saved tokens',
    });
  }
}

/**
 * Get a single saved token by ID
 */
export async function getToken(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.userId;
    const { id } = req.params;

    const token = await prisma.savedToken.findUnique({
      where: { id },
      include: {
        twitchConfig: {
          select: {
            id: true,
            clientId: true,
            name: true,
          },
        },
      },
    });

    if (!token) {
      res.status(404).json({
        error: 'Not found',
        message: 'Token not found',
      });
      return;
    }

    // Ensure the token belongs to the authenticated user
    if (token.userId !== userId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this token',
      });
      return;
    }

    // Return the token WITH the decrypted access token (for copying)
    const responseToken = {
      id: token.id,
      tokenType: token.tokenType,
      accessToken: decrypt(token.accessToken),
      scopes: token.scopes,
      channelLogin: token.channelLogin,
      channelId: token.channelId,
      name: token.name,
      expiresAt: token.expiresAt?.toISOString() || null,
      createdAt: token.createdAt.toISOString(),
      updatedAt: token.updatedAt.toISOString(),
      twitchConfig: token.twitchConfig,
    };

    res.json({ token: responseToken });
  } catch (error) {
    console.error('Get token error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve token',
    });
  }
}

/**
 * Generate an App Access Token
 */
export async function generateAppToken(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.userId;
    const { twitchConfigId, name } = req.body;

    // Get the Twitch config
    const twitchConfig = await prisma.twitchConfig.findUnique({
      where: { id: twitchConfigId },
    });

    if (!twitchConfig) {
      res.status(404).json({
        error: 'Not found',
        message: 'Twitch configuration not found',
      });
      return;
    }

    // Ensure the config belongs to the authenticated user
    if (twitchConfig.userId !== userId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to use this configuration',
      });
      return;
    }

    // Decrypt the client secret
    const clientSecret = decrypt(twitchConfig.clientSecret);

    // Generate the app access token from Twitch
    const { accessToken, expiresIn } = await generateAppAccessToken(
      twitchConfig.clientId,
      clientSecret
    );

    // Calculate expiration date
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Encrypt and save the token
    const encryptedToken = encrypt(accessToken);

    const savedToken = await prisma.savedToken.create({
      data: {
        userId,
        twitchConfigId,
        tokenType: 'app',
        accessToken: encryptedToken,
        scopes: [], // App tokens have no scopes
        channelLogin: null,
        channelId: null,
        name: name || null,
        expiresAt,
      },
      include: {
        twitchConfig: {
          select: {
            id: true,
            clientId: true,
            name: true,
          },
        },
      },
    });

    // Return the token with decrypted access token
    const responseToken = {
      id: savedToken.id,
      tokenType: savedToken.tokenType,
      accessToken: accessToken, // Return unencrypted for immediate use
      scopes: savedToken.scopes,
      channelLogin: savedToken.channelLogin,
      channelId: savedToken.channelId,
      name: savedToken.name,
      expiresAt: savedToken.expiresAt?.toISOString() || null,
      createdAt: savedToken.createdAt.toISOString(),
      updatedAt: savedToken.updatedAt.toISOString(),
      twitchConfig: savedToken.twitchConfig,
    };

    res.status(201).json({
      message: 'App access token generated successfully',
      token: responseToken,
    });
  } catch (error: any) {
    console.error('Generate app token error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message || 'Failed to generate app access token',
    });
  }
}

/**
 * Delete a saved token
 */
export async function deleteToken(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if token exists and belongs to user
    const existingToken = await prisma.savedToken.findUnique({
      where: { id },
    });

    if (!existingToken) {
      res.status(404).json({
        error: 'Not found',
        message: 'Token not found',
      });
      return;
    }

    if (existingToken.userId !== userId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this token',
      });
      return;
    }

    // Delete the token
    await prisma.savedToken.delete({
      where: { id },
    });

    res.json({
      message: 'Token deleted successfully',
    });
  } catch (error) {
    console.error('Delete token error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete token',
    });
  }
}

/**
 * Start User Access Token device flow
 */
export async function startUserToken(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.userId;
    const { twitchConfigId, scopes } = req.body;

    // Get the Twitch config
    const twitchConfig = await prisma.twitchConfig.findUnique({
      where: { id: twitchConfigId },
    });

    if (!twitchConfig) {
      res.status(404).json({
        error: 'Not found',
        message: 'Twitch configuration not found',
      });
      return;
    }

    // Ensure the config belongs to the authenticated user
    if (twitchConfig.userId !== userId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to use this configuration',
      });
      return;
    }

    // Start the device flow
    const deviceFlowData = await startDeviceFlow(twitchConfig.clientId, scopes);

    res.json({
      deviceCode: deviceFlowData.deviceCode,
      userCode: deviceFlowData.userCode,
      verificationUri: deviceFlowData.verificationUri,
      expiresIn: deviceFlowData.expiresIn,
      interval: deviceFlowData.interval,
    });
  } catch (error: any) {
    console.error('Start user token error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message || 'Failed to start user token flow',
    });
  }
}

/**
 * Poll for User Access Token (complete device flow)
 */
export async function pollUserToken(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.userId;
    const { twitchConfigId, deviceCode, name } = req.body;

    // Get the Twitch config
    const twitchConfig = await prisma.twitchConfig.findUnique({
      where: { id: twitchConfigId },
    });

    if (!twitchConfig) {
      res.status(404).json({
        error: 'Not found',
        message: 'Twitch configuration not found',
      });
      return;
    }

    // Ensure the config belongs to the authenticated user
    if (twitchConfig.userId !== userId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to use this configuration',
      });
      return;
    }

    // Poll for the token
    const tokenData = await pollDeviceToken(twitchConfig.clientId, deviceCode);

    // If still pending, return pending status
    if (!tokenData) {
      res.json({ status: 'pending' });
      return;
    }

    // Token received! Validate it to get user info
    const validation = await validateToken(tokenData.accessToken);

    // Calculate expiration date
    const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000);

    // Encrypt and save the token
    const encryptedToken = encrypt(tokenData.accessToken);

    const savedToken = await prisma.savedToken.create({
      data: {
        userId,
        twitchConfigId,
        tokenType: 'user',
        accessToken: encryptedToken,
        scopes: tokenData.scopes,
        channelLogin: validation.login,
        channelId: validation.userId,
        name: name || null,
        expiresAt,
      },
      include: {
        twitchConfig: {
          select: {
            id: true,
            clientId: true,
            name: true,
          },
        },
      },
    });

    // Return the token with decrypted access token
    const responseToken = {
      id: savedToken.id,
      tokenType: savedToken.tokenType,
      accessToken: tokenData.accessToken, // Return unencrypted for immediate use
      scopes: savedToken.scopes,
      channelLogin: savedToken.channelLogin,
      channelId: savedToken.channelId,
      name: savedToken.name,
      expiresAt: savedToken.expiresAt?.toISOString() || null,
      createdAt: savedToken.createdAt.toISOString(),
      updatedAt: savedToken.updatedAt.toISOString(),
      twitchConfig: savedToken.twitchConfig,
    };

    res.status(201).json({
      status: 'success',
      message: 'User access token generated successfully',
      token: responseToken,
    });
  } catch (error: any) {
    console.error('Poll user token error:', error);

    // Handle specific device flow errors
    if (error.message === 'access_denied') {
      res.status(403).json({
        status: 'denied',
        error: 'Access denied',
        message: 'User denied the authorization request',
      });
      return;
    }

    if (error.message === 'expired_token') {
      res.status(400).json({
        status: 'expired',
        error: 'Token expired',
        message: 'The device code has expired. Please start over.',
      });
      return;
    }

    res.status(500).json({
      error: 'Server error',
      message: error.message || 'Failed to poll for user token',
    });
  }
}
