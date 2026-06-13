/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, X, Calendar } from 'lucide-react';
import { User, Transaction } from '../types';

interface TransactionsViewProps {
  user: User;
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionsView({
  user,
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionsViewProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all'); // category or source

  // Get current date boundaries
  const todayStr = '2026-06-13'; // From mock metadata time
  const yesterdayStr = '2026-06-12';

  const formatCurrency = (val: number) => {
    return `${user.currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Filter transactions
  const filteredTxs = transactions.filter((tx) => {
    // Search
    const matchesSearch =
      tx.title.toLowerCase().includes(search.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase())) ||
      tx.amount.toString().includes(search) ||
      (tx.category && tx.category.toLowerCase().includes(search.toLowerCase())) ||
      (tx.source && tx.source.toLowerCase().includes(search.toLowerCase()));

    // Filter Type
    const matchesType = filterType === 'all' || tx.type === filterType;

    // Filter Group/Category
    let matchesGroup = true;
    if (filterGroup !== 'all') {
      if (tx.type === 'credit') {
        matchesGroup = tx.source === filterGroup;
      } else {
        matchesGroup = tx.category === filterGroup;
      }
    }

    return matchesSearch && matchesType && matchesGroup;
  });

  // Calculate stats for current search/filter view
  const viewCredits = filteredTxs.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const viewDebits = filteredTxs.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  // Grouping logic helper
  const dateToMs = (dateStr: string) => new Date(dateStr).getTime();
  const todayMs = dateToMs(todayStr);

  const getWeekRange = () => {
    const d = new Date(todayStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.getTime();
  };

  const startOfWeekMs = getWeekRange();

  const grouped = filteredTxs.reduce(
    (groups, tx) => {
      if (tx.date === todayStr) {
        groups.today.push(tx);
      } else if (tx.date === yesterdayStr) {
        groups.yesterday.push(tx);
      } else {
        const txMs = dateToMs(tx.date);
        if (txMs >= startOfWeekMs) {
          groups.thisWeek.push(tx);
        } else {
          groups.earlier.push(tx);
        }
      }
      return groups;
    },
    { today: [] as Transaction[], yesterday: [] as Transaction[], thisWeek: [] as Transaction[], earlier: [] as Transaction[] }
  );

  // Lists of options for the filter selector
  const availableGroups = Array.from(
    new Set(
      transactions
        .map((t) => (t.type === 'credit' ? t.source : t.category))
        .filter(Boolean) as string[]
    )
  );

  const clearFilters = () => {
    setSearch('');
    setFilterType('all');
    setFilterGroup('all');
  };

  const renderTxRow = (tx: Transaction) => {
    const isCredit = tx.type === 'credit';
    return (
      <div
        key={tx.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all gap-4"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            isCredit
              ? 'bg-neutral-950 border-neutral-950 text-white dark:bg-neutral-800 dark:border-neutral-700'
              : 'bg-neutral-50 border-neutral-200 text-neutral-800 dark:bg-neutral-950 dark:border-neutral-850 dark:text-neutral-300'
          }`}>
            {isCredit ? <ArrowUpRight className="w-4.5 h-4.5" /> : <ArrowDownLeft className="w-4.5 h-4.5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                {tx.title}
              </h4>
              <span className="text-[10px] font-mono select-none uppercase tracking-wider px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded text-neutral-500">
                {isCredit ? tx.source : tx.category}
              </span>
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              {tx.date} {tx.notes ? `• ${tx.notes}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-3 sm:pt-0 border-neutral-100 dark:border-neutral-800">
          <div className="text-left sm:text-right">
            <span className={`text-base font-bold font-mono tracking-tight block ${
              isCredit ? 'text-neutral-950 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
            }`}>
              {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEditTransaction(tx)}
              className="p-2 text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950"
              title="Edit transaction item"
              aria-label={`Edit ${tx.title}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Do you want to permanently delete this transaction: "${tx.title}"?`)) {
                  onDeleteTransaction(tx.id);
                }
              }}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950"
              title="Delete transaction item"
              aria-label={`Delete ${tx.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="transactions-view" className="space-y-6 animate-fade-in">
      {/* Title Panel */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">
          UNIFIED GENERAL LEDGER
        </span>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-105 tracking-tight">
          Wallet Journal
        </h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ledger entries (title, description, amount)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white transition-all"
              aria-label="Search transactions list"
            />
          </div>

          {/* Type Selectors */}
          <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-805 self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-neutral-950 text-white dark:bg-neutral-800'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('credit')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterType === 'credit'
                  ? 'bg-neutral-950 text-white dark:bg-neutral-800'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Money Added
            </button>
            <button
              onClick={() => setFilterType('debit')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterType === 'debit'
                  ? 'bg-neutral-950 text-white dark:bg-neutral-800'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-905'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>

        {/* Dynamic Tag Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-400">Classify:</span>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="text-xs bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-80) text-neutral-800 dark:text-neutral-200 px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              aria-label="Filter by source or category class"
            >
              <option value="all">All sources/categories</option>
              {availableGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {(search || filterType !== 'all' || filterGroup !== 'all') && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-950 dark:text-neutral-405 dark:hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear Filter Parameters</span>
            </button>
          )}
        </div>
      </div>

      {/* Totals Summary for Filtered Results */}
      <div className="text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-205 dark:border-neutral-850 p-3.5 rounded-xl flex items-center justify-around text-neutral-500 dark:text-neutral-400">
        <div>Filtered Transactions Count: <strong className="text-neutral-800 dark:text-neutral-300">{filteredTxs.length}</strong></div>
        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
        <div>Credits Sum: <strong className="text-neutral-800 dark:text-neutral-300">{formatCurrency(viewCredits)}</strong></div>
        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
        <div>Debits Sum: <strong className="text-neutral-800 dark:text-neutral-300">{formatCurrency(viewDebits)}</strong></div>
      </div>

      {/* Main Ledger Groupings */}
      {filteredTxs.length === 0 ? (
        <div className="py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center">
          <p className="text-sm text-neutral-500 mb-2">No matching transactions found.</p>
          <p className="text-xs text-neutral-400">Try adjusting your filters, searching other terms, or clearing all constraints.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          {grouped.today.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono flex items-center gap-1.5 flex-row">
                <Calendar className="w-3.5 h-3.5" />
                <span>Today</span>
              </h3>
              <div className="space-y-2.5">
                {grouped.today.map(renderTxRow)}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {grouped.yesterday.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono flex items-center gap-1.5 flex-row">
                <Calendar className="w-3.5 h-3.5" />
                <span>Yesterday</span>
              </h3>
              <div className="space-y-2.5">
                {grouped.yesterday.map(renderTxRow)}
              </div>
            </div>
          )}

          {/* This Week Group */}
          {grouped.thisWeek.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono flex items-center gap-1.5 flex-row">
                <Calendar className="w-3.5 h-3.5" />
                <span>This Week</span>
              </h3>
              <div className="space-y-2.5">
                {grouped.thisWeek.map(renderTxRow)}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {grouped.earlier.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono flex items-center gap-1.5 flex-row">
                <Calendar className="w-3.5 h-3.5" />
                <span>Earlier</span>
              </h3>
              <div className="space-y-2.5">
                {grouped.earlier.map(renderTxRow)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
