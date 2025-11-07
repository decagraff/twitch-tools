import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-twitch-dark flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Logo />
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Manage Your Twitch
            <span className="text-twitch-purple"> Developer Tools</span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Generate OAuth tokens, manage EventSub webhooks, and streamline your Twitch
            development workflow — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3"
            >
              Get Started Free
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3"
            >
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-twitch-dark-light rounded-lg border border-twitch-gray-dark">
              <div className="text-twitch-purple text-4xl mb-4">🔑</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Token Manager
              </h3>
              <p className="text-gray-400">
                Generate User and App Access Tokens with custom scopes using OAuth Device Flow.
              </p>
            </div>

            <div className="p-6 bg-twitch-dark-light rounded-lg border border-twitch-gray-dark">
              <div className="text-twitch-purple text-4xl mb-4">🪝</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Webhook Manager
              </h3>
              <p className="text-gray-400">
                Create, list, and manage your Twitch EventSub webhook subscriptions effortlessly.
              </p>
            </div>

            <div className="p-6 bg-twitch-dark-light rounded-lg border border-twitch-gray-dark">
              <div className="text-twitch-purple text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Secure Storage
              </h3>
              <p className="text-gray-400">
                Your sensitive data is encrypted with AES-256-GCM and stored securely.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm">
        <p>Built for Twitch developers, by developers</p>
      </footer>
    </div>
  );
};
