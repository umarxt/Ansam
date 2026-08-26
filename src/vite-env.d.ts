/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** دومين الموقع الرسمي (صفحة الهبوط) — الافتراضي ansamair.sa */
  readonly VITE_PUBLIC_DOMAIN?: string;
  /** دومين المنصة الإدارية — الافتراضي app.ansamair.sa */
  readonly VITE_ADMIN_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
