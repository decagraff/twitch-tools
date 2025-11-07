import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  validateGenerateAppToken,
  validateDeleteToken,
  validateGetToken,
} from '../middleware/tokenValidators';
import {
  getAllTokens,
  getToken,
  generateAppToken,
  deleteToken,
} from '../controllers/tokenController';

const router = Router();

/**
 * All routes require authentication
 */

// GET /api/tokens - Get all saved tokens for authenticated user
router.get('/', authMiddleware, getAllTokens);

// GET /api/tokens/:id - Get a specific token (with decrypted access token)
router.get('/:id', authMiddleware, validateGetToken, getToken);

// POST /api/tokens/app - Generate an app access token
router.post('/app', authMiddleware, validateGenerateAppToken, generateAppToken);

// DELETE /api/tokens/:id - Delete a saved token
router.delete('/:id', authMiddleware, validateDeleteToken, deleteToken);

export default router;
