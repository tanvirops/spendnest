import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

/**
 * Fetch expenses with search, category filtering, and sorting
 */
export function useExpenses(params = {}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const { data } = await axiosClient.get('/expenses', { params });
      // server returns { success, data: items, pagination }
      return {
        items: data?.data || [],
        pagination: data?.pagination || { page: 1, limit: 10, total: (data?.data || []).length }
      };
    },
    keepPreviousData: true,
  });
}

/**
 * Mutation hook to create a new expense entry
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newExpense) => {
      const { data } = await axiosClient.post('/expenses', newExpense);
      return data;
    },
    onSuccess: () => {
      toast.success('Expense added successfully!', {id: 'add-expense'});
      // Refetch expenses list & dashboard metrics automatically
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add expense', {id: 'add-expense'});
    },
  });
}

/**
 * Mutation hook to update an existing expense entry
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updatedData }) => {
      const { data } = await axiosClient.put(`/expenses/${id}`, updatedData);
      return data;
    },
    onSuccess: () => {
      toast.success('Expense updated successfully!', {id: 'update-expense'});
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update expense', {id: 'update-expense'});
    },
  });
}

/**
 * Mutation hook to delete an expense entry
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosClient.delete(`/expenses/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Expense deleted successfully!', {id: 'delete-expense'});
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete expense', {id: 'delete-expense'});
    },
  });
}