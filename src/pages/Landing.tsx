import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Snowflake,
  Wrench,
  FileCheck,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Building2,
  Hotel,
  UtensilsCrossed,
  ShieldCheck,
  Instagram,
} from "lucide-react";
import { api } from "../lib/api";
import { Logo } from "../components/Logo";

const SERVICE_ICONS = [Snowflake, UtensilsCrossed, FileCheck, Clock];

export default function Landing() {
  const [data, setData] = useState<any>({ landing: {}, company: {} });

  useEffect(() => {
    api.get<any>("/public/landing").then(setData).catch(() => {});
    document.documentElement.classList.add("landing");
    return () => document.documentElement.classList.remove("landing");
  }, []);

  const l = data.landing || {};
  const c = data.company || {};
  const services = l.services?.length
    ? l.services
    : [
        { title: "صيانة التكييف والتبريد", desc: "أنظمة التكييف المركزي والمكيفات الكبيرة." },
        { title: "صيانة المطابخ والأفران", desc: "المطابخ التجارية والأفران الكبيرة." },
        { title: "عقود التشغيل والصيانة", desc: "عقود سنوية للشركات والفنادق." },
        { title: "صيانة الطوارئ", desc: "استجابة سريعة على مدار الساعة." },
      ];
  const phone = l.phone || c.phone || "0555555555";

  return (
    <div className="min-h-screen bg-cream">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-40 border-b border-navy-100/60 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-11" />
            <div>
              <div className="text-xl font-bold text-navy leading-none">أنسام</div>
              <div className="text-[11px] text-steel">صيانة · تبريد · تكييف</div>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-brand md:flex">
            <a href="#services" className="hover:text-brand">الخدمات</a>
            <a href="#sectors" className="hover:text-brand">من نخدم</a>
            <a href="#contact" className="hover:text-brand">تواصل</a>
          </nav>
          <Link to="/login" className="btn-primary text-sm">
            دخول المنصة
          </Link>
        </div>
      </header>

      {/* البطل */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-sky-soft/40 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="fade-in">
            <span className="badge bg-sky-soft text-brand-dark">حلول متكاملة للصيانة والتبريد</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-navy md:text-5xl">
              {l.hero_title || "أنسام للصيانة والتبريد"}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-brand">
              {l.hero_subtitle ||
                "حلول متكاملة للتكييف والتبريد وصيانة المطابخ والأفران الكبيرة للشركات والفنادق والمنشآت."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${phone}`} className="btn-brand">
                <Phone className="w-5 h-5" />
                اطلب الخدمة الآن
              </a>
              <a href="#services" className="btn-ghost">
                تعرّف على خدماتنا
                <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-brand">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand" /> فنيون معتمدون
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand" /> دعم على مدار الساعة
              </span>
            </div>
          </div>

          <div className="relative fade-in">
            <div className="card overflow-hidden bg-navy-gradient p-8 text-white shadow-glow">
              <Snowflake className="mb-4 h-14 w-14 text-sky-soft" />
              <div className="text-2xl font-bold">تبريد وتكييف بكفاءة عالية</div>
              <p className="mt-3 text-sky-soft/80">
                صيانة احترافية للمكيفات الكبيرة والأنظمة المركزية والأفران والمعدات الحرارية.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { n: "+٥٠", t: "عميل" },
                  { n: "٢٤/٧", t: "دعم" },
                  { n: "١٠٠٪", t: "جودة" },
                ].map((s) => (
                  <div key={s.t} className="rounded-xl bg-white/10 py-3">
                    <div className="text-lg font-bold">{s.n}</div>
                    <div className="text-xs text-sky-soft/80">{s.t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* الخدمات */}
      <section id="services" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-navy">خدماتنا</h2>
          <p className="mt-2 text-slate-brand">حلول شاملة تغطي كافة احتياجات الصيانة والتبريد</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s: any, i: number) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
            return (
              <div
                key={i}
                className="card group p-6 transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-brand">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* القطاعات المستهدفة */}
      <section id="sectors" className="bg-navy-gradient py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">نخدم كبار العملاء</h2>
            <p className="mt-2 text-sky-soft/80">شراكات موثوقة مع الشركات والفنادق والمنشآت الكبرى</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { icon: Building2, title: "الشركات", desc: "عقود صيانة دورية للمقرات والمنشآت التجارية." },
              { icon: Hotel, title: "الفنادق", desc: "أنظمة تكييف وتبريد تعمل بلا انقطاع لراحة النزلاء." },
              { icon: UtensilsCrossed, title: "المطاعم والمطابخ", desc: "صيانة الأفران الكبيرة ومعدات المطابخ التجارية." },
            ].map((s) => (
              <div key={s.title} className="rounded-xl2 border border-white/10 bg-white/5 p-6">
                <s.icon className="mb-4 h-9 w-9 text-sky-soft" />
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-sky-soft/80">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* تواصل */}
      <section id="contact" className="mx-auto max-w-6xl px-5 py-16">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-bold text-navy">تواصل معنا</h2>
              <p className="mt-2 text-slate-brand">نحن جاهزون لخدمتك — تواصل معنا لطلب الخدمة أو عرض سعر.</p>
              <div className="mt-6 space-y-4">
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-navy hover:text-brand">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span dir="ltr">{phone}</span>
                </a>
                {(l.whatsapp || phone) && (
                  <a
                    href={`https://wa.me/${(l.whatsapp || phone).replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-navy hover:text-brand"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    واتساب
                  </a>
                )}
                <a
                  href={`mailto:${l.email || c.email || "info@ansam.sa"}`}
                  className="flex items-center gap-3 text-navy hover:text-brand"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span dir="ltr">{l.email || c.email || "info@ansam.sa"}</span>
                </a>
                {l.instagram && (
                  <div className="flex items-center gap-3 text-navy">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Instagram className="h-5 w-5" />
                    </span>
                    <span dir="ltr">{l.instagram}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-navy-gradient p-8 text-center text-white md:p-10">
              <Logo className="h-16 w-16" onDark />
              <div className="mt-4 text-2xl font-bold">أنسام</div>
              <p className="mt-2 max-w-xs text-sm text-sky-soft/80">
                {c.activity || "خدمات الصيانة والتبريد والتكييف وصيانة المطابخ والأفران الكبيرة"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* التذييل */}
      <footer className="border-t border-navy-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-steel md:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-medium text-navy">أنسام</span>
          </div>
          <span>© {new Date().getFullYear()} جميع الحقوق محفوظة — أنسام</span>
          <Link to="/login" className="text-brand hover:underline">
            دخول المنصة
          </Link>
        </div>
      </footer>
    </div>
  );
}
