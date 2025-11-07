import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { useAuthStore } from '../store/authStore';
import webhookService from '../services/webhookService';
import tokenService from '../services/tokenService';
import type { Webhook, EventSubType, SavedToken } from '../types/index';

export const Webhooks: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [eventTypes, setEventTypes] = useState<EventSubType[]>([]);
  const [tokens, setTokens] = useState<SavedToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({
    tokenId: '',
    type: '',
    callbackUrl: 'https://example.com/webhook',
    broadcasterUserId: '',
    moderatorUserId: '',
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [webhooksData, typesData, tokensData] = await Promise.all([
        webhookService.getAllWebhooks(),
        webhookService.getEventSubTypes(),
        tokenService.getAllTokens(),
      ]);

      setWebhooks(webhooksData);
      setEventTypes(typesData);
      setTokens(tokensData.filter(t => t.tokenType === 'user'));

      if (tokensData.length > 0) {
        setFormData(prev => ({ ...prev, tokenId: tokensData[0].id }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    if (tokens.length === 0) {
      toast.error('You need at least one user token to create webhooks');
      navigate('/tokens');
      return;
    }
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedType = eventTypes.find(t => t.type === formData.type);
      if (!selectedType) {
        toast.error('Please select an event type');
        return;
      }

      const condition: Record<string, string> = {};

      // Build condition based on required fields
      if (selectedType.condition.broadcaster_user_id) {
        if (!formData.broadcasterUserId) {
          toast.error('Broadcaster User ID is required');
          return;
        }
        condition.broadcaster_user_id = formData.broadcasterUserId;
      }

      if (selectedType.condition.moderator_user_id) {
        if (!formData.moderatorUserId) {
          toast.error('Moderator User ID is required');
          return;
        }
        condition.moderator_user_id = formData.moderatorUserId;
      }

      if (selectedType.condition.to_broadcaster_user_id) {
        if (!formData.broadcasterUserId) {
          toast.error('To Broadcaster User ID is required');
          return;
        }
        condition.to_broadcaster_user_id = formData.broadcasterUserId;
      }

      await webhookService.createWebhook({
        tokenId: formData.tokenId,
        type: formData.type,
        condition,
        callbackUrl: formData.callbackUrl,
      });

      toast.success('EventSub subscription created successfully!');
      setShowCreateModal(false);
      setFormData({
        tokenId: tokens[0]?.id || '',
        type: '',
        callbackUrl: 'https://example.com/webhook',
        broadcasterUserId: '',
        moderatorUserId: '',
      });
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create webhook';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (webhook: Webhook) => {
    if (!window.confirm(`Are you sure you want to delete this webhook subscription?\n\nType: ${webhook.type}`)) {
      return;
    }

    try {
      await webhookService.deleteWebhook(webhook.id);
      toast.success('Webhook deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete webhook');
    }
  };

  const handleSync = async () => {
    if (tokens.length === 0) {
      toast.error('You need at least one user token to sync webhooks');
      return;
    }

    try {
      setIsSyncing(true);
      const result = await webhookService.syncWebhooks();

      let message = `Sync completed: ${result.total} total subscriptions found`;
      if (result.imported > 0) message += `, ${result.imported} imported`;
      if (result.updated > 0) message += `, ${result.updated} updated`;
      if (result.removed > 0) message += `, ${result.removed} removed`;

      toast.success(message, { duration: 5000 });
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to sync webhooks';
      toast.error(message, { duration: 5000 });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const selectedType = eventTypes.find(t => t.type === formData.type);

  return (
    <div className="min-h-screen bg-twitch-dark">
      {/* Header */}
      <header className="bg-twitch-dark-light border-b border-twitch-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => navigate('/tokens')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Tokens
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => navigate('/twitch-configs')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Configurations
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => navigate('/api-tester')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                API Tester
              </button>
              <span className="text-gray-600">|</span>
              <span className="text-gray-300">{user?.name || user?.email}</span>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">EventSub Webhooks</h1>
            <p className="text-white/60">
              Manage your Twitch EventSub subscriptions
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={isSyncing || tokens.length === 0}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isSyncing ? 'Syncing...' : 'Sync with Twitch'}
            </button>
            <Button onClick={handleOpenCreateModal}>
              <span className="text-xl mr-2">+</span>
              Create Subscription
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-twitch-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : webhooks.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                No EventSub subscriptions found
              </h3>
              <p className="text-white/60 mb-6">
                Create a new EventSub subscription or sync existing subscriptions from Twitch
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSync}
                  disabled={isSyncing || tokens.length === 0}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  <svg
                    className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {isSyncing ? 'Syncing...' : 'Sync with Twitch'}
                </button>
                <Button onClick={handleOpenCreateModal}>Create Subscription</Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{webhook.type}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        webhook.status === 'enabled'
                          ? 'bg-green-500/20 text-green-400'
                          : webhook.status === 'webhook_callback_verification_pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {webhook.status}
                      </span>
                      {webhook.cost > 0 && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          Cost: {webhook.cost}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/60">
                        <span className="font-medium">Subscription ID:</span> {webhook.subscriptionId}
                      </p>
                      <p className="text-sm text-white/60">
                        <span className="font-medium">Callback:</span> {webhook.callbackUrl}
                      </p>
                      <p className="text-xs text-white/40">
                        Created: {formatDate(webhook.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDelete(webhook)}
                    variant="secondary"
                    className="ml-4"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Create EventSub Subscription</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Token Selector */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Token
                </label>
                <select
                  value={formData.tokenId}
                  onChange={(e) => setFormData({ ...formData, tokenId: e.target.value })}
                  className="w-full px-4 py-2 bg-twitch-dark-light border border-twitch-gray-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-twitch-purple"
                  required
                >
                  {tokens.map((token) => (
                    <option key={token.id} value={token.id}>
                      {token.name || `Token - ${token.channelLogin}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-twitch-dark-light border border-twitch-gray-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-twitch-purple"
                  required
                >
                  <option value="">Select event type...</option>
                  {eventTypes.map((type) => (
                    <option key={type.type} value={type.type}>
                      {type.type} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Broadcaster User ID */}
              {selectedType && (selectedType.condition.broadcaster_user_id || selectedType.condition.to_broadcaster_user_id) && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Broadcaster User ID *
                  </label>
                  <input
                    type="text"
                    value={formData.broadcasterUserId}
                    onChange={(e) => setFormData({ ...formData, broadcasterUserId: e.target.value })}
                    placeholder="e.g., 12345678"
                    className="w-full px-4 py-2 bg-twitch-dark-light border border-twitch-gray-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-twitch-purple"
                    required
                  />
                  <p className="text-xs text-white/40 mt-1">
                    The Twitch user ID of the broadcaster
                  </p>
                </div>
              )}

              {/* Moderator User ID */}
              {selectedType && selectedType.condition.moderator_user_id === 'required' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Moderator User ID *
                  </label>
                  <input
                    type="text"
                    value={formData.moderatorUserId}
                    onChange={(e) => setFormData({ ...formData, moderatorUserId: e.target.value })}
                    placeholder="e.g., 87654321"
                    className="w-full px-4 py-2 bg-twitch-dark-light border border-twitch-gray-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-twitch-purple"
                    required
                  />
                  <p className="text-xs text-white/40 mt-1">
                    The Twitch user ID of the moderator
                  </p>
                </div>
              )}

              {/* Callback URL */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Callback URL
                </label>
                <input
                  type="url"
                  value={formData.callbackUrl}
                  onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
                  placeholder="https://example.com/webhook"
                  className="w-full px-4 py-2 bg-twitch-dark-light border border-twitch-gray-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-twitch-purple"
                  required
                />
                <p className="text-xs text-white/40 mt-1">
                  The URL where Twitch will send event notifications (must be HTTPS)
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-400">
                  <strong>Note:</strong> Your callback URL must be publicly accessible and able to respond to Twitch's verification challenge.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating...' : 'Create Subscription'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
