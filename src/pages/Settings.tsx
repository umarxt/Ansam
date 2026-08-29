import { useEffect, useState } from "react";
import { Building2, ReceiptText, Cloud, Globe, KeyRound, Save, Check, Plus, Trash2, Camera, Wrench } from "lucide-react";
import { api } from "../lib/api";
import { Field, Spinner } from "../components/ui";
import { resetLogoCache } from "../lib/brand";

// ضغط الصور (للشعار)
function compressImage(file: File, max = 512, quality = 0.9): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > max || height > max) {
        const r = Math.min(max / width, max / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      // PNG للحفاظ على الشفافية
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ضغط صور البنر (JPEG بأبعاد أكبر لتبقى واضحة وخفيفة)
function compressPhoto(file: File, max = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > max || height > max) {
        const r = Math.min(max / width, max / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

type Tab = "company" | "invoice" | "services" | "integrations" | "landing" | "security";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "company", label: "بيانات الشركة", icon: Building2 },
  { key: "invoice", label: "إعدادات الفوترة", icon: ReceiptText },
  { key: "services", label: "الخدمات", icon: Wrench },
  { key: "integrations", label: "النسخ الاحتياطي", icon: Cloud },
  { key: "landing", label: "الموقع الرسمي", icon: Globe },
  { key: "security", label: "الأمان", icon: KeyRound },
];

export default function Settings() {
  const [tab, setTab] = useState<Tab>("company");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-navy">الإعدادات</h1>
        <p className="text-sm text-slate-brand">تحكم كامل في بيانات الشركة والفوترة والموقع</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="أقسام الإعدادات">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key ? "bg-navy text-white shadow-soft" : "bg-white text-slate-brand hover:bg-navy-50"
            }`}
          >
            <t.icon className="w-4 h-4" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "company" && <CompanySettings />}
      {tab === "invoice" && <InvoiceSettings />}
      {tab === "services" && <ServicesSettings />}
      {tab === "integrations" && <IntegrationSettings />}
      {tab === "landing" && <LandingSettings />}
      {tab === "security" && <SecuritySettings />}
    </div>
  );
}

function SaveBar({ onSave, saving, saved }: { onSave: () => void; saving: boolean; saved: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3">
      {saved && (
        <span className="flex items-center gap-1 text-sm text-green-600" role="status">
          <Check className="w-4 h-4" aria-hidden="true" /> تم الحفظ
        </span>
      )}
      <button type="button" onClick={onSave} className="btn-brand" disabled={saving}>
        {saving ? <Spinner className="w-5 h-5" /> : <Save className="w-5 h-5" aria-hidden="true" />}
        حفظ التغييرات
      </button>
    </div>
  );
}

function useSetting(key: string, initial: any) {
  const [value, setValue] = useState<any>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<{ value: any }>(`/settings/${key}`)
      .then((r) => setValue({ ...initial, ...(r.value || {}) }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await api.put(`/settings/${key}`, { value });
      if (key === "company") resetLogoCache();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }
  return { value, setValue, loading, saving, saved, save };
}

function Loading() {
  return (
    <div className="flex justify-center py-16 text-brand">
      <Spinner className="w-7 h-7" />
    </div>
  );
}

function CompanySettings() {
  const s = useSetting("company", {
    name_ar: "",
    name_en: "",
    activity: "",
    cr_number: "",
    vat_number: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    iban: "",
    bank_name: "",
    logo: "",
  });
  if (s.loading) return <Loading />;
  const set = (k: string, v: any) => s.setValue({ ...s.value, [k]: v });

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      const d = await compressImage(f);
      set("logo", d);
    }
    e.target.value = "";
  }
  return (
    <div className="card space-y-5 p-6">
      <p className="text-sm text-slate-brand">
        هذه البيانات تُشكّل الهيدر الثابت لكل الفواتير وعروض الأسعار — تُدخلها مرة واحدة فقط.
      </p>

      {/* الشعار */}
      <div className="rounded-xl border border-navy-100 p-4">
        <label className="label">شعار الشركة</label>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-navy-50 p-2">
            <img src={s.value.logo || "/assets/logo-mark.svg"} alt="الشعار" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="btn-brand cursor-pointer text-sm">
              <Camera className="h-4 w-4" aria-hidden="true" />
              رفع شعار (PNG / JPG / SVG)
              <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
            </label>
            {s.value.logo && (
              <button type="button" onClick={() => set("logo", "")} className="text-sm text-red-500 hover:underline">
                إزالة الشعار (العودة للافتراضي)
              </button>
            )}
            <p className="text-xs text-steel">يُفضّل شعار بخلفية شفافة. يظهر في المنصة والفواتير والموقع.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="اسم الشركة (عربي)">
          <input className="input" value={s.value.name_ar} onChange={(e) => set("name_ar", e.target.value)} />
        </Field>
        <Field label="الاسم (إنجليزي)">
          <input className="input" dir="ltr" value={s.value.name_en} onChange={(e) => set("name_en", e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="النشاط">
            <input className="input" value={s.value.activity} onChange={(e) => set("activity", e.target.value)} />
          </Field>
        </div>
        <Field label="رقم السجل التجاري">
          <input className="input" dir="ltr" value={s.value.cr_number} onChange={(e) => set("cr_number", e.target.value)} />
        </Field>
        <Field label="الرقم الضريبي">
          <input className="input" dir="ltr" value={s.value.vat_number} onChange={(e) => set("vat_number", e.target.value)} />
        </Field>
        <Field label="الهاتف">
          <input className="input" dir="ltr" value={s.value.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="البريد الإلكتروني">
          <input className="input" dir="ltr" value={s.value.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="الموقع الإلكتروني">
          <input className="input" dir="ltr" value={s.value.website} onChange={(e) => set("website", e.target.value)} />
        </Field>
        <Field label="العنوان">
          <input className="input" value={s.value.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="الآيبان (IBAN)">
          <input className="input" dir="ltr" value={s.value.iban} onChange={(e) => set("iban", e.target.value)} />
        </Field>
        <Field label="اسم البنك">
          <input className="input" value={s.value.bank_name} onChange={(e) => set("bank_name", e.target.value)} />
        </Field>
      </div>
      <SaveBar onSave={s.save} saving={s.saving} saved={s.saved} />
    </div>
  );
}

function InvoiceSettings() {
  const s = useSetting("invoice_defaults", {
    vat_rate: 15,
    currency: "SAR",
    currency_ar: "ريال",
    terms: "",
    footer: "",
  });
  if (s.loading) return <Loading />;
  const set = (k: string, v: any) => s.setValue({ ...s.value, [k]: v });
  return (
    <div className="card space-y-5 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="نسبة الضريبة %">
          <input
            className="input"
            type="number"
            value={s.value.vat_rate}
            onChange={(e) => set("vat_rate", Number(e.target.value))}
          />
        </Field>
        <Field label="رمز العملة">
          <input className="input" dir="ltr" value={s.value.currency} onChange={(e) => set("currency", e.target.value)} />
        </Field>
        <Field label="اسم العملة (عربي)">
          <input className="input" value={s.value.currency_ar} onChange={(e) => set("currency_ar", e.target.value)} />
        </Field>
      </div>
      <Field label="الشروط والأحكام">
        <textarea
          className="input min-h-[80px]"
          value={s.value.terms}
          onChange={(e) => set("terms", e.target.value)}
        />
      </Field>
      <Field label="نص التذييل">
        <input className="input" value={s.value.footer} onChange={(e) => set("footer", e.target.value)} />
      </Field>
      <SaveBar onSave={s.save} saving={s.saving} saved={s.saved} />
    </div>
  );
}

function IntegrationSettings() {
  const s = useSetting("integrations", { sheets_webhook_url: "", sheets_enabled: false });
  if (s.loading) return <Loading />;
  const set = (k: string, v: any) => s.setValue({ ...s.value, [k]: v });
  return (
    <div className="card space-y-5 p-6">
      <div className="rounded-xl bg-sky-soft/40 p-4 text-sm text-navy-700">
        <p className="font-medium">النسخ الاحتياطي إلى Google Sheets</p>
        <p className="mt-1 leading-relaxed text-slate-brand">
          كل البيانات تُحفظ أساساً في قاعدة بيانات Cloudflare. لتفعيل نسخة احتياطية إضافية في Google
          Sheets: أنشئ Google Apps Script Web App (الكود مرفق في ملف README) والصق رابط النشر هنا.
          سيتم إرسال نسخة من كل فاتورة وحركة مالية جديدة تلقائياً.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-navy">
        <input
          type="checkbox"
          className="h-4 w-4 accent-brand"
          checked={s.value.sheets_enabled}
          onChange={(e) => set("sheets_enabled", e.target.checked)}
        />
        تفعيل النسخ الاحتياطي إلى Google Sheets
      </label>
      <Field label="رابط الـ Web App">
        <input
          className="input"
          dir="ltr"
          placeholder="https://script.google.com/macros/s/.../exec"
          value={s.value.sheets_webhook_url}
          onChange={(e) => set("sheets_webhook_url", e.target.value)}
        />
      </Field>
      <SaveBar onSave={s.save} saving={s.saving} saved={s.saved} />
    </div>
  );
}

function LandingSettings() {
  const s = useSetting("landing", {
    hero_title: "",
    hero_subtitle: "",
    phone: "",
    email: "",
    whatsapp: "",
    instagram: "",
    banners: [],
    services: [],
  });
  if (s.loading) return <Loading />;
  const set = (k: string, v: any) => s.setValue({ ...s.value, [k]: v });
  const services = s.value.services || [];
  const banners: string[] = s.value.banners || [];
  async function onBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      const d = await compressPhoto(f);
      set("banners", [...banners, d].slice(0, 3));
    }
    e.target.value = "";
  }
  const setService = (i: number, k: string, v: any) =>
    set(
      "services",
      services.map((sv: any, idx: number) => (idx === i ? { ...sv, [k]: v } : sv))
    );
  return (
    <div className="card space-y-5 p-6">
      <p className="text-sm text-slate-brand">تحكم في محتوى صفحة الهبوط / الموقع الرسمي المعروض للعملاء.</p>
      <Field label="العنوان الرئيسي">
        <input className="input" value={s.value.hero_title} onChange={(e) => set("hero_title", e.target.value)} />
      </Field>
      <Field label="الوصف">
        <textarea
          className="input min-h-[70px]"
          value={s.value.hero_subtitle}
          onChange={(e) => set("hero_subtitle", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="هاتف التواصل">
          <input className="input" dir="ltr" value={s.value.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="واتساب">
          <input className="input" dir="ltr" value={s.value.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label="البريد الإلكتروني">
          <input className="input" dir="ltr" value={s.value.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="إنستغرام / X">
          <input className="input" dir="ltr" value={s.value.instagram} onChange={(e) => set("instagram", e.target.value)} />
        </Field>
      </div>

      {/* صور البنر خلف الهيرو */}
      <div className="rounded-xl border border-navy-100 p-4">
        <label className="label">صور البنر (خلف الهيرو — حتى 3 صور)</label>
        <p className="mb-3 text-xs text-steel">
          على الديسكتوب تظهر الصور جنباً إلى جنب، وعلى الجوال تتحرك تلقائياً. يُفضّل صور أفقية عالية الجودة.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {banners.map((b, i) => (
            <div key={i} className="relative h-24 w-32 overflow-hidden rounded-xl border border-navy-100">
              <img src={b} alt={`صورة بنر ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => set("banners", banners.filter((_, idx) => idx !== i))}
                className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-500 shadow"
                aria-label={`حذف صورة البنر ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          {banners.length < 3 && (
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-navy-200 text-steel transition hover:bg-navy-50">
              <Camera className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs">إضافة صورة</span>
              <input type="file" accept="image/*" className="hidden" onChange={onBanner} />
            </label>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="label mb-0">الخدمات</label>
          <button
            type="button"
            onClick={() => set("services", [...services, { title: "", desc: "" }])}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> إضافة خدمة
          </button>
        </div>
        <div className="space-y-3">
          {services.map((sv: any, i: number) => (
            <div key={i} className="flex gap-2 rounded-xl border border-navy-100 p-3">
              <div className="flex-1 space-y-2">
                <input
                  className="input"
                  placeholder="عنوان الخدمة"
                  aria-label={`عنوان الخدمة ${i + 1}`}
                  value={sv.title}
                  onChange={(e) => setService(i, "title", e.target.value)}
                />
                <input
                  className="input"
                  placeholder="وصف الخدمة"
                  aria-label={`وصف الخدمة ${i + 1}`}
                  value={sv.desc}
                  onChange={(e) => setService(i, "desc", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  set(
                    "services",
                    services.filter((_: any, idx: number) => idx !== i)
                  )
                }
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                aria-label={`حذف الخدمة ${i + 1}`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <SaveBar onSave={s.save} saving={s.saving} saved={s.saved} />
    </div>
  );
}

function ServicesSettings() {
  const [services, setServices] = useState<any[] | null>(null);
  const [form, setForm] = useState({ name: "", default_price: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await api.get<{ services: any[] }>("/services");
    setServices(r.services);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      await api.post("/services", { name: form.name, default_price: Number(form.default_price || 0) });
      setForm({ name: "", default_price: "" });
      load();
    } finally {
      setBusy(false);
    }
  }
  async function toggle(s: any) {
    await api.put(`/services/${s.id}`, { active: !s.active });
    load();
  }
  async function remove(id: number) {
    if (!window.confirm("حذف الخدمة؟")) return;
    await api.del(`/services/${id}`);
    load();
  }

  return (
    <div className="card space-y-5 p-6">
      <p className="text-sm text-slate-brand">
        الخدمات التي تظهر للموظفين في بوابتهم لاختيارها عند تقديم خدمة للعميل.
      </p>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-navy-100 p-4">
        <div className="flex-1">
          <Field label="اسم الخدمة">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: صيانة مكيف مركزي" />
          </Field>
        </div>
        <div className="w-40">
          <Field label="السعر الافتراضي">
            <input className="input" type="number" dir="ltr" value={form.default_price} onChange={(e) => setForm({ ...form, default_price: e.target.value })} />
          </Field>
        </div>
        <button type="button" onClick={add} disabled={busy} className="btn-brand">
          {busy ? <Spinner className="w-4 h-4" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
          إضافة
        </button>
      </div>

      {services === null ? (
        <Loading />
      ) : services.length === 0 ? (
        <p className="py-6 text-center text-sm text-steel">لا توجد خدمات — أضف أول خدمة.</p>
      ) : (
        <div className="divide-y divide-navy-100">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <div>
                <span className="font-medium text-navy">{s.name}</span>
                {s.default_price > 0 && (
                  <span className="mr-2 text-sm text-steel">— {Number(s.default_price).toLocaleString("ar-SA")} ريال</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(s)}
                  aria-pressed={Boolean(s.active)}
                  aria-label={`${s.active ? "تعطيل" : "تفعيل"} خدمة ${s.name}`}
                  className={`badge ${s.active ? "bg-green-100 text-green-700" : "bg-navy-100 text-slate-brand"}`}
                >
                  {s.active ? "مفعّلة" : "معطّلة"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                  aria-label={`حذف خدمة ${s.name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SecuritySettings() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setMsg(null);
    if (form.next.length < 6) return setMsg({ type: "err", text: "كلمة المرور الجديدة قصيرة (6 أحرف على الأقل)" });
    if (form.next !== form.confirm) return setMsg({ type: "err", text: "كلمتا المرور غير متطابقتين" });
    setSaving(true);
    try {
      await api.post("/account/password", { current: form.current, next: form.next });
      setMsg({ type: "ok", text: "تم تغيير كلمة المرور بنجاح" });
      setForm({ current: "", next: "", confirm: "" });
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card max-w-md space-y-5 p-6">
      <h3 className="font-medium text-navy">تغيير كلمة المرور</h3>
      {msg && (
        <div
          role={msg.type === "ok" ? "status" : "alert"}
          className={`rounded-xl px-4 py-3 text-sm ${
            msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {msg.text}
        </div>
      )}
      <Field label="كلمة المرور الحالية">
        <input
          className="input"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          value={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.value })}
        />
      </Field>
      <Field label="كلمة المرور الجديدة">
        <input
          className="input"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          value={form.next}
          onChange={(e) => setForm({ ...form, next: e.target.value })}
        />
      </Field>
      <Field label="تأكيد كلمة المرور">
        <input
          className="input"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
      </Field>
      <button type="button" onClick={save} className="btn-brand w-full" disabled={saving}>
        {saving ? <Spinner className="w-5 h-5" /> : "حفظ"}
      </button>
    </div>
  );
}
