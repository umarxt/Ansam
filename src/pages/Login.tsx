import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Spinner } from "../components/ui";
import { Logo } from "../components/Logo";
import { LogIn, ArrowRight } from "lucide-react";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/app" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "تعذر تسجيل الدخول");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* الجانب التعريفي */}
      <div className="relative hidden w-1/2 overflow-hidden bg-navy lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="flex items-center gap-3">
          <Logo className="h-12 w-12" onDark />
          <span className="text-2xl font-medium text-white">أنسام</span>
        </div>
        <div>
          <h1 className="text-4xl font-medium leading-snug text-white">
            منصة إدارة متكاملة
            <br />
            للصيانة والتبريد والتكييف
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-sky-soft/80">
            لوحة تحكم، فوترة وعروض أسعار، إدارة مالية، وفريق عمل — كل ذلك في مكان واحد أنيق وسهل.
          </p>
        </div>
        <div className="flex gap-2 opacity-70">
          <span className="h-2 w-10 rounded-full bg-sky-soft" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
        </div>
        {/* عنصر المروحة: مرة واحدة، باهت، في زاوية اللوحة */}
        <img
          src="/ansam-mark-white.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 opacity-[0.06]"
        />
      </div>

      {/* نموذج الدخول */}
      <div className="flex w-full items-center justify-center bg-cream px-6 lg:w-1/2">
        <div className="w-full max-w-sm fade-in">
          <div className="mb-8 text-center lg:text-right">
            <div className="mb-4 flex justify-center lg:hidden">
              <Logo className="h-14 w-14" />
            </div>
            <h2 className="text-2xl font-medium text-navy">تسجيل الدخول</h2>
            <p className="mt-1 text-sm text-steel">أدخل بياناتك للوصول إلى لوحة الإدارة</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="label">اسم الدخول</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
              {busy ? <Spinner className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              دخول
            </button>
          </form>

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-1 text-sm text-steel hover:text-brand"
          >
            العودة إلى الموقع الرسمي
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
