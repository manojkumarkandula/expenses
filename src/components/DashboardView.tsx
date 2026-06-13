/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlusCircle, MinusCircle, Wallet, ArrowUpRight, ArrowDownLeft, Target, Calendar } from 'lucide-react';
import { User, Transaction, Goal } from '../types';

interface DashboardViewProps {
  user: User;
  transactions: Transaction[];
  goals: Goal[];
  onAddMoneyClick: () => void;
  onAddExpenseClick: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToGoals: () => void;
}

export default function DashboardView({
  user,
  transactions,
  goals,
  onAddMoneyClick,
  onAddExpenseClick,
  onNavigateToTransactions,
  onNavigateToGoals
}: DashboardViewProps) {
  // Calculations
  const totalMoneyAdded = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMoneySpent = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const availableBalance = totalMoneyAdded - totalMoneySpent;

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (val: number) => {
    return `${user.currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Personalized Greeting based on Time of Day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">
            WALLET CONCEPT
          </span>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {getGreeting()}, {user.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 font-mono">
          <Calendar className="w-3.5 h-3.5" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Hero Section: Available Balance (The Absolute Main Focus) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-50 rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-xs relative overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 bg-radial-[circle_at_top_right] from-neutral-50/50 to-transparent dark:from-neutral-850/50 pointer-events-none" />

        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2 font-mono">
          Available Balance
        </span>
        <h2 className="text-5xl sm:text-6xl font-bold text-neutral-950 dark:text-white tracking-tight break-all font-sans">
          {formatCurrency(availableBalance)}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2.5 max-w-sm">
          This balance adapts dynamically as you add funds and record expenses.
        </p>

        {/* Large quick-entry buttons inside Hero for primary visibility */}
        <div className="mt-8 flex flex-row gap-3 w-full max-w-md">
          <button
            onClick={onAddMoneyClick}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-white rounded-xl font-semibold text-sm transition-all border border-neutral-900 dark:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-white shadow-xs"
            aria-label="Add money to your available balance"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Money</span>
          </button>
          <button
            onClick={onAddExpenseClick}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 rounded-xl font-semibold text-sm transition-all border border-neutral-200 dark:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-800"
            aria-label="Record expense to reduce available balance"
          >
            <MinusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid - Simple Grey-scale */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-bold uppercase tracking-wider font-mono">Available Balance</span>
            <Wallet className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate">
            {formatCurrency(availableBalance)}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-bold uppercase tracking-wider font-mono">Total Added</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate">
            {formatCurrency(totalMoneyAdded)}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-bold uppercase tracking-wider font-mono">Total Spent</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate">
            {formatCurrency(totalMoneySpent)}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors" onClick={onNavigateToGoals}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-bold uppercase tracking-wider font-mono">Total Saved</span>
            <Target className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate">
            {formatCurrency(totalSaved)}
          </p>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-105 tracking-tight">
            Recent Activity
          </h3>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 dark:focus-visible:ring-white rounded-sm px-1"
          >
            Show Unified Ledger
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center">
            <p className="text-sm text-neutral-500">No transactions recorded yet.</p>
            <p className="text-xs text-neutral-400 mt-1">Add cash or list expenses using the quick buttons or FAB icon.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
            {recentTransactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/45 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${
                      isCredit
                        ? 'bg-neutral-950 border-neutral-950 text-white dark:bg-neutral-800 dark:border-neutral-700'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-850 dark:bg-neutral-950 dark:border-neutral-850 dark:text-neutral-300'
                    }`}>
                      {isCredit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 group-hover:underline decoration-neutral-400">
                        {tx.title}
                      </h4>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {tx.date} • {isCredit ? `Source: ${tx.source}` : `Category: ${tx.category}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold font-mono tracking-tight ${
                      isCredit ? 'text-neutral-955 dark:text-neutral-100' : 'text-neutral-501 dark:text-neutral-405'
                    }`}>
                      {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    {tx.notes && (
                      <p className="text-[11px] text-neutral-400 max-w-[150px] truncate" title={tx.notes}>
                        {tx.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
