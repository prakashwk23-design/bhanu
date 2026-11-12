import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import type { WorkflowStatus } from '../../lib/types';
import { STATUS_META } from '../../lib/platforms';

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ Button */

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'subtle' | 'danger';
type Size = 'xs' | 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-indigo-500 to-violet-600 text-white border border-indigo-400/40 shadow-[0_8px_24px_-10px_rgba(99,102,241,0.85),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-indigo-400 hover:to-violet-500',
  secondary:
    'bg-raised/80 text-ink border border-line/80 hover:bg-raised hover:border-line shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
  ghost: 'text-muted hover:text-ink hover:bg-raised/70 border border-transparent',
  outline: 'border border-indigo-400/40 text-indigo-700 bg-indigo-500/5 hover:bg-indigo-500/15 dark:text-indigo-200',
  subtle: 'border border-line/70 bg-surface/70 text-ink hover:bg-raised/80',
  danger: 'border border-rose-500/40 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:text-rose-200',
};

const SIZES: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-[11px] gap-1.5 rounded-lg',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-[38px] px-3.5 text-[13px] gap-2 rounded-xl',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  trailing?: ReactNode;
  loading?: boolean;
  block?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  trailing,
  loading,
  block,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        'relative inline-flex select-none items-center justify-center font-medium transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-[0.5px]',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      {children}
      {trailing}
    </button>
  );
}

export function IconButton({
  label,
  className,
  active,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all',
        active
          ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
          : 'border-transparent text-muted hover:border-line/70 hover:bg-raised/70 hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({
  className,
  children,
  interactive,
  ...rest
}: { className?: string; children: ReactNode; interactive?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cx(
        'rounded-2xl border border-line/70 bg-surface/60 shadow-card backdrop-blur-xl',
        interactive && 'transition-colors hover:border-line hover:bg-surface/80',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- Badge */

export function Badge({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium leading-5 tracking-wide',
        className ?? 'border-line/70 bg-raised/70 text-muted',
      )}
    >
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', dot)} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: WorkflowStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <Badge className={cx(meta.chip, meta.text, 'font-semibold', className)} dot={meta.dot}>
      {meta.label}
    </Badge>
  );
}

/* ------------------------------------------------------------------ Switch */

export function Switch({
  checked,
  onChange,
  label,
  size = 'md',
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}) {
  const dims =
    size === 'sm'
      ? { w: 'w-8', h: 'h-[18px]', knob: 'h-[13px] w-[13px]', on: 'translate-x-[17px]', off: 'translate-x-[2px]' }
      : { w: 'w-9', h: 'h-5', knob: 'h-4 w-4', on: 'translate-x-[18px]', off: 'translate-x-[3px]' };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-200',
        dims.w,
        dims.h,
        checked
          ? 'border-indigo-400/60 bg-indigo-500/80 shadow-[0_0_12px_-2px_rgba(99,102,241,0.7)]'
          : 'border-line/80 bg-raised',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span
        className={cx(
          'absolute rounded-full bg-white shadow-sm transition-transform duration-200',
          dims.knob,
          checked ? dims.on : dims.off,
        )}
      />
    </button>
  );
}

/* -------------------------------------------------------------- Segmented */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: {
  options: { id: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (next: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      className={cx(
        'inline-flex items-center gap-0.5 rounded-lg border border-line/70 bg-app/60 p-0.5',
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-[7px] font-medium transition-all duration-200',
            size === 'sm' ? 'h-6 px-2 text-[11px]' : 'h-7 px-2.5 text-xs',
            value === option.id
              ? 'bg-raised text-ink shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_2px_8px_-4px_rgba(0,0,0,0.6)]'
              : 'text-muted hover:text-ink',
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Avatar */

export function Avatar({
  initials,
  tone = 'from-indigo-400 to-violet-600',
  size = 36,
  ring,
  className,
}: {
  initials: string;
  tone?: string;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white select-none',
        tone,
        ring && 'ring-2 ring-app',
        className,
      )}
      style={{ height: size, width: size, fontSize: Math.max(10, size * 0.34) }}
    >
      {initials}
    </div>
  );
}

/* ------------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fadeIn bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'relative w-full animate-popIn overflow-hidden rounded-2xl border border-line/80 bg-surface shadow-pop',
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line/60 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
            {description && <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>}
          </div>
          <IconButton label="Close dialog" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line/60 bg-app/40 px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Section UI */

export function SectionTitle({
  step,
  title,
  description,
  right,
  className,
}: {
  step?: string;
  title: string;
  description?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex items-start justify-between gap-3', className)}>
      <div className="flex items-start gap-2.5">
        {step && (
          <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line/70 bg-raised/80 px-1 font-mono text-[10px] font-semibold text-faint">
            {step}
          </span>
        )}
        <div>
          <h3 className="text-[13px] font-semibold tracking-tight text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{description}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">{children}</span>
      {hint && <span className="text-[10.5px] text-faint/80">{hint}</span>}
    </div>
  );
}

export function TextInput({ className, ...rest }: React.ComponentPropsWithRef<'input'>) {
  return (
    <input
      {...rest}
      className={cx(
        'h-9 w-full rounded-lg border border-line/70 bg-app/50 px-3 text-[13px] text-ink outline-none transition-colors',
        'placeholder:text-faint focus:border-indigo-400/60 focus:bg-app/80 focus:ring-2 focus:ring-indigo-500/20',
        className,
      )}
    />
  );
}

export function TextArea({ className, ...rest }: React.ComponentPropsWithRef<'textarea'>) {
  return (
    <textarea
      {...rest}
      className={cx(
        'w-full resize-none rounded-lg border border-line/70 bg-app/50 px-3 py-2.5 text-[13px] leading-relaxed text-ink outline-none transition-colors',
        'placeholder:text-faint focus:border-indigo-400/60 focus:bg-app/80 focus:ring-2 focus:ring-indigo-500/20',
        className,
      )}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cx('relative', className)}>
      <select
        {...rest}
        className="h-8 w-full appearance-none rounded-lg border border-line/70 bg-app/60 pl-2.5 pr-7 text-[11.5px] font-medium text-ink outline-none transition-colors hover:bg-raised focus:border-indigo-400/60"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-ink"
    >
      <span
        className={cx(
          'flex h-4 w-4 items-center justify-center rounded border transition-colors',
          checked ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-line bg-app/60',
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

export function Meter({ value, className, tone = 'indigo' }: { value: number; className?: string; tone?: 'indigo' | 'emerald' | 'amber' | 'rose' }) {
  const tones = {
    indigo: 'bg-gradient-to-r from-indigo-500 to-violet-500',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-400',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-500',
  };
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-line/60', className)}>
      <div
        className={cx('h-full rounded-full transition-all duration-500', tones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/70 bg-raised/60 text-faint">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-line/70 bg-app/70 px-1.5 py-0.5 font-mono text-[10px] text-faint">
      {children}
    </kbd>
  );
}
