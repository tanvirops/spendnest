import React from 'react';
import Modal from 'react-modal';
import { useForm, Controller } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import { FiX } from 'react-icons/fi';
import { useCreateExpense } from '../../hooks/useExpenses';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = [
  { value: 'Food', label: 'Food' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Education', label: 'Education' },
  { value: 'Bills', label: 'Bills' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Others', label: 'Others' },
];

export default function AddExpenseModal({ isOpen, onRequestClose }) {
  const createMutation = useCreateExpense();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    createMutation.mutate({
      name: data.name,
      amount: Number(data.amount),
      category: data.category.value,
      expenseDate: data.expenseDate || new Date().toISOString(),
      notes: data.notes || '',
    }, {
      onSuccess: () => {
        reset();
        onRequestClose();
        toast.success('Expense added successfully', {id: 'add-expense'});
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-w-md w-full bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 outline-none mx-4"
      overlayClassName="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Record Expense</h2>
        <button onClick={onRequestClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Expense Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            placeholder="e.g., Grocery Shopping"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Amount (৳)</label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { required: 'Amount is required', min: 0.01 })}
            placeholder="0.00"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
          {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <CreatableSelect
                {...field}
                options={DEFAULT_CATEGORIES}
                className="text-sm my-react-select-container"
                classNamePrefix="my-react-select"
                placeholder="Select or type custom..."
              />
            )}
          />
          {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date</label>
          <input
            type="datetime-local"
            {...register('expenseDate')}
            defaultValue={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notes (Optional)</label>
          <textarea
            {...register('notes')}
            rows="2"
            placeholder="Additional details..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={createMutation.isLoading}
          className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
        >
          {createMutation.isLoading ? 'Saving...' : 'Save Expense'}
        </button>
      </form>
    </Modal>
  );
}