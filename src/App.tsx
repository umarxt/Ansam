import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { PageLoader } from "./components/ui";
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

export default function App() {
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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
