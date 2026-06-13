/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Transaction, Goal } from '../types';
import { ShieldAlert, Key, LogOut, Check, RefreshCw, Landmark, Trash2 } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  transactions: Transaction[];
  goals: Goal[];
  onUpdateProfile: (updated: User) => void;
  onLogout: () => void;
}

const CURRENCIES = [
  { symbol: '₹', name: 'Indian Rupee (INR)' },
  { symbol: '$', name: 'US Dollar (USD)' },
  { symbol: '€', name: 'Euro (EUR)' },
  { symbol: '£', name: 'British Pound (GBP)' },
  { symbol: '¥', name: 'Japanese Yen (JPY)' },
];

export default function ProfileView({ user, transactions, goals, onUpdateProfile, onLogout }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState(user.currency);
  const [theme, setTheme] = useState(user.theme);

  // Dynamic statistics calculations
  const totalIncome = transactions.filter(t => t.type === 'credit').length;
  const totalExpenses = transactions.filter(t => t.type === 'debit').length;
  const activeGoalsCount = goals.length;

  // Password Changing state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Profile Save Message
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a valid name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    onUpdateProfile({
      ...user,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      currency,
      theme,
    });

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (!oldPassword) {
      setPassMessage({ text: 'Old password is required.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPassMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    // Mock successful update
    setPassMessage({ text: 'Secure password updated successfully!', type: 'success' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetDemoData = () => {
    if (confirm('Warning: Are you sure you want to reset your local database to initial seed data values? This will override your transactions and goals.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div id="profile-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">
          USER SETTINGS
        </span>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-52 tracking-tight">
          Manage Profile
        </h1>
      </div>

      {/* Profile Card Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-[circle_at_top_right] from-neutral-50/50 to-transparent dark:from-neutral-850/50 pointer-events-none" />
        
        {/* Avatar badge */}
        <div className="w-20 h-20 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center text-2xl font-black shadow-md shrink-0 select-none border border-neutral-900">
          {name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
        </div>

        {/* User Metadata */}
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {name || 'PocketLedger User'}
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            {email || 'no-email@pocketledger.app'}
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-400">
            <span>UID:</span>
            <span className="select-all">{user.id}</span>
          </div>
        </div>

        {/* Quick Statistics block */}
        <div className="w-full sm:w-auto grid grid-cols-3 gap-4 border-t sm:border-t-0 sm:border-l border-neutral-150 dark:border-neutral-850 pt-4 sm:pt-0 sm:pl-6 text-center select-none">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">Credits</span>
            <span className="block text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono">{totalIncome}</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">Debits</span>
            <span className="block text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono">{totalExpenses}</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">Goals</span>
            <span className="block text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono">{activeGoalsCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: General Settings */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 rounded-2xl shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-neutral-905 dark:text-neutral-100 flex items-center gap-2">
            General Information
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="p-name" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">
                Full Name
              </label>
              <input
                id="p-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="p-email" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <input
                id="p-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {/* Currency select */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2 font-mono">
                Preferred Currency Symbol
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Currency option selector">
                {CURRENCIES.map((curr) => {
                  const isSelected = currency === curr.symbol;
                  return (
                    <button
                      key={curr.symbol}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setCurrency(curr.symbol)}
                      className={`py-2 px-3 border rounded-xl text-center focus:outline-none focus-visible:ring-1 transition-all ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950 font-bold'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-850'
                      }`}
                      title={curr.name}
                    >
                      <span className="text-sm block">{curr.symbol}</span>
                      <span className="text-[10px] text-neutral-400 block truncate">{curr.symbol === '₹' ? 'INR' : curr.symbol === '$' ? 'USD' : curr.symbol === '€' ? 'EUR' : curr.symbol === '£' ? 'GBP' : 'JPY'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2 font-mono">
                Visual Theme Preference
              </label>
              <div className="flex gap-2" role="radiogroup" aria-label="Visual theme picker">
                <button
                  type="button"
                  role="radio"
                  aria-checked={theme === 'light'}
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2.5 px-4 border text-xs font-bold rounded-xl transition-all ${
                    theme === 'light'
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  Light Theme
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2.5 px-4 border text-xs font-bold rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  Dark Theme
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-between gap-4">
              {profileSaved && (
                <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile updated successfully!</span>
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 font-bold text-xs rounded-xl transition-all"
              >
                Save General Profile Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Mini Widgets */}
        <div className="space-y-6">
          
          {/* Change Password Panel */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-neutral-450" />
              <span>Change Password</span>
            </h2>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <div>
                <label htmlFor="p-old-pass" className="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1 font-mono">
                  Old Password
                </label>
                <input
                  id="p-old-pass"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label htmlFor="p-new-pass" className="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1 font-mono">
                  New Password
                </label>
                <input
                  id="p-new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label htmlFor="p-confirm-pass" className="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1 font-mono">
                  Confirm New Password
                </label>
                <input
                  id="p-confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              {passMessage && (
                <div className={`p-2 rounded text-[10px] font-mono leading-relaxed ${
                  passMessage.type === 'success' ? 'bg-neutral-100 border border-neutral-300 text-neutral-800' : 'bg-neutral-50 border border-neutral-200 text-neutral-600'
                }`}>
                  {passMessage.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-neutral-900 border border-neutral-900 text-white dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700 hover:bg-neutral-850 rounded-xl text-xs font-semibold transition-all"
              >
                Update Password Key
              </button>
            </form>
          </div>

          {/* Database controls or Reset details */}
          <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 p-5 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-neutral-450 uppercase tracking-widest font-mono">
              System Operations
            </h2>

            <div className="space-y-2">
              <button
                onClick={handleResetDemoData}
                type="button"
                className="w-full py-2 border border-neutral-300 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Local Database</span>
              </button>

              <button
                onClick={onLogout}
                type="button"
                className="w-full py-2.5 bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
