import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Logo } from '../components/Logo';
import tokenService from '../services/tokenService';

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle errors from Twitch
        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'Authorization failed');
          toast.error(errorDescription || 'Authorization failed');
          setTimeout(() => navigate('/tokens'), 3000);
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authorization code or state');
          toast.error('Invalid authorization response');
          setTimeout(() => navigate('/tokens'), 3000);
          return;
        }

        // Get stored state and data from sessionStorage
        const storedState = sessionStorage.getItem('oauth_state');
        const storedData = sessionStorage.getItem('oauth_data');

        if (!storedState || !storedData) {
          setStatus('error');
          setMessage('Session expired. Please try again.');
          toast.error('Session expired');
          setTimeout(() => navigate('/tokens'), 3000);
          return;
        }

        // Verify state matches (CSRF protection)
        if (state !== storedState) {
          setStatus('error');
          setMessage('State mismatch. Possible CSRF attack.');
          toast.error('Security validation failed');
          setTimeout(() => navigate('/tokens'), 3000);
          return;
        }

        // Parse stored data
        const { twitchConfigId, name } = JSON.parse(storedData);

        // Exchange code for token
        const result = await tokenService.handleOAuthCallback({
          twitchConfigId,
          code,
          name: name || undefined,
        });

        // Clean up session storage
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_data');

        // Success
        setStatus('success');
        setMessage('Authorization successful! Redirecting...');
        toast.success('User access token generated successfully!');

        // Redirect to tokens page
        setTimeout(() => navigate('/tokens'), 2000);
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to complete authorization');
        toast.error(error.response?.data?.message || 'Failed to complete authorization');
        setTimeout(() => navigate('/tokens'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-twitch-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Logo />
        </div>

        <div className="bg-twitch-dark-light border border-twitch-gray-dark rounded-lg p-8">
          <div className="text-center">
            {status === 'processing' && (
              <>
                <div className="w-16 h-16 border-4 border-twitch-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Processing Authorization
                </h2>
                <p className="text-white/60">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Success!
                </h2>
                <p className="text-white/60">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Authorization Failed
                </h2>
                <p className="text-white/60 mb-4">{message}</p>
                <button
                  onClick={() => navigate('/tokens')}
                  className="px-6 py-2 bg-twitch-purple hover:bg-twitch-purple-dark text-white rounded-lg transition-colors"
                >
                  Return to Tokens
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
