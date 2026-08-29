import { useEffect, useRef, useState } from "react";
import {
  Snowflake,
  Wind,
  ChefHat,
  Wrench,
  Timer,
  Gauge,
  FileText,
  Users,
  Award,
  MapPin,
  Globe,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Building2,
  Hotel,
  UtensilsCrossed,
  Store,
  Warehouse,
  Stethoscope,
  GraduationCap,
  Instagram,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { api } from "../lib/api";
import { Logo } from "../components/Logo";

/* بيانات الشركة الرسمية (مصدر الحقيقة لصفحة الهبوط) */
const COMPANY = {
  phoneIntl: "966552535923",
  phoneDisplay: "+966 55 253 5923",
  email: "info@ansamair.sa",
  website: "ansamair.sa",
  social: "AnsamairSA",
  cr: "1010686317",
  address: "ابن عساكر، الدريهمية، مدينة الرياض، المملكة العربية السعودية",
  tagline: "لا يحتر تبريدك … ولا يبرد مطبخك.",
};

const QUICK_FACTS = [
  { label: "الكيان", value: "شركة سعودية مرخّصة — سجل تجاري رقم 1010686317" },
  { label: "المقر", value: "مدينة الرياض — وتغطية تشمل جميع أحياء الرياض" },
  { label: "التخصص", value: "تكييف • تبريد تجاري • مطابخ وأفران صناعية" },
  { label: "نموذج العمل", value: "عقود صيانة سنوية • مشاريع تركيب • طوارئ على مدار الساعة" },
  { label: "الاستجابة الطارئة", value: "خلال 30 دقيقة في أوقات العمل داخل نطاق التغطية المعتمد" },
];

const VALUES = [
  {
    icon: Timer,
    title: "السرعة مسؤولية",
    desc: "نتعامل مع وقت العميل كأصل مالي. التزامنا بزمن الاستجابة بندٌ تعاقدي لا شعار تسويقي.",
  },
  {
    icon: Wrench,
    title: "الإتقان في التفاصيل",
    desc: "لا حلول مؤقتة — نعالج السبب الجذري ونسلّم تقريراً فنياً بما نُفِّذ وما يجب مراقبته لاحقاً.",
  },
  {
    icon: FileText,
    title: "الشفافية",
    desc: "تسعير واضح قبل التنفيذ وتقارير موثّقة بعده. لا تكاليف مفاجئة ولا بنود غامضة.",
  },
  {
    icon: BadgeCheck,
    title: "الاحترافية والانضباط",
    desc: "فنيون بزيّ موحّد وسلوك مهني والتزام بمواعيد الدخول والخروج واشتراطات المنشأة الأمنية.",
  },
  {
    icon: ShieldCheck,
    title: "السلامة أولاً",
    desc: "التزام بمعايير السلامة في التعامل مع الكهرباء وغازات التبريد والمعدات ذات الضغط العالي.",
  },
];

const DIFFERENTIATORS = [
  {
    icon: Timer,
    title: "استجابة طارئة خلال 30 دقيقة",
    desc: "فرق مناوبة وتوزيع جغرافي مدروس داخل الرياض وخط طوارئ مباشر — نصل بأسرع وقت داخل نطاق التغطية المعتمد.",
  },
  {
    icon: Snowflake,
    title: "تخصص في المعدات النادرة",
    desc: "غرف التبريد والتجميد الكبيرة وثلاجات العرض الضخمة والأفران الصناعية وخطوط المطابخ — تخصص يفتقر إليه أغلب المزوّدين.",
  },
  {
    icon: FileText,
    title: "عقود بمستوى خدمة مكتوبة",
    desc: "زمن استجابة محدّد وزيارات دورية وأولوية تنفيذ وبنود واضحة للطرفين. التزامنا موثّق لا شفهي.",
  },
  {
    icon: ShieldCheck,
    title: "ضمان على جودة التنفيذ",
    desc: "توثيق جميع أعمال الصيانة وتزويد العميل بالتقارير الدورية.",
  },
  {
    icon: Gauge,
    title: "صيانة وقائية تمنع العطل",
    desc: "جدولة دورية تقلّل الأعطال المفاجئة وتخفض استهلاك الطاقة وتطيل العمر التشغيلي للمعدة.",
  },
  {
    icon: Award,
    title: "شركة سعودية بكوادر مؤهلة",
    desc: "كيان وطني مرخّص في الرياض وتعامل نظامي بعقود رسمية.",
  },
];

const SERVICE_GROUPS = [
  {
    icon: Wind,
    title: "التكييف والتهوية",
    items: [
      "توريد وتركيب أنظمة التكييف: سبليت، دكت مخفي، شباك، VRF/VRV، تشيلر، ووحدات مناولة الهواء.",
      "الصيانة الدورية الشاملة: تنظيف وفحص الضغوط وتعبئة غاز التبريد والفحص الكهربائي.",
      "كشف وإصلاح التسريبات ومعالجة ضعف التبريد.",
      "إصلاح واستبدال الضواغط ولوحات التحكم.",
      "تمديد وتعديل مجاري الهواء وأنظمة التهوية والشفط.",
      "تنظيف وتعقيم مجاري الهواء لتحسين جودة الهواء الداخلي.",
      "دراسة الأحمال الحرارية والتوصية بالحل الأنسب للمساحة.",
    ],
  },
  {
    icon: Snowflake,
    title: "التبريد التجاري والصناعي",
    highlight: "تخصصنا الأبرز",
    items: [
      "غرف التبريد والتجميد: تركيب، صيانة، عزل، وإصلاح الأعطال.",
      "ثلاجات وبرادات العرض الضخمة والمجمّدات الأفقية والرأسية.",
      "وحدات التبريد المركزي للمستودعات والمخازن الغذائية.",
      "ثلاجات الصيدليات والمستودعات الطبية الحساسة لدرجات الحرارة.",
      "أنظمة التحكم بالحرارة والإنذار عند الخروج عن النطاق الآمن.",
      "معالجة تراكم الثلج وضعف التبريد وتسريب الغاز وأعطال الضواغط.",
      "تعديل درجات التشغيل بحسب طبيعة المنتج المخزّن.",
    ],
  },
  {
    icon: ChefHat,
    title: "المطابخ التجارية والأفران",
    items: [
      "الأفران الصناعية: كهربائية، غاز، حِمل حراري (كونفكشن)، وأفران المخابز والبيتزا.",
      "معدات الطهي: القلايات والشوايات والطباخات والبخاريات وحمامات التسخين.",
      "شفاطات المطابخ وأنظمة الطرد والتهوية وفلاتر الدهون.",
      "غسالات الصحون الصناعية ومعدات التجهيز.",
      "تركيب خطوط المطابخ التجارية المتكاملة وتشغيلها التجريبي.",
      "الصيانة الوقائية بما يتوافق مع اشتراطات السلامة والصحة الغذائية.",
      "معالجة أعطال الثرموستات وعناصر التسخين وصمامات الغاز ولوحات التحكم.",
    ],
  },
];

const SECTORS = [
  { icon: Hotel, title: "الفنادق والشقق الفندقية", desc: "راحة النزيل لا تحتمل التأجيل؛ نعمل بسرّية وانضباط داخل المرافق." },
  { icon: UtensilsCrossed, title: "المطاعم والمقاهي والسلاسل", desc: "تغطية موحّدة لجميع الفروع بعقد واحد وتقرير مركزي." },
  { icon: Building2, title: "الشركات والمقرات الإدارية", desc: "بيئة عمل مستقرة وصيانة مجدولة دون تعطيل للدوام." },
  { icon: Store, title: "التجزئة والهايبرماركت", desc: "حماية سلسلة التبريد وسلامة المخزون الغذائي." },
  { icon: Warehouse, title: "المستودعات والمخازن المبرّدة", desc: "مراقبة درجات الحرارة وضمان استمرارية التشغيل." },
  { icon: Stethoscope, title: "القطاع الصحي والصيدليات", desc: "تبريد دقيق للمنتجات الحساسة وفق الاشتراطات." },
  { icon: GraduationCap, title: "المنشآت التعليمية والحكومية", desc: "عقود تشغيل وصيانة شاملة." },
];

const CONTRACT_BENEFITS = [
  "تكلفة سنوية معلومة بلا مفاجآت في الميزانية التشغيلية.",
  "تقليل نسبة الأعطال المفاجئة عبر الصيانة الوقائية المجدولة.",
  "إطالة العمر التشغيلي للمعدات وخفض استهلاك الطاقة.",
  "أرشيف صيانة موثّق يخدم التدقيق ومتطلبات الجودة.",
];

const WORKFLOW = [
  { title: "الاستلام والتصنيف", desc: "ردٌّ فوري عبر القنوات المعتمدة وتصنيف البلاغ (طارئ / عاجل / مجدول)." },
  { title: "التوجيه الميداني", desc: "إسناد أقرب فريق مؤهّل للمعدة المعنية؛ وفي الطوارئ تحرّك خلال دقائق." },
  { title: "التشخيص", desc: "فحص ميداني وتحديد السبب الجذري لا العَرَض الظاهر فقط." },
  { title: "الاعتماد والتسعير", desc: "عرض واضح بالتكلفة والمدة قبل التنفيذ — ولا تنفيذ دون موافقة." },
  { title: "التنفيذ", desc: "إصلاح بقطع أصلية وأدوات متخصصة والتزام بمعايير السلامة." },
  { title: "التشغيل والاختبار", desc: "تشغيل تجريبي والتأكد من عودة الأداء إلى مستواه الطبيعي." },
  { title: "التقرير والمتابعة", desc: "تقرير مصوّر بالإجراءات والتوصيات ومتابعة لاحقة للتأكد من الاستقرار." },
];

const QUALITY = [
  "الالتزام بمعايير السلامة المهنية في التعامل مع الكهرباء وغازات التبريد والضغط العالي.",
  "استخدام قطع غيار أصلية ومعتمدة وتوثيق مصدرها في التقرير الفني.",
  "التعامل النظامي مع غازات التبريد وفق الاشتراطات البيئية المعتمدة.",
  "فنيون مدرَّبون ومزوّدون بمعدات الوقاية الشخصية.",
  "سجل صيانة إلكتروني لدى العميل.",
  "التزام بسياسات الدخول والتصاريح الأمنية داخل منشأة العميل.",
];

const TEAM = [
  { icon: Wrench, title: "فنيون متخصصون", desc: "في التبريد التجاري والمعدات الثقيلة مع تدريب مستمر على الأنظمة الحديثة." },
  { icon: ShieldCheck, title: "مشرفو جودة ميدانيون", desc: "لمراجعة الأعمال والتأكد من مطابقتها للمعايير." },
  { icon: Timer, title: "غرفة عمليات", desc: "لاستقبال البلاغات وتوزيعها ومتابعة زمن الاستجابة لحظياً." },
  { icon: Users, title: "إدارة حسابات العقود", desc: "نقطة تواصل واحدة تعرف تفاصيل منشأتك." },
];

const COMPARISON = [
  { without: "بحث عن فنيّ وقت الأزمة", withUs: "فريق مخصّص يعرف معداتك مسبقاً" },
  { without: "أسعار طوارئ مرتفعة وغير متوقعة", withUs: "تكلفة سنوية ثابتة ومعلومة" },
  { without: "أعطال مفاجئة متكررة", withUs: "صيانة وقائية تقلّل الأعطال" },
  { without: "توقّف تشغيلي وخسائر مخزون", withUs: "استجابة خلال 30 دقيقة في أوقات العمل" },
  { without: "لا سجل ولا توثيق", withUs: "تقارير وأرشيف صيانة كامل" },
  { without: "عمر أقصر للمعدات", withUs: "إطالة العمر التشغيلي وخفض استهلاك الطاقة" },
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
      { threshold: 0.15 }
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
  const banners: string[] = (l.banners || []).filter(Boolean);
  const tel = `tel:+${COMPANY.phoneIntl}`;
  const wa = `https://wa.me/${COMPANY.phoneIntl}`;
  const mailto = `mailto:${COMPANY.email}`;

  return (
    <div className="min-h-screen bg-cream">
      <a href="#main-content" className="skip-link">
        تخطَّ إلى المحتوى
      </a>
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-40 border-b border-navy-100/60 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#" aria-label="أنسام — الصفحة الرئيسية" className="flex items-center">
            <img src="/ansam-lockup-horizontal.svg" alt="أنسام" className="h-8 w-auto md:h-10" />
          </a>
          <nav aria-label="روابط الموقع" className="hidden items-center gap-7 text-sm font-medium text-slate-brand lg:flex">
            <a href="#about" className="nav-link hover:text-brand">من نحن</a>
            <a href="#services" className="nav-link hover:text-brand">خدماتنا</a>
            <a href="#sectors" className="nav-link hover:text-brand">القطاعات</a>
            <a href="#contracts" className="nav-link hover:text-brand">عقود الصيانة</a>
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
                <a role="menuitem" href={wa} target="_blank" rel="noreferrer" onClick={() => setCtaOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy transition hover:bg-navy-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand"><MessageCircle className="h-4 w-4" aria-hidden="true" /></span>
                  واتساب
                </a>
                <a role="menuitem" href={tel} onClick={() => setCtaOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy transition hover:bg-navy-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand"><Phone className="h-4 w-4" aria-hidden="true" /></span>
                  اتصال هاتفي
                </a>
                <a role="menuitem" href={mailto} onClick={() => setCtaOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy transition hover:bg-navy-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand"><Mail className="h-4 w-4" aria-hidden="true" /></span>
                  البريد الإلكتروني
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* البطل */}
      <main id="main-content">
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        {banners.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <div className="hidden h-full md:flex">
              {banners.slice(0, 3).map((src, i) => (
                <img key={i} src={src} alt="" className="h-full flex-1 object-cover" />
              ))}
            </div>
            <div className="relative h-full md:hidden">
              {banners.map((src, i) => (
                <img key={i} src={src} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === bannerIndex % banners.length ? "opacity-100" : "opacity-0"}`} />
              ))}
            </div>
            <div className="absolute inset-0 bg-cream/85" />
          </div>
        )}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-sky-soft/40 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="fade-in">
            <span className="badge bg-sky-soft text-brand-dark">تكييف • تبريد تجاري • مطابخ وأفران</span>
            <h1 id="hero-title" className="mt-5 max-w-[20ch] text-4xl font-medium leading-tight text-navy md:text-5xl">
              {l.hero_title || "استمرارية تشغيل — لا مجرد زيارة صيانة"}
            </h1>
            <p className="mt-5 max-w-[54ch] text-lg leading-relaxed text-slate-brand">
              {l.hero_subtitle ||
                "شركة سعودية في الرياض متخصصة في التكييف والتبريد والمعدات التجارية الثقيلة، باستجابة ميدانية مضمونة وفنيين مؤهلين للمعدات التي يندر من يجيد صيانتها."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={tel} className="btn-brand">
                <Phone className="h-5 w-5" aria-hidden="true" />
                اطلب الخدمة الآن
              </a>
              <a href="#services" className="btn-ghost">
                تعرّف على خدماتنا
                <ArrowLeft className="arrow h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-brand">
              <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" /> فنيون معتمدون</span>
              <span className="flex items-center gap-2"><Timer className="h-5 w-5 text-brand" aria-hidden="true" /> استجابة خلال 30 دقيقة</span>
              <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-brand" aria-hidden="true" /> طوارئ على مدار الساعة</span>
            </div>
          </div>

          <div className="relative fade-in">
            <div className="card overflow-hidden bg-navy-gradient p-8 text-white shadow-glow">
              <img src="/ansam-mark-white.svg" alt="" aria-hidden="true" className="mb-4 h-14 w-14 object-contain" />
              <div className="text-2xl font-medium">{COMPANY.tagline}</div>
              <p className="mt-3 text-sky-soft/80">
                نُمكّن المنشآت التجارية والفندقية من العمل دون انقطاع عبر صيانة استباقية واستجابة طارئة سريعة.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { n: "30 د", t: "زمن الاستجابة" },
                  { n: "24/7", t: "طوارئ" },
                  { n: "100%", t: "توثيق" },
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

      {/* كلمة البداية */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="reveal card relative overflow-hidden p-8 md:p-12">
          <Sparkles className="absolute -left-4 -top-4 h-24 w-24 text-brand/5" aria-hidden="true" />
          <span className="badge bg-sky-soft text-brand-dark">كلمة البداية</span>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-slate-brand">
            <p>
              في قطاع الضيافة والمنشآت التجارية، لا يُقاس نجاح مزوّد الخدمة بجودة الإصلاح فحسب، بل بسرعة وصوله قبل أن تتحوّل العطل إلى خسارة.
            </p>
            <p>
              توقّف غرفة تبريد لساعات يعني إتلاف مخزون كامل. تعطّل فرن في وقت الذروة يعني إيقاف المطبخ. ارتفاع حرارة جناح فندقي يعني شكوى نزيل وتقييماً سلبياً دائماً.
            </p>
            <p>
              من هذه النقطة تحديداً انطلقت <strong className="text-navy">«أنسام»</strong>: شركة سعودية مقرها الرياض، متخصصة في التكييف والتبريد والمعدات التجارية الثقيلة، تعمل بمعايير تشغيلية واضحة واستجابة ميدانية مضمونة وفنيين مؤهلين للمعدات التي يندر من يجيد صيانتها.
            </p>
            <p className="text-xl font-medium text-navy">
              نحن لا نقدّم «زيارة صيانة» — نحن نقدّم استمرارية تشغيل.
            </p>
          </div>
          <div className="mt-6 text-sm font-medium text-brand">— المؤسّس</div>
        </div>
      </section>

      {/* من نحن + مؤشرات سريعة */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="reveal">
            <h2 className="text-3xl font-medium text-navy">من نحن</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-slate-brand">
              <p>
                «أنسام» شركة سعودية في مدينة الرياض، متخصصة في تركيب وصيانة وإصلاح أنظمة التكييف والتبريد والمعدات التجارية للمطاعم والفنادق والمنشآت.
              </p>
              <p>
                تأسست برؤية واضحة: سدّ فجوة حقيقية في السوق السعودي تتمثل في نقص الفنيين المؤهلين للتعامل مع المعدات التجارية الضخمة — الثلاجات والغرف المبرّدة الكبيرة والأفران الصناعية وخطوط المطابخ التجارية — وهي معدات مرتفعة التكلفة يكبّد توقفها المنشأة خسائر مباشرة.
              </p>
              <p>
                نعمل وفق نموذج العقود التشغيلية مع الشركات والفنادق والمطاعم والمجمعات، إلى جانب خدمات الطوارئ الفورية، معتمدين على كوادر فنية مدرّبة.
              </p>
              <p>
                ونعتزّ بكوننا كياناً وطنياً يسهم في رؤية المملكة 2030 عبر توطين المهن التقنية المتخصصة ورفع جودة الخدمات المساندة.
              </p>
            </div>
          </div>
          <div className="reveal">
            <div className="card overflow-hidden">
              <div className="border-b border-navy-100 bg-navy-50/60 px-6 py-4">
                <h3 className="flex items-center gap-2 font-medium text-navy">
                  <Gauge className="h-5 w-5 text-brand" /> مؤشرات سريعة
                </h3>
              </div>
              <dl className="divide-y divide-navy-100">
                {QUICK_FACTS.map((f) => (
                  <div key={f.label} className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-navy">{f.label}</dt>
                    <dd className="text-sm leading-relaxed text-slate-brand sm:col-span-2">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* الرؤية والرسالة */}
      <section className="bg-navy-gradient py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="reveal rounded-xl2 border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-medium">رؤيتنا</h3>
              <p className="mt-3 leading-relaxed text-sky-soft/85">
                أن نكون الخيار الأول والموثوق في المملكة لحلول التكييف والتبريد والمعدات التجارية، والاسم الذي تستدعيه المنشآت حين لا يكون هناك مجال للخطأ.
              </p>
            </div>
            <div className="reveal rounded-xl2 border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-medium">رسالتنا</h3>
              <p className="mt-3 leading-relaxed text-sky-soft/85">
                تمكين المنشآت التجارية والفندقية من العمل دون انقطاع، عبر صيانة استباقية واستجابة طارئة سريعة ينفّذها فنيون مؤهلون، وفق معايير جودة وسلامة موثّقة وشفافية كاملة في التكلفة والتقارير.
              </p>
            </div>
          </div>
          <div className="reveal mt-6 rounded-xl2 bg-white/10 p-6 text-center">
            <p className="text-sm text-sky-soft/80">وعدنا لعملائنا</p>
            <p className="mt-1 text-2xl font-medium">{COMPANY.tagline}</p>
          </div>
        </div>
      </section>

      {/* قيمنا */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="reveal mb-10 text-center">
          <h2 className="text-3xl font-medium text-navy">قيمنا</h2>
          <p className="mt-2 text-slate-brand">مبادئ نعمل بها كل يوم في الميدان</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v, i) => (
            <div key={v.title} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="card group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-navy">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-brand">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ما يميّزنا */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal mb-10 text-center">
            <h2 className="text-3xl font-medium text-navy">ما الذي يميّزنا فعلياً</h2>
            <p className="mt-2 text-slate-brand">فرق حقيقي تلمسه في كل بلاغ وكل تقرير</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS.map((d, i) => (
              <div key={d.title} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="group h-full rounded-xl2 border border-navy-100 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/30 hover:shadow-glow">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                    <d.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-navy">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-brand">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* خدماتنا */}
      <section id="services" className="mx-auto max-w-6xl px-5 py-16">
        <div className="reveal mb-10 text-center">
          <h2 className="text-3xl font-medium text-navy">خدماتنا</h2>
          <p className="mt-2 text-slate-brand">ثلاثة محاور متكاملة تغطي معدات المنشأة من الألف إلى الياء</p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {SERVICE_GROUPS.map((g, i) => (
            <div key={g.title} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="card flex h-full flex-col p-7">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <g.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-medium text-navy">{g.title}</h3>
                    {g.highlight && <span className="text-xs font-medium text-brand">{g.highlight}</span>}
                  </div>
                </div>
                <ul className="mt-2 space-y-2.5">
                  {g.items.map((it, j) => (
                    <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-slate-brand">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* القطاعات */}
      <section id="sectors" className="bg-navy-gradient py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal mb-10 text-center">
            <h2 className="text-3xl font-medium">القطاعات التي نخدمها</h2>
            <p className="mt-2 text-sky-soft/80">حلول مصمّمة لطبيعة كل منشأة</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((s, i) => (
              <div key={s.title} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="group h-full rounded-xl2 border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:bg-white/10">
                  <s.icon className="mb-4 h-9 w-9 text-sky-soft transition-transform duration-300 group-hover:-rotate-6" />
                  <h3 className="text-lg font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm text-sky-soft/80">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* عقود الصيانة السنوية */}
      <section id="contracts" className="mx-auto max-w-6xl px-5 py-16">
        <div className="reveal card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-10">
              <span className="badge bg-sky-soft text-brand-dark">نموذجنا الأساسي</span>
              <h2 className="mt-4 text-3xl font-medium text-navy">عقود الصيانة السنوية</h2>
              <p className="mt-3 leading-relaxed text-slate-brand">
                تمنح المنشأة أولوية في الاستجابة وتكلفة تشغيلية ثابتة ومتوقعة — راحة بال طوال العام.
              </p>
              <a href={wa} target="_blank" rel="noreferrer" className="btn-brand mt-6">
                <MessageCircle className="h-5 w-5" />
                اطلب عرض عقد سنوي
              </a>
            </div>
            <div className="bg-navy-50/50 p-8 md:p-10">
              <h3 className="font-medium text-navy">مزايا التعاقد</h3>
              <ul className="mt-4 space-y-3">
                {CONTRACT_BENEFITS.map((b, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-brand">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* آلية العمل */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal mb-10 text-center">
            <h2 className="text-3xl font-medium text-navy">آلية العمل</h2>
            <p className="mt-2 text-slate-brand">من البلاغ إلى الاستقرار — سبع خطوات موثّقة</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WORKFLOW.map((w, i) => (
              <div key={w.title} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="flex h-full gap-4 rounded-xl2 border border-navy-100 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-navy">{w.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-brand">{w.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* الجودة والسلامة والضمان */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-8 lg:grid-cols-5">
          <div className="reveal lg:col-span-2">
            <h2 className="text-3xl font-medium text-navy">الجودة والسلامة والضمان</h2>
            <p className="mt-3 leading-relaxed text-slate-brand">
              التزام موثّق في كل خطوة — من قطع الغيار الأصلية إلى سجلّ الصيانة الإلكتروني لدى العميل.
            </p>
          </div>
          <div className="reveal lg:col-span-3">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {QUALITY.map((q, i) => (
                <li key={i} className="flex gap-2.5 rounded-xl2 border border-navy-100 p-4 text-sm leading-relaxed text-slate-brand">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* فريقنا */}
      <section className="bg-navy-gradient py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal mb-10 text-center">
            <h2 className="text-3xl font-medium">فريقنا</h2>
            <p className="mt-2 text-sky-soft/80">خلف كل استجابة سريعة فريق منظّم</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((t, i) => (
              <div key={t.title} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="h-full rounded-xl2 border border-white/10 bg-white/5 p-6">
                  <t.icon className="mb-4 h-9 w-9 text-sky-soft" />
                  <h3 className="font-medium">{t.title}</h3>
                  <p className="mt-2 text-sm text-sky-soft/80">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* لماذا تتعاقد مع أنسام الآن */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="reveal mb-10 text-center">
          <h2 className="text-3xl font-medium text-navy">لماذا تتعاقد مع أنسام الآن</h2>
          <p className="mt-2 text-slate-brand">الفرق بين انتظار الأزمة والاستعداد لها</p>
        </div>
        <div className="reveal grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-xl2 border border-navy-100 bg-white p-7">
            <h3 className="mb-4 font-medium text-steel">الوضع دون عقد صيانة</h3>
            <ul className="space-y-3">
              {COMPARISON.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-brand">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-steel/70" />
                  <span>{r.without}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl2 border border-brand/30 bg-sky-soft/30 p-7 shadow-glow">
            <h3 className="mb-4 flex items-center gap-2 font-medium text-brand-dark">
              <BadgeCheck className="h-5 w-5 text-brand" /> مع أنسام
            </h3>
            <ul className="space-y-3">
              {COMPARISON.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-navy">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span>{r.withUs}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* تواصل */}
      <section id="contact" className="mx-auto max-w-6xl px-5 py-16">
        <div className="reveal card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-medium text-navy">تواصل معنا</h2>
              <p className="mt-2 text-slate-brand">جاهزون لخدمتك — لطلب الخدمة أو عقد صيانة أو عرض سعر.</p>
              <div className="mt-6 space-y-4">
                <a href={tel} className="flex items-center gap-3 text-navy hover:text-brand">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><Phone className="h-5 w-5" aria-hidden="true" /></span>
                  <span><span className="block text-xs text-steel">الرقم الموحّد</span><span dir="ltr">{COMPANY.phoneDisplay}</span></span>
                </a>
                <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-navy hover:text-brand">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><MessageCircle className="h-5 w-5" aria-hidden="true" /></span>
                  <span><span className="block text-xs text-steel">واتساب الأعمال</span><span dir="ltr">{COMPANY.phoneDisplay}</span></span>
                </a>
                <a href={mailto} className="flex items-center gap-3 text-navy hover:text-brand">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><Mail className="h-5 w-5" aria-hidden="true" /></span>
                  <span><span className="block text-xs text-steel">البريد الإلكتروني</span><span dir="ltr">{COMPANY.email}</span></span>
                </a>
                <a href={`https://${COMPANY.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-navy hover:text-brand">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><Globe className="h-5 w-5" aria-hidden="true" /></span>
                  <span><span className="block text-xs text-steel">الموقع الإلكتروني</span><span dir="ltr">{COMPANY.website}</span></span>
                </a>
                <a href={`https://instagram.com/${COMPANY.social}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-navy hover:text-brand">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><Instagram className="h-5 w-5" aria-hidden="true" /></span>
                  <span><span className="block text-xs text-steel">حسابات التواصل</span><span dir="ltr">@{COMPANY.social}</span></span>
                </a>
                <div className="flex items-center gap-3 text-navy">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><MapPin className="h-5 w-5" aria-hidden="true" /></span>
                  <span><span className="block text-xs text-steel">الإدارة</span>{COMPANY.address}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-navy-gradient p-8 text-center text-white md:p-10">
              <Logo className="h-16 w-16" onDark />
              <div className="mt-4 text-2xl font-medium">أنسام</div>
              <p className="mt-2 max-w-xs text-sm text-sky-soft/80">{COMPANY.tagline}</p>
              <p className="mt-4 text-xs text-sky-soft/70">سجل تجاري رقم {COMPANY.cr}</p>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* التذييل */}
      <footer className="border-t border-navy-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-steel md:flex-row">
          <a href="#" aria-label="أنسام" className="flex items-center">
            <img src="/ansam-lockup-horizontal.svg" alt="أنسام" className="h-7 w-auto" />
          </a>
          <span className="text-center">أنسام — {COMPANY.tagline}</span>
          <span>© {new Date().getFullYear()} جميع الحقوق محفوظة</span>
        </div>
      </footer>
    </div>
  );
}
