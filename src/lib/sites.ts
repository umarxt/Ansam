// إعداد فصل الموقعين عبر النطاقات (Domains)
//
// النشر واحد على Cloudflare (Worker + الأصول + D1) لكنه مربوط بدومينين:
//   - الموقع الرسمي (صفحة الهبوط)  →  ansamair.sa
//   - المنصة الإدارية              →  app.ansamair.sa
//
// يمكن تغيير النطاقين وقت البناء عبر متغيّرات البيئة:
//   VITE_PUBLIC_DOMAIN , VITE_ADMIN_DOMAIN

export const PUBLIC_DOMAIN =
  (import.meta.env.VITE_PUBLIC_DOMAIN as string | undefined)?.trim() || "ansamair.sa";

export const ADMIN_DOMAIN =
  (import.meta.env.VITE_ADMIN_DOMAIN as string | undefined)?.trim() || "app.ansamair.sa";

export type SiteMode = "public" | "admin" | "dev";

// أثناء التطوير/المعاينة نُبقي الموقعين متاحين معاً بدون أي تحويل بين النطاقات
function isDevHost(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".localhost") ||
    host.endsWith(".workers.dev") ||
    host.endsWith(".pages.dev")
  );
}

/** يحدّد أي «موقع» نعرضه اعتماداً على النطاق الحالي. */
export function siteMode(): SiteMode {
  if (typeof window === "undefined") return "public";
  const host = window.location.hostname.toLowerCase();
  if (isDevHost(host)) return "dev";
  if (host === ADMIN_DOMAIN.toLowerCase()) return "admin";
  return "public";
}

/** الرابط الكامل لصفحة داخل المنصة الإدارية على دومين الإدارة. */
export function adminUrl(path = "/app"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `https://${ADMIN_DOMAIN}${p}`;
}

/** الرابط الكامل للموقع الرسمي على دومينه. */
export function publicUrl(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `https://${PUBLIC_DOMAIN}${p}`;
}
