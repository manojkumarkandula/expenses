/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // stored hashed or plain for simple mock client security
  currency: string;  // e.g. "₹", "$", "€", "£"
  theme: 'light' | 'dark';
}

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category?: string; // e.g. "Food", "Travel", "Shopping", "Health", "Education", "Entertainment", "Bills", "Other"
  source?: string;   // e.g. "Freelance", "Internship", "Salary", "Gift", "Refund", "Parents", "Other"
  title: string;
  notes?: string;
  date: string;       // YYYY-MM-DD
  created_at: string; // ISO string
}

export interface Goal {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string; // YYYY-MM-DD (Optional)
  created_at: string;  // ISO string
}
