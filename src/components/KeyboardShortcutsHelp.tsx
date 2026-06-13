/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus close button on open
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="keyboard-shortcuts-dialog-overlay"
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="keyboard-shortcuts-dialog"
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-neutral-900 dark:text-neutral-50" />
            <h2 id="shortcuts-title" className="text-lg font-bold text-neutral-900 dark:text-neutral-50 font-sans tracking-tight">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-50"
            aria-label="Close shortcuts help dialog"
          >
            <X className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 font-mono">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Add Money (Credit)</span>
                <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200 shadow-sm">
                  +
                </kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Add Expense (Debit)</span>
                <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200 shadow-sm">
                  -
                </kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Show Keyboard Help</span>
                <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200 shadow-sm">
                  ?
                </kbd>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 font-mono">
              Page Navigation
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Go to Dashboard</span>
                <div className="flex gap-1 items-center">
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">G</kbd>
                  <span className="text-xs text-neutral-400 font-mono">then</span>
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">D</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Go to Transactions</span>
                <div className="flex gap-1 items-center">
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">G</kbd>
                  <span className="text-xs text-neutral-400 font-mono">then</span>
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">T</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Go to Goals</span>
                <div className="flex gap-1 items-center">
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">G</kbd>
                  <span className="text-xs text-neutral-400 font-mono">then</span>
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">G</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Go to Analytics</span>
                <div className="flex gap-1 items-center">
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">G</kbd>
                  <span className="text-xs text-neutral-400 font-mono">then</span>
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">A</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Go to Profile</span>
                <div className="flex gap-1 items-center">
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">G</kbd>
                  <span className="text-xs text-neutral-400 font-mono">then</span>
                  <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200">P</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-[11px] text-center text-neutral-400 font-mono">
          Press ESC anytime to close any active modal.
        </div>
      </div>
    </div>
  );
}
