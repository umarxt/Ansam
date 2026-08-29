import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ClipboardList,
  CalendarCheck,
  UserCheck,
  Wrench,
  FileText,
  PieChart,
  ArrowUpLeft,
  Clock,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatMoney, formatDate } from "../lib/format";
import { PageLoader } from "../components/ui";

const JOB_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "بانتظار التأكيد", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "مؤكّد", cls: "bg-green-100 text-green-700" },
  rejected: { label: "مرفوض", cls: "bg-red-100 text-red-600" },
};

function StatCard({ icon: Icon, label, value, tone = "navy" }: any) {
  const tones: Record<string, string> = {
    navy: "bg-sky-soft text-navy",
    brand: "bg-sky-soft text-brand",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
  };
  return (
    <div className="card p-5 fade-in">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="num mt-4 text-2xl font-medium text-navy">{value}</div>
      <div className="mt-1 text-sm text-slate-brand">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin, can } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get<any>("/dashboard").then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <PageLoader />;
  const t = data.totals || {};
  const net = Number(t.income_total || 0) - Number(t.expense_total || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-navy">لوحة المعلومات</h1>
          <p className="text-sm text-steel">نظرة تشغيلية على أنسام</p>
        </div>
        {can("finance") && (
          <Link to="/app/financial" className="btn-ghost">
            <PieChart className="w-5 h-5" />
            اللوحة المالية
          </Link>
        )}
      </div>

      {/* مؤشرات تشغيلية */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} tone="navy" label="الموظفون النشطون" value={t.employees_count || 0} />
        <StatCard icon={CalendarCheck} tone="brand" label="زيارات ميدانية اليوم" value={t.jobs_today || 0} />
        <StatCard icon={ClipboardList} tone="amber" label="طلبات بانتظار التأكيد" value={t.jobs_pending || 0} />
        <StatCard icon={UserCheck} tone="green" label="عدد العملاء" value={t.clients_count || 0} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-soft text-navy">
            <Wrench className="h-5 w-5" />
          </span>
          <div>
            <div className="num text-xl font-medium text-navy">{t.jobs_total || 0}</div>
            <div className="text-xs text-slate-brand">إجمالي الطلبات الميدانية</div>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-soft text-navy">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <div className="num text-xl font-medium text-navy">{t.invoices_count || 0}</div>
            <div className="text-xs text-slate-brand">فاتورة</div>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-soft text-navy">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <div className="num text-xl font-medium text-navy">{t.services_count || 0}</div>
            <div className="text-xs text-slate-brand">خدمة معرّفة</div>
          </div>
        </div>
        {can("finance") ? (
          <Link to="/app/financial" className="card flex items-center gap-3 bg-navy p-4 text-white hover:bg-navy-700">
            <PieChart className="h-8 w-8" />
            <div>
              <div className="text-sm font-medium">{formatMoney(net)}</div>
              <div className="flex items-center gap-1 text-xs text-sky-soft/80">
                صافي الدخل <ArrowUpLeft className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ) : (
          <div className="card flex items-center gap-3 p-4">
            <CalendarCheck className="h-8 w-8 text-brand" />
            <div>
              <div className="text-xl font-medium text-navy">{t.quotes_count || 0}</div>
              <div className="text-xs text-steel">عرض سعر</div>
            </div>
          </div>
        )}
      </div>

      {/* أحدث الطلبات الميدانية */}
      {isAdmin && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
            <h3 className="font-medium text-navy">أحدث الطلبات الميدانية</h3>
            <Link to="/app/jobs" className="text-sm text-brand hover:underline">
              عرض الكل
            </Link>
          </div>
          {(data.recentJobs || []).length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-sm text-steel">
              <Clock className="mb-2 h-8 w-8" />
              لا توجد طلبات ميدانية بعد — ستظهر هنا عند إرسال الموظفين لها من بوابتهم.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-navy-50/50 text-right text-xs text-steel">
                  <tr>
                    <th className="px-5 py-3 font-medium">الموظف</th>
                    <th className="px-5 py-3 font-medium">العميل</th>
                    <th className="px-5 py-3 font-medium">الخدمة</th>
                    <th className="px-5 py-3 font-medium">المبلغ</th>
                    <th className="px-5 py-3 font-medium">التاريخ</th>
                    <th className="px-5 py-3 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100/60">
                  {data.recentJobs.map((j: any) => (
                    <tr key={j.id} className="hover:bg-navy-50/30">
                      <td className="px-5 py-3 text-navy">{j.employee_name || "-"}</td>
                      <td className="px-5 py-3 text-navy">{j.client_name || "-"}</td>
                      <td className="px-5 py-3 text-slate-brand">{j.service_name || "-"}</td>
                      <td className="px-5 py-3 font-medium text-navy">{formatMoney(j.amount)}</td>
                      <td className="px-5 py-3 text-steel">{formatDate(j.created_at)}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${JOB_STATUS[j.status]?.cls || "bg-navy-100 text-navy-700"}`}>
                          {JOB_STATUS[j.status]?.label || j.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
