import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Save, ArrowRight, Building2 } from "lucide-react";
import { api } from "../lib/api";
import { formatMoney } from "../lib/format";
import { Field, Spinner } from "../components/ui";
import { Logo } from "../components/Logo";

interface Item {
  desc: string;
  qty: number;
  price: number;
}

const empty = { desc: "", qty: 1, price: 0 };

export default function DocumentEditor({ type }: { type: "invoice" | "quote" }) {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const base = type === "invoice" ? "invoices" : "quotes";

  const [company, setCompany] = useState<any>({});
  const [defaults, setDefaults] = useState<any>({ vat_rate: 15, currency_ar: "ريال" });
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<any>({
    number: "",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    client_name: "",
    client_vat: "",
    client_phone: "",
    client_address: "",
    payment_method: "cash",
    status: type === "invoice" ? "issued" : "draft",
    notes: "",
    discount: 0,
    vat_rate: 15,
    create_txn: type === "invoice",
    received_by_employee_id: "",
  });
  const [items, setItems] = useState<Item[]>([{ ...empty }]);

  useEffect(() => {
    (async () => {
      try {
        const [c, d, emp] = await Promise.all([
          api.get<{ value: any }>("/settings/company"),
          api.get<{ value: any }>("/settings/invoice_defaults"),
          api.get<{ employees: any[] }>("/employees"),
        ]);
        setCompany(c.value || {});
        setDefaults(d.value || {});
        setEmployees(emp.employees || []);

        if (editing) {
          const { document } = await api.get<{ document: any }>(`/documents/${id}`);
          setForm({
            number: document.number,
            issue_date: document.issue_date,
            due_date: document.due_date || "",
            client_name: document.client_name || "",
            client_vat: document.client_vat || "",
            client_phone: document.client_phone || "",
            client_address: document.client_address || "",
            payment_method: document.payment_method || "cash",
            status: document.status,
            notes: document.notes || "",
            discount: document.discount || 0,
            vat_rate: document.vat_rate ?? 15,
            create_txn: false,
            received_by_employee_id: "",
          });
          setItems(JSON.parse(document.items || "[]"));
        } else {
          const { number } = await api.get<{ number: string }>(`/documents/next-number?type=${type}`);
          setForm((f: any) => ({ ...f, number, vat_rate: d.value?.vat_rate ?? 15 }));
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
    const afterDiscount = Math.max(0, subtotal - Number(form.discount || 0));
    const vat = afterDiscount * (Number(form.vat_rate || 0) / 100);
    return { subtotal, vat, total: afterDiscount + vat };
  }, [items, form.discount, form.vat_rate]);

  const currency = defaults.currency_ar || "ريال";

  function setField(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }
  function setItem(i: number, k: keyof Item, v: any) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  }
  function addItem() {
    setItems((arr) => [...arr, { ...empty }]);
  }
  function removeItem(i: number) {
    setItems((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr));
  }

  async function save() {
    setError("");
    if (!form.client_name.trim()) {
      setError("أدخل اسم العميل");
      return;
    }
    if (items.every((it) => !it.desc.trim())) {
      setError("أضف بنداً واحداً على الأقل");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        doc_type: type,
        items: items.filter((it) => it.desc.trim()),
        received_by_employee_id: form.received_by_employee_id || null,
      };
      if (editing) {
        await api.put(`/documents/${id}`, payload);
        navigate(`/app/${base}/${id}`);
      } else {
        const res = await api.post<{ id: number }>("/documents", payload);
        navigate(`/app/${base}/${res.id}`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-24 text-brand">
        <Spinner className="w-8 h-8" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(`/app/${base}`)}
            className="mb-1 flex items-center gap-1 text-sm text-steel hover:text-brand"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
          <h1 className="text-2xl font-medium text-navy">
            {editing ? "تعديل" : "إنشاء"} {type === "invoice" ? "فاتورة" : "عرض سعر"}
          </h1>
        </div>
        <button onClick={save} className="btn-brand" disabled={saving}>
          {saving ? <Spinner className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          حفظ
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* الهيدر الثابت (بيانات الشركة) */}
      <div className="card border-navy bg-navy p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12" onDark />
            <div>
              <div className="text-lg font-medium">{company.name_ar || "مؤسسة أنسام"}</div>
              <div className="text-xs text-sky-soft/80">{company.activity}</div>
            </div>
          </div>
          <div className="hidden text-left text-xs text-sky-soft/80 sm:block">
            {company.phone && <div>هاتف: {company.phone}</div>}
            {company.vat_number && <div>الرقم الضريبي: {company.vat_number}</div>}
            {company.website && <div>{company.website}</div>}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-sky-soft/70">
          <Building2 className="w-3.5 h-3.5" />
          الهيدر الثابت يُدار من صفحة الإعدادات — لن تحتاج لإعادة إدخاله في كل مرة.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* التفاصيل */}
        <div className="space-y-6 lg:col-span-2">
          {/* المتغيرات: الرقم والتاريخ */}
          <div className="card p-5">
            <h3 className="mb-4 font-medium text-navy">بيانات المستند</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label={type === "invoice" ? "رقم الفاتورة" : "رقم العرض"}>
                <input
                  className="input"
                  dir="ltr"
                  value={form.number}
                  onChange={(e) => setField("number", e.target.value)}
                />
              </Field>
              <Field label="التاريخ">
                <input
                  type="date"
                  className="input"
                  value={form.issue_date}
                  onChange={(e) => setField("issue_date", e.target.value)}
                />
              </Field>
              <Field label="تاريخ الاستحقاق">
                <input
                  type="date"
                  className="input"
                  value={form.due_date}
                  onChange={(e) => setField("due_date", e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* بيانات العميل */}
          <div className="card p-5">
            <h3 className="mb-4 font-medium text-navy">بيانات العميل</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="اسم العميل">
                <input
                  className="input"
                  value={form.client_name}
                  onChange={(e) => setField("client_name", e.target.value)}
                  placeholder="اسم الشركة / العميل"
                />
              </Field>
              <Field label="الرقم الضريبي (اختياري)">
                <input
                  className="input"
                  dir="ltr"
                  value={form.client_vat}
                  onChange={(e) => setField("client_vat", e.target.value)}
                />
              </Field>
              <Field label="الجوال">
                <input
                  className="input"
                  dir="ltr"
                  value={form.client_phone}
                  onChange={(e) => setField("client_phone", e.target.value)}
                />
              </Field>
              <Field label="العنوان">
                <input
                  className="input"
                  value={form.client_address}
                  onChange={(e) => setField("client_address", e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* البنود */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-navy">البنود</h3>
              <button onClick={addItem} className="btn-ghost text-sm">
                <Plus className="w-4 h-4" />
                إضافة بند
              </button>
            </div>
            <div className="space-y-3">
              <div className="hidden grid-cols-12 gap-2 px-1 text-xs text-steel sm:grid">
                <div className="col-span-6">الوصف</div>
                <div className="col-span-2">الكمية</div>
                <div className="col-span-2">السعر</div>
                <div className="col-span-2">الإجمالي</div>
              </div>
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <input
                    className="input col-span-12 sm:col-span-6"
                    placeholder="وصف الخدمة / المنتج"
                    value={it.desc}
                    onChange={(e) => setItem(i, "desc", e.target.value)}
                  />
                  <input
                    className="input col-span-4 sm:col-span-2"
                    type="number"
                    min="0"
                    step="any"
                    value={it.qty}
                    onChange={(e) => setItem(i, "qty", e.target.value)}
                  />
                  <input
                    className="input col-span-4 sm:col-span-2"
                    type="number"
                    min="0"
                    step="any"
                    value={it.price}
                    onChange={(e) => setItem(i, "price", e.target.value)}
                  />
                  <div className="col-span-3 text-sm font-medium text-navy sm:col-span-1">
                    {(Number(it.qty || 0) * Number(it.price || 0)).toLocaleString("ar-SA")}
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    className="col-span-1 rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <Field label="ملاحظات">
              <textarea
                className="input min-h-[80px]"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="أي ملاحظات إضافية تظهر في المستند"
              />
            </Field>
          </div>
        </div>

        {/* الملخص والإعدادات */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-4 font-medium text-navy">الإجمالي</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-steel">المجموع الفرعي</span>
                <span className="font-medium text-navy">{formatMoney(totals.subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-steel">الخصم</span>
                <input
                  className="input w-28 py-1.5 text-left"
                  type="number"
                  min="0"
                  step="any"
                  value={form.discount}
                  onChange={(e) => setField("discount", e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-steel">الضريبة %</span>
                <input
                  className="input w-28 py-1.5 text-left"
                  type="number"
                  min="0"
                  step="any"
                  value={form.vat_rate}
                  onChange={(e) => setField("vat_rate", e.target.value)}
                />
              </div>
              <div className="flex justify-between border-t border-navy-100 pt-2">
                <span className="text-steel">قيمة الضريبة</span>
                <span className="font-medium text-navy">{formatMoney(totals.vat, currency)}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-navy p-3 text-white">
                <span className="font-medium">الإجمالي النهائي</span>
                <span className="font-medium">{formatMoney(totals.total, currency)}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-medium text-navy">الحالة والدفع</h3>
            <div className="space-y-4">
              <Field label="الحالة">
                <select
                  className="input"
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  <option value="draft">مسودة</option>
                  <option value="issued">صادرة</option>
                  {type === "invoice" && <option value="paid">مدفوعة</option>}
                  <option value="cancelled">ملغاة</option>
                </select>
              </Field>

              {type === "invoice" && (
                <>
                  <Field label="طريقة الدفع">
                    <select
                      className="input"
                      value={form.payment_method}
                      onChange={(e) => setField("payment_method", e.target.value)}
                    >
                      <option value="cash">نقدي</option>
                      <option value="transfer">حوالة</option>
                      <option value="pos">جهاز شبكة</option>
                    </select>
                  </Field>

                  {!editing && (
                    <label className="flex items-center gap-2 text-sm text-slate-brand">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-brand"
                        checked={form.create_txn}
                        onChange={(e) => setField("create_txn", e.target.checked)}
                      />
                      تسجيل قيد مالي (تحصيل) تلقائياً
                    </label>
                  )}

                  {/* الدفع النقدي => تحديد الموظف المستلم */}
                  {!editing && form.create_txn && form.payment_method === "cash" && (
                    <Field label="الموظف المستلم للنقد" hint="مطلوب للدفع النقدي لضبط العهدة">
                      <select
                        className="input"
                        value={form.received_by_employee_id}
                        onChange={(e) => setField("received_by_employee_id", e.target.value)}
                      >
                        <option value="">— اختر الموظف —</option>
                        {employees.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name} {e.emp_code ? `(${e.emp_code})` : ""}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </>
              )}
            </div>
          </div>

          <button onClick={save} className="btn-primary w-full py-3" disabled={saving}>
            {saving ? <Spinner className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            حفظ {type === "invoice" ? "الفاتورة" : "العرض"}
          </button>
        </div>
      </div>
    </div>
  );
}
