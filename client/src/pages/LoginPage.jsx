import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import PageTitle from '../utils/PageTitle';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await axiosClient.post('/auth/login', data);
      localStorage.setItem('auth_token', res.data.token);
      toast.success('Logged in successfully!', {id: 'login'});
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed', {id: 'login'});
    }
  };

  
  const googleAuthUrl = `/api/auth/google`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <PageTitle 
        title="Login" 
        description="Sign in to your SpendNest account to access your personal finance tracker and manage your expenses."
        keywords="login, sign in, authentication, expense tracker"
      />
      <div className="max-w-md w-full bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to your Expense Tracker account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              {...register('email', { required: true })}
              placeholder="user@example.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: true })}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
            />
          </div>

          <button type="submit" className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg text-sm">
            Sign In
          </button>
        </form>

        <div className="pt-2">
          <button
            onClick={() => { window.location.href = googleAuthUrl; }}
            type="button"
            className="w-full mt-2 py-2.5 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.35 11.1H12v2.8h5.35c-.23 1.4-1.09 2.6-2.33 3.4v2.82h3.77c2.2-2.02 3.51-5.03 3.51-8.73 0-.57-.05-1.12-.15-1.65z" fill="#4285F4"/><path d="M12 22c2.97 0 5.47-1 7.29-2.7l-3.77-2.82c-1.04.7-2.37 1.12-3.51 1.12-2.7 0-4.98-1.82-5.8-4.27H2.3v2.68C4.12 19.98 7.82 22 12 22z" fill="#34A853"/><path d="M6.2 13.53A7.01 7.01 0 0 1 6 12c0-.66.11-1.3.31-1.88V7.44H2.3A10 10 0 0 0 2 12c0 1.6.36 3.12 1 4.45l3.2-2.92z" fill="#FBBC05"/><path d="M12 6.4c1.62 0 3.07.56 4.21 1.66l3.16-3.16C17.46 2.9 14.97 2 12 2 7.82 2 4.12 4.02 2.3 7.44l3.2 2.68C7.02 8.22 9.3 6.4 12 6.4z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account? <Link to="/register" className="text-slate-900 dark:text-white font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
}