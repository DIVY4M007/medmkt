'use client';

import { STATUS_LABELS } from '@/lib/format';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-[#EAE5D9]/80 text-[#5C635F]',
  pending_approval: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  paid: 'bg-sky-50 text-sky-700 border border-sky-200/60',
  delivered: 'bg-[#4A675B]/8 text-[#4A675B] border border-[#4A675B]/15',
  rejected: 'bg-red-50 text-red-700 border border-red-200/60',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  draft: 'bg-[#5C635F]',
  pending_approval: 'bg-amber-500',
  approved: 'bg-emerald-500',
  paid: 'bg-sky-500',
  delivered: 'bg-[#4A675B]',
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
  const colorClass = STATUS_COLORS[status] || 'bg-[#EAE5D9]/80 text-[#5C635F]';
  const dotColor = STATUS_DOT_COLORS[status] || 'bg-[#5C635F]';

  return (
    <span
      data-testid={testid}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all duration-200',
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
