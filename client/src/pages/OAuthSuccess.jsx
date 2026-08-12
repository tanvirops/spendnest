import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      toast.success('Logged in with Google');
      navigate('/');
    } else {
      toast.error('OAuth failed: missing token');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-slate-600">Completing sign in...</div>
    </div>
  );
}
