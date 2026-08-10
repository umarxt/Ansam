import { useEffect, useState } from "react";
import { Plus, Banknote, ArrowLeftRight, CreditCard, Trash2, Filter, Users } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatMoney, formatDate, PAYMENT_LABELS } from "../lib/format";
import { Modal, Field, Spinner, EmptyState } from "../components/ui";

const METHOD_ICONS: Record<string, any> = { cash: Banknote, transfer: ArrowLeftRight, pos: CreditCard };
const METHOD_COLORS: Record<string, string> = {
  cash: "text-brand bg-brand/10",
  transfer: "text-navy bg-navy-100",
  pos: "text-slate-brand bg-steel/20",
};

export default function Finance() {
  const { isAdmin } = useAuth();
  const [txns, setTxns] = useState<any[] | null>(null);
  const [summary, setSummary] = useState<any>({ byMethod: [], cashByEmployee: [] });
  const [employees, setEmployees] = useState<any[]>([]);
  const [filters, setFilters] = useState({ method: "", employee_id: "", from: "", to: "" });
  const [modal, setModal] = useState(false);

  async function load() {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v) as [string, string][]
    ).toString();
    const [t, s] = await Promise.all([
      api.get<{ transactions: any[] }>(`/finance${qs ? `?${qs}` : ""}`),
      api.get<any>("/finance/summary"),
    ]);
    setTxns(t.transactions);
    setSummary(s);
  }

  useEffect(() => {
    api.get<{ employees: any[] }>("/employees").then((e) => setEmployees(e.employees));
  }, []);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const methodTotals: Record<string, { income: number; expense: number }> = {};
  for (const m of summary.byMethod || []) {
    methodTotals[m.payment_method] = { income: Number(m.income || 0), expense: Number(m.expense || 0) };
  }
  const totalIncome = Object.values(methodTotals).reduce((s, m) => s + m.income, 0);
  const totalExpense = Object.values(methodTotals).reduce((s, m) => s + m.expense, 0);

  async function remove(id: number) {
    if (!confirm("حذف هذه الحركة؟")) return;
    await api.del(`/finance/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-navy">المالية</h1>
          <p className="text-sm text-steel">إدارة الإيرادات والمصروفات وطرق الدفع</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-brand">
          <Plus className="w-5 h-5" />
          حركة جديدة
        </button>
      </div>

      {/* ملخص طرق الدفع */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="text-sm text-steel">صافي الرصيد</div>
          <div className="mt-1 text-2xl font-medium text-navy">{formatMoney(totalIncome - totalExpense)}</div>
          <div className="mt-2 flex gap-3 text-xs">
            <span className="text-green-600">وارد {formatMoney(totalIncome)}</span>
            <span className="text-red-500">صادر {formatMoney(totalExpense)}</span>
          </div>
        </div>
        {(["cash", "transfer", "pos"] as const).map((m) => {
          const Icon = METHOD_ICONS[m];
          const val = methodTotals[m] || { income: 0, expense: 0 };
          return (
            <div key={m} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-steel">{PAYMENT_LABELS[m]}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${METHOD_COLORS[m]}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-xl font-medium text-navy">{formatMoney(val.income - val.expense)}</div>
            </div>
          );
        })}
      </div>

      {/* عهدة النقدي حسب الموظف */}
      {summary.cashByEmployee?.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-medium text-navy">
            <Users className="h-5 w-5 text-brand" />
            النقدي المُحصّل حسب الموظف
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.cashByEmployee.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl bg-navy-50/60 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-medium text-navy">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-medium text-white">
                    {e.name?.charAt(0)}
                  </span>
                  {e.name}
                </span>
                <span className="font-medium text-brand">{formatMoney(e.collected)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الفلاتر */}
      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-1 text-sm font-medium text-slate-brand">
            <Filter className="h-4 w-4" /> تصفية:
          </div>
          <select
            className="input w-auto"
            value={filters.method}
            onChange={(e) => setFilters({ ...filters, method: e.target.value })}
          >
            <option value="">كل الطرق</option>
            <option value="cash">نقدي</option>
            <option value="transfer">حوالة</option>
            <option value="pos">جهاز شبكة</option>
          </select>
          <select
            className="input w-auto"
            value={filters.employee_id}
            onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
          >
            <option value="">كل الموظفين</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="input w-auto"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
          <input
            type="date"
            className="input w-auto"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
          {(filters.method || filters.employee_id || filters.from || filters.to) && (
            <button
              onClick={() => setFilters({ method: "", employee_id: "", from: "", to: "" })}
              className="text-sm text-brand hover:underline"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* الجدول */}
      <div className="card overflow-hidden">
        {txns === null ? (
          <div className="flex justify-center py-16 text-brand">
            <Spinner className="w-7 h-7" />
          </div>
        ) : txns.length === 0 ? (
          <EmptyState icon={<Banknote className="h-12 w-12" />} title="لا توجد حركات مالية" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-50/50 text-right text-xs text-steel">
                <tr>
                  <th className="px-5 py-3 font-medium">التاريخ</th>
                  <th className="px-5 py-3 font-medium">البيان</th>
                  <th className="px-5 py-3 font-medium">النوع</th>
                  <th className="px-5 py-3 font-medium">الطريقة</th>
                  <th className="px-5 py-3 font-medium">الموظف</th>
                  <th className="px-5 py-3 font-medium">المبلغ</th>
                  {isAdmin && <th className="px-5 py-3 font-medium"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100/60">
                {txns.map((t) => (
                  <tr key={t.id} className="hover:bg-navy-50/30">
                    <td className="px-5 py-3 text-steel">{formatDate(t.txn_date)}</td>
                    <td className="px-5 py-3 text-navy">
                      {t.description || "-"}
                      {t.document_number && (
                        <span className="mr-1 text-xs text-brand" dir="ltr">
                          {" "}
                          {t.document_number}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`badge ${
                          t.txn_type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {t.txn_type === "income" ? "وارد" : "صادر"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-brand">{PAYMENT_LABELS[t.payment_method]}</td>
                    <td className="px-5 py-3 text-slate-brand">{t.employee_name || "-"}</td>
                    <td
                      className={`px-5 py-3 font-medium ${
                        t.txn_type === "income" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {t.txn_type === "income" ? "+" : "-"} {formatMoney(t.amount)}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3">
                        <button onClick={() => remove(t.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <TxnModal employees={employees} onClose={() => setModal(false)} onSaved={load} />}
    </div>
  );
}

function TxnModal({
  employees,
  onClose,
  onSaved,
}: {
  employees: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    txn_date: new Date().toISOString().slice(0, 10),
    txn_type: "income",
    amount: "",
    payment_method: "cash",
    description: "",
    category: "",
    employee_id: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setError("");
    if (!form.amount) return setError("أدخل المبلغ");
    if (form.payment_method === "cash" && !form.employee_id)
      return setError("الدفع النقدي يتطلب تحديد الموظف المستلم");
    setSaving(true);
    try {
      await api.post("/finance", { ...form, employee_id: form.employee_id || null });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="حركة مالية جديدة">
      <div className="space-y-4">
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <Field label="النوع">
            <select className="input" value={form.txn_type} onChange={(e) => set("txn_type", e.target.value)}>
              <option value="income">وارد (إيراد)</option>
              <option value="expense">صادر (مصروف)</option>
            </select>
          </Field>
          <Field label="التاريخ">
            <input type="date" className="input" value={form.txn_date} onChange={(e) => set("txn_date", e.target.value)} />
          </Field>
          <Field label="المبلغ">
            <input
              type="number"
              step="any"
              min="0"
              className="input"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
          </Field>
          <Field label="طريقة الدفع">
            <select
              className="input"
              value={form.payment_method}
              onChange={(e) => set("payment_method", e.target.value)}
            >
              <option value="cash">نقدي</option>
              <option value="transfer">حوالة</option>
              <option value="pos">جهاز شبكة</option>
            </select>
          </Field>
        </div>

        {form.payment_method === "cash" && (
          <Field label="الموظف المستلم" hint="مطلوب للدفع النقدي">
            <select className="input" value={form.employee_id} onChange={(e) => set("employee_id", e.target.value)}>
              <option value="">— اختر الموظف —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} {e.emp_code ? `(${e.emp_code})` : ""}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="البيان">
          <input className="input" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

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
