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

export async function getCurrentUser(): Promise<User | null> {
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    return {
      id: session.user.id,
      name: profile?.name || session.user.user_metadata?.name || 'User',
      email: session.user.email || '',
      password: '',
      currency: profile?.currency || '₹',
      theme: (profile?.theme as 'light' | 'dark') || 'dark',
    };
  }

  const currentId = getCurrentUserId();
  if (!currentId) return null;
  const users = getUsers();
  return users.find(u => u.id === currentId) || null;
}

export async function updateUser(updatedUser: User): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedUser.name,
        currency: updatedUser.currency,
        theme: updatedUser.theme,
      })
      .eq('id', updatedUser.id);
    if (error) {
      console.error('Error updating user in Supabase:', error);
      throw error;
    }
  } else {
    const users = getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
  }
}

export async function registerUser(name: string, email: string, password123: string): Promise<User> {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password123,
      options: {
        data: { name },
      },
    });
    if (error) {
      console.error('Error during Supabase sign up:', error);
      throw error;
    }
    if (!data.user) {
      throw new Error('Registration failed.');
    }
    return {
      id: data.user.id,
      name,
      email: data.user.email || email,
      password: '',
      currency: '₹',
      theme: 'dark',
    };
  } else {
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
}

export async function loginUser(email: string, password123: string): Promise<User> {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password123,
    });
    if (error) {
      console.error('Error during Supabase sign in:', error);
      throw error;
    }
    if (!data.user) {
      throw new Error('Login failed.');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      name: profile?.name || data.user.user_metadata?.name || 'User',
      email: data.user.email || email,
      password: '',
      currency: profile?.currency || '₹',
      theme: (profile?.theme as 'light' | 'dark') || 'dark',
    };
  } else {
    const users = getUsers();
    const match = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password123
    );
    if (!match) {
      throw new Error('Incorrect email or password credentials. (Hint: Register or try Demo login!)');
    }
    setCurrentUserId(match.id);
    return match;
  }
}

export async function logoutUser(): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out of Supabase:', error);
    }
  }
  setCurrentUserId(null);
}

// Transaction Actions
export function getAllTransactions(): Transaction[] {
  initDb();
  const raw = localStorage.getItem(KEYS.TRANSACTIONS);
  return raw ? JSON.parse(raw) : [];
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching Supabase transactions:', error);
      return [];
    }
    return data || [];
  } else {
    return getAllTransactions().filter(t => t.user_id === userId);
  }
}

export async function addTransaction(userId: string, tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
  if (supabase) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        type: tx.type,
        amount: tx.amount,
        category: tx.category || null,
        source: tx.source || null,
        title: tx.title,
        notes: tx.notes || null,
        date: tx.date,
      }])
      .select()
      .single();
    if (error) {
      console.error('Error inserting transaction in Supabase:', error);
      throw error;
    }
    return data;
  } else {
    const all = getAllTransactions();
    const newTx: Transaction = {
      ...tx,
      id: generateId(),
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    all.unshift(newTx);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));
    return newTx;
  }
}

export async function updateTransaction(userId: string, tx: Transaction): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('transactions')
      .update({
        type: tx.type,
        amount: tx.amount,
        category: tx.category || null,
        source: tx.source || null,
        title: tx.title,
        notes: tx.notes || null,
        date: tx.date,
      })
      .eq('id', tx.id)
      .eq('user_id', userId);
    if (error) {
      console.error('Error updating transaction in Supabase:', error);
      throw error;
    }
  } else {
    const all = getAllTransactions();
    const index = all.findIndex(t => t.id === tx.id && t.user_id === userId);
    if (index !== -1) {
      all[index] = tx;
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));
    }
  }
}

export async function deleteTransaction(userId: string, id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      console.error('Error deleting transaction in Supabase:', error);
      throw error;
    }
  } else {
    const all = getAllTransactions();
    const filtered = all.filter(t => !(t.id === id && t.user_id === userId));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(filtered));
  }
}

// Goal Actions
export function getAllGoals(): Goal[] {
  initDb();
  const raw = localStorage.getItem(KEYS.GOALS);
  return raw ? JSON.parse(raw) : [];
}

export async function getGoals(userId: string): Promise<Goal[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching Supabase goals:', error);
      return [];
    }
    return data || [];
  } else {
    return getAllGoals().filter(g => g.user_id === userId);
  }
}

export async function addGoal(userId: string, goal: Omit<Goal, 'id' | 'user_id' | 'created_at'>): Promise<Goal> {
  if (supabase) {
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: userId,
        goal_name: goal.goal_name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount || 0,
        target_date: goal.target_date || null,
      }])
      .select()
      .single();
    if (error) {
      console.error('Error inserting goal in Supabase:', error);
      throw error;
    }
    return data;
  } else {
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
}

export async function updateGoal(userId: string, goal: Goal): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('goals')
      .update({
        goal_name: goal.goal_name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        target_date: goal.target_date || null,
      })
      .eq('id', goal.id)
      .eq('user_id', userId);
    if (error) {
      console.error('Error updating goal in Supabase:', error);
      throw error;
    }
  } else {
    const all = getAllGoals();
    const index = all.findIndex(g => g.id === goal.id && g.user_id === userId);
    if (index !== -1) {
      all[index] = goal;
      localStorage.setItem(KEYS.GOALS, JSON.stringify(all));
    }
  }
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      console.error('Error deleting goal in Supabase:', error);
      throw error;
    }
  } else {
    const all = getAllGoals();
    const filtered = all.filter(g => !(g.id === id && g.user_id === userId));
    localStorage.setItem(KEYS.GOALS, JSON.stringify(filtered));
  }
}

export async function contributeToGoal(userId: string, goalId: string, amount: number): Promise<void> {
  let goal: Goal | undefined;

  if (supabase) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();
    if (error || !data) return;
    goal = data;
  } else {
    const allGoals = await getGoals(userId);
    goal = allGoals.find(g => g.id === goalId);
  }

  if (!goal) return;

  // Add a debit transaction
  await addTransaction(userId, {
    type: 'debit',
    amount: amount,
    category: 'Other',
    title: `Saved for: ${goal.goal_name}`,
    notes: `Manual allocation contribution of funds from available pocket cash status directly into goal tracker savings.`,
    date: new Date().toISOString().split('T')[0],
  });

  // Update original goal current_amount
  goal.current_amount += amount;
  await updateGoal(userId, goal);
}
