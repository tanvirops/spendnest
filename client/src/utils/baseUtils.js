const getPreferredCurrency = () => {
  if (typeof window === 'undefined') return 'BDT';
  return localStorage.getItem('user_currency') || 'BDT';
};

export const formatCurrency = (val, currency = getPreferredCurrency()) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(val) || 0);
};


export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};



export const currencyOptions = [
  { value: "BDT", icon: "৳", label: "BDT - Bangladeshi Taka" },
  { value: "USD", icon: "$", label: "USD - US Dollar" },
  { value: "EUR", icon: "€", label: "EUR - Euro" },
  { value: "GBP", icon: "£", label: "GBP - British Pound" },
  { value: "INR", icon: "₹", label: "INR - Indian Rupee" },
];
export const findCurrencyIcon = (currency) => {
  return currencyOptions.find((option) => option.value === currency)?.icon || null;
}
export const findCurrency = (currency) => {
  return currencyOptions.find((option) => option.value === currency) || null;
}



export const profileTabOptions = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
];
