/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Transaction, Goal } from '../types';
import { supabase } from './supabaseClient';

// Helper to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// LocalStorage Keys
const KEYS = {
  USERS: 'pocketledger_users',
  TRANSACTIONS: 'pocketledger_transactions',
  GOALS: 'pocketledger_goals',
  CURRENT_USER_ID: 'pocketledger_current_user_id',
};

// Initial Seed Data Functions
const getInitialUsers = (): User[] => [
  {
    id: 'demo-user',
    name: 'Kandula Manoj',
    email: 'kandulamanoj2005@gmail.com',
    password: 'password123',
    currency: '₹',
    theme: 'dark',
  }
];

const getInitialTransactions = (): Transaction[] => [
  {
    id: 't-1',
    user_id: 'demo-user',
    type: 'credit',
    amount: 15000,
    source: 'Freelance',
    title: 'Freelance UI/UX Project',
    notes: 'Completed web design prototype for a startup client.',
    date: '2026-06-10',
    created_at: new Date('2026-06-10T10:00:00Z').toISOString(),
  },
  {
    id: 't-2',
    user_id: 'demo-user',
    type: 'debit',
    amount: 800,
    category: 'Entertainment',
    title: 'Movie Ticket & Popcorn',
    notes: 'Watched new sci-fi film in theatres.',
    date: '2026-06-10',
    created_at: new Date('2026-06-10T19:30:00Z').toISOString(),
  },
  {
    id: 't-3',
    user_id: 'demo-user',
    type: 'credit',
    amount: 8000,
    source: 'Internship',
    title: 'Monthly stipend',
    notes: 'Stipend for research assistance internship.',
    date: '2026-06-11',
    created_at: new Date('2026-06-11T09:00:00Z').toISOString(),
  },
  {
    id: 't-4',
    user_id: 'demo-user',
    type: 'debit',
    amount: 3500,
    category: 'Education',
    title: 'Financial Management Course',
    notes: 'Bought online specialization curriculum.',
    date: '2026-06-11',
    created_at: new Date('2026-06-11T14:15:00Z').toISOString(),
  },
  {
    id: 't-5',
    user_id: 'demo-user',
    type: 'credit',
    amount: 2000,
    source: 'Gift',
    title: 'Birthday Gift from Uncle',
    notes: 'Belated birthday greeting gift card cash.',
    date: '2026-06-12',
    created_at: new Date('2026-06-12T08:00:00Z').toISOString(),
  },
  {
    id: 't-6',
    user_id: 'demo-user',
    type: 'debit',
    amount: 1200,
    category: 'Food',
    title: 'Dinner at Bistro',
    notes: 'Reunion dinner with old high school friends.',
    date: '2026-06-12',
    created_at: new Date('2026-06-12T21:00:00Z').toISOString(),
  },
  {
    id: 't-7',
    user_id: 'demo-user',
    type: 'debit',
    amount: 450,
    category: 'Travel',
    title: 'Uber to Metro Station',
    notes: 'Commute back from dinner.',
    date: '2026-06-12',
    created_at: new Date('2026-06-12T22:30:00Z').toISOString(),
  },
];

const getInitialGoals = (): Goal[] => [
  {
    id: 'g-1',
    user_id: 'demo-user',
    goal_name: 'New Laptop',
    target_amount: 60000,
    current_amount: 25000,
    target_date: '2026-12-31',
    created_at: new Date('2026-06-01T08:00:00Z').toISOString(),
  },
  {
    id: 'g-2',
    user_id: 'demo-user',
    goal_name: 'Emergency Fund',
    target_amount: 15000,
    current_amount: 5000,
    target_date: '2026-09-30',
    created_at: new Date('2026-06-01T08:05:00Z').toISOString(),
  },
];

// Initialize DB if not present
export function initDb(): void {
  if (supabase) {
    console.log('PocketLedger: Supabase client detected and configured successfully!');
  } else {
    console.log('PocketLedger: Using LocalStorage fallback storage mode. Provide environment variables in .env to connect to Supabase.');
  }

  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(getInitialUsers()));
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(getInitialTransactions()));
  }
  if (!localStorage.getItem(KEYS.GOALS)) {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(getInitialGoals()));
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER_ID)) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, 'demo-user');
  }
}

// User Actions
export function getUsers(): User[] {
  initDb();
  const raw = localStorage.getItem(KEYS.USERS);
  return raw ? JSON.parse(raw) : [];
}

export function getCurrentUserId(): string | null {
  initDb();
  return localStorage.getItem(KEYS.CURRENT_USER_ID);
}

export function setCurrentUserId(userId: string | null): void {
  if (userId) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  }
}

export function getCurrentUser(): User | null {
  const currentId = getCurrentUserId();
  if (!currentId) return null;
  const users = getUsers();
  return users.find(u => u.id === currentId) || null;
}

export function updateUser(updatedUser: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
}

export function registerUser(name: string, email: string, password123: string): User {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }
  const newUser: User = {
    id: generateId(),
    name,
    email: email.toLowerCase(),
    password: password123,
    currency: '₹',
    theme: 'dark',
  };
  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  setCurrentUserId(newUser.id);
  return newUser;
}

// Transaction Actions
export function getAllTransactions(): Transaction[] {
  initDb();
  const raw = localStorage.getItem(KEYS.TRANSACTIONS);
  return raw ? JSON.parse(raw) : [];
}

export function getTransactions(userId: string): Transaction[] {
  return getAllTransactions().filter(t => t.user_id === userId);
}

export function addTransaction(userId: string, tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Transaction {
  const all = getAllTransactions();
  const newTx: Transaction = {
    ...tx,
    id: generateId(),
    user_id: userId,
    created_at: new Date().toISOString(),
  };
  all.unshift(newTx); // Insert at beginning
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));
  return newTx;
}

export function updateTransaction(userId: string, tx: Transaction): void {
  const all = getAllTransactions();
  const index = all.findIndex(t => t.id === tx.id && t.user_id === userId);
  if (index !== -1) {
    all[index] = tx;
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));
  }
}

export function deleteTransaction(userId: string, id: string): void {
  const all = getAllTransactions();
  const filtered = all.filter(t => !(t.id === id && t.user_id === userId));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(filtered));
}

// Goal Actions
export function getAllGoals(): Goal[] {
  initDb();
  const raw = localStorage.getItem(KEYS.GOALS);
  return raw ? JSON.parse(raw) : [];
}

export function getGoals(userId: string): Goal[] {
  return getAllGoals().filter(g => g.user_id === userId);
}

export function addGoal(userId: string, goal: Omit<Goal, 'id' | 'user_id' | 'created_at'>): Goal {
  const all = getAllGoals();
  const newGoal: Goal = {
    ...goal,
    id: generateId(),
    user_id: userId,
    created_at: new Date().toISOString(),
  };
  all.push(newGoal);
  localStorage.setItem(KEYS.GOALS, JSON.stringify(all));
  return newGoal;
}

export function updateGoal(userId: string, goal: Goal): void {
  const all = getAllGoals();
  const index = all.findIndex(g => g.id === goal.id && g.user_id === userId);
  if (index !== -1) {
    all[index] = goal;
    localStorage.setItem(KEYS.GOALS, JSON.stringify(all));
  }
}

export function deleteGoal(userId: string, id: string): void {
  const all = getAllGoals();
  const filtered = all.filter(g => !(g.id === id && g.user_id === userId));
  localStorage.setItem(KEYS.GOALS, JSON.stringify(filtered));
}

export function contributeToGoal(userId: string, goalId: string, amount: number): void {
  const goals = getGoals(userId);
  const goal = goals.find(g => g.id === goalId);
  if (!goal) return;

  // Add a debit transaction
  addTransaction(userId, {
    type: 'debit',
    amount: amount,
    category: 'Other',
    title: `Saved for: ${goal.goal_name}`,
    notes: `Manual allocation contribution of funds from available pocket cash status directly into goal tracker savings.`,
    date: new Date().toISOString().split('T')[0],
  });

  // Update original goal current_amount
  goal.current_amount += amount;
  updateGoal(userId, goal);
}

/*
  ========================================================================
  SUPABASE DATABASE CONNECTIVITY WRAPPER EXAMPLES
  ========================================================================
  To transition your app fully to Supabase database sync, convert the database
  methods above to async functions using the Supabase client connection hooks:

  1. Fetching Transactions:
     export async function getTransactionsAsync(userId: string) {
       if (!supabase) return getTransactions(userId);
       const { data, error } = await supabase
         .from('transactions')
         .select('*')
         .eq('user_id', userId)
         .order('created_at', { ascending: false });
       if (error) console.error('Error fetching transactions:', error);
       return data || [];
     }

  2. Adding a Transaction:
     export async function addTransactionAsync(userId: string, tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) {
       if (!supabase) return addTransaction(userId, tx);
       const { data, error } = await supabase
         .from('transactions')
         .insert([{ ...tx, user_id: userId }])
         .select()
         .single();
       if (error) console.error('Error adding transaction:', error);
       return data;
     }

  3. Syncing user authentication with Supabase Auth:
     - Use supabase.auth.signUp() and supabase.auth.signInWithPassword()
       to secure account creation and session state management.
*/
