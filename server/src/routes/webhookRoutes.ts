import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, param } from 'express-validator';
import {
  getAllWebhooks,
  createWebhook,
  deleteWebhook,
  getEventSubTypes,
} from '../controllers/webhookController';

const router = Router();

/**
 * All routes require authentication
 */

// GET /api/webhooks - Get all webhooks for authenticated user
router.get('/', authMiddleware, getAllWebhooks);

// GET /api/webhooks/types - Get available EventSub subscription types
router.get('/types', authMiddleware, getEventSubTypes);

// POST /api/webhooks - Create a new EventSub subscription
router.post(
  '/',
  authMiddleware,
  [
    body('tokenId').isUUID().withMessage('Token ID must be a valid UUID'),
    body('type').isString().notEmpty().withMessage('Type is required'),
    body('condition').isObject().withMessage('Condition must be an object'),
    body('callbackUrl').isURL().withMessage('Callback URL must be a valid URL'),
  ],
  createWebhook
);

// DELETE /api/webhooks/:id - Delete a webhook
router.delete(
  '/:id',
  authMiddleware,
  param('id').isUUID(),
  deleteWebhook
);

export default router;
