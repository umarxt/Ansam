import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Printer, Pencil, ArrowRight, Trash2, FileUp } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatMoney, formatDate, PAYMENT_LABELS, STATUS_LABELS, STATUS_COLORS } from "../lib/format";
import { Spinner } from "../components/ui";
import { Logo } from "../components/Logo";

export default function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [doc, setDoc] = useState<any>(null);
  const [company, setCompany] = useState<any>({});
  const [defaults, setDefaults] = useState<any>({ currency_ar: "ريال" });

  useEffect(() => {
    (async () => {
      const [d, c, def] = await Promise.all([
        api.get<{ document: any }>(`/documents/${id}`),
        api.get<{ value: any }>("/settings/company"),
        api.get<{ value: any }>("/settings/invoice_defaults"),
      ]);
      setDoc(d.document);
      setCompany(c.value || {});
      setDefaults(def.value || {});
    })();
  }, [id]);

  if (!doc)
    return (
      <div className="flex justify-center py-24 text-brand">
        <Spinner className="w-8 h-8" />
      </div>
    );

  const items = JSON.parse(doc.items || "[]");
  const currency = defaults.currency_ar || "ريال";
  const isInvoice = doc.doc_type === "invoice";
  const base = isInvoice ? "invoices" : "quotes";
  const docTitle = isInvoice ? "فاتورة ضريبية" : "عرض سعر";

  async function convert() {
    if (!confirm("تحويل عرض السعر إلى فاتورة؟")) return;
    const res = await api.post<{ id: number }>(`/documents/${id}/convert`);
    navigate(`/app/invoices/${res.id}`);
  }
  async function remove() {
    if (!confirm("حذف هذا المستند نهائياً؟")) return;
    await api.del(`/documents/${id}`);
    navigate(`/app/${base}`);
  }

  return (
    <div className="space-y-5">
      {/* شريط الإجراءات */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/app/${base}`)}
          className="flex items-center gap-1 text-sm text-steel hover:text-brand"
        >
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          رجوع للقائمة
        </button>
        <div className="flex flex-wrap gap-2">
          {!isInvoice && (
            <button type="button" onClick={convert} className="btn-ghost">
              <FileUp className="w-4 h-4" aria-hidden="true" />
              تحويل لفاتورة
            </button>
          )}
          <button type="button" onClick={() => navigate(`/app/${base}/${id}/edit`)} className="btn-ghost">
            <Pencil className="w-4 h-4" aria-hidden="true" />
            تعديل
          </button>
          {isAdmin && (
            <button type="button" onClick={remove} className="btn-danger">
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              حذف
            </button>
          )}
          <button type="button" onClick={() => window.print()} className="btn-primary">
            <Printer className="w-4 h-4" aria-hidden="true" />
            طباعة / PDF
          </button>
        </div>
      </div>

      {/* المستند القابل للطباعة */}
      <div className="print-area card mx-auto max-w-3xl overflow-hidden p-0">
        {/* رأس */}
        <div className="bg-navy-gradient p-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Logo className="h-16 w-16" onDark />
              <div>
                <div className="text-2xl font-medium">{company.name_ar || "مؤسسة أنسام"}</div>
                <div className="mt-1 max-w-xs text-xs text-sky-soft/80">{company.activity}</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-xl font-medium">{docTitle}</div>
              <div className="mt-1 text-sm text-sky-soft/90" dir="ltr">
                {doc.number}
              </div>
              <span className={`badge mt-2 ${STATUS_COLORS[doc.status]}`}>
                {STATUS_LABELS[doc.status]}
              </span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-1 text-xs text-sky-soft/80">
            {company.phone && <span>هاتف: {company.phone}</span>}
            {company.email && <span>{company.email}</span>}
            {company.vat_number && <span>الرقم الضريبي: {company.vat_number}</span>}
            {company.cr_number && <span>س.ت: {company.cr_number}</span>}
          </div>
        </div>

        <div className="p-8">
          {/* بيانات العميل والتواريخ */}
          <div className="grid grid-cols-2 gap-6 border-b border-navy-100 pb-6">
            <div>
              <div className="mb-2 text-xs font-medium text-steel">فاتورة إلى</div>
              <div className="font-medium text-navy">{doc.client_name}</div>
              {doc.client_address && <div className="text-sm text-slate-brand">{doc.client_address}</div>}
              {doc.client_phone && (
                <div className="text-sm text-slate-brand" dir="ltr">
                  {doc.client_phone}
                </div>
              )}
              {doc.client_vat && (
                <div className="text-sm text-slate-brand">الرقم الضريبي: {doc.client_vat}</div>
              )}
            </div>
            <div className="text-left">
              <div className="mb-1 text-sm">
                <span className="text-steel">التاريخ: </span>
                <span className="font-medium text-navy">{formatDate(doc.issue_date)}</span>
              </div>
              {doc.due_date && (
                <div className="mb-1 text-sm">
                  <span className="text-steel">الاستحقاق: </span>
                  <span className="font-medium text-navy">{formatDate(doc.due_date)}</span>
                </div>
              )}
              {isInvoice && doc.payment_method && (
                <div className="text-sm">
                  <span className="text-steel">طريقة الدفع: </span>
                  <span className="font-medium text-navy">{PAYMENT_LABELS[doc.payment_method]}</span>
                </div>
              )}
            </div>
          </div>

          {/* البنود */}
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="bg-navy-50 text-right text-xs text-slate-brand">
                <th className="rounded-r-lg px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">الوصف</th>
                <th className="px-3 py-2 font-medium">الكمية</th>
                <th className="px-3 py-2 font-medium">السعر</th>
                <th className="rounded-l-lg px-3 py-2 font-medium">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any, i: number) => (
                <tr key={i} className="border-b border-navy-100/60">
                  <td className="px-3 py-3 text-steel">{i + 1}</td>
                  <td className="px-3 py-3 text-navy">{it.desc}</td>
                  <td className="px-3 py-3 text-slate-brand">{it.qty}</td>
                  <td className="px-3 py-3 text-slate-brand">{formatMoney(it.price, currency)}</td>
                  <td className="px-3 py-3 font-medium text-navy">
                    {formatMoney(Number(it.qty) * Number(it.price), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* الإجماليات */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-steel">المجموع الفرعي</span>
                <span className="text-navy">{formatMoney(doc.subtotal, currency)}</span>
              </div>
              {doc.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-steel">الخصم</span>
                  <span className="text-navy">- {formatMoney(doc.discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-steel">الضريبة ({doc.vat_rate}%)</span>
                <span className="text-navy">{formatMoney(doc.vat_amount, currency)}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-navy px-4 py-3 text-white">
                <span className="font-medium">الإجمالي</span>
                <span className="font-medium">{formatMoney(doc.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* ملاحظات وشروط */}
          {(doc.notes || defaults.terms || company.iban) && (
            <div className="mt-8 space-y-3 border-t border-navy-100 pt-6 text-xs text-slate-brand">
              {doc.notes && (
                <div>
                  <span className="font-medium text-navy">ملاحظات: </span>
                  {doc.notes}
                </div>
              )}
              {defaults.terms && (
                <div>
                  <span className="font-medium text-navy">الشروط: </span>
                  {defaults.terms}
                </div>
              )}
              {company.iban && (
                <div dir="ltr" className="text-right">
                  <span className="font-medium text-navy">IBAN: </span>
                  {company.iban} {company.bank_name ? `— ${company.bank_name}` : ""}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center text-sm font-medium text-brand">
            {defaults.footer || "شكراً لتعاملكم مع أنسام"}
          </div>
        </div>
      </div>
    </div>
  );
}
