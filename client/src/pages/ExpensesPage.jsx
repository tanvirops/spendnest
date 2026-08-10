import React, { useState } from 'react';
import { FiSearch, FiFilter, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useExpenses } from '../hooks/useExpenses';
import { CategoryBadge } from '../utils/categoryIcons';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function ExpensesPage({ onOpenAddExpenseModal }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  const queryClient = useQueryClient();
  const { data: expenses = [], isLoading } = useExpenses({ search, category, sort });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axiosClient.delete(`/expenses/${id}`);
      toast.success('Expense deleted successfully');
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['dashboard-summary']);
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all your logged expenses.</p>
        </div>
        <button
          onClick={onOpenAddExpenseModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-medium"
        >
          <FiPlus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expense name..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 focus:outline-none"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900"
        >
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Transport">Transport</option>
          <option value="Medicine">Medicine</option>
          <option value="Bills">Bills</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="highest">Sort: Highest Amount</option>
          <option value="lowest">Sort: Lowest Amount</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 uppercase border-b border-slate-100 dark:border-slate-900">
            <tr>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Category</th>
              <th className="px-6 py-3 font-semibold">Amount</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-xs">Loading expenses...</td></tr>
            ) : expenses.length > 0 ? (
              expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{exp.name}</td>
                  <td className="px-6 py-4"><CategoryBadge category={exp.category} /></td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">${exp.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(exp._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-xs text-slate-400">No expenses recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}