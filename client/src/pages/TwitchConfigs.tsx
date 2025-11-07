import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { useAuthStore } from '../store/authStore';
import twitchConfigService from '../services/twitchConfigService';
import type { TwitchConfig, CreateTwitchConfigRequest } from '../types/index';

export const TwitchConfigs: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [configs, setConfigs] = useState<TwitchConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TwitchConfig | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Load configs on mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const data = await twitchConfigService.getAllConfigs();
      setConfigs(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (config?: TwitchConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        name: config.name || '',
      });
    } else {
      setEditingConfig(null);
      setFormData({
        clientId: '',
        clientSecret: '',
        name: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingConfig(null);
    setFormData({
      clientId: '',
      clientSecret: '',
      name: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.clientSecret) {
      toast.error('Client ID and Client Secret are required');
      return;
    }

    try {
      setIsSubmitting(true);

      const requestData: CreateTwitchConfigRequest = {
        clientId: formData.clientId.trim(),
        clientSecret: formData.clientSecret.trim(),
        name: formData.name.trim() || undefined,
      };

      if (editingConfig) {
        // Update existing config
        await twitchConfigService.updateConfig(editingConfig.id, requestData);
        toast.success('Configuration updated successfully');
      } else {
        // Create new config
        await twitchConfigService.createConfig(requestData);
        toast.success('Configuration created successfully');
      }

      handleCloseModal();
      loadConfigs();
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to save configuration';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (config: TwitchConfig) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the configuration "${
          config.name || config.clientId
        }"?`
      )
    ) {
      return;
    }

    try {
      await twitchConfigService.deleteConfig(config.id);
      toast.success('Configuration deleted successfully');
      loadConfigs();
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to delete configuration';
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

  const maskSecret = (secret: string) => {
    if (secret.length <= 8) return '••••••••';
    return secret.substring(0, 4) + '••••••••' + secret.substring(secret.length - 4);
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
              <span className="text-gray-300">
                {user?.name || user?.email}
              </span>
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Twitch Configurations
            </h1>
            <p className="text-white/60">
              Manage your Twitch application credentials
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <span className="text-xl mr-2">+</span>
            Add Configuration
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-twitch-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : configs.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No configurations yet
            </h2>
            <p className="text-white/60 mb-6">
              Add your first Twitch application to get started
            </p>
            <Button onClick={() => handleOpenModal()}>Add Configuration</Button>
          </Card>
        ) : (
          /* Configs List */
          <div className="grid gap-4">
            {configs.map((config) => (
              <Card key={config.id} className="hover:border-twitch-purple/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">
                        {config.name || 'Unnamed Configuration'}
                      </h3>
                      <span className="px-2 py-1 bg-twitch-purple/20 text-twitch-purple text-xs rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Client ID:</span>
                        <code className="text-white bg-twitch-dark-light px-2 py-1 rounded">
                          {config.clientId}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Client Secret:</span>
                        <code className="text-white/40 bg-twitch-dark-light px-2 py-1 rounded">
                          {maskSecret(config.clientSecret)}
                        </code>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40 mt-3">
                        <span>Created: {formatDate(config.createdAt)}</span>
                        <span>Updated: {formatDate(config.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(config)}
                      className="px-4 py-2 bg-twitch-dark-light hover:bg-white/10 text-white rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(config)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingConfig ? 'Edit Configuration' : 'Add Configuration'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Name (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="My Twitch App"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Client ID *
                </label>
                <Input
                  type="text"
                  placeholder="your_client_id_here"
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-white/40 mt-1">
                  30-31 characters, lowercase letters and numbers only
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Client Secret *
                </label>
                <Input
                  type="password"
                  placeholder="your_client_secret_here"
                  value={formData.clientSecret}
                  onChange={(e) =>
                    setFormData({ ...formData, clientSecret: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-white/40 mt-1">
                  30 characters, lowercase letters and numbers only
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting
                    ? 'Saving...'
                    : editingConfig
                    ? 'Update Configuration'
                    : 'Create Configuration'}
                </Button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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
    </div>
  );
};
