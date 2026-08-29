import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserCog, ShieldCheck, KeyRound, Wrench, Camera, Image as ImageIcon } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate } from "../lib/format";
import { Modal, Field, Spinner, EmptyState } from "../components/ui";

const PERMISSIONS: { key: string; label: string; desc: string }[] = [
  { key: "invoicing", label: "الفوترة وعروض الأسعار", desc: "إنشاء وإصدار الفواتير والعروض" },
  { key: "finance", label: "المالية", desc: "الاطلاع على اللوحة المالية والحركات" },
  { key: "tools", label: "لديه عدة / أدوات", desc: "تظهر له أدواته في بوابة الموظف" },
  { key: "services", label: "تقديم الخدمات", desc: "يقدّم الخدمات ويصوّرها من بوابة الموظف" },
];

// ضغط صورة الأداة
function compressImg(file: File, max = 900, quality = 0.7): Promise<string> {
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

interface Emp {
  id: number;
  name: string;
  username: string;
  emp_code: string | null;
  role: string;
  phone: string | null;
  active: number;
  permissions?: string[];
  created_at: string;
}

export default function Employees() {
  const { user } = useAuth();
  const [list, setList] = useState<Emp[] | null>(null);
  const [modal, setModal] = useState<{ open: boolean; emp?: Emp }>({ open: false });
  const [toolsFor, setToolsFor] = useState<Emp | null>(null);

  async function load() {
    const res = await api.get<{ employees: Emp[] }>("/employees");
    setList(res.employees);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(id: number) {
    if (!confirm("حذف هذا الموظف؟")) return;
    try {
      await api.del(`/employees/${id}`);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-medium text-navy">
            <UserCog className="h-6 w-6 text-brand" aria-hidden="true" />
            الموظفون
          </h1>
          <p className="text-sm text-slate-brand">إضافة الموظفين وتعيين كلمات المرور والرموز والصلاحيات</p>
        </div>
        <button type="button" onClick={() => setModal({ open: true })} className="btn-brand">
          <Plus className="w-5 h-5" aria-hidden="true" />
          موظف جديد
        </button>
      </div>

      <div className="card overflow-hidden">
        {list === null ? (
          <div className="flex justify-center py-16 text-brand">
            <Spinner className="w-7 h-7" />
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={<UserCog className="h-12 w-12" />} title="لا يوجد موظفون" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-50/50 text-right text-xs text-steel">
                <tr>
                  <th className="px-5 py-3 font-medium">الاسم</th>
                  <th className="px-5 py-3 font-medium">اسم الدخول</th>
                  <th className="px-5 py-3 font-medium">الرمز</th>
                  <th className="px-5 py-3 font-medium">الصلاحية</th>
                  <th className="px-5 py-3 font-medium">الحالة</th>
                  <th className="px-5 py-3 font-medium">أُضيف</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100/60">
                {list.map((e) => (
                  <tr key={e.id} className="hover:bg-navy-50/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-medium text-brand">
                          {e.name.charAt(0)}
                        </span>
                        <span className="font-medium text-navy">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-brand" dir="ltr">
                      {e.username}
                    </td>
                    <td className="px-5 py-3">
                      {e.emp_code ? (
                        <span className="badge bg-navy-100 text-navy-700" dir="ltr">
                          {e.emp_code}
                        </span>
                      ) : (
                        <span className="text-steel">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {e.role === "admin" ? (
                        <span className="badge bg-brand/10 text-brand">
                          <ShieldCheck className="w-3 h-3" /> مدير
                        </span>
                      ) : (
                        <span className="badge bg-navy-50 text-slate-brand">موظف</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`badge ${
                          e.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {e.active ? "نشط" : "معطّل"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-steel">{formatDate(e.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setToolsFor(e)}
                          className="rounded-lg p-2 text-brand hover:bg-brand/10"
                          title="أدوات / عدة الموظف"
                          aria-label={`أدوات وعدة ${e.name}`}
                        >
                          <Wrench className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ open: true, emp: e })}
                          className="rounded-lg p-2 text-slate-brand hover:bg-navy-50"
                          aria-label={`تعديل ${e.name}`}
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        {e.id !== user?.id && (
                          <button
                            type="button"
                            onClick={() => remove(e.id)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            aria-label={`حذف ${e.name}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <EmployeeModal emp={modal.emp} onClose={() => setModal({ open: false })} onSaved={load} />
      )}
      {toolsFor && <ToolsManager emp={toolsFor} onClose={() => setToolsFor(null)} />}
    </div>
  );
}

function ToolsManager({ emp, onClose }: { emp: Emp; onClose: () => void }) {
  const [tools, setTools] = useState<any[] | null>(null);
  const [form, setForm] = useState({ kit_name: "العدة", name: "", qty: 1, image: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await api.get<{ tools: any[] }>(`/tools?employee_id=${emp.id}`);
    setTools(r.tools);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      const d = await compressImg(f);
      setForm((s) => ({ ...s, image: d }));
    }
    e.target.value = "";
  }
  async function add() {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      await api.post("/tools", { ...form, employee_id: emp.id, qty: Number(form.qty || 1) });
      setForm({ kit_name: form.kit_name, name: "", qty: 1, image: "" });
      load();
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    await api.del(`/tools/${id}`);
    load();
  }

  return (
    <Modal open onClose={onClose} title={`أدوات / عدة — ${emp.name}`} wide>
      <div className="space-y-5">
        <div className="rounded-xl border border-navy-100 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="اسم العدة">
              <input className="input" value={form.kit_name} onChange={(e) => setForm({ ...form, kit_name: e.target.value })} />
            </Field>
            <Field label="اسم الأداة">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="الكمية">
              <input className="input" type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
            </Field>
            <div>
              <label className="label">صورة الأداة</label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-navy-100 px-4 py-2.5 text-sm text-slate-brand hover:border-brand">
                <Camera className="h-4 w-4" aria-hidden="true" />
                {form.image ? "تم اختيار صورة" : "اختر صورة"}
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
            </div>
          </div>
          {form.image && <img src={form.image} alt="معاينة صورة الأداة" className="mt-3 h-20 rounded-lg object-cover" />}
          <div className="mt-3 text-left">
            <button type="button" onClick={add} disabled={busy} className="btn-brand">
              {busy ? <Spinner className="w-4 h-4" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
              إضافة أداة
            </button>
          </div>
        </div>

        {tools === null ? (
          <div className="flex justify-center py-8 text-brand">
            <Spinner className="w-6 h-6" />
          </div>
        ) : tools.length === 0 ? (
          <p className="py-6 text-center text-sm text-steel">لا توجد أدوات مسندة لهذا الموظف</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tools.map((t) => (
              <div key={t.id} className="card overflow-hidden">
                {t.image ? (
                  <img src={t.image} alt={t.name || "أداة"} className="h-24 w-full object-cover" />
                ) : (
                  <div className="flex h-24 items-center justify-center bg-navy-50 text-steel">
                    <ImageIcon className="h-7 w-7" aria-hidden="true" />
                  </div>
                )}
                <div className="flex items-center justify-between p-2">
                  <div>
                    <div className="text-sm font-medium text-navy">{t.name}</div>
                    <div className="text-[11px] text-steel">
                      {t.kit_name} · ×{t.qty}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    aria-label={`حذف الأداة ${t.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function EmployeeModal({
  emp,
  onClose,
  onSaved,
}: {
  emp?: Emp;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = Boolean(emp);
  const [form, setForm] = useState({
    name: emp?.name || "",
    username: emp?.username || "",
    password: "",
    emp_code: emp?.emp_code || "",
    role: emp?.role || "employee",
    phone: emp?.phone || "",
    active: emp ? Boolean(emp.active) : true,
    permissions: (emp?.permissions as string[]) || [],
  });

  function togglePerm(key: string) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((p) => p !== key)
        : [...f.permissions, key],
    }));
  }
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setError("");
    if (!form.name.trim() || !form.username.trim()) return setError("الاسم واسم الدخول مطلوبان");
    if (!editing && !form.password) return setError("أدخل كلمة المرور");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/employees/${emp!.id}`, {
          ...form,
          password: form.password || undefined,
        });
      } else {
        await api.post("/employees", form);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={editing ? "تعديل الموظف" : "إضافة موظف"}>
      <div className="space-y-4">
        {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="الاسم">
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="اسم الدخول">
            <input
              className="input"
              dir="ltr"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              disabled={editing}
            />
          </Field>
          <Field label={editing ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}>
            <div className="relative">
              <KeyRound className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" aria-hidden="true" />
              <input
                className="input pr-10"
                dir="ltr"
                type="text"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={editing ? "اتركها فارغة لعدم التغيير" : "••••••"}
              />
            </div>
          </Field>
          <Field label="رمز الموظف">
            <input
              className="input"
              dir="ltr"
              value={form.emp_code}
              onChange={(e) => set("emp_code", e.target.value)}
              placeholder="EMP-002"
            />
          </Field>
          <Field label="الجوال">
            <input className="input" dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="الصلاحية">
            <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="employee">موظف</option>
              <option value="admin">مدير</option>
            </select>
          </Field>
        </div>
        {/* الصلاحيات */}
        <div>
          <label className="label">الصلاحيات</label>
          {form.role === "admin" ? (
            <div className="rounded-xl bg-brand/5 px-4 py-3 text-sm text-brand">
              المدير يملك جميع الصلاحيات تلقائياً.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PERMISSIONS.map((p) => (
                <label
                  key={p.key}
                  className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 transition ${
                    form.permissions.includes(p.key)
                      ? "border-brand bg-brand/5"
                      : "border-navy-100 hover:border-navy-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-brand"
                    checked={form.permissions.includes(p.key)}
                    onChange={() => togglePerm(p.key)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-navy">{p.label}</span>
                    <span className="block text-xs text-steel">{p.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-brand">
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
          />
          حساب نشط
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            إلغاء
          </button>
          <button type="button" onClick={save} className="btn-brand" disabled={saving}>
            {saving ? <Spinner className="w-5 h-5" /> : "حفظ"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
