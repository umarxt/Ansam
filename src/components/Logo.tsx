import { useEffect, useState } from "react";
import { getLogo } from "../lib/brand";

type Variant = "mark" | "horizontal" | "stacked";

/**
 * شعار أنسام الرسمي.
 * - variant="mark": الرمز المربّع (أيقونة داخل مربّع كحلي) — للأماكن الضيّقة والمضمّنة.
 * - variant="horizontal": القفل الأفقي (الرمز + كلمة ansam) — للترويسة/الشريط العلوي.
 * - variant="stacked": القفل العمودي (الرمز + ANSAM + أنسام) — للواجهات البارزة والمركزية.
 *
 * على الخلفيات الداكنة (onDark) يُستخدم تلقائياً إصدار فاتح من القفل ليظهر بوضوح.
 * إن رفعت الشركة شعاراً مخصّصاً من الإعدادات فسيُستخدم بدلاً من الشعار الرسمي،
 * ويوضع داخل خلفية بيضاء على الخلفيات الداكنة ليبقى واضحاً.
 */
export function Logo({
  variant = "mark",
  className = "h-11 w-11",
  onDark = false,
  chipClassName = "",
}: {
  variant?: Variant;
  className?: string;
  onDark?: boolean;
  chipClassName?: string;
}) {
  const [logo, setLogo] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    getLogo().then(setLogo);
  }, []);

  const isCustom = Boolean(logo);

  // الشعار المخصّص المرفوع من الإعدادات يتجاوز الشعار الرسمي.
  if (isCustom) {
    if (onDark) {
      return (
        <span
          className={`inline-flex items-center justify-center rounded-xl bg-white p-1.5 ${chipClassName}`}
        >
          <img src={logo as string} alt="أنسام" className={className} />
        </span>
      );
    }
    return (
      <img src={logo as string} alt="أنسام" className={`object-contain ${className}`} />
    );
  }

  // الشعار الرسمي الافتراضي.
  const base =
    variant === "horizontal"
      ? "/assets/logo-horizontal"
      : variant === "stacked"
        ? "/assets/logo-stacked"
        : null;

  // الرمز المربّع مكتفٍ بذاته (يعمل على أي خلفية).
  if (!base) {
    return (
      <img
        src="/assets/logo-mark.svg"
        alt="أنسام"
        className={`object-contain ${className}`}
      />
    );
  }

  // القفل الأفقي/العمودي: نسخة فاتحة على الداكن، وداكنة على الفاتح.
  const src = `${base}${onDark ? "-light" : ""}.svg`;
  return <img src={src} alt="أنسام" className={`object-contain ${className}`} />;
}
