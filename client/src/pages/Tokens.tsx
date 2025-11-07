import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { useAuthStore } from '../store/authStore';
import tokenService from '../services/tokenService';
import twitchConfigService from '../services/twitchConfigService';
import type { SavedToken, TwitchConfig, GenerateAppTokenRequest } from '../types/index';

export const Tokens: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [tokens, setTokens] = useState<SavedToken[]>([]);
  const [configs, setConfigs] = useState<TwitchConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SavedToken | null>(null);
  const [formData, setFormData] = useState({
    twitchConfigId: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Load tokens and configs on mount
  useEffect(() => {
    loadTokens();
    loadConfigs();
  }, []);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      const data = await tokenService.getAllTokens();
      setTokens(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfigs = async () => {
    try {
      const data = await twitchConfigService.getAllConfigs();
      setConfigs(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load configurations');
    }
  };

  const handleOpenGenerateModal = () => {
    if (configs.length === 0) {
      toast.error('Please create a Twitch configuration first');
      navigate('/twitch-configs');
      return;
    }
    setFormData({
      twitchConfigId: configs[0]?.id || '',
      name: '',
    });
    setShowGenerateModal(true);
  };

  const handleCloseGenerateModal = () => {
    setShowGenerateModal(false);
    setFormData({
      twitchConfigId: '',
      name: '',
    });
  };

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.twitchConfigId) {
      toast.error('Please select a configuration');
      return;
    }

    try {
      setIsSubmitting(true);

      const requestData: GenerateAppTokenRequest = {
        twitchConfigId: formData.twitchConfigId,
        name: formData.name.trim() || undefined,
      };

      const newToken = await tokenService.generateAppToken(requestData);
      toast.success('App Access Token generated successfully!');
      handleCloseGenerateModal();
      loadTokens();

      // Show the token in a modal
      setSelectedToken(newToken);
      setShowTokenModal(true);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to generate token';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewToken = async (token: SavedToken) => {
    try {
      // Fetch the full token with decrypted access token
      const fullToken = await tokenService.getToken(token.id);
      setSelectedToken(fullToken);
      setShowTokenModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to retrieve token');
    }
  };

  const handleCopyToken = () => {
    if (selectedToken?.accessToken) {
      navigator.clipboard.writeText(selectedToken.accessToken);
      toast.success('Token copied to clipboard!');
    }
  };

  const handleDelete = async (token: SavedToken) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the token "${
          token.name || token.tokenType + ' token'
        }"?`
      )
    ) {
      return;
    }

    try {
      await tokenService.deleteToken(token.id);
      toast.success('Token deleted successfully');
      loadTokens();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete token';
      toast.error(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never';
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

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
                onClick={() => navigate('/twitch-configs')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Configurations
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
            <h1 className="text-3xl font-bold text-white mb-2">Token Manager</h1>
            <p className="text-white/60">Generate and manage your Twitch API tokens</p>
          </div>
          <Button onClick={handleOpenGenerateModal}>
            <span className="text-xl mr-2">+</span>
            Generate App Token
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-twitch-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tokens.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🔑</div>
            <h2 className="text-xl font-semibold text-white mb-2">No tokens yet</h2>
            <p className="text-white/60 mb-6">
              Generate your first App Access Token to get started
            </p>
            <Button onClick={handleOpenGenerateModal}>Generate App Token</Button>
          </Card>
        ) : (
          /* Tokens List */
          <div className="grid gap-4">
            {tokens.map((token) => (
              <Card
                key={token.id}
                className="hover:border-twitch-purple/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">
                        {token.name || `${token.tokenType.toUpperCase()} Token`}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          token.tokenType === 'app'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {token.tokenType.toUpperCase()}
                      </span>
                      {isExpired(token.expiresAt) && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Configuration:</span>
                        <span className="text-white">
                          {token.twitchConfig.name || token.twitchConfig.clientId}
                        </span>
                      </div>
                      {token.channelLogin && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white/60">Channel:</span>
                          <span className="text-white">{token.channelLogin}</span>
                        </div>
                      )}
                      {token.scopes.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white/60">Scopes:</span>
                          <div className="flex flex-wrap gap-1">
                            {token.scopes.map((scope) => (
                              <span
                                key={scope}
                                className="px-2 py-0.5 bg-twitch-dark-light text-white/80 text-xs rounded"
                              >
                                {scope}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-white/40 mt-3">
                        <span>Created: {formatDate(token.createdAt)}</span>
                        <span>
                          Expires: {getTimeRemaining(token.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewToken(token)}
                      className="px-4 py-2 bg-twitch-purple hover:bg-twitch-purple-dark text-white rounded-lg transition-colors"
                    >
                      View Token
                    </button>
                    <button
                      onClick={() => handleDelete(token)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Generate Token Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              Generate App Access Token
            </h2>
            <form onSubmit={handleGenerateToken} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Twitch Configuration *
                </label>
                <select
                  value={formData.twitchConfigId}
                  onChange={(e) =>
                    setFormData({ ...formData, twitchConfigId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-twitch-dark-light border border-twitch-gray-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-twitch-purple"
                >
                  {configs.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.name || config.clientId}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-white/40 mt-1">
                  Select which Twitch application to use
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Name (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="My App Token"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <p className="text-xs text-white/40 mt-1">
                  Give this token a memorable name
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  <strong>Note:</strong> App Access Tokens are used for
                  server-to-server requests and don't require user authorization.
                  They have no scopes and can't access user-specific data.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Generating...' : 'Generate Token'}
                </Button>
                <button
                  type="button"
                  onClick={handleCloseGenerateModal}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* View Token Modal */}
      {showTokenModal && selectedToken && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Access Token</h2>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Token
                </label>
                <div className="relative">
                  <code className="block w-full px-4 py-3 bg-twitch-dark border border-twitch-gray-dark text-white rounded-lg break-all text-sm font-mono">
                    {selectedToken.accessToken}
                  </code>
                  <Button
                    onClick={handleCopyToken}
                    className="absolute top-2 right-2"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Type
                  </label>
                  <p className="text-white">{selectedToken.tokenType.toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Expires
                  </label>
                  <p className="text-white">
                    {getTimeRemaining(selectedToken.expiresAt)}
                  </p>
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-400">
                  <strong>Security Warning:</strong> Keep this token secure and never
                  share it publicly. Anyone with this token can make API requests on
                  behalf of your application.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
