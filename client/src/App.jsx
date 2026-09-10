// src/App.jsx
import React, { useState, useEffect } from 'react';
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
import OAuthSuccess from './pages/OAuthSuccess';
import SplashScreen from './components/SplashScreen';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    // Show splash screen on first load
    // Check if app was just installed or cache was cleared
    const hasSeenSplash = sessionStorage.getItem('splashShown');

    if (!hasSeenSplash) {
      // First time in this session - show splash
      const splashTimer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('splashShown', 'true');
      }, 2500); // Splash shows for 2.5 seconds

      return () => clearTimeout(splashTimer);
    } else {
      // Splash already shown in this session
      setShowSplash(false);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const handleOpenExpenseModal = () => setIsExpenseModalOpen(true);
  const handleCloseExpenseModal = () => setIsExpenseModalOpen(false);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '0.75rem',
            fontSize: '14px',
          },
        }}
      />

      <AddExpenseModal isOpen={isExpenseModalOpen} onRequestClose={handleCloseExpenseModal} />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/success" element={<OAuthSuccess />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
