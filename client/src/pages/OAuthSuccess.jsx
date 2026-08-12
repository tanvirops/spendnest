import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('OAuthSuccess - location.href', window.location.href);

    // 1) Try query string ?token=...
    const params = new URLSearchParams(window.location.search);
    let token = params.get('token');
    console.log('OAuthSuccess - token from query:', token);

    // 2) If not found, try hash fragment #token=... or #access_token=...
    if (!token && window.location.hash) {
      const hash = window.location.hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(hash);
      token = hashParams.get('token') || hashParams.get('access_token');
      console.log('OAuthSuccess - token from hash:', token);
    }

    // 3) If still not found, check pathname last segment (in case server redirected to /oauth/success/<token>)
    if (!token) {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && last.split('.').length >= 2) {
        token = last;
        console.log('OAuthSuccess - token from pathname segment:', token ? '[found]' : null);
      }
    }

    console.log('OAuthSuccess - final token value:', token);
    if (token) {
      localStorage.setItem('auth_token', token);
      toast.success('Logged in with Google');
      navigate('/');
    } else {
    //   toast.error('OAuth failed: missing token');
      // keep user on page for debugging instead of immediate redirect
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-slate-600">Completing sign in...</div>
    </div>
  );
}
