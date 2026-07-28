import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  ClipboardList,
  Camera,
  LogOut,
  ArrowRight,
  Send,
  Trash2,
  CheckCircle2,
  History,
  KeyRound,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Logo } from "../components/Logo";
import { Spinner, Field, EmptyState } from "../components/ui";
import { formatMoney, formatDate } from "../lib/format";

// ضغط الصور قبل الرفع
function compress(file: File, max = 1200, quality = 0.7): Promise<string> {
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

export default function Portal() {
  const { user, loading, refresh, logout, can } = useAuth();
  const [view, setView] = useState<"home" | "tools" | "service" | "history">("home");

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-brand">
        <Spinner className="w-8 h-8" />
      </div>
    );

  if (!user) return <PortalLogin onDone={refresh} />;

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy-gradient text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" onDark />
            <div>
              <div className="text-lg font-bold leading-none">بوابة الموظف</div>
              <div className="text-[11px] text-sky-soft/80 mt-1">
                {user.name} {user.emp_code ? `· ${user.emp_code}` : ""}
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">
        {view !== "home" && (
          <button
            onClick={() => setView("home")}
            className="mb-4 flex items-center gap-1 text-sm text-steel hover:text-brand"
          >
            <ArrowRight className="w-4 h-4" /> الرئيسية
          </button>
        )}

        {view === "home" && (
          <>
            <h1 className="mb-1 text-2xl font-bold text-navy">مرحباً {user.name.split(" ")[0]} 👋</h1>
            <p className="mb-6 text-sm text-steel">اختر الإجراء المطلوب</p>
            <div className="grid grid-cols-2 gap-4">
              {can("tools") && (
                <PortalTile icon={Wrench} label="أدواتي" sub="العُدد المسندة إليك" onClick={() => setView("tools")} />
              )}
              {can("services") && (
                <PortalTile
                  icon={Camera}
                  label="تقديم خدمة"
                  sub="اختر الخدمة وصوّرها"
                  onClick={() => setView("service")}
                  primary
                />
              )}
              <PortalTile icon={History} label="سجل طلباتي" sub="الطلبات السابقة" onClick={() => setView("history")} />
            </div>
            {!can("tools") && !can("services") && (
              <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                لم تُسند إليك صلاحيات بعد. تواصل مع الإدارة.
              </div>
            )}
          </>
        )}

        {view === "tools" && <ToolsView />}
        {view === "service" && <ServiceForm onSubmitted={() => setView("history")} />}
        {view === "history" && <HistoryView />}
      </main>

      <footer className="pb-8 pt-4 text-center text-xs text-steel">
        <Link to="/" className="hover:text-brand">
          الموقع الرسمي لأنسام
        </Link>
      </footer>
    </div>
  );
}

function PortalTile({ icon: Icon, label, sub, onClick, primary }: any) {
  return (
    <button
      onClick={onClick}
      className={`card flex flex-col items-start gap-3 p-5 text-right transition hover:-translate-y-0.5 hover:shadow-glow ${
        primary ? "bg-navy text-white" : ""
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          primary ? "bg-white/15 text-white" : "bg-brand/10 text-brand"
        }`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <div className={`font-bold ${primary ? "text-white" : "text-navy"}`}>{label}</div>
        <div className={`text-xs ${primary ? "text-sky-soft/80" : "text-steel"}`}>{sub}</div>
      </div>
    </button>
  );
}

/* ---------- تسجيل دخول البوابة (اسم + رمز) ---------- */
function PortalLogin({ onDone }: { onDone: () => Promise<void> }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<{ employees: any[] }>("/portal/employees").then((r) => setEmployees(r.employees)).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!employeeId) return setError("اختر اسمك");
    if (!code) return setError("أدخل الرمز");
    setBusy(true);
    try {
      await api.post("/portal/login", { employee_id: Number(employeeId), code });
      await onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-gradient px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <Logo variant="stacked" onDark className="h-24 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white">بوابة الموظف</h1>
          <p className="mt-1 text-sm text-sky-soft/80">اختر اسمك وأدخل الرمز الخاص بك</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <Field label="الاسم">
            <select className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">— اختر اسمك —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الرمز">
            <div className="relative">
              <KeyRound className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
              <input
                className="input pr-10"
                dir="ltr"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="الرمز"
              />
            </div>
          </Field>
          <button type="submit" className="btn-brand w-full py-3" disabled={busy}>
            {busy ? <Spinner className="w-5 h-5" /> : "دخول"}
          </button>
        </form>
        <Link to="/" className="mt-5 flex items-center justify-center gap-1 text-sm text-sky-soft/80 hover:text-white">
          الموقع الرسمي
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

/* ---------- الأدوات ---------- */
function ToolsView() {
  const [tools, setTools] = useState<any[] | null>(null);
  useEffect(() => {
    api.get<{ tools: any[] }>("/portal/tools").then((r) => setTools(r.tools)).catch(() => setTools([]));
  }, []);

  if (tools === null)
    return (
      <div className="flex justify-center py-16 text-brand">
        <Spinner className="w-7 h-7" />
      </div>
    );
  if (tools.length === 0)
    return (
      <div className="card">
        <EmptyState icon={<Wrench className="h-12 w-12" />} title="لا توجد أدوات مسندة إليك" />
      </div>
    );

  const kits: Record<string, any[]> = {};
  for (const t of tools) (kits[t.kit_name || "العدة"] ||= []).push(t);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-navy">أدواتي</h1>
      {Object.entries(kits).map(([kit, items]) => (
        <div key={kit}>
          <h3 className="mb-3 font-bold text-slate-brand">{kit}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((t) => (
              <div key={t.id} className="card overflow-hidden">
                {t.image ? (
                  <img src={t.image} alt="" className="h-28 w-full object-cover" />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-navy-50 text-steel">
                    <Wrench className="h-8 w-8" />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-sm font-medium text-navy">{t.name}</div>
                  <div className="text-xs text-steel">الكمية: {t.qty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- تقديم خدمة ---------- */
function ServiceForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    service_id: "",
    service_name: "",
    amount: "",
    client_name: "",
    client_phone: "",
    client_address: "",
    description: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get<{ services: any[] }>("/portal/services").then((r) => setServices(r.services)).catch(() => {});
  }, []);

  function pickService(id: string) {
    const s = services.find((x) => String(x.id) === id);
    setForm((f: any) => ({
      ...f,
      service_id: id,
      service_name: s?.name || "",
      amount: s?.default_price ? String(s.default_price) : f.amount,
    }));
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const f of files.slice(0, 6)) {
      try {
        const d = await compress(f);
        setPhotos((p) => (p.length < 6 ? [...p, d] : p));
      } catch {
        /* تجاهل */
      }
    }
    e.target.value = "";
  }

  async function submit() {
    setError("");
    if (!form.service_name) return setError("اختر الخدمة");
    setBusy(true);
    try {
      await api.post("/portal/jobs", { ...form, amount: Number(form.amount || 0), photos });
      setDone(true);
      setTimeout(onSubmitted, 1400);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="card flex flex-col items-center gap-3 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-600" />
        <div className="text-lg font-bold text-navy">تم إرسال الطلب بنجاح</div>
        <p className="text-sm text-steel">سيصل الطلب للإدارة للمراجعة والتأكيد.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-navy">تقديم خدمة للعميل</h1>
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="card space-y-4 p-5">
        <Field label="الخدمة المقدمة">
          <select className="input" value={form.service_id} onChange={(e) => pickService(e.target.value)}>
            <option value="">— اختر الخدمة —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        {services.length === 0 && (
          <p className="text-xs text-amber-600">لا توجد خدمات معرّفة بعد — تواصل مع الإدارة لإضافتها.</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="اسم العميل">
            <input className="input" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
          </Field>
          <Field label="جوال العميل">
            <input className="input" dir="ltr" value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} />
          </Field>
        </div>
        <Field label="العنوان">
          <input className="input" value={form.client_address} onChange={(e) => setForm({ ...form, client_address: e.target.value })} />
        </Field>
        <Field label="المبلغ (اختياري)">
          <input className="input" type="number" dir="ltr" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </Field>
        <Field label="ملاحظات">
          <textarea className="input min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
      </div>

      {/* الصور */}
      <div className="card p-5">
        <label className="label">صور الخدمة</label>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              <img src={p} alt="" className="h-24 w-full rounded-xl object-cover" />
              <button
                onClick={() => setPhotos((arr) => arr.filter((_, idx) => idx !== i))}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-navy-100 text-steel hover:border-brand hover:text-brand">
              <Camera className="h-6 w-6" />
              <span className="text-xs">إضافة صورة</span>
              <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={onFiles} />
            </label>
          )}
        </div>
      </div>

      <button onClick={submit} disabled={busy} className="btn-brand w-full py-3">
        {busy ? <Spinner className="w-5 h-5" /> : <Send className="w-5 h-5" />}
        إرسال الطلب للإدارة
      </button>
    </div>
  );
}

/* ---------- سجل الطلبات ---------- */
const JOB_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "بانتظار التأكيد", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "مؤكّد", cls: "bg-green-100 text-green-700" },
  rejected: { label: "مرفوض", cls: "bg-red-100 text-red-600" },
};
function HistoryView() {
  const [jobs, setJobs] = useState<any[] | null>(null);
  useEffect(() => {
    api.get<{ jobs: any[] }>("/portal/jobs").then((r) => setJobs(r.jobs)).catch(() => setJobs([]));
  }, []);
  if (jobs === null)
    return (
      <div className="flex justify-center py-16 text-brand">
        <Spinner className="w-7 h-7" />
      </div>
    );
  if (jobs.length === 0)
    return (
      <div className="card">
        <EmptyState icon={<History className="h-12 w-12" />} title="لا توجد طلبات سابقة" />
      </div>
    );
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-navy">سجل طلباتي</h1>
      {jobs.map((j) => (
        <div key={j.id} className="card flex items-center justify-between p-4">
          <div>
            <div className="font-medium text-navy">{j.service_name || "خدمة"}</div>
            <div className="text-xs text-steel">
              {j.client_name || "-"} · {formatDate(j.created_at)}
            </div>
          </div>
          <div className="text-left">
            <div className="font-semibold text-navy">{formatMoney(j.amount)}</div>
            <span className={`badge ${JOB_STATUS[j.status]?.cls || ""}`}>{JOB_STATUS[j.status]?.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
