import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText, FileSpreadsheet, Eye, Pencil } from "lucide-react";
import { api } from "../lib/api";
import { formatMoney, formatDate, STATUS_COLORS, STATUS_LABELS, PAYMENT_LABELS } from "../lib/format";
import { EmptyState, Spinner } from "../components/ui";

interface Doc {
  id: number;
  doc_type: string;
  number: string;
  issue_date: string;
  client_name: string;
  total: number;
  status: string;
  payment_method?: string;
  created_by_name?: string;
}

export default function Documents({ type }: { type: "invoice" | "quote" }) {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [q, setQ] = useState("");
  const base = type === "invoice" ? "invoices" : "quotes";
  const title = type === "invoice" ? "الفوترة" : "عروض الأسعار";
  const Icon = type === "invoice" ? FileText : FileSpreadsheet;

  async function load() {
    setDocs(null);
    const res = await api.get<{ documents: Doc[] }>(
      `/documents?type=${type}${q ? `&q=${encodeURIComponent(q)}` : ""}`
    );
    setDocs(res.documents);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-medium text-navy">
            <Icon className="h-6 w-6 text-brand" />
            {title}
          </h1>
          <p className="text-sm text-steel">
            {type === "invoice"
              ? "إصدار الفواتير مباشرة والاطلاع على السجل الكامل"
              : "إنشاء عروض الأسعار وتحويلها إلى فواتير"}
          </p>
        </div>
        <Link to={`/app/${base}/new`} className="btn-brand">
          <Plus className="w-5 h-5" />
          {type === "invoice" ? "فاتورة جديدة" : "عرض سعر جديد"}
        </Link>
      </div>

      <div className="card p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="relative"
        >
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-steel" />
          <input
            className="input pr-11"
            placeholder="بحث بالرقم أو اسم العميل..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
      </div>

      <div className="card overflow-hidden">
        {docs === null ? (
          <div className="flex justify-center py-16 text-brand">
            <Spinner className="w-7 h-7" />
          </div>
        ) : docs.length === 0 ? (
          <EmptyState
            icon={<Icon className="h-12 w-12" />}
            title="لا توجد مستندات"
            sub="ابدأ بإنشاء أول مستند"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-50/50 text-right text-xs text-steel">
                <tr>
                  <th className="px-5 py-3 font-medium">الرقم</th>
                  <th className="px-5 py-3 font-medium">العميل</th>
                  <th className="px-5 py-3 font-medium">التاريخ</th>
                  <th className="px-5 py-3 font-medium">المبلغ</th>
                  {type === "invoice" && <th className="px-5 py-3 font-medium">الدفع</th>}
                  <th className="px-5 py-3 font-medium">الحالة</th>
                  <th className="px-5 py-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100/60">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-navy-50/30">
                    <td className="px-5 py-3 font-medium text-navy" dir="ltr">
                      {d.number}
                    </td>
                    <td className="px-5 py-3 text-navy">{d.client_name}</td>
                    <td className="px-5 py-3 text-steel">{formatDate(d.issue_date)}</td>
                    <td className="px-5 py-3 font-medium text-navy">{formatMoney(d.total)}</td>
                    {type === "invoice" && (
                      <td className="px-5 py-3 text-slate-brand">
                        {d.payment_method ? PAYMENT_LABELS[d.payment_method] : "-"}
                      </td>
                    )}
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_COLORS[d.status] || ""}`}>
                        {STATUS_LABELS[d.status] || d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/app/${base}/${d.id}`}
                          className="rounded-lg p-2 text-brand hover:bg-brand/10"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/app/${base}/${d.id}/edit`}
                          className="rounded-lg p-2 text-slate-brand hover:bg-navy-50"
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
