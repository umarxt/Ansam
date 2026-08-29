import {
  ReactNode,
  ReactElement,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
} from "react";
import { X, Loader2 } from "lucide-react";

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} role="status" aria-label="جارٍ التحميل" />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24 text-brand">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (open) {
      const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }
  }, [open, onClose]);

  const titleId = useId();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-900/40 backdrop-blur-sm p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={`card w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-8 fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
          <h3 id={titleId} className="text-lg font-medium text-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg p-1.5 text-steel hover:bg-navy-50"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  // ربط التسمية والنص المساعد بعنصر الإدخال لقارئات الشاشة، دون المساس بالمنطق.
  const autoId = useId();
  const hintId = hint ? `${autoId}-hint` : undefined;
  let control = children;
  if (isValidElement(children)) {
    const child = children as ReactElement<any>;
    const controlId = child.props.id ?? autoId;
    control = cloneElement(child, {
      id: controlId,
      "aria-describedby":
        [child.props["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined,
    });
    return (
      <div>
        <label htmlFor={controlId} className="label">
          {label}
        </label>
        {control}
        {hint && (
          <p id={hintId} className="mt-1 text-xs text-steel">
            {hint}
          </p>
        )}
      </div>
    );
  }
  return (
    <div>
      <label className="label">{label}</label>
      {control}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-steel">
          {hint}
        </p>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, sub }: { icon?: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-3 text-steel">{icon}</div>}
      <p className="font-medium text-navy">{title}</p>
      {sub && <p className="mt-1 text-sm text-steel">{sub}</p>}
    </div>
  );
}
