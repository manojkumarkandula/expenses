/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BarChart, PieChart, TrendingDown, Layers, Calendar, Landmark, Coins } from 'lucide-react';
import { User, Transaction } from '../types';

interface AnalyticsViewProps {
  user: User;
  transactions: Transaction[];
}

export default function AnalyticsView({ user, transactions }: AnalyticsViewProps) {
  const [timePeriod, setTimePeriod] = useState<'all' | 'june'>('all'); // demo-user seed data is in June 2026

  const formatCurrency = (val: number) => {
    return `${user.currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Only debits (expenses) are included in this view as requested
  const expenses = transactions.filter((t) => t.type === 'debit');

  // Filter based on period if requested
  const filteredExpenses = expenses.filter((e) => {
    if (timePeriod === 'june') {
      return e.date.startsWith('2026-06');
    }
    return true;
  });

  const totalExpenseSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for Pie/Donut Chart & Cards
  const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Health', 'Education', 'Entertainment', 'Bills', 'Other'];
  
  const categoryStats = CATEGORIES.map((catName) => {
    const sum = filteredExpenses
      .filter((e) => e.category === catName)
      .reduce((s, e) => s + e.amount, 0);
    const percent = totalExpenseSum > 0 ? (sum / totalExpenseSum) * 100 : 0;
    return { name: catName, value: sum, percent };
  }).filter((stat) => stat.value > 0) // only show categories with some expenses
    .sort((a, b) => b.value - a.value);

  // Group by month for Bar Chart (Month-wise expenses)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Create a map of year-month spending
  const monthlyMap: { [key: string]: number } = {};
  expenses.forEach((e) => {
    const dateParts = e.date.split('-');
    if (dateParts.length >= 2) {
      const year = dateParts[0];
      const monthIdx = parseInt(dateParts[1], 10) - 1;
      const key = `${monthNames[monthIdx]} ${year}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + e.amount;
    }
  });

  // Convert monthly data to simple array and sort chronologically/historically
  const monthlyStats = Object.keys(monthlyMap).map((k) => ({
    label: k,
    value: monthlyMap[k],
  }));

  // If monthly is empty, show a demo empty state or populate June 2026
  const displayMonthlyStats = monthlyStats.length > 0 
    ? monthlyStats 
    : [{ label: 'Jun 2026', value: totalExpenseSum }];

  // Find max value in monthly to scale the bar heights dynamically
  const maxMonthlyVal = Math.max(...displayMonthlyStats.map((d) => d.value), 1);

  // Donut SVG helper math
  let accumulatedPercent = 0;

  // Grey shades for the donut chart segment fills (elegant, high contrast, non-color)
  const greyShades = [
    '#18181b', // neutral-900
    '#3f3f46', // neutral-700
    '#71717a', // neutral-500
    '#a1a1aa', // neutral-400
    '#d4d4d8', // neutral-300
    '#e4e4e7', // neutral-200
    '#f4f4f5', // neutral-100
    '#a8a29e', // stone-400
  ];

  return (
    <div id="analytics-view" className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">
            FINANCIAL PERSPECTIVES
          </span>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-55 tracking-tight">
            Insights Dashboard
          </h1>
        </div>

        {/* Time Toggle */}
        <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200 dark:border-neutral-850 self-start sm:self-auto">
          <button
            onClick={() => setTimePeriod('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              timePeriod === 'all'
                ? 'bg-neutral-950 text-white dark:bg-neutral-800'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            All Ledger Records
          </button>
          <button
            onClick={() => setTimePeriod('june')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              timePeriod === 'june'
                ? 'bg-neutral-950 text-white dark:bg-neutral-800'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            June 2026
          </button>
        </div>
      </div>

      {totalExpenseSum === 0 ? (
        <div className="py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center">
          <p className="text-sm text-neutral-500 mb-1">No transaction expense logs found to analyze.</p>
          <p className="text-xs text-neutral-400">Record a few debits in your Wallet screen to view distribution analytics.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Main Visuals Grid (Donut Pie and Bar Chart side-by-side on large screen) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pie Chart / Donut Layout (Expense Distribution by Category) */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5 flex flex-col">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  Expense Category Distribution
                </h3>
              </div>

              <div className="flex flex-col xs:flex-row items-center justify-around gap-6 py-4 flex-1">
                {/* SVG Donut */}
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                    {/* Background circle */}
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="transparent"
                      stroke="transparent"
                      strokeWidth="3.2"
                    />
                    
                    {/* Render Segments */}
                    {categoryStats.map((stat, idx) => {
                      const strokeDasharray = `${stat.percent} ${100 - stat.percent}`;
                      const strokeDashoffset = 100 - accumulatedPercent;
                      accumulatedPercent += stat.percent;
                      const shade = greyShades[idx % greyShades.length];

                      return (
                        <circle
                          key={stat.name}
                          cx="16"
                          cy="16"
                          r="14"
                          fill="transparent"
                          stroke={shade}
                          strokeWidth="3.2"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Center Hub details */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-neutral-400 font-mono block uppercase">Total Spent</span>
                    <span className="text-sm font-black text-neutral-900 dark:text-neutral-50 block font-mono">
                      {formatCurrency(totalExpenseSum)}
                    </span>
                  </div>
                </div>

                {/* Legend parameters lists */}
                <div className="space-y-2 text-xs w-full xs:w-auto">
                  {categoryStats.map((stat, idx) => {
                    const shade = greyShades[idx % greyShades.length];
                    return (
                      <div key={stat.name} className="flex items-center justify-between xs:justify-start gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-xs border border-neutral-300 dark:border-neutral-700 block" style={{ backgroundColor: shade }} />
                          <span className="text-neutral-600 dark:text-neutral-350 font-semibold">{stat.name}</span>
                        </div>
                        <span className="text-neutral-400 font-mono ml-auto xs:ml-4 text-[11px]">
                          ({stat.percent.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Monthly Spending (Bar Chart) */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-6 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  Monthly Total Disbursements
                </h3>
              </div>

              {/* Responsive SVG Bar Graph */}
              <div className="h-44 flex items-end gap-5 pt-6 pb-2 border-b border-neutral-200 dark:border-neutral-850 px-2 flex-1">
                {displayMonthlyStats.map((bar) => {
                  const pctHeight = (bar.value / maxMonthlyVal) * 100;
                  return (
                    <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center select-none">
                        {formatCurrency(bar.value)}
                      </div>
                      
                      {/* Bar item box */}
                      <div
                        className="w-full rounded-t-lg bg-neutral-950 dark:bg-neutral-300 hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-all cursor-pointer relative"
                        style={{ height: `${pctHeight === 0 ? 4 : Math.max(pctHeight, 4)}%` }}
                        aria-label={`Month ${bar.label} spent value: ${formatCurrency(bar.value)}`}
                      >
                        {/* High contrast focus border status */}
                        <div className="absolute inset-0 border border-transparent hover:border-white rounded-t-lg" />
                      </div>

                      <div className="text-[10px] font-bold uppercase font-mono tracking-wider text-neutral-400 select-none">
                        {bar.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-neutral-400 font-mono text-center">
                Hover or press categories to inspect numeric value.
              </p>
            </div>
          </div>

          {/* Category Summary Cards List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Classified Breakdown Summary
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {categoryStats.map((stat, idx) => {
                const shade = greyShades[idx % greyShades.length];
                return (
                  <div
                    key={stat.name}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4.5 rounded-2xl flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-row">
                        <span className="w-2.5 h-2.5 rounded-full block border border-neutral-300 dark:border-neutral-700" style={{ backgroundColor: shade }} />
                        <span className="text-xs text-neutral-500 font-medium">{stat.name}</span>
                      </div>
                      <p className="text-base font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                        {formatCurrency(stat.value)}
                      </p>
                    </div>

                    <div className="text-right text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-950 py-1.5 px-2 rounded-xl border border-neutral-100 dark:border-neutral-850 font-mono">
                      {stat.percent.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
