import React, { useEffect } from 'react';
import { FiMail, FiLogOut, FiKey, FiUser } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageTitle from '../utils/PageTitle';
import { changePassword, updateProfile } from '../api/profile';
import { useProfile } from '../hooks/useProfile';
import { currencyOptions, findCurrency, findCurrencyIcon, profileTabOptions } from '../utils/baseUtils';


export default function ProfilePage() {
  const { user, refetch } = useProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'security' ? 'security' : 'profile';

  const profileForm = useForm({
    defaultValues: {
      name: user?.data?.name || '',
      currency: user?.data?.currency || 'BDT',
    },
  });

  const passwordForm = useForm();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = profileForm;

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = passwordForm;

  useEffect(() => {
    if (user?.data) {
      resetProfile({
        name: user.data.name || '',
        currency: user.data.currency || 'BDT',
      });
    }
  }, [user, resetProfile]);

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'profile' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const setActiveTab = (tab) => {
    setSearchParams({ tab }, { replace: true });
  };

  const onUpdateProfile = async (data) => {
    try {
      const response = await updateProfile({
        name: data.name,
        currency: data.currency,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_currency', response.data?.currency || data.currency);
      }

      toast.success('Profile updated successfully!');
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const onChangePassword = async (data) => {
    try {
      await changePassword(data);
      toast.success('Password updated successfully!');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_currency');
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageTitle 
        title="Profile" 
        description="Manage your account settings, personal information, and change your password on SpendNest."
        keywords="profile, account settings, user profile, password change"
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Account Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile details and security settings.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <div className="flex gap-2 border-b border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900 p-2">
          {profileTabOptions.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-6 p-4">
            <div className="bg-white dark:bg-slate-950 shadow-sm space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-900">
                <div className="w-14 h-14 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xl uppercase">
                  {user?.data?.name ? user.data.name[0] : <FiUser className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.data?.name || 'User'}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <FiMail className="w-3.5 h-3.5" /> {user?.data?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block mb-1">Account Role</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{user?.data?.role || 'User'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block mb-1">Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block mb-1">Account Verified</span>
                  <span className={`font-semibold ${user?.data?.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {user?.data?.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block mb-1">Currency</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {findCurrencyIcon(user?.data?.currency || 'BDT')} {" "}
                     {findCurrency(user?.data?.currency || 'BDT')?.label || 'Bangladeshi Taka'}
                  </span>
                </div>
              </div>
            </div>

            <div className=" border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">Profile Details</h3>

              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    {...registerProfile('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
                  />
                  {profileErrors.name && <p className="text-xs text-rose-500 mt-1">{profileErrors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Preferred Currency</label>
                  <select
                    {...registerProfile('currency', { required: 'Currency is required' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  {profileErrors.currency && <p className="text-xs text-rose-500 mt-1">{profileErrors.currency.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="py-2 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {isProfileSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="rounded-2xl  bg-white dark:bg-slate-950 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiKey className="w-4 h-4" /> Change Password
              </h3>

              <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
                  />
                  {passwordErrors.currentPassword && <p className="text-xs text-rose-500 mt-1">{passwordErrors.currentPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters required' },
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none"
                  />
                  {passwordErrors.newPassword && <p className="text-xs text-rose-500 mt-1">{passwordErrors.newPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
        >
          <FiLogOut className="w-4 h-4" /> Log Out from Account
        </button>
      </div>
    </div>
  );
}