import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMoreVertical, FiEdit3, FiTrash2, FiX } from 'react-icons/fi';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const buttonBaseClasses = 'inline-flex w-full sm:w-auto items-center justify-center rounded-lg text-sm font-semibold transition-opacity';
const primaryButtonClasses = `${buttonBaseClasses} sm:min-w-[140px] px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90`;
const secondaryButtonClasses = `${buttonBaseClasses} sm:min-w-[140px] px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:opacity-90`;

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
};

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const MobileDropdownPortal = ({ children, open }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(open ? children : null, document.body);
  };

  const openCreateBudgetModal = () => {
    reset({
      amount: '',
      fromEffective: formatDateInput(new Date()),
      toEffective: formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
      isActive: true,
    });
    setEditingBudgetId(null);
    setIsBudgetModalOpen(true);
  };

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      amount: '',
      fromEffective: formatDateInput(new Date()),
      toEffective: formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
      isActive: true,
    },
  });

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/budgets');
      return data?.data || [];
    },
    staleTime: 1000 * 60,
  });

  const createBudget = useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/budgets', payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Budget created successfully!', {id: 'create-budget'});
      queryClient.invalidateQueries(['budgets']);
      queryClient.invalidateQueries(['dashboard-summary']);
      reset();
      setEditingBudgetId(null);
      setIsBudgetModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create budget', {id: 'create-budget'});
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await axiosClient.put(`/budgets/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Budget updated successfully!', {id: 'update-budget'});
      queryClient.invalidateQueries(['budgets']);
      queryClient.invalidateQueries(['dashboard-summary']);
      reset();
      setEditingBudgetId(null);
      setIsBudgetModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update budget', {id: 'update-budget'});
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/budgets/${id}`);
    },
    onSuccess: () => {
      toast.success('Budget deleted successfully!', {id: 'delete-budget'});
      queryClient.invalidateQueries(['budgets']);
      queryClient.invalidateQueries(['dashboard-summary']);
      setEditingBudgetId(null);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete budget', {id: 'delete-budget'});
    },
  });

  useEffect(() => {
    if (!editingBudgetId) return;
    const budget = budgets.find((item) => item._id === editingBudgetId);
    if (budget) {
      setValue('amount', budget.amount);
      setValue('fromEffective', formatDateInput(budget.fromEffective));
      setValue('toEffective', formatDateInput(budget.toEffective));
      setValue('isActive', budget.isActive);
    }
  }, [editingBudgetId, budgets, setValue]);

  const onSubmit = async (data) => {
    const payload = {
      amount: Number(data.amount),
      type: 'monthly',
      fromEffective: data.fromEffective,
      toEffective: data.toEffective,
      isActive: data.isActive,
    };

    if (editingBudgetId) {
      await updateBudget.mutateAsync({ id: editingBudgetId, payload });
    } else {
      await createBudget.mutateAsync(payload);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudgetId(budget._id);
    setIsBudgetModalOpen(true);
    setDropdownOpenId(null);
  };

  const toggleDropdown = (budgetId) => {
    setDropdownOpenId((current) => (current === budgetId ? null : budgetId));
  };

  const closeDropdown = () => setDropdownOpenId(null);

  const closeModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudgetId(null);
    reset({
      amount: '',
      fromEffective: formatDateInput(new Date()),
      toEffective: formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
      isActive: true,
    });
  };

  const handleDelete = async (budget) => {
    if (budget.isActive) {
      toast.error('Cannot delete an active budget. Deactivate it first.' , {id: 'delete-budget'});
      return;
    }
    if (!window.confirm('Delete this budget?')) return;
    await deleteBudget.mutateAsync(budget._id);
    closeDropdown();
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Budget Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create, edit, and remove budget records. Only one active budget is allowed at a time.</p>
        </div>
        <button type="button" onClick={openCreateBudgetModal} className={primaryButtonClasses}>
          Add Budget
        </button>
      </div>

      <Modal
        isOpen={isBudgetModalOpen}
        onRequestClose={closeModal}
        overlayClassName="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        className="w-full max-w-2xl rounded-3xl bg-white p-4 sm:p-6 shadow-2xl outline-none dark:bg-slate-950"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{editingBudgetId ? 'Edit Budget' : 'Add Budget'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Update budget dates, amount, and active state.</p>
          </div>
          <button type="button" onClick={closeModal} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Monthly Budget ($)</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { required: 'Amount is required', min: 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">From Date</label>
              <input
                type="date"
                {...register('fromEffective', { required: 'Start date is required' })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">To Date</label>
              <input
                type="date"
                {...register('toEffective', { required: 'End date is required' })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                {...register('isActive')}
                id="modalIsActive"
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="modalIsActive" className="text-sm text-slate-600 dark:text-slate-400">Active budget</label>
            </div>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <button type="submit" className={primaryButtonClasses}>
              {editingBudgetId ? 'Update Budget' : 'Create Budget'}
            </button>
            <button type="button" onClick={closeModal} className={secondaryButtonClasses}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-visible">
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Budget History
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {isLoading ? (
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading budgets...</div>
          ) : budgets.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">No budgets found.</div>
          ) : (
            budgets.map((budget) => (
              <div key={budget._id} className="p-5 grid gap-4 md:grid-cols-[1fr_auto] items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">${budget.amount.toFixed(2)}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${budget.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {budget.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{budget.type} budget</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateInput(budget.fromEffective)} → {formatDateInput(budget.toEffective)}</p>
                  <div className="flex items-center justify-between mt-4 md:hidden w-full">
                    <button
                      type="button"
                      onClick={() => handleEdit(budget)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <FiEdit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(budget)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-rose-600 shadow-sm hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="relative flex justify-start md:justify-end">
                  <button
                    type="button"
                    onClick={() => toggleDropdown(budget._id)}
                    className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <FiMoreVertical className="h-5 w-5" />
                  </button>
                  {dropdownOpenId === budget._id && (
                    <>
                      <div className="hidden md:block absolute right-0 top-12 z-20 w-40 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                        <button
                          type="button"
                          onClick={() => handleEdit(budget)}
                          className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <FiEdit3 className="h-4 w-4" /> Edit
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(budget)}
                          className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <div className="flex items-center gap-2">
                            <FiTrash2 className="h-4 w-4" /> Delete
                          </div>
                        </button>
                      </div>
                      
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
