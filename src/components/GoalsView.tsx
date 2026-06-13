/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, PlusCircle, ArrowUpRight, Calendar, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { User, Goal } from '../types';

interface GoalsViewProps {
  user: User;
  goals: Goal[];
  availableBalance: number;
  onAddGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => void;
  onContributeToGoals: (goalId: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

export default function GoalsView({
  user,
  goals,
  availableBalance,
  onAddGoal,
  onContributeToGoals,
  onDeleteGoal,
}: GoalsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Contribution inputs state (keyed by goal id)
  const [contributionAmounts, setContributionAmounts] = useState<{ [key: string]: string }>({});

  const formatCurrency = (val: number) => {
    return `${user.currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const start = currentAmount ? parseFloat(currentAmount) : 0;

    if (!goalName.trim()) {
      alert('Please enter a goal name.');
      return;
    }
    if (isNaN(target) || target <= 0) {
      alert('Please enter a valid target amount greater than zero.');
      return;
    }
    if (isNaN(start) || start < 0) {
      alert('Please enter a valid initial saved money or leave empty.');
      return;
    }
    if (start > target) {
      alert('Initial savings cannot exceed target amount.');
      return;
    }

    onAddGoal({
      goal_name: goalName.trim(),
      target_amount: target,
      current_amount: start,
      target_date: targetDate || undefined,
    });

    // Reset forms
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setShowAddForm(false);
  };

  const handleSaveContribution = (goalId: string, target: number, current: number) => {
    const rawAmt = contributionAmounts[goalId];
    if (!rawAmt) return;
    const amount = parseFloat(rawAmt);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid contribution amount.');
      return;
    }

    if (amount > availableBalance) {
      alert(`Insufficient funds! Your current wallet available balance is ${formatCurrency(availableBalance)}, which is less than your contribution amount ${formatCurrency(amount)}.`);
      return;
    }

    const remaining = target - current;
    if (amount > remaining) {
      alert(`The requested contribution ${formatCurrency(amount)} exceeds the remaining goal balance ${formatCurrency(remaining)}.`);
      return;
    }

    onContributeToGoals(goalId, amount);

    // clear item contribution input
    setContributionAmounts(prev => ({ ...prev, [goalId]: '' }));
  };

  return (
    <div id="goals-view" className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">
            STRATEGIC SAVINGS
          </span>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Financial Intentions
          </h1>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-150 dark:text-neutral-950 font-semibold text-xs rounded-xl border border-neutral-800 dark:border-neutral-200 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950"
          aria-expanded={showAddForm}
        >
          {showAddForm ? <ChevronUp className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancel Creation' : 'Formulate Goal'}</span>
        </button>
      </div>

      {/* Expandable Add Goal Widget */}
      {showAddForm && (
        <form
          onSubmit={handleCreateGoal}
          className="bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 p-5 rounded-2xl shadow-xl space-y-4 animate-slide-up"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="goal-name-field" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-450 uppercase tracking-widest mb-1 font-mono">
                Goal / Target Title *
              </label>
              <input
                id="goal-name-field"
                type="text"
                required
                placeholder="e.g. New Laptop, Emergency Fund"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="goal-target-amount-field" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-455 uppercase tracking-widest mb-1 font-mono">
                Target Value ({user.currency}) *
              </label>
              <input
                id="goal-target-amount-field"
                type="number"
                required
                min="1"
                step="any"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white transition-all font-mono"
              />
            </div>

            <div>
              <label htmlFor="goal-current-amount-field" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-460 uppercase tracking-widest mb-1 font-mono">
                Already Saved ({user.currency})
              </label>
              <input
                id="goal-current-amount-field"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white transition-all font-mono"
              />
            </div>

            <div>
              <label htmlFor="goal-target-date-field" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-465 uppercase tracking-widest mb-1 font-mono">
                Target Deadline Date (Optional)
              </label>
              <input
                id="goal-target-date-field"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-850 dark:hover:bg-neutral-100 rounded-xl text-xs font-semibold transition-all"
            >
              Add Saving Goal Intent
            </button>
          </div>
        </form>
      )}

      {/* Interactive Goals List */}
      {goals.length === 0 ? (
        <div className="py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center">
          <p className="text-sm text-neutral-500 mb-1">No active savings goals.</p>
          <p className="text-xs text-neutral-400">Strategize computer hardware, travel setups, or an emergency deposit above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const completionPercent = Math.min(
              100,
              Math.max(0, (goal.current_amount / goal.target_amount) * 100)
            );
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);
            const isCompleted = goal.current_amount >= goal.target_amount;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs space-y-4 group relative flex flex-col justify-between"
              >
                <div>
                  {/* Card Title Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100">
                        {isCompleted ? <CheckCircle2 className="w-4 h-4 text-neutral-900 dark:text-white" /> : <Target className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                          {goal.goal_name}
                        </h3>
                        {goal.target_date && (
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>By: {goal.target_date}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Do you want to permanently delete goal "${goal.goal_name}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="p-1.5 text-neutral-400 hover:text-neutral-905 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
                      title="Delete target goal"
                      aria-label={`Delete ${goal.goal_name} goal`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Metrics details */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-850">
                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase block">Saved value</span>
                      <strong className="text-neutral-800 dark:text-neutral-200">{formatCurrency(goal.current_amount)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-400 text-[10px] uppercase block">Target value</span>
                      <strong className="text-neutral-850 dark:text-neutral-200">{formatCurrency(goal.target_amount)}</strong>
                    </div>
                  </div>

                  {/* Progress bar Meter */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex justify-between items-center text-xs text-neutral-400">
                      <span>Progress Completeness</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">{completionPercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-950 rounded-full overflow-hidden border border-neutral-200/40 dark:border-neutral-800">
                      <div
                        className="h-full bg-neutral-950 dark:bg-white rounded-full transition-all"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contribution Action form footer */}
                {!isCompleted && (
                  <div className="mt-5 pt-3.5 border-t border-neutral-100 dark:border-neutral-850 flex gap-2 items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-mono">
                        {user.currency}
                      </span>
                      <input
                        type="number"
                        placeholder="Contribute..."
                        value={contributionAmounts[goal.id] || ''}
                        onChange={(e) =>
                          setContributionAmounts((prev) => ({ ...prev, [goal.id]: e.target.value }))
                        }
                        className="w-full pl-6 pr-2 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                        aria-label={`Contribute currency value toward ${goal.goal_name}`}
                      />
                    </div>
                    <button
                      onClick={() => handleSaveContribution(goal.id, goal.target_amount, goal.current_amount)}
                      disabled={!contributionAmounts[goal.id]}
                      className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Fund</span>
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <div className="mt-4 p-2 bg-neutral-50 dark:bg-neutral-950 border border-dashed border-neutral-200 dark:border-neutral-800 text-center rounded-xl text-neutral-400 text-xs font-mono font-semibold">
                    Target Goal Completed!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
