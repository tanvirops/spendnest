import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiDollarSign, 
  FiPieChart, 
  FiUser, 
  FiLogOut, 
  FiPlus 
} from 'react-icons/fi';

export default function AppLayout({ children, onOpenExpenseModal }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: FiGrid },
    { label: 'Expenses', path: '/expenses', icon: FiDollarSign },
    { label: 'Budget', path: '/budget', icon: FiPieChart },
    { label: 'Profile', path: '/profile', icon: FiUser },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 fixed h-full z-20 justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold">
              $
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">Expense Tracker</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-900">
          <button
            onClick={onOpenExpenseModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" /> Add Expense
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <FiLogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Personal Workspace</span>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-semibold text-xs">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-30 px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors ${
                isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={onOpenExpenseModal}
          className="p-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full shadow-lg"
        >
          <FiPlus className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
}