/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface FABProps {
  onAddMoneyClick: () => void;
  onAddExpenseClick: () => void;
}

export default function FAB({ onAddMoneyClick, onAddExpenseClick }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 flex flex-col items-end gap-3.5"
    >
      {/* Sub Actions Menus */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 animate-slide-up">
          {/* Add Money button option */}
          <button
            onClick={() => handleAction(onAddMoneyClick)}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-xl shadow-lg border border-neutral-800 dark:border-neutral-200 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-bold transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-white"
            aria-label="Quick Add Money"
          >
            <span>Add Money</span>
            <div className="p-1 rounded-md bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Add Expense button option */}
          <button
            onClick={() => handleAction(onAddExpenseClick)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-xs font-bold transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-white"
            aria-label="Quick Add Expense"
          >
            <span>Add Expense</span>
            <div className="p-1 rounded-md bg-neutral-100 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger FAB Circular Button */}
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border transition-all transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-white ${
          isOpen
            ? 'bg-neutral-905 border-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-950 rotate-45'
            : 'bg-neutral-950 border-neutral-950 text-white dark:bg-white dark:text-neutral-950 dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-100'
        }`}
        aria-label="Expand quick action menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Plus className="w-6 h-6 transition-transform" />
      </button>
    </div>
  );
}
