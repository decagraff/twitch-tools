import api from './api';
import type {
  Webhook,
  CreateWebhookRequest,
  EventSubType,
  WebhooksResponse,
  EventSubTypesResponse,
} from '../types/index';

/**
 * Webhook Service
 * Handles all API calls related to EventSub webhooks
 */
const webhookService = {
  /**
   * Get all webhooks for the authenticated user
   */
  async getAllWebhooks(): Promise<Webhook[]> {
    const response = await api.get<WebhooksResponse>('/webhooks');
    return response.data.webhooks;
  },

  /**
   * Get available EventSub subscription types
   */
  async getEventSubTypes(): Promise<EventSubType[]> {
    const response = await api.get<EventSubTypesResponse>('/webhooks/types');
    return response.data.types;
  },

  /**
   * Create a new EventSub subscription
   */
  async createWebhook(data: CreateWebhookRequest): Promise<Webhook> {
    const response = await api.post<{ webhook: Webhook }>('/webhooks', data);
    return response.data.webhook;
  },

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    await api.delete(`/webhooks/${id}`);
  },
};

export default webhookService;
