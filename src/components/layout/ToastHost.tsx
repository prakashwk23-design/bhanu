import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useApp } from '../../lib/store';
import { cx } from '../ui/Primitives';

export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[60] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'warning' ? TriangleAlert : Info;
        return (
          <div
            key={toast.id}
            className={cx(
              'pointer-events-auto flex animate-slideIn items-start gap-2.5 rounded-xl border px-3.5 py-2.5 shadow-pop backdrop-blur-xl',
              toast.tone === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/80'
                : toast.tone === 'warning'
                  ? 'border-amber-500/30 bg-amber-950/80'
                  : 'border-line/80 bg-slate-900/90',
            )}
          >
            <Icon
              className={cx(
                'mt-0.5 h-4 w-4 shrink-0',
                toast.tone === 'success' ? 'text-emerald-400' : toast.tone === 'warning' ? 'text-amber-400' : 'text-indigo-300',
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold leading-5 text-white">{toast.message}</p>
              {toast.description && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300">{toast.description}</p>}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="mt-0.5 text-slate-500 transition-colors hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
