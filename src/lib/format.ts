export function formatMoney(n: number | string, currency = "ريال"): string {
  const num = Number(n || 0);
  return (
    num.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
    " " +
    currency
  );
}

export function formatNumber(n: number | string): string {
  return Number(n || 0).toLocaleString("ar-SA", { maximumFractionDigits: 2 });
}

export function formatDate(d?: string): string {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "نقدي",
  transfer: "حوالة",
  pos: "جهاز شبكة",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  issued: "صادرة",
  paid: "مدفوعة",
  cancelled: "ملغاة",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-navy-100 text-navy-700",
  issued: "bg-sky-soft text-brand-dark",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};
