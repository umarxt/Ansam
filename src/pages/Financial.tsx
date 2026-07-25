import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  FileText,
  TrendingUp,
  TrendingDown,
  Banknote,
  ArrowLeftRight,
  CreditCard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "../lib/api";
import { formatMoney, formatDate, PAYMENT_LABELS, STATUS_COLORS, STATUS_LABELS } from "../lib/format";
import { PageLoader } from "../components/ui";

interface DashData {
  totals: any;
  byMethod: { payment_method: string; amount: number }[];
  monthly: { month: string; income: number; expense: number }[];
  recent: any[];
}

const METHOD_COLORS: Record<string, string> = {
  cash: "#2E6DA6",
  transfer: "#12283F",
  pos: "#8B97A6",
};
const METHOD_ICONS: Record<string, any> = {
  cash: Banknote,
  transfer: ArrowLeftRight,
  pos: CreditCard,
};

function StatCard({ icon: Icon, label, value, tone = "navy" }: any) {
  const tones: Record<string, string> = {
    navy: "bg-navy text-white",
    brand: "bg-brand text-white",
    green: "bg-green-600 text-white",
    red: "bg-red-500 text-white",
  };
  return (
    <div className="card p-5 fade-in">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-4 text-2xl font-bold text-navy">{value}</div>
      <div className="mt-1 text-sm text-steel">{label}</div>
    </div>
  );
}

export default function Financial() {
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    api.get<DashData>("/dashboard").then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <PageLoader />;
  const t = data.totals || {};
  const net = Number(t.income_total || 0) - Number(t.expense_total || 0);

  const pieData = data.byMethod.map((m) => ({
    name: PAYMENT_LABELS[m.payment_method] || m.payment_method,
    key: m.payment_method,
    value: Number(m.amount),
  }));
  const monthData = data.monthly.map((m) => ({
    name: m.month,
    الإيرادات: Number(m.income),
    المصروفات: Number(m.expense),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">اللوحة المالية</h1>
        <p className="text-sm text-steel">تحليل الإيرادات والمصروفات وطرق الدفع</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} tone="brand" label="صافي الدخل" value={formatMoney(net)} />
        <StatCard icon={TrendingUp} tone="green" label="إجمالي الإيرادات" value={formatMoney(t.income_total)} />
        <StatCard icon={TrendingDown} tone="red" label="إجمالي المصروفات" value={formatMoney(t.expense_total)} />
        <StatCard icon={FileText} tone="navy" label="قيمة الفواتير" value={formatMoney(t.invoices_total)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 font-bold text-navy">الإيرادات والمصروفات (آخر 6 أشهر)</h3>
          {monthData.length === 0 ? (
            <p className="py-16 text-center text-sm text-steel">لا توجد بيانات بعد</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8B97A6" }} />
                <YAxis tick={{ fontSize: 12, fill: "#8B97A6" }} width={70} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #d6e0ea", fontSize: 13 }}
                  formatter={(v: any) => formatMoney(v)}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="الإيرادات" fill="#2E6DA6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="المصروفات" fill="#8B97A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-bold text-navy">الإيرادات حسب طريقة الدفع</h3>
          {pieData.length === 0 ? (
            <p className="py-16 text-center text-sm text-steel">لا توجد بيانات بعد</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {pieData.map((d) => (
                      <Cell key={d.key} fill={METHOD_COLORS[d.key] || "#4B6076"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatMoney(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-2">
                {pieData.map((d) => {
                  const Icon = METHOD_ICONS[d.key] || Banknote;
                  return (
                    <div key={d.key} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-brand">
                        <Icon className="w-4 h-4" style={{ color: METHOD_COLORS[d.key] }} />
                        {d.name}
                      </span>
                      <span className="font-semibold text-navy">{formatMoney(d.value)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h3 className="font-bold text-navy">أحدث المستندات</h3>
          <Link to="/app/invoices" className="text-sm text-brand hover:underline">
            عرض الكل
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="py-12 text-center text-sm text-steel">لا توجد مستندات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-50/50 text-right text-xs text-steel">
                <tr>
                  <th className="px-5 py-3 font-medium">الرقم</th>
                  <th className="px-5 py-3 font-medium">النوع</th>
                  <th className="px-5 py-3 font-medium">العميل</th>
                  <th className="px-5 py-3 font-medium">التاريخ</th>
                  <th className="px-5 py-3 font-medium">المبلغ</th>
                  <th className="px-5 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100/60">
                {data.recent.map((d) => (
                  <tr key={d.id} className="hover:bg-navy-50/30">
                    <td className="px-5 py-3">
                      <Link
                        to={`/app/${d.doc_type === "invoice" ? "invoices" : "quotes"}/${d.id}`}
                        className="font-medium text-brand hover:underline"
                        dir="ltr"
                      >
                        {d.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-brand">
                      {d.doc_type === "invoice" ? "فاتورة" : "عرض سعر"}
                    </td>
                    <td className="px-5 py-3 text-navy">{d.client_name}</td>
                    <td className="px-5 py-3 text-steel">{formatDate(d.issue_date)}</td>
                    <td className="px-5 py-3 font-semibold text-navy">{formatMoney(d.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_COLORS[d.status] || ""}`}>
                        {STATUS_LABELS[d.status] || d.status}
                      </span>
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
