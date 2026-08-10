// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Modal
import AppLayout from './layouts/AppLayout';
import AddExpenseModal from './components/modal/AddExpenseModal';

// Pages
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import BudgetPage from './pages/BudgetPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Auth Guard: টোকেন না থাকলে সরাসরি Login পেজে পাঠিয়ে দেবে
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleOpenExpenseModal = () => setIsExpenseModalOpen(true);
  const handleCloseExpenseModal = () => setIsExpenseModalOpen(false);

  return (
    <>
      {/* গ্লোবাল টোস্ট নোটিফিকেশন কনফিগারেশন */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '0.75rem',
            fontSize: '14px'
          } 
        }} 
      />

      {/* গ্লোবাল Expense যোগ করার পপআপ মোডাল */}
      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onRequestClose={handleCloseExpenseModal} 
      />

      <Routes>
        {/* পাবলিক পেজ (Authentication) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* প্রোটেক্টেড অ্যাপ্লিকেশনের পেজসমূহ (মেম্বারদের জন্য) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout onOpenExpenseModal={handleOpenExpenseModal}>
                <Dashboard onOpenAddExpenseModal={handleOpenExpenseModal} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <AppLayout onOpenExpenseModal={handleOpenExpenseModal}>
                <ExpensesPage onOpenAddExpenseModal={handleOpenExpenseModal} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <AppLayout onOpenExpenseModal={handleOpenExpenseModal}>
                <BudgetPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout onOpenExpenseModal={handleOpenExpenseModal}>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ভুল ইউআরএল দিলে ড্যাশবোর্ডে রিডাইরেক্ট করবে */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}