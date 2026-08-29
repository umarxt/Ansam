import { useEffect, useRef, useState } from "react";
import {
  Snowflake,
  Refrigerator,
  UtensilsCrossed,
  Phone,
  Mail,
  MessageCircle,
  ArrowUpLeft,
  ClipboardCheck,
  FileText,
  CalendarClock,
  LineChart,
  ShieldCheck,
  Check,
  Minus,
  Instagram,
} from "lucide-react";
import { api } from "../lib/api";
import { Logo } from "../components/Logo";

const SERVICE_ICONS = [Snowflake, Refrigerator, UtensilsCrossed];

/** فاصل موجي بين الأقسام — مشتق من عنصر الأنابيب في الهوية */
function Wave({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`block w-full ${className}`}
      style={{ height: 64, transform: flip ? "scaleY(-1)" : undefined }}
      viewBox="0 0 1200 64"
      preserveAspectRatio="none"
    >
      <path
        d="M0 40 C 200 8, 340 8, 520 34 S 900 68, 1200 28 L 1200 64 L 0 64 Z"
        fill="#D6E4F0"
      />
    </svg>
  );
}

/** عنوان يظهر كلمةً كلمة (تقسيم بالكلمة فقط — إلزامي للعربية) */
function Heading({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h2 className={`reveal reveal-head ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="reveal-line">
          <span style={{ transitionDelay: `${i * 55}ms` }}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
}

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
      { threshold: 0.25 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [data]);

  // إغلاق قائمة التواصل عند النقر خارجها أو ضغط Escape
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
        { title: "التكييف المركزي", desc: "تشغيل وصيانة أنظمة التكييف المركزي والوحدات الكبيرة بكفاءة عالية." },
        { title: "التبريد وغرف الحفظ", desc: "صيانة غرف التبريد والتجميد ومعدات حفظ الأغذية دون انقطاع." },
        { title: "المطابخ التجارية والأفران", desc: "صيانة الأفران الكبيرة ومعدات المطابخ التجارية للمطاعم والفنادق." },
      ];
  const phone = l.phone || c.phone || "0555555555";
  const email = l.email || c.email || "info@ansam.sa";
  const whatsapp = (l.whatsapp || phone).replace(/[^0-9]/g, "");
  const banners: string[] = (l.banners || []).filter(Boolean);

  const trust = [
    { n: "24/7", t: "استجابة تعاقدية" },
    { n: "+50", t: "منشأة مخدومة" },
    { n: "100%", t: "فنيون معتمدون" },
    { n: "سنوي", t: "برنامج صيانة وقائية" },
  ];

  const steps = [
    { icon: ClipboardCheck, title: "زيارة تقييم", desc: "معاينة ميدانية لمعداتك وحصر حالتها واحتياجاتها." },
    { icon: FileText, title: "عرض فني ومالي", desc: "خطة صيانة واضحة بتكلفة سنوية ثابتة بلا مفاجآت." },
    { icon: CalendarClock, title: "جدول صيانة وقائية", desc: "زيارات دورية مجدولة تحفظ عمر المعدات وتمنع الأعطال." },
    { icon: LineChart, title: "تقارير شهرية", desc: "تقارير موثّقة بحالة كل معدة وما تم إنجازه." },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" aria-label="أنسام" className="flex items-center">
            <img src="/ansam-lockup-horizontal.svg" alt="أنسام" className="h-8 w-auto md:h-9" />
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-brand md:flex">
            <a href="#services" className="nav-link hover:text-brand">الخدمات</a>
            <a href="#how" className="nav-link hover:text-brand">كيف نعمل</a>
            <a href="#compare" className="nav-link hover:text-brand">لماذا الوقائية</a>
            <a href="#contact" className="nav-link hover:text-brand">تواصل</a>
          </nav>
          <a href="#contact" className="btn-primary text-sm">اطلب عرض سعر</a>
        </div>
      </header>

      {/* الهيرو */}
      <section id="top" className="relative overflow-hidden">
        {/* صور البنر خلف الهيرو (اختيارية من الإعدادات) */}
        {banners.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <div className="hidden h-full md:flex">
              {banners.slice(0, 3).map((src, i) => (
                <img key={i} src={src} alt="" className="h-full flex-1 object-cover" />
              ))}
            </div>
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
            <div className="absolute inset-0 bg-cream/85" />
          </div>
        )}

        {/* عنصر المروحة: مرة واحدة، كبير، باهت في زاوية الهيرو */}
        <img
          src="/ansam-mark.svg"
          alt=""
          aria-hidden="true"
          className="spin-slow pointer-events-none absolute -left-24 -top-28 z-0 h-[26rem] w-[26rem] opacity-[0.05]"
        />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-24">
          <div className="fade-in">
            <span className="badge border border-navy-100 bg-white text-eyebrow text-slate-brand">
              حلول صيانة تعاقدية للمنشآت
            </span>
            <h1 className="type-hero mt-5 text-navy">
              {l.hero_title || "استمرارية تشغيل معداتك، بلا انقطاع"}
            </h1>
            <p className="type-body mt-5 max-w-[60ch] text-slate-brand">
              {l.hero_subtitle ||
                "عقود صيانة وقائية للتكييف والتبريد والمطابخ التجارية والأفران الكبيرة — تحفظ معداتك وتخفض تكاليف التوقّف المفاجئ."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="btn-primary">
                اطلب زيارة تقييم مجانية
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <MessageCircle className="h-5 w-5" />
                تحدث مع مهندس
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-eyebrow text-slate-brand">
              <span className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-5 w-5 text-navy" /> فنيون معتمدون
              </span>
              <span className="flex items-center gap-2">
                <CalendarClock aria-hidden="true" className="h-5 w-5 text-navy" /> صيانة مجدولة
              </span>
              <span className="flex items-center gap-2">
                <LineChart aria-hidden="true" className="h-5 w-5 text-navy" /> تقارير موثّقة
              </span>
            </div>
          </div>

          {/* بطاقة طلب سريع */}
          <div className="fade-in">
            <QuickQuote defaultPhone={phone} whatsapp={whatsapp} />
          </div>
        </div>
      </section>

      {/* شريط أرقام الثقة */}
      <section aria-label="مؤشرات الثقة" className="border-y border-navy-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 py-10 sm:grid-cols-4 md:py-12">
          {trust.map((s) => (
            <div key={s.t} className="reveal px-3 text-center">
              <div className="num type-section-title text-navy">{s.n}</div>
              <div className="mt-1 text-eyebrow text-slate-brand">{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* الخدمات */}
      <section id="services" className="mx-auto max-w-6xl px-5 py-14 md:py-24">
        <div className="mb-10 text-center md:mb-14">
          <Heading text="خدماتنا" className="type-section-title text-navy" />
          <p className="reveal mt-3 text-slate-brand" style={{ transitionDelay: "550ms" }}>
            تغطية شاملة لأنظمة التبريد والتكييف ومعدات المطابخ التجارية.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {services.map((s: any, i: number) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
            return (
              <a
                key={i}
                href="#contact"
                className="landing-card reveal group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 transition-colors hover:border-brand"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-soft text-navy">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="type-card-title mt-5 text-navy">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-brand">{s.desc}</p>
                <span className="mt-5 flex items-center gap-2 text-sm font-medium text-brand">
                  اطلب هذه الخدمة
                  <span className="arrow-icon flex h-8 w-8 items-center justify-center rounded-full border border-navy-100 text-brand transition-all">
                    <ArrowUpLeft className="h-4 w-4" />
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <Wave />

      {/* كيف نعمل */}
      <section id="how" className="bg-white py-14 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center md:mb-14">
            <Heading text="كيف نعمل" className="type-section-title text-navy" />
            <p className="reveal mt-3 text-slate-brand" style={{ transitionDelay: "550ms" }}>
              أربع مراحل واضحة من أول زيارة حتى التقارير الدورية.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="reveal rounded-2xl border border-navy-100 bg-cream p-6"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-navy">
                    <s.icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="num text-2xl font-medium text-navy-200">{i + 1}</span>
                </div>
                <h3 className="type-card-title mt-4 text-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-brand">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Wave flip />

      {/* الوقائية مقابل الطارئة */}
      <section id="compare" className="mx-auto max-w-6xl px-5 py-14 md:py-24">
        <div className="mb-10 text-center md:mb-14">
          <Heading text="الصيانة الوقائية مقابل الطارئة" className="type-section-title text-navy" />
          <p className="reveal mt-3 text-slate-brand" style={{ transitionDelay: "550ms" }}>
            العقد الوقائي يوفّر التكلفة قبل أن تُسأل عنه.
          </p>
        </div>
        <div className="reveal overflow-hidden rounded-2xl border border-navy-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-right">
                <th className="px-5 py-4 font-medium text-slate-brand"></th>
                <th className="px-5 py-4 font-medium text-navy">صيانة وقائية (عقد)</th>
                <th className="px-5 py-4 font-medium text-slate-brand">إصلاح طارئ عند العطل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {[
                { k: "التكلفة السنوية", a: "ثابتة ومخطّطة", b: "متقلّبة وغير متوقّعة" },
                { k: "ساعات التوقّف", a: "أدنى ما يمكن", b: "توقّف مفاجئ ومطوّل" },
                { k: "عمر المعدات", a: "أطول بصيانة منتظمة", b: "يقصر مع الإهمال" },
                { k: "أولوية الاستجابة", a: "مضمونة تعاقدياً", b: "حسب التوفّر" },
              ].map((r) => (
                <tr key={r.k}>
                  <td className="px-5 py-4 font-medium text-navy">{r.k}</td>
                  <td className="px-5 py-4 text-slate-brand">
                    <span className="flex items-center gap-2">
                      <Check aria-hidden="true" className="h-4 w-4 text-navy" />
                      {r.a}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-steel">
                    <span className="flex items-center gap-2">
                      <Minus aria-hidden="true" className="h-4 w-4" />
                      {r.b}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* القسم الداكن الوحيد — الالتزامات التعاقدية (SLA) */}
      <section className="bg-navy py-14 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 md:mb-14">
            <Heading text="التزاماتنا التعاقدية" className="type-section-title text-white" />
            <p className="reveal mt-3 max-w-[60ch] text-sky-soft/85" style={{ transitionDelay: "550ms" }}>
              نتعاقد على مستوى خدمة واضح — لا وعود شفهية.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { n: "24/7", t: "قناة تواصل للطوارئ طوال أيام الأسبوع." },
              { n: "زيارات مجدولة", t: "برنامج صيانة وقائية دوري موثّق لكل معدة." },
              { n: "تقرير لكل زيارة", t: "توثيق ما تم فحصه وإصلاحه بعد كل زيارة." },
            ].map((s, i) => (
              <div
                key={i}
                className="reveal rounded-2xl border border-white/15 p-6"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="type-card-title text-white">{s.n}</div>
                <p className="mt-2 text-sm leading-relaxed text-sky-soft/85">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* من نخدم */}
      <section className="bg-white py-14 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center md:mb-14">
            <Heading text="نخدم كبار العملاء" className="type-section-title text-navy" />
            <p className="reveal mt-3 text-slate-brand" style={{ transitionDelay: "550ms" }}>
              شراكات موثوقة مع الشركات والفنادق والمطاعم والسلاسل التجارية.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { title: "الشركات والمنشآت", desc: "عقود صيانة دورية للمقرات والمرافق التجارية." },
              { title: "الفنادق", desc: "أنظمة تكييف وتبريد تعمل بلا انقطاع لراحة النزلاء." },
              { title: "المطاعم والمطابخ", desc: "صيانة الأفران الكبيرة ومعدات المطابخ التجارية." },
            ].map((s, i) => (
              <div
                key={s.title}
                className="reveal rounded-2xl border border-navy-100 bg-cream p-6"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <h3 className="type-card-title text-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-brand">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Wave />

      {/* تواصل + طلب عرض سعر */}
      <section id="contact" className="mx-auto max-w-6xl px-5 py-14 md:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <Heading text="اطلب عرض سعر" className="type-section-title text-navy" />
            <p className="mt-3 max-w-[60ch] text-slate-brand">
              أرسل بياناتك أو تواصل معنا مباشرة — نرتّب زيارة تقييم مجانية لمعداتك.
            </p>
            <div className="mt-8 space-y-3">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-navy transition-colors hover:border-brand hover:text-brand"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-soft text-navy">
                  <Phone aria-hidden="true" className="h-5 w-5" />
                </span>
                <span dir="ltr" className="num">{phone}</span>
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-navy transition-colors hover:border-brand hover:text-brand"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-soft text-navy">
                  <MessageCircle aria-hidden="true" className="h-5 w-5" />
                </span>
                واتساب
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-navy transition-colors hover:border-brand hover:text-brand"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-soft text-navy">
                  <Mail aria-hidden="true" className="h-5 w-5" />
                </span>
                <span dir="ltr" className="num">{email}</span>
              </a>
              {l.instagram && (
                <a
                  href={`https://instagram.com/${String(l.instagram).replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-navy transition-colors hover:border-brand hover:text-brand"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-soft text-navy">
                    <Instagram aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span dir="ltr">{l.instagram}</span>
                </a>
              )}
            </div>
          </div>

          <QuickQuote defaultPhone={phone} whatsapp={whatsapp} card />
        </div>
      </section>

      {/* التذييل */}
      <footer className="border-t border-navy-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-steel md:flex-row">
          <a href="#top" aria-label="أنسام" className="flex items-center">
            <img src="/ansam-lockup-horizontal.svg" alt="أنسام" className="h-7 w-auto" />
          </a>
          <span className="text-center">
            © {new Date().getFullYear()} أنسام — {c.activity || "خدمات الصيانة والتبريد والتكييف"}
          </span>
          <a href="#contact" className="font-medium text-brand hover:underline">
            اطلب عرض سعر
          </a>
        </div>
      </footer>
    </div>
  );
}

/** نموذج طلب سريع — يفتح واتساب برسالة مُعبّأة (لا يحتاج خادماً) */
function QuickQuote({
  defaultPhone,
  whatsapp,
  card = false,
}: {
  defaultPhone: string;
  whatsapp: string;
  card?: boolean;
}) {
  const [form, setForm] = useState({ name: "", facility: "مطعم / مطبخ تجاري", phone: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const msg = `مرحباً أنسام،%0Aأرغب بطلب عرض سعر لعقد صيانة.%0Aاسم المنشأة: ${
      form.name || "-"
    }%0Aنوع المرفق: ${form.facility}%0Aرقم الجوال: ${form.phone || defaultPhone}`;
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-2xl border border-navy-100 bg-white p-6 md:p-7 ${card ? "reveal" : ""}`}
    >
      <div className="type-card-title text-navy">اطلب زيارة تقييم مجانية</div>
      <p className="mt-1 text-eyebrow text-slate-brand">نرد عليك في أسرع وقت لترتيب الموعد.</p>
      <div className="mt-5 space-y-3">
        <div>
          <label className="label">اسم المنشأة</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثال: مطاعم النخبة"
          />
        </div>
        <div>
          <label className="label">نوع المرفق</label>
          <select
            className="input"
            value={form.facility}
            onChange={(e) => setForm({ ...form, facility: e.target.value })}
          >
            <option>مطعم / مطبخ تجاري</option>
            <option>فندق</option>
            <option>شركة / مقر تجاري</option>
            <option>سلسلة فروع</option>
            <option>أخرى</option>
          </select>
        </div>
        <div>
          <label className="label">رقم الجوال</label>
          <input
            className="input"
            dir="ltr"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="05xxxxxxxx"
          />
        </div>
      </div>
      <button type="submit" className="btn-primary mt-5 w-full">
        إرسال الطلب عبر واتساب
      </button>
    </form>
  );
}
