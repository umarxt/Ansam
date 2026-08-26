import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { PageLoader } from "./components/ui";
import { siteMode, adminUrl } from "./lib/sites";
import AppLayout from "./components/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Financial from "./pages/Financial";
import Finance from "./pages/Finance";
import Documents from "./pages/Documents";
import DocumentEditor from "./pages/DocumentEditor";
import DocumentView from "./pages/DocumentView";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import Jobs from "./pages/Jobs";
import Portal from "./pages/Portal";

function Protected({
  children,
  admin,
  perm,
}: {
  children: JSX.Element;
  admin?: boolean;
  perm?: string;
}) {
  const { user, loading, isAdmin, can } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && !isAdmin) return <Navigate to="/app" replace />;
  if (perm && !can(perm)) return <Navigate to="/app" replace />;
  return children;
}

/** تحويل خارجي بين النطاقين (الموقع الرسمي ↔ المنصة الإدارية). */
function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return <PageLoader />;
}

/** مسارات المنصة الإدارية الداخلية (مشتركة بين وضع الإدارة ووضع التطوير). */
function appChildRoutes() {
  return (
    <>
      <Route index element={<Dashboard />} />
      <Route
        path="financial"
        element={
          <Protected perm="finance">
            <Financial />
          </Protected>
        }
      />
      <Route
        path="jobs"
        element={
          <Protected admin>
            <Jobs />
          </Protected>
        }
      />
      <Route
        path="finance"
        element={
          <Protected perm="finance">
            <Finance />
          </Protected>
        }
      />

      <Route path="invoices" element={<Documents type="invoice" />} />
      <Route path="invoices/new" element={<DocumentEditor type="invoice" />} />
      <Route path="invoices/:id" element={<DocumentView />} />
      <Route path="invoices/:id/edit" element={<DocumentEditor type="invoice" />} />

      <Route path="quotes" element={<Documents type="quote" />} />
      <Route path="quotes/new" element={<DocumentEditor type="quote" />} />
      <Route path="quotes/:id" element={<DocumentView />} />
      <Route path="quotes/:id/edit" element={<DocumentEditor type="quote" />} />

      <Route
        path="employees"
        element={
          <Protected admin>
            <Employees />
          </Protected>
        }
      />
      <Route
        path="settings"
        element={
          <Protected admin>
            <Settings />
          </Protected>
        }
      />
    </>
  );
}

export default function App() {
  const mode = siteMode();

  // دومين المنصة الإدارية: لا نعرض صفحة الهبوط — الجذر يوجّه إلى /app،
  // وأي طلب لصفحة الهبوط يُحوَّل إلى الموقع الرسمي.
  if (mode === "admin") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal" element={<Portal />} />
        <Route
          path="/app"
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          {appChildRoutes()}
        </Route>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    );
  }

  // دومين الموقع الرسمي: نعرض صفحة الهبوط فقط، وأي مسار خاص بالمنصة
  // (الدخول/اللوحة/البوابة) يُحوَّل إلى دومين الإدارة app.ansamair.sa.
  if (mode === "public") {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<ExternalRedirect to={adminUrl("/login")} />} />
        <Route path="/portal" element={<ExternalRedirect to={adminUrl("/portal")} />} />
        <Route path="/app/*" element={<ExternalRedirect to={adminUrl("/app")} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // وضع التطوير/المعاينة: الموقعان متاحان معاً على نفس المضيف.
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/portal" element={<Portal />} />

      <Route
        path="/app"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        {appChildRoutes()}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
