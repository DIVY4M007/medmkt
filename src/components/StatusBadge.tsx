'use client';

import { STATUS_LABELS } from '@/lib/format';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  pending_approval: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50',
  approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50',
  paid: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/50',
  delivered: 'bg-primary/10 text-primary dark:bg-primary/15 border border-primary/15',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200/80 dark:border-red-800/50',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  draft: 'bg-slate-400',
  pending_approval: 'bg-amber-500',
  approved: 'bg-emerald-500',
  paid: 'bg-teal-500',
  delivered: 'bg-primary',
  rejected: 'bg-red-500',
};

interface StatusBadgeProps {
  status: string;
  dimmed?: boolean;
  className?: string;
  testid?: string;
}

export default function StatusBadge({ status, dimmed, className, testid }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const colorClass = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  const dotColor = STATUS_DOT_COLORS[status] || 'bg-slate-400';

  return (
    <span
      data-testid={testid}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-all duration-200',
        colorClass,
        dimmed && 'opacity-30',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColor, dimmed && 'opacity-50')} />
      {label}
    </span>
  );
}
