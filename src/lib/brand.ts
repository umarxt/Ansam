// جلب شعار الشركة مرة واحدة (مُخزّن) — من نقطة عامة تعمل قبل تسجيل الدخول
let cache: string | null | undefined = undefined;
let promise: Promise<string | null> | null = null;

export async function getLogo(): Promise<string | null> {
  if (cache !== undefined) return cache;
  if (!promise) {
    promise = fetch("/api/public/landing", { credentials: "include" })
      .then((r) => r.json())
      .then((d: any): string | null => {
        cache = d?.company?.logo || null;
        return cache ?? null;
      })
      .catch((): string | null => {
        cache = null;
        return null;
      });
  }
  return promise;
}

export function resetLogoCache() {
  cache = undefined;
  promise = null;
}
