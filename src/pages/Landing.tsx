import { useEffect, useRef, useState } from "react";
import {
  Snowflake,
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
  Award,
  Timer,
  BadgeCheck,
  ClipboardCheck,
  FileSignature,
  CalendarRange,
  LineChart,
} from "lucide-react";
import { api } from "../lib/api";
import { Logo } from "../components/Logo";
import { WaveDivider } from "../components/ui";

const SERVICE_ICONS = [Snowflake, UtensilsCrossed, FileCheck, Clock];

// منهجية العمل — أربع خطوات (تسلسل فعلي فالترقيم مبرّر)
const STEPS = [
  { icon: ClipboardCheck, title: "زيارة تقييم", desc: "معاينة ميدانية لموقعك وتحديد احتياجات الصيانة بدقة." },
  { icon: FileSignature, title: "عرض فني ومالي", desc: "عرض واضح بالنطاق والتكلفة قبل بدء أي عمل." },
  { icon: CalendarRange, title: "جدول صيانة وقائية", desc: "زيارات دورية مجدولة تمنع الأعطال قبل وقوعها." },
  { icon: LineChart, title: "تقارير دورية", desc: "تقرير بحالة المعدات والأعمال المنفّذة بعد كل زيارة." },
];

export default function Landing() {
  const [data, setData] = useState<any>({ landing: {}, company: {} });
  const [ctaOpen, setCtaOpen] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    api.get<any>("/public/landing").then(setData).catch(() => {});
    document.documentElement.classList.add("landing");
    return () => document.documentElement.classList.remove("landing");
  }, []);

  // حركة الظهور عند التمرير: تُشغَّل مرة واحدة لكل عنصر ثم تتوقف مراقبته
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [data]);

  // إغلاق قائمة «اطلب الخدمة» عند النقر خارجها أو ضغط Escape
  useEffect(() => {
    if (!ctaOpen) return;
    const onDown = (e: MouseEvent) => {
      if (ctaRef.current && !ctaRef.current.contains(e.target as Node)) setCtaOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCtaOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ctaOpen]);

  // تدوير صور البنر تلقائياً على الجوال
  useEffect(() => {
    const n = (data?.landing?.banners || []).filter(Boolean).length;
    if (n <= 1) return;
    const id = setInterval(() => setBannerIndex((i) => (i + 1) % n), 4500);
    return () => clearInterval(id);
  }, [data]);

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
  const email = l.email || c.email || "info@ansam.sa";
  const whatsapp = (l.whatsapp || phone).replace(/[^0-9]/g, "");
  const banners: string[] = (l.banners || []).filter(Boolean);
  // أرقام الثقة — تُقرأ من الإعدادات إن توفّرت وإلا قيَم افتراضية
  const trust = [
    { icon: Award, n: l.stat_years || "+10", t: "سنوات خبرة" },
    { icon: Building2, n: l.stat_sites || "+50", t: "منشأة مخدومة" },
    { icon: Timer, n: l.stat_response || "24/7", t: "استجابة الطوارئ" },
    { icon: BadgeCheck, n: l.stat_techs || "+20", t: "فنيون معتمدون" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-40 border-b border-navy-100/60 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#" aria-label="أنسام" className="flex items-center">
            <img
              src="/ansam-lockup-horizontal.svg"
              alt="أنسام"
              className="h-8 w-auto md:h-10"
            />
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-brand md:flex">
            <a href="#services" className="nav-link hover:text-brand">الخدمات</a>
            <a href="#sectors" className="nav-link hover:text-brand">من نخدم</a>
            <a href="#how" className="nav-link hover:text-brand">كيف نعمل</a>
            <a href="#contact" className="nav-link hover:text-brand">تواصل</a>
          </nav>
          <div className="relative" ref={ctaRef}>
            <button
              type="button"
              onClick={() => setCtaOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={ctaOpen}
              className="btn-primary text-sm"
            >
              اطلب الخدمة
            </button>
            {ctaOpen && (
              <div
                role="menu"
                className="fade-in absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-navy-100 bg-white p-1.5 shadow-card"
              >
                <a
                  role="menuitem"
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setCtaOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy transition hover:bg-navy-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  واتساب
                </a>
                <a
                  role="menuitem"
                  href={`tel:${phone}`}
                  onClick={() => setCtaOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy transition hover:bg-navy-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Phone className="h-4 w-4" />
                  </span>
                  اتصال هاتفي
                </a>
                <a
                  role="menuitem"
                  href={`mailto:${email}`}
                  onClick={() => setCtaOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy transition hover:bg-navy-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Mail className="h-4 w-4" />
                  </span>
                  البريد الإلكتروني
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* البطل */}
      <section className="relative overflow-hidden">
        {/* بنر الصور خلف الهيرو */}
        {banners.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            {/* ديسكتوب: حتى ثلاث صور جنباً إلى جنب */}
            <div className="hidden h-full md:flex">
              {banners.slice(0, 3).map((src, i) => (
                <img key={i} src={src} alt="" className="h-full flex-1 object-cover" />
              ))}
            </div>
            {/* جوال: صورة واحدة تتحرك تلقائياً */}
            <div className="relative h-full md:hidden">
              {banners.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    i === bannerIndex % banners.length ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
            {/* طبقة تعتيم لإبقاء النص واضحاً */}
            <div className="absolute inset-0 bg-cream/80" />
          </div>
        )}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-sky-soft/40 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="fade-in">
            <span className="badge bg-sky-soft text-brand-dark">حلول متكاملة للصيانة والتبريد</span>
            <h1 className="mt-5 text-4xl font-medium leading-tight text-navy md:text-5xl">
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
                <ArrowLeft className="arrow w-4 h-4" />
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
              <img
                src="/ansam-mark-white.svg"
                alt=""
                aria-hidden="true"
                className="mb-4 h-14 w-14 object-contain"
              />
              <div className="text-2xl font-medium">تبريد وتكييف بكفاءة عالية</div>
              <p className="mt-3 text-sky-soft/80">
                صيانة احترافية للمكيفات الكبيرة والأنظمة المركزية والأفران والمعدات الحرارية.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { n: "+50", t: "عميل" },
                  { n: "24/7", t: "دعم" },
                  { n: "100%", t: "جودة" },
                ].map((s) => (
                  <div key={s.t} className="rounded-xl bg-white/10 py-3">
                    <div className="text-lg font-medium">{s.n}</div>
                    <div className="text-xs text-sky-soft/80">{s.t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* شريط أرقام الثقة */}
      <section className="border-y border-navy-100/60 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-navy-100/60 px-5 sm:divide-x sm:divide-x-reverse md:grid-cols-4">
          {trust.map((s) => (
            <div key={s.t} className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
              <s.icon className="h-6 w-6 text-brand" aria-hidden="true" />
              <div className="num text-3xl font-medium leading-none text-navy">{s.n}</div>
              <div className="text-sm text-slate-brand">{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* الخدمات */}
      <section id="services" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="reveal section-head mx-auto text-center">
          <span className="badge-eyebrow">ما نقدّمه</span>
          <h2 className="mt-4 text-3xl font-medium text-navy">خدماتنا</h2>
          <p className="mt-2 text-slate-brand">حلول شاملة تغطي كافة احتياجات الصيانة والتبريد</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s: any, i: number) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
            return (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="card group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-all duration-300 ease-out group-hover:bg-brand group-hover:text-white group-hover:-rotate-6 group-active:-rotate-12 group-active:scale-95">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-navy">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-brand">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* القطاعات المستهدفة */}
      <WaveDivider className="-mb-px text-navy" fill="currentColor" />
      <section id="sectors" className="bg-navy-gradient pb-16 pt-4 text-white md:pb-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal section-head mx-auto text-center">
            <span className="badge-eyebrow bg-white/10 text-sky-soft">من نخدم</span>
            <h2 className="mt-4 text-3xl font-medium">نخدم كبار العملاء</h2>
            <p className="mt-2 text-sky-soft/80">شراكات موثوقة مع الشركات والفنادق والمنشآت الكبرى</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { icon: Building2, title: "الشركات", desc: "عقود صيانة دورية للمقرات والمنشآت التجارية." },
              { icon: Hotel, title: "الفنادق", desc: "أنظمة تكييف وتبريد تعمل بلا انقطاع لراحة النزلاء." },
              { icon: UtensilsCrossed, title: "المطاعم والمطابخ", desc: "صيانة الأفران الكبيرة ومعدات المطابخ التجارية." },
            ].map((s, i) => (
              <div key={s.title} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="group h-full rounded-xl2 border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:bg-white/10">
                  <s.icon className="mb-4 h-9 w-9 text-sky-soft transition-transform duration-300 ease-out group-hover:-rotate-6 group-active:-rotate-12" />
                  <h3 className="text-lg font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm text-sky-soft/80">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider className="-mt-px text-navy" fill="currentColor" flip />

      {/* كيف نعمل */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="reveal section-head mx-auto text-center">
          <span className="badge-eyebrow">منهجية العمل</span>
          <h2 className="mt-4 text-3xl font-medium text-navy">كيف نعمل معك</h2>
          <p className="mt-2 text-slate-brand">أربع خطوات واضحة من أول تواصل حتى تقارير الصيانة الدورية</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="card group relative h-full overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                <span
                  className="num pointer-events-none absolute end-4 top-3 text-5xl font-medium text-navy-100 transition-colors group-hover:text-sky-soft"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-brand">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* تواصل */}
      <section id="contact" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="reveal card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-medium text-navy">تواصل معنا</h2>
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
              <div className="mt-4 text-2xl font-medium">أنسام</div>
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
          <a href="#" aria-label="أنسام" className="flex items-center">
            <img src="/ansam-lockup-horizontal.svg" alt="أنسام" className="h-7 w-auto" />
          </a>
          <span>© {new Date().getFullYear()} جميع الحقوق محفوظة — أنسام</span>
          <a href="#contact" className="text-brand hover:underline">
            تواصل معنا
          </a>
        </div>
      </footer>
    </div>
  );
}
