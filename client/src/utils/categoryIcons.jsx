import React from 'react';
import { 
  FiCoffee, 
  FiShoppingBag, 
  FiTruck, 
  FiActivity, 
  FiBook, 
  FiFileText, 
  FiTv, 
  FiCompass, 
  FiTag 
} from 'react-icons/fi';

const CATEGORY_MAP = {
  Food: {
    icon: FiCoffee,
    styles: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
  },
  Shopping: {
    icon: FiShoppingBag,
    styles: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
  },
  Transport: {
    icon: FiTruck,
    styles: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
  },
  Medicine: {
    icon: FiActivity,
    styles: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
  },
  Education: {
    icon: FiBook,
    styles: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
  },
  Bills: {
    icon: FiFileText,
    styles: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-900/50',
  },
  Entertainment: {
    icon: FiTv,
    styles: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50',
  },
  Travel: {
    icon: FiCompass,
    styles: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50',
  },
  Others: {
    icon: FiTag,
    styles: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
};

/**
 * Returns Category Icon Component
 */
export const getCategoryIcon = (category) => {
  const config = CATEGORY_MAP[category] || CATEGORY_MAP.Others;
  return config.icon;
};

/**
 * Reusable Badge Component for Expense Categories
 */
export function CategoryBadge({ category }) {
  const config = CATEGORY_MAP[category] || CATEGORY_MAP.Others;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.styles}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{category || 'Others'}</span>
    </span>
  );
}
