"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/hooks/useLanguage";

const content = {
  en: {
    dir: "ltr",
    badge: "Get in Touch",
    title: "Contact",
    title1: "Us",
    subtitle: "We're here to help — hosts, guests, and everyone in between",
    effective: "Available 7 days a week",
    lastUpdated: "Response within 24 hours",
    toc: "Quick Links",

    /* ── CONTACT CARDS ── */
    cardsHeading: "Reach Us Directly",
    cards: [
      {
        icon: "✉️",
        title: "General Support",
        desc: "Questions about bookings, accounts, or the platform",
        value: "support@mar-haba.ly",
        type: "email",
      },
      {
        icon: "🏠",
        title: "Host Support",
        desc: "Subscription, listing management, and host tools",
        value: "hosts@mar-haba.ly",
        type: "email",
      },
      {
        icon: "🔒",
        title: "Privacy & Legal",
        desc: "Data requests, privacy concerns, legal inquiries",
        value: "privacy@mar-haba.ly",
        type: "email",
      },
      {
        icon: "📍",
        title: "Our Location",
        desc: "Based and operating in",
        value: "Libya",
        type: "location",
      },
    ],

    /* ── FORM ── */
    formHeading: "Send Us a Message",
    formSubheading:
      "Fill in the form below and our team will get back to you within 24 hours.",
    fields: {
      name: "Full Name",
      namePlaceholder: "Your full name",
      email: "Email Address",
      emailPlaceholder: "you@example.com",
      role: "I am a",
      roleOptions: ["Guest", "Host", "Just browsing"],
      subject: "Subject",
      subjectPlaceholder: "What's this about?",
      message: "Message",
      messagePlaceholder: "Tell us how we can help you...",
      submit: "Send Message",
      submitting: "Sending...",
    },
    successTitle: "Message sent!",
    successDesc:
      "Thanks for reaching out. We'll get back to you at your email address within 24 hours.",
    sendAnother: "Send another message",

    /* ── FAQ ── */
    faqHeading: "Frequently Asked Questions",
    faqs: [
      {
        q: "How do I create a host account?",
        a: "Click 'Get Started' on the homepage and select 'Host' during sign-up. Once registered, you can list your first property immediately.",
      },
      {
        q: "How much does it cost to list on Marhaba?",
        a: "Marhaba charges hosts a single flat-rate subscription fee every six months. There are no per-booking commissions — you keep 100% of what guests pay you.",
      },
      {
        q: "Does Marhaba handle payments between guests and hosts?",
        a: "No. Marhaba does not process or facilitate any payments between hosts and guests. All payment arrangements are made directly and privately between the two parties.",
      },
      {
        q: "How do I cancel or modify a booking?",
        a: "Log in to your dashboard, go to 'My Bookings', and select the booking you wish to manage. Both hosts and guests can cancel bookings through the platform.",
      },
      {
        q: "What happens if a guest doesn't show up?",
        a: "Hosts can flag a booking as a 'no-show' through their dashboard. Repeated no-shows by a guest may affect their ability to book on Marhaba in the future.",
      },
      {
        q: "Can I list multiple properties?",
        a: "Yes. A single host subscription gives you access to list and manage multiple properties from your host dashboard.",
      },
      {
        q: "How do I update my listing photos or details?",
        a: "Go to your host dashboard, select the listing you want to edit, and update any details or photos. Changes go live immediately.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Click 'Sign In' on the homepage, then 'Forgot Password'. We'll send a reset link to your registered email address.",
      },
    ],

    footer: {
      desc: "Libya's trusted short-term rental platform connecting hosts and travelers.",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
  },

  /* ════════════════════════════════════════
     ARABIC
  ════════════════════════════════════════ */
  ar: {
    dir: "rtl",
    badge: "تواصل معنا",
    title: "اتصل",
    title1: "بنا",
    subtitle: "نحن هنا للمساعدة — للمضيفين والضيوف والجميع",
    effective: "متاحون 7 أيام في الأسبوع",
    lastUpdated: "رد خلال 24 ساعة",
    toc: "روابط سريعة",

    cardsHeading: "تواصل معنا مباشرةً",
    cards: [
      {
        icon: "✉️",
        title: "الدعم العام",
        desc: "أسئلة حول الحجوزات والحسابات والمنصة",
        value: "support@mar-haba.ly",
        type: "email",
      },
      {
        icon: "🏠",
        title: "دعم المضيفين",
        desc: "الاشتراك وإدارة القوائم وأدوات المضيف",
        value: "hosts@mar-haba.ly",
        type: "email",
      },
      {
        icon: "🔒",
        title: "الخصوصية والشؤون القانونية",
        desc: "طلبات البيانات والمخاوف المتعلقة بالخصوصية والاستفسارات القانونية",
        value: "privacy@mar-haba.ly",
        type: "email",
      },
      {
        icon: "📍",
        title: "موقعنا",
        desc: "مقرنا وعملياتنا في",
        value: "ليبيا",
        type: "location",
      },
    ],

    formHeading: "أرسل لنا رسالة",
    formSubheading: "املأ النموذج أدناه وسيتواصل معك فريقنا خلال 24 ساعة.",
    fields: {
      name: "الاسم الكامل",
      namePlaceholder: "اسمك الكامل",
      email: "البريد الإلكتروني",
      emailPlaceholder: "example@email.com",
      role: "أنا",
      roleOptions: ["ضيف", "مضيف", "أتصفح فقط"],
      subject: "الموضوع",
      subjectPlaceholder: "ما الذي تودّ الاستفسار عنه؟",
      message: "الرسالة",
      messagePlaceholder: "أخبرنا كيف يمكننا مساعدتك...",
      submit: "إرسال الرسالة",
      submitting: "جارٍ الإرسال...",
    },
    successTitle: "تم إرسال رسالتك!",
    successDesc:
      "شكرًا لتواصلك معنا. سنرد عليك على بريدك الإلكتروني خلال 24 ساعة.",
    sendAnother: "إرسال رسالة أخرى",

    faqHeading: "الأسئلة الشائعة",
    faqs: [
      {
        q: "كيف أنشئ حساب مضيف؟",
        a: "انقر على 'ابدأ الآن' في الصفحة الرئيسية واختر 'مضيف' أثناء التسجيل. بمجرد التسجيل، يمكنك إدراج عقارك الأول فورًا.",
      },
      {
        q: "كم تكلفة الإدراج على مرحبا؟",
        a: "تفرض مرحبا على المضيفين رسوم اشتراك ثابتة واحدة كل ستة أشهر. لا توجد عمولات على كل حجز — تحتفظ بـ100% مما يدفعه لك الضيوف.",
      },
      {
        q: "هل تتعامل مرحبا بالمدفوعات بين الضيوف والمضيفين؟",
        a: "لا. لا تعالج مرحبا أي مدفوعات بين المضيفين والضيوف. تُرتَّب جميع ترتيبات الدفع بصورة خاصة ومباشرة بين الطرفين.",
      },
      {
        q: "كيف أُلغي أو أعدّل حجزًا؟",
        a: "سجّل دخولك إلى لوحة التحكم، وانتقل إلى 'حجوزاتي'، واختر الحجز الذي تريد إدارته. يستطيع كل من المضيف والضيف إلغاء الحجوزات عبر المنصة.",
      },
      {
        q: "ماذا يحدث إذا لم يحضر الضيف؟",
        a: "يمكن للمضيف تسجيل الحجز كـ'عدم حضور' من خلال لوحة التحكم. قد تؤثر حالات عدم الحضور المتكررة من قِبل الضيف على قدرته في الحجز مستقبلًا.",
      },
      {
        q: "هل يمكنني إدراج أكثر من عقار؟",
        a: "نعم. اشتراك المضيف الواحد يتيح لك إدراج وإدارة عدة عقارات من لوحة التحكم الخاصة بك.",
      },
      {
        q: "كيف أحدّث صور أو تفاصيل قائمتي؟",
        a: "انتقل إلى لوحة التحكم الخاصة بك، اختر القائمة التي تريد تعديلها، وحدّث أي تفاصيل أو صور. تظهر التغييرات فورًا.",
      },
      {
        q: "نسيت كلمة المرور. ماذا أفعل؟",
        a: "انقر على 'تسجيل الدخول' في الصفحة الرئيسية، ثم 'نسيت كلمة المرور'. سنرسل رابط إعادة تعيين إلى بريدك الإلكتروني المسجّل.",
      },
    ],

    footer: {
      desc: "منصة التأجير قصير الأمد الموثوقة في ليبيا تربط المضيفين والمسافرين.",
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
    },
  },
};

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    role: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const { lang, toggleLanguage } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  const c = content[lang];
  const isAr = lang === "ar";

  const navLinks = [
    { id: "home", label: isAr ? "→ الرئيسية" : "← Home", href: "/" },
  ];

  const handleChange = (e) =>
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      console.log(data.message);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir={c.dir} className="bg-white min-h-screen text-gray-900">
      {/* NAV */}
      <Navbar
        NAV_LINKS={navLinks}
        user={null}
        lang={lang}
        toggleLanguage={toggleLanguage}
      />

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-[#1a1a2e] via-[#2d2d5e] to-[#1a1a2e] py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(232,197,71,0.12)_0%,transparent_60%)] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#e8c547 0px,#e8c547 1px,transparent 1px,transparent 40px)",
          }}
        />
        <div className="max-w-screen-xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 px-3.5 py-1.5 rounded-full text-[11px] tracking-widest uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
            {c.badge}
          </div>
          <h1
            className={`font-light text-[clamp(32px,5vw,56px)] text-white leading-[1.1] mb-3 ${
              isAr
                ? "font-['Cairo','Tajawal',sans-serif]"
                : "font-['Fraunces',serif] italic"
            }`}
          >
            {c.title}
            <span className="font-bold text-[#e8c547]"> {c.title1}</span>
          </h1>
          <p className="text-white/50 text-[15px] mb-5">{c.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <span className="text-[12px] text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              {c.effective}
            </span>
            <span className="text-[12px] text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              {c.lastUpdated}
            </span>
          </div>
        </div>
      </section>

      {/* ── CONTACT CARDS ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-4">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-2 font-semibold">
          {c.cardsHeading}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {c.cards.map((card) => (
            <div
              key={card.title}
              className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-yellow-300 hover:shadow-sm transition-all"
            >
              <span className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-xl shrink-0">
                {card.icon}
              </span>
              <div>
                <div className="font-semibold text-gray-900 text-[14px] mb-0.5">
                  {card.title}
                </div>
                <div className="text-[12px] text-gray-500 mb-2">
                  {card.desc}
                </div>
                {card.type === "email" ? (
                  <a
                    href={`mailto:${card.value}`}
                    className="text-[13px] text-[#1a1a2e] font-semibold no-underline hover:text-yellow-600 transition-colors break-all"
                  >
                    {card.value}
                  </a>
                ) : (
                  <span className="text-[13px] text-[#1a1a2e] font-semibold">
                    {card.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN BODY: Form + FAQ ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ── CONTACT FORM ── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-9 h-9 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-lg shrink-0">
              ✍️
            </span>
            <h2
              className={`font-semibold text-[20px] text-gray-900 ${
                isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
              }`}
            >
              {c.formHeading}
            </h2>
          </div>
          <p className="text-[13px] text-gray-500 mb-7 ms-12">
            {c.formSubheading}
          </p>

          {submitted ? (
            /* Success state */
            <div className="bg-[#1a1a2e] rounded-2xl p-8 text-center border-l-4 border-yellow-400">
              <div className="text-5xl mb-4">✅</div>
              <h3
                className={`text-white font-semibold text-[20px] mb-2 ${
                  isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                }`}
              >
                {c.successTitle}
              </h3>
              <p className="text-white/60 text-[14px] leading-[1.75] mb-6">
                {c.successDesc}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormState({
                    name: "",
                    email: "",
                    role: "",
                    subject: "",
                    message: "",
                  });
                }}
                className="bg-yellow-400 text-[#1a1a2e] px-6 py-2.5 rounded-xl text-[13px] font-semibold border-none cursor-pointer hover:bg-yellow-300 transition-colors"
              >
                {c.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-gray-700 tracking-wide">
                    {c.fields.name} <span className="text-yellow-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    placeholder={c.fields.namePlaceholder}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-[#1a1a2e]/10 transition-all placeholder-gray-400 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-gray-700 tracking-wide">
                    {c.fields.email} <span className="text-yellow-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    placeholder={c.fields.emailPlaceholder}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-[#1a1a2e]/10 transition-all placeholder-gray-400 bg-white"
                  />
                </div>
              </div>

              {/* Role + Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-gray-700 tracking-wide">
                    {c.fields.role}
                  </label>
                  <select
                    name="role"
                    value={formState.role}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-[#1a1a2e]/10 transition-all bg-white appearance-none cursor-pointer"
                  >
                    <option value="">—</option>
                    {c.fields.roleOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-gray-700 tracking-wide">
                    {c.fields.subject}{" "}
                    <span className="text-yellow-500">*</span>
                  </label>
                  <input
                    name="subject"
                    type="text"
                    required
                    value={formState.subject}
                    onChange={handleChange}
                    placeholder={c.fields.subjectPlaceholder}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-[#1a1a2e]/10 transition-all placeholder-gray-400 bg-white"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-gray-700 tracking-wide">
                  {c.fields.message} <span className="text-yellow-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  value={formState.message}
                  onChange={handleChange}
                  placeholder={c.fields.messagePlaceholder}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-[#1a1a2e]/10 transition-all placeholder-gray-400 bg-white resize-none"
                />
              </div>
              {error && (
                <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#1a1a2e] text-yellow-400 px-7 py-3.5 rounded-xl text-[14px] font-semibold border-none cursor-pointer hover:bg-[#2d2d5e] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin inline-block" />
                    {c.fields.submitting}
                  </>
                ) : (
                  c.fields.submit
                )}
              </button>
            </form>
          )}
        </div>

        {/* ── FAQ ── */}
        <div>
          <div className="flex items-center gap-3 mb-7">
            <span className="w-9 h-9 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-lg shrink-0">
              ❓
            </span>
            <h2
              className={`font-semibold text-[20px] text-gray-900 ${
                isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
              }`}
            >
              {c.faqHeading}
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {c.faqs.map((faq, i) => (
              <div
                key={i}
                className={`border rounded-2xl overflow-hidden transition-all ${
                  openFaq === i ? "border-[#1a1a2e]" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start bg-white cursor-pointer border-none"
                >
                  <span
                    className={`text-[13px] font-semibold text-gray-900 leading-[1.5] ${
                      isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      openFaq === i ? "bg-[#1a1a2e]" : "bg-gray-100"
                    }`}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      className={`transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    >
                      <path
                        d="M2 3.5l3 3 3-3"
                        stroke={openFaq === i ? "#e8c547" : "#6b7280"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-[13px] text-gray-600 leading-[1.8] pt-3">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA BAND ── */}
      <div className="bg-[#1a1a2e] mx-4 sm:mx-6 mb-10 rounded-3xl px-8 py-12 max-w-screen-xl lg:mx-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,197,71,0.18)_0%,transparent_65%)] pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="text-[10px] tracking-[0.12em] uppercase text-yellow-400/60 mb-3">
            {isAr ? "لا تزال لديك أسئلة؟" : "Still have questions?"}
          </div>
          <h3
            className={`font-light text-[clamp(22px,4vw,36px)] text-white mb-3 leading-[1.2] ${
              isAr
                ? "font-['Cairo','Tajawal',sans-serif]"
                : "font-['Fraunces',serif] italic"
            }`}
          >
            {isAr ? "فريقنا جاهز لمساعدتك" : "Our team is ready to help"}
          </h3>
          <p className="text-white/45 text-[14px] max-w-[400px] mx-auto mb-7 leading-[1.75]">
            {isAr
              ? "أرسل لنا رسالة باستخدام النموذج أعلاه أو تواصل مباشرةً عبر البريد الإلكتروني. نرد عادةً خلال ساعات."
              : "Send us a message using the form above or reach us directly by email. We typically respond within a few hours."}
          </p>
          <a
            href="mailto:support@mar-haba.ly"
            className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-7 py-3.5 rounded-xl text-sm font-bold no-underline hover:bg-yellow-300 transition-colors"
          >
            ✉️ support@mar-haba.ly
          </a>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111] px-6 pt-12 pb-7">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-5 pb-8 border-b border-[#222] mb-6">
            <Link
              href="/"
              style={{
                textDecoration: "none",
                fontFamily: "'Cairo','Tajawal',sans-serif",
                fontWeight: 500,
                fontSize: "26px",
                color: "#fff",
                letterSpacing: "1px",
              }}
            >
              مر<span style={{ fontWeight: 700, color: "#e8c547" }}>حبا</span>
            </Link>
            <p className="text-sm text-[#555] max-w-xs leading-[1.7]">
              {c.footer.desc}
            </p>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-[#444]">
              &copy; {new Date().getFullYear()} Marhaba. {c.footer.rights}
            </p>
            <div className="flex gap-5">
              <Link
                href="/privacy"
                className="text-xs text-[#999] no-underline hover:text-yellow-400 transition-colors"
              >
                {c.footer.privacy}
              </Link>
              <Link
                href="/terms"
                className="text-xs text-[#999] no-underline hover:text-yellow-400 transition-colors"
              >
                {c.footer.terms}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
