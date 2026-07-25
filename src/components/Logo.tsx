import { useEffect, useState } from "react";
import { getLogo } from "../lib/brand";

/**
 * شعار أنسام. يستخدم الشعار المرفوع من الإعدادات إن وُجد، وإلا الشعار الافتراضي.
 * onDark: عند الخلفيات الداكنة، يُوضع الشعار المرفوع داخل خلفية بيضاء ليظهر بوضوح
 * (الشعار الافتراضي مكتفٍ بذاته فلا يحتاج ذلك).
 */
export function Logo({
  className = "h-11 w-11",
  onDark = false,
  chipClassName = "",
}: {
  className?: string;
  onDark?: boolean;
  chipClassName?: string;
}) {
  const [logo, setLogo] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    getLogo().then(setLogo);
  }, []);

  const isCustom = Boolean(logo);
  const src = logo || "/assets/logo-mark.svg";

  if (isCustom && onDark) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-white p-1.5 ${chipClassName}`}
      >
        <img src={src} alt="أنسام" className={className} />
      </span>
    );
  }
  return <img src={src} alt="أنسام" className={`object-contain ${className}`} />;
}
