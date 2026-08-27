import { ComponentType, ReactNode, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

/* ============================================================
   رأس صفحة موحّد للوحة الإدارة (عنوان + وصف + إجراءات)
   ============================================================ */
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-medium text-navy">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-steel">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ============================================================
   بطاقة إحصائية موحّدة (تُستخدم في لوحة المعلومات واللوحة المالية)
   ============================================================ */
export type StatTone = "navy" | "brand" | "amber" | "green" | "red" | "steel";

const STAT_TONES: Record<StatTone, string> = {
  navy: "bg-navy text-white",
  brand: "bg-brand text-white",
  amber: "bg-amber-500 text-white",
  green: "bg-green-600 text-white",
  red: "bg-red-500 text-white",
  steel: "bg-steel text-white",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "navy",
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  tone?: StatTone;
  hint?: ReactNode;
}) {
  return (
    <div className="stat-card fade-in">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-soft ${STAT_TONES[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="num mt-4 text-2xl font-medium leading-none text-navy">{value}</div>
      <div className="mt-1.5 text-sm text-steel">{label}</div>
      {hint && <div className="mt-1 text-xs text-slate-brand">{hint}</div>}
    </div>
  );
}

/* ============================================================
   فاصل موجة (مشتق من عنصر الأنابيب في الهوية) — بين الأقسام
   ============================================================ */
export function WaveDivider({
  className = "",
  fill = "currentColor",
  flip = false,
}: {
  className?: string;
  fill?: string;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`block h-10 w-full md:h-14 ${flip ? "rotate-180" : ""} ${className}`}
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
    >
      <path
        d="M0 40 C 200 0, 320 80, 600 40 S 1000 0, 1200 40 L1200 80 L0 80 Z"
        fill={fill}
      />
    </svg>
  );
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

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-900/40 backdrop-blur-sm p-4 sm:p-8">
      <div
        className={`card w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-8 fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
          <h3 className="text-lg font-medium text-navy">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-steel hover:bg-navy-50">
            <X className="w-5 h-5" />
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
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-steel">{hint}</p>}
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
