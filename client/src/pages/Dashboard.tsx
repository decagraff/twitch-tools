import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-twitch-dark">
      {/* Header */}
      <header className="bg-twitch-dark-light border-b border-twitch-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex items-center space-x-4">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
          </h1>
          <p className="text-gray-400">
            This is your dashboard. More features coming soon!
          </p>
        </div>

        {/* Stats Grid (Placeholder) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-twitch-dark-light border border-twitch-gray-dark rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Configs</h3>
              <span className="text-3xl">⚙️</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">0</p>
            <p className="text-sm text-gray-400">Twitch Configurations</p>
          </div>

          <div className="bg-twitch-dark-light border border-twitch-gray-dark rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tokens</h3>
              <span className="text-3xl">🔑</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">0</p>
            <p className="text-sm text-gray-400">Saved Tokens</p>
          </div>

          <div className="bg-twitch-dark-light border border-twitch-gray-dark rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Webhooks</h3>
              <span className="text-3xl">🪝</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">0</p>
            <p className="text-sm text-gray-400">Active Webhooks</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-twitch-dark-light border border-twitch-gray-dark rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="w-full py-4" disabled>
              Generate Token
            </Button>
            <Button className="w-full py-4" disabled>
              Manage Webhooks
            </Button>
            <Button className="w-full py-4" disabled>
              Add Configuration
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-4 text-center">
            Features coming in next phases...
          </p>
        </div>
      </main>
    </div>
  );
};
