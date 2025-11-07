import { body, param } from 'express-validator';

/**
 * Validation for generating an app access token
 */
export const validateGenerateAppToken = [
  body('twitchConfigId')
    .trim()
    .notEmpty()
    .withMessage('Twitch Config ID is required')
    .isUUID()
    .withMessage('Invalid Twitch Config ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
];

/**
 * Validation for deleting a token
 */
export const validateDeleteToken = [
  param('id')
    .isUUID()
    .withMessage('Invalid token ID'),
];

/**
 * Validation for getting a single token
 */
export const validateGetToken = [
  param('id')
    .isUUID()
    .withMessage('Invalid token ID'),
];
