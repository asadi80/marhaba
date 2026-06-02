"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const content = {
  en: {
    dir: "ltr",
    badge: "Your Safety Matters",
    title: "Safety",
    title1: "Centre",
    subtitle: "Guidelines and resources to keep every stay safe and respectful",
    effective: "Updated regularly",
    lastUpdated: "Report incidents 24/7",

    /* ── STAT PILLS ── */
    stats: [
      { value: "24/7", label: "Incident reporting" },
      { value: "100%", label: "Direct payments — no middleman" },
      { value: "48h", label: "Abuse review turnaround" },
    ],

    /* ── SECTIONS ── */
    sections: [
      {
        id: "guests",
        icon: "🧳",
        color: "#2563eb",
        title: "Guest Safety Tips",
        intro:
          "Before you book and during your stay, these practices help keep you safe.",
        items: [
          {
            title: "Verify the listing before booking",
            body: "Read all reviews carefully. If a property has no reviews yet, message the host with questions before confirming. Look for verified host badges.",
          },
          {
            title: "Keep communication on-platform",
            body: "Use Marhaba's messaging system to communicate with hosts. Avoid sharing personal phone numbers or email addresses before a booking is confirmed.",
          },
          {
            title: "Check the address before you travel",
            body: "Cross-reference the listed address on a map application before you set off. Contact your host if anything seems unclear.",
          },
          {
            title: "Know the emergency exits",
            body: "On arrival, locate fire exits, extinguishers, and the property's first-aid kit. Ask the host if these are not immediately obvious.",
          },
          {
            title: "Share your itinerary",
            body: "Let a trusted friend or family member know where you are staying, the host's name, and when you expect to check out.",
          },
          {
            title: "Trust your instincts",
            body: "If something feels wrong on arrival — the property doesn't match photos, or you feel unsafe — leave and contact Marhaba support immediately.",
          },
        ],
      },
      {
        id: "hosts",
        icon: "🏠",
        color: "#059669",
        title: "Host Responsibilities",
        intro:
          "Hosts on Marhaba are responsible for providing a safe, honest, and welcoming environment.",
        items: [
          {
            title: "Accurate listing information",
            body: "Photos, descriptions, and amenities must truthfully represent the property. Misleading listings violate Marhaba's Terms of Service and may result in account suspension.",
          },
          {
            title: "Safety equipment",
            body: "Ensure your property has working smoke detectors, a fire extinguisher, and a first-aid kit. Replace batteries and check equipment before every new guest.",
          },
          {
            title: "Clear emergency information",
            body: "Provide guests with local emergency numbers (police, ambulance, fire brigade) and the address of the nearest hospital in your welcome guide.",
          },
          {
            title: "Respect guest privacy",
            body: "Hidden cameras or recording devices of any kind are strictly prohibited. Hosts found in violation will be permanently removed from the platform.",
          },
          {
            title: "Secure access",
            body: "Change door codes or lock combinations between every guest. Do not share access credentials with third parties.",
          },
          {
            title: "Prompt communication",
            body: "Respond to guest messages within a reasonable time. If you are unavailable, set an out-of-office response and provide an emergency contact.",
          },
        ],
      },
      {
        id: "payments",
        icon: "💳",
        color: "#d97706",
        title: "Booking & Payment Safety",
        intro:
          "Marhaba does not process payments. Understanding how transactions work protects both parties.",
        items: [
          {
            title: "Payments are direct between parties",
            body: "Marhaba does not handle, hold, or facilitate any money between guests and hosts. All payment arrangements are made privately and directly between the two parties.",
          },
          {
            title: "Agree on payment terms before confirming",
            body: "Discuss and agree on amount, method, currency, and refund policy with the host before you confirm a booking. Get written confirmation in the Marhaba chat.",
          },
          {
            title: "Beware of off-platform requests",
            body: "Any request asking you to pay through an external link, crypto wallet, or unofficial channel before a booking is confirmed is a red flag. Report it immediately.",
          },
          {
            title: "No refund guarantees from Marhaba",
            body: "Because Marhaba does not process payments, we cannot issue refunds. Dispute resolution is between the guest and host directly. Document all payment agreements in writing.",
          },
          {
            title: "Use traceable payment methods",
            body: "Where possible, use bank transfers or payment methods that leave a paper trail. Avoid large cash payments with no receipt.",
          },
          {
            title: "Cancellation policies",
            body: "Review the host's cancellation policy before booking. It is the guest's responsibility to understand and agree to these terms prior to confirmation.",
          },
        ],
      },
      {
        id: "reporting",
        icon: "🚨",
        color: "#dc2626",
        title: "Reporting Abuse & Incidents",
        intro:
          "We take every report seriously. Here's how to flag issues and what happens next.",
        items: [
          {
            title: "How to report a safety incident",
            body: "Go to your dashboard → Bookings → select the booking → 'Report an Issue'. Describe the incident in detail. Our team reviews all reports within 48 hours.",
          },
          {
            title: "What counts as a reportable incident",
            body: "Misrepresented listings, hidden cameras, harassment, threats, property damage, no-shows, payment disputes, or any behaviour that makes you feel unsafe.",
          },
          {
            title: "Urgent safety situations",
            body: "If you are in immediate danger, contact local emergency services first (police: 1515 in Libya). Then contact Marhaba support at safety@mar-haba.ly.",
          },
          {
            title: "What happens after you report",
            body: "Our team will acknowledge your report within 24 hours. Depending on severity, we may suspend the account under review, request evidence, or escalate to authorities.",
          },
          {
            title: "False reports",
            body: "Submitting a knowingly false report is a violation of our Terms of Service and may result in account suspension. Please only report genuine incidents.",
          },
          {
            title: "Anonymous reporting",
            body: "You may request that your identity be kept confidential during an investigation. We will make reasonable efforts to honour this where legally possible.",
          },
        ],
      },
    ],

    /* ── EMERGENCY CONTACTS ── */
    emergencyHeading: "Emergency Contacts in Libya",
    emergencyNote:
      "Save these numbers before your trip. Availability may vary by region.",
    emergencies: [
      { label: "Police", number: "1515" },
      { label: "Ambulance", number: "1120" },
      { label: "Fire Brigade", number: "1122" },
      { label: "Marhaba Safety", number: "safety@mar-haba.ly" },
    ],

    /* ── CTA ── */
    ctaEyebrow: "Need to report something?",
    ctaTitle: "We're here around the clock",
    ctaBody:
      "If you experience or witness anything that compromises safety on Marhaba, don't hesitate to reach out. Every report is reviewed by a real person.",
    ctaButton: "Contact Safety Team",

    footer: {
      desc: "Libya's trusted short-term rental platform connecting hosts and travelers.",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
  },

  /* ════════════════════════════════════
     ARABIC
  ════════════════════════════════════ */
  ar: {
    dir: "rtl",
    badge: "سلامتك تهمنا",
    title: "مركز",
    title1: " السلامة",
    subtitle: "إرشادات وموارد لضمان إقامة آمنة ومحترمة للجميع",
    effective: "يُحدَّث بانتظام",
    lastUpdated: "الإبلاغ عن الحوادث 24/7",

    stats: [
      { value: "24/7", label: "الإبلاغ عن الحوادث" },
      { value: "100%", label: "مدفوعات مباشرة — بلا وسيط" },
      { value: "48h", label: "مراجعة بلاغات الإساءة" },
    ],

    sections: [
      {
        id: "guests",
        icon: "🧳",
        color: "#2563eb",
        title: "نصائح السلامة للضيوف",
        intro: "قبل الحجز وأثناء إقامتك، اتبع هذه الإرشادات لتبقى بأمان.",
        items: [
          {
            title: "تحقق من القائمة قبل الحجز",
            body: "اقرأ جميع التقييمات بعناية. إذا لم يكن للعقار تقييمات بعد، راسل المضيف بأسئلتك قبل التأكيد. ابحث عن شارة المضيف الموثَّق.",
          },
          {
            title: "أبقِ التواصل داخل المنصة",
            body: "استخدم نظام المراسلة في مرحبا للتواصل مع المضيفين. تجنّب مشاركة أرقام هواتفك الشخصية أو بريدك الإلكتروني قبل تأكيد الحجز.",
          },
          {
            title: "تحقق من العنوان قبل السفر",
            body: "راجع العنوان المدرج على تطبيق الخرائط قبل المغادرة. تواصل مع مضيفك إذا كان هناك أي شيء غير واضح.",
          },
          {
            title: "تعرّف على مخارج الطوارئ",
            body: "عند الوصول، حدد مخارج الحريق وأجهزة الإطفاء وحقيبة الإسعافات الأولية. اسأل المضيف إن لم تكن ظاهرة بوضوح.",
          },
          {
            title: "شارك جدولك مع شخص موثوق",
            body: "أخبر صديقاً أو أحد أفراد عائلتك بمكان إقامتك واسم المضيف وموعد المغادرة المتوقع.",
          },
          {
            title: "ثق بحدسك",
            body: "إذا شعرت بشيء غير صحيح عند الوصول — العقار لا يطابق الصور، أو شعرت بعدم الأمان — غادر فوراً وتواصل مع دعم مرحبا.",
          },
        ],
      },
      {
        id: "hosts",
        icon: "🏠",
        color: "#059669",
        title: "مسؤوليات المضيف",
        intro: "يتحمل المضيفون في مرحبا مسؤولية توفير بيئة آمنة وصادقة ومرحِّبة.",
        items: [
          {
            title: "معلومات القائمة الدقيقة",
            body: "يجب أن تعكس الصور والأوصاف والمرافق العقارَ بصدق تام. القوائم المضللة تنتهك شروط خدمة مرحبا وقد تؤدي إلى تعليق الحساب.",
          },
          {
            title: "معدات السلامة",
            body: "تأكد من وجود كاشفات دخان تعمل بكفاءة، ومطفأة حريق، وحقيبة إسعافات أولية. استبدل البطاريات وافحص المعدات قبل كل ضيف جديد.",
          },
          {
            title: "معلومات الطوارئ الواضحة",
            body: "زوّد الضيوف بأرقام الطوارئ المحلية (الشرطة، الإسعاف، الإطفاء) وعنوان أقرب مستشفى في دليل الترحيب.",
          },
          {
            title: "احترام خصوصية الضيف",
            body: "الكاميرات الخفية أو أجهزة التسجيل بأي شكل محظورة حظراً صارماً. سيُزال المضيفون المخالفون نهائياً من المنصة.",
          },
          {
            title: "الوصول الآمن",
            body: "غيّر رموز الأبواب أو مفاتيح القفل بين كل ضيف وآخر. لا تشارك بيانات الوصول مع أطراف ثالثة.",
          },
          {
            title: "التواصل الفوري",
            body: "رد على رسائل الضيوف في وقت معقول. إذا كنت غير متاح، ضع رداً تلقائياً وقدّم جهة اتصال للطوارئ.",
          },
        ],
      },
      {
        id: "payments",
        icon: "💳",
        color: "#d97706",
        title: "سلامة الحجز والمدفوعات",
        intro: "مرحبا لا تعالج المدفوعات. فهم آلية المعاملات يحمي كلا الطرفين.",
        items: [
          {
            title: "المدفوعات مباشرة بين الطرفين",
            body: "لا تتعامل مرحبا بأي أموال بين الضيوف والمضيفين ولا تحتفظ بها. تُرتَّب جميع ترتيبات الدفع بصورة خاصة ومباشرة بين الطرفين.",
          },
          {
            title: "اتفق على شروط الدفع قبل التأكيد",
            body: "ناقش المبلغ والطريقة والعملة وسياسة الاسترداد مع المضيف قبل تأكيد الحجز. احصل على تأكيد كتابي عبر محادثة مرحبا.",
          },
          {
            title: "احذر من الطلبات خارج المنصة",
            body: "أي طلب يدعوك للدفع عبر رابط خارجي أو محفظة عملات رقمية أو قناة غير رسمية قبل تأكيد الحجز يُعدّ إشارة تحذير. أبلغ عنه فوراً.",
          },
          {
            title: "لا ضمانات استرداد من مرحبا",
            body: "بما أن مرحبا لا تعالج المدفوعات، فلا يمكنها إصدار استردادات. يكون حل النزاعات مباشرةً بين الضيف والمضيف. وثّق جميع اتفاقيات الدفع كتابةً.",
          },
          {
            title: "استخدم طرق دفع قابلة للتتبع",
            body: "كلما أمكن، استخدم التحويلات المصرفية أو طرق الدفع التي تترك سجلاً واضحاً. تجنّب المدفوعات النقدية الكبيرة دون إيصال.",
          },
          {
            title: "سياسات الإلغاء",
            body: "راجع سياسة الإلغاء الخاصة بالمضيف قبل الحجز. يقع على عاتق الضيف فهم هذه الشروط والموافقة عليها قبل التأكيد.",
          },
        ],
      },
      {
        id: "reporting",
        icon: "🚨",
        color: "#dc2626",
        title: "الإبلاغ عن الإساءة والحوادث",
        intro: "نأخذ كل بلاغ بجدية تامة. إليك كيفية الإبلاغ وما يحدث بعد ذلك.",
        items: [
          {
            title: "كيفية الإبلاغ عن حادثة أمنية",
            body: "انتقل إلى لوحة التحكم ← الحجوزات ← اختر الحجز ← 'الإبلاغ عن مشكلة'. صف الحادثة بالتفصيل. يراجع فريقنا جميع البلاغات خلال 48 ساعة.",
          },
          {
            title: "ما الذي يُعدّ حادثة قابلة للإبلاغ",
            body: "القوائم المضللة، الكاميرات الخفية، التحرش، التهديدات، إتلاف الممتلكات، حالات عدم الحضور، نزاعات الدفع، أو أي سلوك يجعلك تشعر بعدم الأمان.",
          },
          {
            title: "حالات الطوارئ الأمنية العاجلة",
            body: "إذا كنت في خطر فوري، تواصل مع خدمات الطوارئ المحلية أولاً (الشرطة: 1515 في ليبيا). ثم تواصل مع دعم مرحبا على safety@mar-haba.ly.",
          },
          {
            title: "ما الذي يحدث بعد تقديم البلاغ",
            body: "سيُقرّ فريقنا باستلام بلاغك خلال 24 ساعة. حسب درجة الخطورة، قد نعلّق الحساب قيد المراجعة أو نطلب أدلة أو نحيل الأمر للجهات المختصة.",
          },
          {
            title: "البلاغات الكاذبة",
            body: "تقديم بلاغ كاذب عمداً يُعدّ انتهاكاً لشروط خدمتنا وقد يؤدي إلى تعليق الحساب. يرجى الإبلاغ عن الحوادث الحقيقية فقط.",
          },
          {
            title: "الإبلاغ بصورة مجهولة",
            body: "يمكنك طلب إبقاء هويتك سرية أثناء التحقيق. سنبذل جهوداً معقولة للوفاء بهذا الطلب في حدود ما يسمح به القانون.",
          },
        ],
      },
    ],

    emergencyHeading: "جهات الطوارئ في ليبيا",
    emergencyNote: "احفظ هذه الأرقام قبل رحلتك. قد يتفاوت التوفر حسب المنطقة.",
    emergencies: [
      { label: "الشرطة", number: "1515" },
      { label: "الإسعاف", number: "1120" },
      { label: "الإطفاء", number: "1122" },
      { label: "سلامة مرحبا", number: "safety@mar-haba.ly" },
    ],

    ctaEyebrow: "هل تريد الإبلاغ عن شيء؟",
    ctaTitle: "نحن هنا على مدار الساعة",
    ctaBody:
      "إذا تعرضت أو شهدت أي شيء يهدد السلامة على مرحبا، لا تتردد في التواصل معنا. يراجع كل بلاغ شخص حقيقي من فريقنا.",
    ctaButton: "تواصل مع فريق السلامة",

    footer: {
      desc: "منصة التأجير قصير الأمد الموثوقة في ليبيا تربط المضيفين والمسافرين.",
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
    },
  },
};

const sectionColorMap = {
  "#2563eb": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  "#059669": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  "#d97706": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  "#dc2626": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
};

export default function SafetyPage() {
  const [lang, setLang] = useState("en");
  const [openItems, setOpenItems] = useState({});

  const c = content[lang];
  const isAr = lang === "ar";

  const navLinks = [
    { id: "home", label: isAr ? "→ الرئيسية" : "← Home", href: "/" },
  ];

  const toggle = (sectionId, i) => {
    const key = `${sectionId}-${i}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isOpen = (sectionId, i) => !!openItems[`${sectionId}-${i}`];

  return (
    <div dir={c.dir} className="bg-white min-h-screen text-gray-900">
      {/* NAV */}
      <Navbar
        NAV_LINKS={navLinks}
        user={null}
        lang={lang}
        toggleLanguage={() => setLang(lang === "en" ? "ar" : "en")}
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
          <p className="text-white/50 text-[15px] mb-7">{c.subtitle}</p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            {c.stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-2.5"
              >
                <span className="text-yellow-400 font-bold text-[15px]">{s.value}</span>
                <span className="text-white/40 text-[11px]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION NAV PILLS ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto flex gap-1 overflow-x-auto py-3 scrollbar-hide">
          {c.sections.map((sec) => {
            const colors = sectionColorMap[sec.color];
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap no-underline transition-colors ${colors.bg} ${colors.text} border ${colors.border}`}
              >
                <span>{sec.icon}</span>
                {sec.title}
              </a>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-14 flex flex-col gap-16">
        {c.sections.map((sec) => {
          const colors = sectionColorMap[sec.color];
          return (
            <section key={sec.id} id={sec.id}>
              {/* Section header */}
              <div className="flex items-start gap-4 mb-6">
                <span
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `${sec.color}18` }}
                >
                  {sec.icon}
                </span>
                <div>
                  <h2
                    className={`font-semibold text-[22px] text-gray-900 leading-tight mb-1 ${
                      isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                    }`}
                  >
                    {sec.title}
                  </h2>
                  <p className="text-[13px] text-gray-500 leading-[1.7]">{sec.intro}</p>
                </div>
              </div>

              {/* Accordion items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ms-0 md:ms-16">
                {sec.items.map((item, i) => (
                  <div
                    key={i}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      isOpen(sec.id, i) ? `border-[${sec.color}]` : "border-gray-200"
                    }`}
                    style={{
                      borderColor: isOpen(sec.id, i) ? sec.color : undefined,
                    }}
                  >
                    <button
                      onClick={() => toggle(sec.id, i)}
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 text-start bg-white cursor-pointer border-none"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`}
                        />
                        <span
                          className={`text-[13px] font-semibold text-gray-900 leading-[1.5] ${
                            isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors`}
                        style={{
                          background: isOpen(sec.id, i) ? sec.color : "#f3f4f6",
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          className={`transition-transform duration-200 ${
                            isOpen(sec.id, i) ? "rotate-180" : ""
                          }`}
                        >
                          <path
                            d="M2 3.5l3 3 3-3"
                            stroke={isOpen(sec.id, i) ? "#fff" : "#6b7280"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    {isOpen(sec.id, i) && (
                      <div
                        className="px-5 pb-4 border-t"
                        style={{ background: `${sec.color}08`, borderColor: `${sec.color}22` }}
                      >
                        <p className="text-[13px] text-gray-600 leading-[1.8] pt-3">
                          {item.body}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* ── EMERGENCY CONTACTS ── */}
        <section>
          <div className="flex items-start gap-4 mb-6">
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-red-50">
              📞
            </span>
            <div>
              <h2
                className={`font-semibold text-[22px] text-gray-900 leading-tight mb-1 ${
                  isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                }`}
              >
                {c.emergencyHeading}
              </h2>
              <p className="text-[13px] text-gray-500">{c.emergencyNote}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 ms-0 md:ms-16">
            {c.emergencies.map((e) => (
              <div
                key={e.label}
                className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-1.5 hover:border-red-300 hover:shadow-sm transition-all"
              >
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                  {e.label}
                </span>
                {e.number.includes("@") ? (
                  <a
                    href={`mailto:${e.number}`}
                    className="text-[13px] font-bold text-[#1a1a2e] no-underline hover:text-yellow-600 transition-colors break-all"
                  >
                    {e.number}
                  </a>
                ) : (
                  <a
                    href={`tel:${e.number}`}
                    className="text-[22px] font-bold text-[#1a1a2e] no-underline hover:text-yellow-600 transition-colors tracking-tight"
                  >
                    {e.number}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── BOTTOM CTA BAND ── */}
      <div className="bg-[#1a1a2e] mx-4 sm:mx-6 mb-10 rounded-3xl px-8 py-12 max-w-screen-xl lg:mx-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,197,71,0.18)_0%,transparent_65%)] pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="text-[10px] tracking-[0.12em] uppercase text-yellow-400/60 mb-3">
            {c.ctaEyebrow}
          </div>
          <h3
            className={`font-light text-[clamp(22px,4vw,36px)] text-white mb-3 leading-[1.2] ${
              isAr
                ? "font-['Cairo','Tajawal',sans-serif]"
                : "font-['Fraunces',serif] italic"
            }`}
          >
            {c.ctaTitle}
          </h3>
          <p className="text-white/45 text-[14px] max-w-[440px] mx-auto mb-7 leading-[1.75]">
            {c.ctaBody}
          </p>
          <a
            href="mailto:safety@mar-haba.ly"
            className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-7 py-3.5 rounded-xl text-sm font-bold no-underline hover:bg-yellow-300 transition-colors"
          >
            🚨 {c.ctaButton}
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