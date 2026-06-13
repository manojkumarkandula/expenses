/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onChange: (theme: 'light' | 'dark') => void;
}

export default function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const toggle = () => {
    onChange(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      id="theme-toggle"
      onClick={toggle}
      className="p-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-50"
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {theme === 'light' ? <Moon className="w-5 h-5 pointer-events-none" /> : <Sun className="w-5 h-5 pointer-events-none" />}
    </button>
  );
}
