// client/src/pages/Dashboard.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiPieChart, 
  FiPlus, 
  FiAlertTriangle, 
  FiArrowUpRight,
  FiLayers,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi';
import axiosClient from '../api/axiosClient';
import { CategoryBadge } from '../utils/categoryIcons';
import PageTitle from '../utils/PageTitle';
import { formatCurrency, formatDate } from '../utils/baseUtils';





export default function Dashboard({ onOpenAddExpenseModal }) {
  // Fetch Dashboard Analytics Summary
  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError, error: summaryError } = useQuery({
  queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/expenses/dashboard');
      return data?.data;
    },
    refetchInterval: 30000,
  });

  // Fetch Recent Expenses List
  const { data: recentExpenses, isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses', { limit: 5, sort: 'newest' }],
    queryFn: async () => {
      const { data } = await axiosClient.get('/expenses?limit=5&sort=newest');
      return data?.data || [];
    },
  });

  const summary = summaryData || {
    totalExpense: 0,
    monthlyExpense: 0,
    todayExpense: 0,
    totalExpensesCount: 0,
    budgetAmount: 0,
    remainingBudget: 0,
    budgetUsagePercent: 0,
    alertLevel: 'NORMAL',
    categoryBreakdown: []
  };

  const getAlertBadge = () => {
  const baseStyle = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border";
  
  if (summary.alertLevel === 'EXCEEDED') {
    return (
      <span className={`${baseStyle} bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900`}>
        <FiAlertTriangle className="w-3 h-3 shrink-0" /> Exceeded
      </span>
    );
  }
  if (summary.alertLevel === 'WARNING_90') {
    return (
      <span className={`${baseStyle} bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900`}>
        <FiAlertTriangle className="w-3 h-3 shrink-0" /> 90% Used
      </span>
    );
  }
  return (
    <span className={`${baseStyle} bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900`}>
      <FiCheckCircle className="w-3 h-3 shrink-0" /> On Track
    </span>
  );
};

  const getProgressBarColor = () => {
    if (summary.budgetUsagePercent >= 100) return 'bg-rose-500';
    if (summary.budgetUsagePercent >= 85) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (isSummaryError) {
    const errorMessage =
      summaryError?.response?.data?.message ||
      'Failed to load dashboard metrics. Please check your connection or backend API response.';

    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Dashboard" 
        description="Track your spending trends, monitor budget metrics, and manage your personal finances with SpendNest."
        keywords="dashboard, budget, spending, expenses, financial overview"
      />
      {/* Top Header & Add Expense Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor spending trends, track budget metrics, and review recent activity.
          </p>
        </div>
        <button
          onClick={onOpenAddExpenseModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-medium transition-all shadow-sm active:scale-[0.98]"
        >
          <FiPlus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Spending
            </span>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isSummaryLoading ? (
              <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(summary.totalExpense)}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lifetime recorded expenses</p>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Expense
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <FiCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isSummaryLoading ? (
              <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(summary.monthlyExpense)}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current calendar month</p>
          </div>
        </div>

        {/* Today's Expense */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Spending
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FiClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isSummaryLoading ? (
              <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(summary.todayExpense)}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Logged today</p>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Transactions
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <FiLayers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isSummaryLoading ? (
              <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {summary.totalExpensesCount}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total entries created</p>
          </div>
        </div>
      </div>

      {/* Analytics Section: Budget Progress & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Budget Card */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-900">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Monthly Budget Target
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target spending limit configured for this month
                </p>
              </div>
              {getAlertBadge()}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Allocated Budget</span>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
                  {summary.budgetAmount > 0 ? formatCurrency(summary.budgetAmount) : 'Not set'}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Spent so far</span>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(summary.monthlyExpense)}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Remaining</span>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(summary.remainingBudget)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Budget Utilization
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {summary.budgetUsagePercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressBarColor()}`}
                  style={{ width: `${Math.min(100, summary.budgetUsagePercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Calculated as: (Monthly Expense / Total Budget) × 100</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FiPieChart className="w-4 h-4 text-slate-500" /> Top Categories
            </h2>
            <span className="text-xs text-slate-400">This Month</span>
          </div>

          <div className="mt-4 space-y-4">
            {summary.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
              summary.categoryBreakdown.slice(0, 4).map((cat) => {
                const categoryPercent = summary.monthlyExpense > 0
                  ? Math.round((cat.total / summary.monthlyExpense) * 100)
                  : 0;

                return (
                  <div key={cat._id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <CategoryBadge category={cat._id} />
                      <div className="text-right">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatCurrency(cat.total)}
                        </span>
                        <span className="text-slate-400 ml-1.5">({categoryPercent}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-300"
                        style={{ width: `${categoryPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No categorical spending logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest expenses recorded
            </p>
          </div>
          <a
            href="/expenses"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <span>View All</span>
            <FiArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-900">
              <tr>
                <th className="px-6 py-3 font-semibold">Expense Name</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {isExpensesLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {expense.name}
                      {expense.notes && (
                        <p className="text-xs text-slate-400 font-normal truncate max-w-xs">{expense.notes}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <CategoryBadge category={expense.category} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-xs text-slate-400">
                    No transactions found. Click "Record Expense" to add your first transaction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-900">
          {isExpensesLoading ? (
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
            </div>
          ) : recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => (
              <div key={expense._id} className="p-4 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {expense.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={expense.category} />
                    <span className="text-[10px] text-slate-400">
                      {formatDate(expense.expenseDate)}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}