import React from 'react';
import { useForm } from 'react-hook-form';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function BudgetPage() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/budget', {
        amount: Number(data.amount),
        type: 'monthly',
        fromEffective: new Date(),
        toEffective: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      });
      toast.success('Budget threshold updated!');
    } catch (err) {
      toast.error('Failed to set budget');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Budget Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Set your spending threshold for the current month.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Monthly Limit ($)</label>
          <input
            type="number"
            {...register('amount', { required: true })}
            placeholder="e.g., 2000"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg text-sm"
        >
          Update Monthly Budget
        </button>
      </form>
    </div>
  );
}