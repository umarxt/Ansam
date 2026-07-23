import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserCog, ShieldCheck, KeyRound } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate } from "../lib/format";
import { Modal, Field, Spinner, EmptyState } from "../components/ui";

interface Emp {
  id: number;
  name: string;
  username: string;
  emp_code: string | null;
  role: string;
  phone: string | null;
  active: number;
  created_at: string;
}

export default function Employees() {
  const { user } = useAuth();
  const [list, setList] = useState<Emp[] | null>(null);
  const [modal, setModal] = useState<{ open: boolean; emp?: Emp }>({ open: false });

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
          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy">
            <UserCog className="h-6 w-6 text-brand" />
            الموظفون
          </h1>
          <p className="text-sm text-steel">إضافة الموظفين وتعيين كلمات المرور والرموز والصلاحيات</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-brand">
          <Plus className="w-5 h-5" />
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
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
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
                          onClick={() => setModal({ open: true, emp: e })}
                          className="rounded-lg p-2 text-slate-brand hover:bg-navy-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {e.id !== user?.id && (
                          <button
                            onClick={() => remove(e.id)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
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
  });
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
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
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
              <KeyRound className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
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
          <button onClick={onClose} className="btn-ghost">
            إلغاء
          </button>
          <button onClick={save} className="btn-brand" disabled={saving}>
            {saving ? <Spinner className="w-5 h-5" /> : "حفظ"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
