import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../ui/Primitives';
import type { PlanTier } from '../../lib/types';

export const PLAN_STYLES: Record<PlanTier, string> = {
  Free: 'border-slate-600/60 bg-slate-700/20 text-slate-300',
  Pro: 'border-indigo-400/30 bg-indigo-500/10 text-indigo-200',
  Agency: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
};

const BUTTON_VARIANTS = {
  primary:
    'border-indigo-400/40 bg-gradient-to-b from-indigo-500 to-violet-600 text-white shadow-[0_8px_24px_-12px_rgba(99,102,241,0.9)] hover:from-indigo-400 hover:to-violet-500',
  secondary: 'border-slate-700/80 bg-slate-900/80 text-slate-200 hover:border-slate-600 hover:bg-slate-800',
  ghost: 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
  danger: 'border-rose-500/35 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  amber: 'border-amber-400/35 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20',
} as const;

const BUTTON_SIZES = {
  xs: 'h-7 px-2.5 text-[10.5px] gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-[11px] gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-xs gap-2 rounded-lg',
} as const;

export function AdminButton({
  variant = 'secondary',
  size = 'sm',
  icon,
  children,
  className,
  block,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  icon?: ReactNode;
  block?: boolean;
}) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex shrink-0 select-none items-center justify-center border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        block && 'w-full',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cx(
        'rounded-xl border border-slate-800/80 bg-[#080d17]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_24px_60px_-40px_rgba(0,0,0,0.9)]',
        padded && 'p-4',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PlanPill({ plan, className }: { plan: PlanTier; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em]',
        PLAN_STYLES[plan],
        className,
      )}
    >
      {plan}
    </span>
  );
}

type Tone = 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'violet';

const TONE_STYLES: Record<Tone, { chip: string; dot: string; bar: string }> = {
  emerald: { chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300', dot: 'bg-emerald-400', bar: 'bg-emerald-400' },
  amber: { chip: 'border-amber-500/25 bg-amber-500/10 text-amber-300', dot: 'bg-amber-400', bar: 'bg-amber-400' },
  rose: { chip: 'border-rose-500/25 bg-rose-500/10 text-rose-300', dot: 'bg-rose-400', bar: 'bg-rose-400' },
  slate: { chip: 'border-slate-700 bg-slate-800/40 text-slate-400', dot: 'bg-slate-500', bar: 'bg-slate-500' },
  indigo: { chip: 'border-indigo-500/25 bg-indigo-500/10 text-indigo-300', dot: 'bg-indigo-400', bar: 'bg-indigo-400' },
  violet: { chip: 'border-violet-500/25 bg-violet-500/10 text-violet-300', dot: 'bg-violet-400', bar: 'bg-violet-400' },
};

export function Pill({
  tone = 'slate',
  dot,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9.5px] font-medium',
        TONE_STYLES[tone].chip,
        className,
      )}
    >
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', TONE_STYLES[tone].dot)} />}
      {children}
    </span>
  );
}

export function MiniBar({
  value,
  tone = 'indigo',
  className,
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-slate-800', className)}>
      <div
        className={cx('h-full rounded-full transition-all duration-500', TONE_STYLES[tone].bar)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function AdminToggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full border transition-colors',
        checked
          ? 'border-indigo-400/50 bg-indigo-500/80'
          : 'border-slate-700 bg-slate-800',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span
        className={cx(
          'absolute h-[12px] w-[12px] rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[16px]' : 'translate-x-[2px]',
        )}
      />
    </button>
  );
}

export function AdminRange({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      step={5}
      value={value}
      disabled={disabled}
      aria-label={label}
      onChange={(event) => onChange(Number(event.target.value))}
      className={cx('h-1 w-full cursor-pointer', disabled && 'cursor-not-allowed opacity-30')}
    />
  );
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);
}

export function AdminDrawer({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 animate-fadeIn bg-black/65 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="absolute inset-y-0 right-0 flex w-full max-w-[440px] animate-slideIn flex-col border-l border-slate-800 bg-[#070b13] shadow-[-30px_0_80px_-40px_rgba(0,0,0,0.9)]"
      >
        {children}
      </aside>
    </div>
  );
}

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fadeIn bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[82vh] w-full max-w-2xl animate-popIn flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-[#0a101b] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function TableShell({
  children,
  className,
  minWidthClass = 'min-w-[960px]',
}: {
  children: ReactNode;
  className?: string;
  minWidthClass?: string;
}) {
  return (
    <div className={cx('overflow-x-auto', className)}>
      <table className={cx('w-full border-collapse text-left', minWidthClass)}>{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cx(
        'whitespace-nowrap border-b border-slate-800/80 px-3 py-2.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-500',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cx('border-b border-slate-800/50 px-3 py-3 align-middle text-[11.5px] text-slate-300', className)}>
      {children}
    </td>
  );
}

export { TONE_STYLES };
