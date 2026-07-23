import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  FileSpreadsheet,
  Users,
  Settings,
  Globe,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../lib/auth";

const nav = [
  { to: "/app", label: "لوحة المعلومات", icon: LayoutDashboard, end: true },
  { to: "/app/finance", label: "المالية", icon: Wallet },
  { to: "/app/invoices", label: "الفوترة", icon: FileText },
  { to: "/app/quotes", label: "عروض الأسعار", icon: FileSpreadsheet },
  { to: "/app/employees", label: "الموظفون", icon: Users, admin: true },
  { to: "/app/settings", label: "الإعدادات", icon: Settings, admin: true },
];

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <img src="/assets/logo-mark.svg" alt="أنسام" className="h-11 w-11" />
        <div>
          <div className="text-xl font-bold text-white leading-none">أنسام</div>
          <div className="text-[11px] text-sky-soft/80 mt-1">منصة الإدارة</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav
          .filter((n) => !n.admin || isAdmin)
          .map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-navy shadow-soft"
                    : "text-sky-soft/90 hover:bg-white/10"
                }`
              }
            >
              <n.icon className="w-[18px] h-[18px]" />
              {n.label}
            </NavLink>
          ))}

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sky-soft/90 transition-all hover:bg-white/10"
        >
          <Globe className="w-[18px] h-[18px]" />
          الموقع الرسمي
          <ChevronLeft className="w-4 h-4 mr-auto opacity-60" />
        </a>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            {user?.name?.charAt(0) || "؟"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
            <div className="text-[11px] text-sky-soft/70">
              {isAdmin ? "مدير" : "موظف"} {user?.emp_code ? `· ${user.emp_code}` : ""}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-sky-soft/80 transition hover:bg-white/10"
        >
          <LogOut className="w-[18px] h-[18px]" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* الشريط الجانبي - سطح المكتب */}
      <aside className="fixed inset-y-0 right-0 hidden w-64 bg-navy-gradient lg:block">
        {SidebarContent}
      </aside>

      {/* الشريط الجانبي - الجوال */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-64 bg-navy-gradient">{SidebarContent}</aside>
        </div>
      )}

      {/* المحتوى */}
      <div className="lg:pr-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-100 bg-cream/80 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <img src="/assets/logo-mark.svg" alt="أنسام" className="h-8 w-8" />
            <span className="font-bold text-navy">أنسام</span>
          </div>
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-navy hover:bg-navy-50">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
