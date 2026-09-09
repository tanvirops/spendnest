import React, { useState } from 'react';
import { FiSearch, FiFilter, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useExpenses, useExpenseCategories } from '../hooks/useExpenses';
import { CategoryBadge } from '../utils/categoryIcons';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import PageTitle from '../utils/PageTitle';
import { formatCurrency, formatDate } from '../utils/baseUtils';

export default function ExpensesPage({ onOpenAddExpenseModal }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const timezoneOffset = -new Date().getTimezoneOffset();

  const queryClient = useQueryClient();
  const { data: expensesResult = { items: [], pagination: { page: 1, limit: 10, total: 0 } }, isLoading } = useExpenses({ search, category, sort, startDate, endDate, timezoneOffset, page, limit });
  const { data: categories = [] } = useExpenseCategories();
  const expenses = expensesResult.items || [];
  const pagination = expensesResult.pagination || { page: 1, limit: 10, total: 0 };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axiosClient.delete(`/expenses/${id}`);
      toast.success('Expense deleted successfully', {id: 'delete-expense'});
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['dashboard-summary']);
    } catch (err) {
      toast.error('Failed to delete expense', {id: 'delete-expense'});
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Expenses" 
        description="View, filter, and manage all your logged expenses with detailed insights on spending categories and amounts."
        keywords="expenses, spending, transaction history, expense tracking"
      />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
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
          {categories.map((categoryOption) => (
            <option key={categoryOption.value} value={categoryOption.value}>
              {categoryOption.label}
            </option>
          ))}
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

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          aria-label="Start date"
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          aria-label="End date"
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900"
        />
      </div>

      {/* Mobile list view */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="p-4 text-sm text-slate-500">Loading...</div>
        ) : expenses.length > 0 ? (
          expenses.map((exp) => (
            <div key={exp._id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{exp.name}</span>
                    <CategoryBadge category={exp.category} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatCurrency(exp.amount)}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(exp.expenseDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDelete(exp._id)} className="p-2 rounded-full text-rose-600 bg-rose-50 dark:bg-transparent">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-sm text-slate-500">No expenses recorded.</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-x-auto shadow-sm">
        <table className="min-w-[640px] w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 uppercase border-b border-slate-100 dark:border-slate-900">
            <tr>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Expense Date</th>
              <th className="px-6 py-3 font-semibold">Category</th>
              <th className="px-6 py-3 font-semibold">Amount</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-xs">Loading expenses...</td></tr>
            ) : expenses.length > 0 ? (
              expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{exp.name}</td>
                  <td className="px-6 py-4">{formatDate(exp.expenseDate)}</td>
                  <td className="px-6 py-4"><CategoryBadge category={exp.category} /></td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(exp._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-xs text-slate-400">No expenses recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-500">Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page <= 1} className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50">
            Prev
          </button>
          <button onClick={() => setPage((p) => p + 1)} disabled={pagination.page * pagination.limit >= pagination.total} className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}