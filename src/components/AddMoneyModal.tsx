/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Briefcase, GraduationCap, Banknote, Gift, RotateCcw, Users, CircleEllipsis } from 'lucide-react';
import { Transaction } from '../types';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { amount: number; source: string; date: string; notes: string; title: string }) => void;
  currency: string;
  editTransaction?: Transaction | null;
}

const SOURCES = [
  { name: 'Freelance', icon: Briefcase },
  { name: 'Internship', icon: GraduationCap },
  { name: 'Salary', icon: Banknote },
  { name: 'Gift', icon: Gift },
  { name: 'Refund', icon: RotateCcw },
  { name: 'Parents', icon: Users },
  { name: 'Other', icon: CircleEllipsis },
];

export default function AddMoneyModal({ isOpen, onClose, onSave, currency, editTransaction }: AddMoneyModalProps) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Freelance');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setAmount(editTransaction.amount.toString());
        setSource(editTransaction.source || 'Freelance');
        setDate(editTransaction.date);
        setTitle(editTransaction.title);
        setNotes(editTransaction.notes || '');
      } else {
        setAmount('');
        setSource('Freelance');
        setDate(new Date().toISOString().split('T')[0]);
        setTitle('');
        setNotes('');
      }
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, editTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than zero.');
      return;
    }
    const finalTitle = title.trim() || `${source} Income`;
    onSave({
      amount: numAmount,
      source,
      date,
      title: finalTitle,
      notes: notes.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transition-all my-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-money-title"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="add-money-title" className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            {editTransaction ? 'Edit Income' : 'Add Money'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Input */}
          <div>
            <label htmlFor="money-amount" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2 font-mono">
              Amount ({currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-neutral-400">
                {currency}
              </span>
              <input
                ref={firstInputRef}
                type="number"
                id="money-amount"
                required
                min="0.01"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-lg font-semibold text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-50 transition-all font-mono"
              />
            </div>
          </div>

          {/* Source Options (No classic dropdown - elegant grid select) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2.5 font-mono">
              Select Source *
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2" role="radiogroup" aria-label="Income source list">
              {SOURCES.map((item) => {
                const Icon = item.icon;
                const isSelected = source === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSource(item.name)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-50 ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950 ring-1 ring-neutral-950 dark:ring-neutral-50'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5 flex-shrink-0" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="money-title" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2 font-mono">
              Description / Title
            </label>
            <input
              type="text"
              id="money-title"
              placeholder="e.g. Logo Design, Weekend Gift"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-50 transition-all"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="money-date" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2 font-mono">
              Date *
            </label>
            <input
              type="date"
              id="money-date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-50 transition-all font-mono"
            />
          </div>

          {/* Notes Optional */}
          <div>
            <label htmlFor="money-notes" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2 font-mono">
              Notes (Optional)
            </label>
            <textarea
              id="money-notes"
              rows={2}
              placeholder="Provide extra details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-50 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-neutral-950 dark:bg-neutral-50 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-50"
            >
              {editTransaction ? 'Save Changes' : 'Add Cash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
