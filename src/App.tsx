/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  initDb,
  getTransactions,
  getGoals,
  registerUser,
  setCurrentUserId,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addGoal,
  contributeToGoal,
  deleteGoal,
  updateUser,
  getUsers,
  loginUser,
  logoutUser,
} from './utils/db';
import { User, Transaction, Goal } from './types';
import ThemeToggle from './components/ThemeToggle';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import AddMoneyModal from './components/AddMoneyModal';
import AddExpenseModal from './components/AddExpenseModal';

import { motion, AnimatePresence } from 'motion/react';

// Navigation icon pairs
import {
  LayoutDashboard,
  Receipt,
  Target,
  BarChart3,
  User as UserIcon,
  HelpCircle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';

// Subviews
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import GoalsView from './components/GoalsView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';

export default function App() {
  // Main State Hooks
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'goals' | 'analytics' | 'profile'>('dashboard');

  // Modals Toggles
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  
  // Edit State Store
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Authentication Fields (if not logged in)
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize DB and Fetch initial session
  useEffect(() => {
    initDb();
    const fetchSession = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    fetchSession();
  }, []);

  // Sync state whenever currentUser changes
  useEffect(() => {
    const syncData = async () => {
      if (currentUser) {
        const txs = await getTransactions(currentUser.id);
        const gls = await getGoals(currentUser.id);
        setTransactions(txs);
        setGoals(gls);

        // Synchronize visual dark mode class
        if (currentUser.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        document.documentElement.classList.remove('dark'); // default light
      }
    };
    syncData();
  }, [currentUser]);

  // Global Keyboard Shortcuts Event Listeners
  useEffect(() => {
    let lastKey = '';
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore when focused inside text input fields
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }

      const key = e.key.toLowerCase();

      // Keyboard shortcuts help manual toggle key
      if (key === '?' || (e.shiftKey && e.key === '/')) {
        setIsShortcutsHelpOpen((prev) => !prev);
        return;
      }

      // Add money shortcut
      if (e.key === '+') {
        e.preventDefault();
        setEditingTransaction(null);
        setIsAddMoneyOpen(true);
        return;
      }

      // Add expense shortcut
      if (e.key === '-') {
        e.preventDefault();
        setEditingTransaction(null);
        setIsAddExpenseOpen(true);
        return;
      }

      // Double-key combinations (e.g., G then D, G then T)
      if (lastKey === 'g') {
        if (key === 'd') {
          setActiveTab('dashboard');
        } else if (key === 't') {
          setActiveTab('transactions');
        } else if (key === 'g') {
          setActiveTab('goals');
        } else if (key === 'a') {
          setActiveTab('analytics');
        } else if (key === 'p') {
          setActiveTab('profile');
        }
        lastKey = ''; // Reset
        return;
      }

      if (key === 'g') {
        lastKey = 'g';
        // Clear last key after short timeout to allow individual keypresses
        setTimeout(() => {
          if (lastKey === 'g') lastKey = '';
        }, 1500);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // UI Event Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setAuthError('All fields are required.');
      return;
    }

    try {
      const user = await loginUser(loginEmail.trim(), loginPassword);
      setCurrentUser(user);
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Incorrect email or password credentials.');
    }
  };

  const handleRegisterInput = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setAuthError('All registration fields are required.');
      return;
    }

    try {
      const newUser = await registerUser(regName, regEmail, regPassword);
      setCurrentUser(newUser);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during registration.');
    }
  };

  const handleDemoAccess = async () => {
    // Standard fast bypass trigger
    initDb();
    const users = getUsers();
    const demo = users.find((u) => u.id === 'demo-user') || users[0];
    if (demo) {
      setCurrentUserId(demo.id);
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    await updateUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  // Transaction Actions Callbacks
  const handleSaveMoneyTransaction = async (data: {
    amount: number;
    source: string;
    date: string;
    title: string;
    notes: string;
  }) => {
    if (!currentUser) return;

    if (editingTransaction) {
      // Edit Mode
      const updated: Transaction = {
        ...editingTransaction,
        amount: data.amount,
        source: data.source,
        date: data.date,
        title: data.title,
        notes: data.notes,
      };
      await updateTransaction(currentUser.id, updated);
      setEditingTransaction(null);
    } else {
      // Add Mode
      await addTransaction(currentUser.id, {
        type: 'credit',
        amount: data.amount,
        source: data.source,
        date: data.date,
        title: data.title,
        notes: data.notes,
      });
    }

    const txs = await getTransactions(currentUser.id);
    setTransactions(txs);
  };

  const handleSaveExpenseTransaction = async (data: {
    amount: number;
    category: string;
    date: string;
    title: string;
    notes: string;
  }) => {
    if (!currentUser) return;

    if (editingTransaction) {
      // Edit Mode
      const updated: Transaction = {
        ...editingTransaction,
        amount: data.amount,
        category: data.category,
        date: data.date,
        title: data.title,
        notes: data.notes,
      };
      await updateTransaction(currentUser.id, updated);
      setEditingTransaction(null);
    } else {
      // Add Mode
      await addTransaction(currentUser.id, {
        type: 'debit',
        amount: data.amount,
        category: data.category,
        date: data.date,
        title: data.title,
        notes: data.notes,
      });
    }

    const txs = await getTransactions(currentUser.id);
    setTransactions(txs);
  };

  const handleTriggerEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    if (tx.type === 'credit') {
      setIsAddMoneyOpen(true);
    } else {
      setIsAddExpenseOpen(true);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!currentUser) return;
    await deleteTransaction(currentUser.id, id);
    const txs = await getTransactions(currentUser.id);
    setTransactions(txs);
  };

  // Goals Action Callbacks
  const handleAddNewGoal = async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => {
    if (!currentUser) return;
    await addGoal(currentUser.id, goalData);
    const gls = await getGoals(currentUser.id);
    setGoals(gls);
  };

  const handleContributeToGoals = async (goalId: string, amount: number) => {
    if (!currentUser) return;
    await contributeToGoal(currentUser.id, goalId, amount);

    // Refresh transactions list and goals progress
    const txs = await getTransactions(currentUser.id);
    const gls = await getGoals(currentUser.id);
    setTransactions(txs);
    setGoals(gls);
  };

  const handleDeleteGoal = async (id: string) => {
    if (!currentUser) return;
    await deleteGoal(currentUser.id, id);
    const gls = await getGoals(currentUser.id);
    setGoals(gls);
  };

  const calculateAvailableBalance = () => {
    const credits = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const debits = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    return credits - debits;
  };

  // Nav configuration
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', name: 'Transactions', icon: Receipt },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'profile', name: 'Profile', icon: UserIcon },
  ] as const;

  // Render Subview content
  const renderTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            user={currentUser}
            transactions={transactions}
            goals={goals}
            onAddMoneyClick={() => {
              setEditingTransaction(null);
              setIsAddMoneyOpen(true);
            }}
            onAddExpenseClick={() => {
              setEditingTransaction(null);
              setIsAddExpenseOpen(true);
            }}
            onNavigateToTransactions={() => setActiveTab('transactions')}
            onNavigateToGoals={() => setActiveTab('goals')}
          />
        );
      case 'transactions':
        return (
          <TransactionsView
            user={currentUser}
            transactions={transactions}
            onEditTransaction={handleTriggerEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'goals':
        return (
          <GoalsView
            user={currentUser}
            goals={goals}
            availableBalance={calculateAvailableBalance()}
            onAddGoal={handleAddNewGoal}
            onContributeToGoals={handleContributeToGoals}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case 'analytics':
        return <AnalyticsView user={currentUser} transactions={transactions} />;
      case 'profile':
        return (
          <ProfileView
            user={currentUser}
            transactions={transactions}
            goals={goals}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
          />
        );
    }
  };

  // Visual Styling for grey-scale layout
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 flex flex-col transition-colors selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900 pb-24 md:pb-0">
      
      {/* Auth Screen layout if no current session */}
      {!currentUser ? (
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 max-w-md mx-auto w-full">
          <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-8">
            
            {/* Header Brand */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border border-neutral-900">
                <Briefcase className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase font-sans">
                PocketLedger
              </h1>
              <p className="text-xs text-neutral-400 font-medium font-mono leading-relaxed px-4">
                "Track money in. Track money out. Know your balance instantly."
              </p>
            </div>

            {/* Toggle tabs */}
            <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-250">
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isRegistering
                    ? 'bg-neutral-950 text-white dark:bg-neutral-800'
                    : 'text-neutral-500'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isRegistering
                    ? 'bg-neutral-950 text-white dark:bg-neutral-800'
                    : 'text-neutral-500'
                }`}
              >
                Register
              </button>
            </div>

            {/* Dynamic Auth forms */}
            {!isRegistering ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="auth-email" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    Email Address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="auth-pass" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    Password
                  </label>
                  <input
                    id="auth-pass"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                </div>

                {authError && (
                  <p className="text-xs text-neutral-400 font-mono bg-neutral-100 p-2.5 rounded-lg border border-neutral-200">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Sign In Entry</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterInput} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="reg-name" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="Manoj"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-email" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="manoj@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-pass" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    Password
                  </label>
                  <input
                    id="reg-pass"
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                </div>

                {authError && (
                  <p className="text-xs text-neutral-400 font-mono bg-neutral-100 p-2.5 rounded-lg border border-neutral-205">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Authorize Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
            
          </div>
          <div className="mt-8 text-[10px] font-mono text-center text-neutral-400">
            PocketLedger Client App v1.0.0 • No Cookies Server Hooks
          </div>
        </div>
      ) : (
        /* Authenticated Main UI with layout grids */
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* Main Left sidebar for desktop / Top brand ribbon for mobile */}
          <aside className="w-full md:w-64 bg-white dark:bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between py-4.5 px-4 md:h-screen md:sticky md:top-0">
            <div className="space-y-6">
              
              {/* Brand Header */}
              <div className="flex items-center justify-between md:mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border border-neutral-800">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-sm font-black tracking-wider uppercase text-neutral-950 dark:text-white font-sans">
                      PocketLedger
                    </h1>
                    <p className="text-[9px] text-neutral-400 font-mono tracking-tighter">
                      No salary constraints
                    </p>
                  </div>
                </div>

                {/* Theme toggle & help buttons side by side */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsShortcutsHelpOpen(true)}
                    className="p-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                    title="Keyboard shortcuts manual (Hotkey: ?)"
                    aria-label="Keyboard shortcuts manual"
                  >
                    <HelpCircle className="w-4 h-4 pointer-events-none" />
                  </button>

                  <ThemeToggle
                    theme={currentUser.theme}
                    onChange={(newTheme) => {
                      const updated = { ...currentUser, theme: newTheme };
                      updateUser(updated);
                      setCurrentUser(updated);
                    }}
                  />
                </div>
              </div>

              {/* Desktop primary Sidebar Links (hidden on mobile bottom bar) */}
              <nav className="hidden md:flex flex-col gap-1.5" aria-label="Desktop Primary Navigation">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 dark:focus-visible:ring-white ${
                        isActive
                          ? 'bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950 font-bold border-r-2 border-neutral-950 dark:border-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-850 hover:text-neutral-950 dark:hover:text-white'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Desktop User Footer (hidden on mobile) */}
            <div className="hidden md:block pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <p className="text-[10px] text-neutral-400 uppercase font-mono tracking-widest mb-1 select-none">
                Active Wallet Profile
              </p>
              <h2 className="font-bold text-neutral-800 dark:text-neutral-200 truncate">
                {currentUser.name}
              </h2>
              <p className="text-[10px] text-neutral-400 truncate mt-0.5 select-all">
                {currentUser.email}
              </p>
            </div>
          </aside>

          {/* Center Main Stage Content panel */}
          <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 py-8 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full"
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Persistent Mobile Bottom Navigation Tabs (hidden on Desktop) */}
          <nav className="md:hidden fixed bottom-4 left-4 right-4 max-w-lg mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 px-2 py-1.5 z-40 flex justify-around items-center h-16 rounded-[28px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)]" aria-label="Mobile Bottom Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 py-1 px-3.5 rounded-2xl transition-colors duration-200 ${
                    isActive
                      ? 'text-neutral-950 dark:text-white font-bold'
                      : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
                  }`}
                  style={{ minWidth: "48px", minHeight: "48px" }} /* strict physical accessibility touch targets */
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-mobile-pill"
                      className="absolute inset-0 bg-neutral-100/90 dark:bg-neutral-800/90 rounded-2xl -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold tracking-wider">{item.name}</span>
                </button>
              );
            })}
          </nav>



          {/* Quick-action entry Modals */}
          <AddMoneyModal
            isOpen={isAddMoneyOpen}
            onClose={() => {
              setIsAddMoneyOpen(false);
              setEditingTransaction(null);
            }}
            onSave={handleSaveMoneyTransaction}
            currency={currentUser.currency}
            editTransaction={editingTransaction}
          />

          <AddExpenseModal
            isOpen={isAddExpenseOpen}
            onClose={() => {
              setIsAddExpenseOpen(false);
              setEditingTransaction(null);
            }}
            onSave={handleSaveExpenseTransaction}
            currency={currentUser.currency}
            editTransaction={editingTransaction}
          />

          {/* Keyboard Shortcuts Dialog Help modal overlay */}
          <KeyboardShortcutsHelp
            isOpen={isShortcutsHelpOpen}
            onClose={() => setIsShortcutsHelpOpen(false)}
          />

        </div>
      )}
    </div>
  );
}
