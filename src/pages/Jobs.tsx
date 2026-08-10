import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Check, X, FileUp, Eye, Filter } from "lucide-react";
import { api } from "../lib/api";
import { formatMoney, formatDate } from "../lib/format";
import { Modal, Spinner, EmptyState } from "../components/ui";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "بانتظار التأكيد", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "مؤكّد", cls: "bg-green-100 text-green-700" },
  rejected: { label: "مرفوض", cls: "bg-red-100 text-red-600" },
};

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[] | null>(null);
  const [status, setStatus] = useState("pending");
  const [view, setView] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setJobs(null);
    const res = await api.get<{ jobs: any[] }>(`/jobs${status ? `?status=${status}` : ""}`);
    setJobs(res.jobs);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function confirm(id: number) {
    setBusy(true);
    try {
      const res = await api.post<{ invoice_id: number }>(`/jobs/${id}/confirm`);
      navigate(`/app/invoices/${res.invoice_id}/edit`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function reject(id: number) {
    if (!window.confirm("رفض هذا الطلب؟")) return;
    await api.post(`/jobs/${id}/reject`);
    setView(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-medium text-navy">
          <ClipboardList className="h-6 w-6 text-brand" />
          الطلبات الميدانية
        </h1>
        <p className="text-sm text-steel">
          طلبات الموظفين من الميدان — أكّد الطلب لإنشاء فاتورة تلقائياً ثم أصدرها.
        </p>
      </div>

      <div className="card flex flex-wrap items-center gap-2 p-3">
        <span className="flex items-center gap-1 px-2 text-sm text-slate-brand">
          <Filter className="h-4 w-4" /> الحالة:
        </span>
        {[
          ["pending", "بانتظار التأكيد"],
          ["confirmed", "مؤكّد"],
          ["rejected", "مرفوض"],
          ["", "الكل"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setStatus(v)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              status === v ? "bg-navy text-white" : "bg-navy-50 text-slate-brand hover:bg-navy-100"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {jobs === null ? (
        <div className="flex justify-center py-16 text-brand">
          <Spinner className="w-7 h-7" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ClipboardList className="h-12 w-12" />} title="لا توجد طلبات" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((j) => {
            const photos = JSON.parse(j.photos || "[]");
            return (
              <div key={j.id} className="card overflow-hidden fade-in">
                {photos[0] ? (
                  <div className="relative h-40 bg-navy-50">
                    <img src={photos[0]} alt="" className="h-full w-full object-cover" />
                    {photos.length > 1 && (
                      <span className="absolute bottom-2 left-2 rounded-lg bg-navy/80 px-2 py-0.5 text-xs text-white">
                        +{photos.length - 1}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center bg-navy-50 text-steel">
                    <ClipboardList className="h-10 w-10" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-navy">{j.service_name || "خدمة"}</span>
                    <span className={`badge ${STATUS[j.status]?.cls || ""}`}>{STATUS[j.status]?.label}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-slate-brand">
                    <div>العميل: {j.client_name || "-"}</div>
                    <div>الموظف: {j.employee_name || "-"}</div>
                    <div className="font-medium text-navy">{formatMoney(j.amount)}</div>
                    <div className="text-xs text-steel">{formatDate(j.created_at)}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setView(j)} className="btn-ghost flex-1 py-2 text-sm">
                      <Eye className="w-4 h-4" /> تفاصيل
                    </button>
                    {j.status === "pending" && (
                      <button onClick={() => confirm(j.id)} disabled={busy} className="btn-brand flex-1 py-2 text-sm">
                        <Check className="w-4 h-4" /> تأكيد
                      </button>
                    )}
                    {j.status === "confirmed" && j.invoice_id && (
                      <button
                        onClick={() => navigate(`/app/invoices/${j.invoice_id}`)}
                        className="btn-primary flex-1 py-2 text-sm"
                      >
                        <FileUp className="w-4 h-4" /> الفاتورة
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view && (
        <Modal open onClose={() => setView(null)} title={`طلب #${view.id} — ${view.service_name || "خدمة"}`} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="العميل" value={view.client_name} />
              <Info label="الجوال" value={view.client_phone} />
              <Info label="العنوان" value={view.client_address} />
              <Info label="الموظف" value={view.employee_name} />
              <Info label="المبلغ" value={formatMoney(view.amount)} />
              <Info label="التاريخ" value={formatDate(view.created_at)} />
            </div>
            {view.description && (
              <div className="rounded-xl bg-navy-50 p-3 text-sm text-slate-brand">{view.description}</div>
            )}
            {(() => {
              const photos = JSON.parse(view.photos || "[]");
              return photos.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p: string, i: number) => (
                    <a key={i} href={p} target="_blank" rel="noreferrer">
                      <img src={p} alt="" className="h-28 w-full rounded-xl object-cover" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-steel">لا توجد صور مرفقة</p>
              );
            })()}
            <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
              {view.status === "pending" && (
                <>
                  <button onClick={() => reject(view.id)} className="btn-danger">
                    <X className="w-4 h-4" /> رفض
                  </button>
                  <button onClick={() => confirm(view.id)} disabled={busy} className="btn-brand">
                    <Check className="w-4 h-4" /> تأكيد وإنشاء فاتورة
                  </button>
                </>
              )}
              {view.status === "confirmed" && view.invoice_id && (
                <button onClick={() => navigate(`/app/invoices/${view.invoice_id}`)} className="btn-primary">
                  <FileUp className="w-4 h-4" /> فتح الفاتورة
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs text-steel">{label}</div>
      <div className="font-medium text-navy">{value || "-"}</div>
    </div>
  );
}
