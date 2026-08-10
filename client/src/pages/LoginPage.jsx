import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await axiosClient.post('/auth/login', data);
      localStorage.setItem('auth_token', res.data.token);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
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

        <p className="text-center text-xs text-slate-500">
          Don't have an account? <Link to="/register" className="text-slate-900 dark:text-white font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
}