"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const content = {
  en: {
    dir: "ltr",
    badge: "How Payments Work",
    title: "Payment",
    title1: "Methods",
    subtitle:
      "Marhaba does not process payments. All transactions happen directly between guests and hosts.",
    effective: "No platform fees on transactions",
    lastUpdated: "You keep 100% of what you earn",

    /* ── NOTICE BANNER ── */
    noticeBadge: "Important",
    noticeText:
      "Marhaba is a listing platform, not a payment processor. We do not hold, transfer, or guarantee any funds between guests and hosts. All payment arrangements are made privately between the two parties.",

    /* ── HOW IT WORKS STEPS ── */
    howHeading: "How It Works",
    howSteps: [
      {
        step: "01",
        title: "Find & Contact",
        body: "Browse listings and message the host directly through Marhaba's platform to confirm availability and discuss payment terms.",
      },
      {
        step: "02",
        title: "Agree on Terms",
        body: "Agree on the total amount, currency, payment method, and refund policy before confirming your booking. Keep a written record in the Marhaba chat.",
      },
      {
        step: "03",
        title: "Pay Directly",
        body: "Complete payment directly with the host using your agreed method — bank transfer, mobile wallet, or cash. Marhaba is not involved in this step.",
      },
      {
        step: "04",
        title: "Confirm & Stay",
        body: "Once payment is confirmed with the host, your booking is set. Check in and enjoy your stay.",
      },
    ],

    /* ── PAYMENT METHODS ── */
    methodsHeading: "Common Payment Methods in Libya",
    methodsSubheading:
      "These are the methods hosts and guests typically use. Always agree on the method before booking.",
    methods: [
      {
        icon: "🏦",
        title: "Bank Transfer",
        tag: "Most Recommended",
        tagColor: "#059669",
        body: "Direct transfers between Libyan bank accounts (Masraf Al Riyad, Wahda Bank, Aman Bank, etc.). Leaves a clear paper trail — recommended for larger amounts.",
        pros: ["Traceable record", "Secure for large amounts", "Widely accepted"],
        cons: ["May take 1–2 business days", "Requires bank account details"],
      },
      {
        icon: "📱",
        title: "Mobile Wallets",
        tag: "Popular",
        tagColor: "#2563eb",
        body: "Services like Mobi Cash and Tadawul are widely used for fast peer-to-peer transfers. Instant and convenient for smaller amounts.",
        pros: ["Instant transfer", "Easy to use", "No bank account needed"],
        cons: ["Transaction limits may apply", "Less common for large amounts"],
      },
      {
        icon: "💵",
        title: "Cash",
        tag: "Common",
        tagColor: "#d97706",
        body: "Cash in Libyan Dinar (LYD) remains a common method, especially for shorter stays. Always request a written receipt from the host.",
        pros: ["Immediately confirmed", "No fees", "Widely understood"],
        cons: ["No paper trail", "Risk if no receipt", "Inconvenient for large amounts"],
      },
      {
        icon: "💳",
        title: "Debit / Credit Card",
        tag: "Limited availability",
        tagColor: "#6b7280",
        body: "Card payments between individuals are not widely available in Libya. Only use this method if the host has a confirmed and verifiable card terminal.",
        pros: ["Familiar method", "Some fraud protection"],
        cons: ["Rare between individuals", "Fees may apply", "Verify terminal legitimacy"],
      },
    ],

    /* ── TIPS ── */
    tipsHeading: "Payment Best Practices",
    tips: [
      {
        icon: "📝",
        title: "Always get written confirmation",
        body: "Use Marhaba's chat to confirm the agreed amount, method, and any refund terms. Screenshots of this conversation are your evidence if a dispute arises.",
      },
      {
        icon: "🧾",
        title: "Request a receipt for cash",
        body: "If paying in cash, ask the host to send a written acknowledgement via Marhaba chat confirming the amount received.",
      },
      {
        icon: "🚩",
        title: "Watch out for red flags",
        body: "Never pay through external links, unknown apps, or cryptocurrency before a booking is confirmed on Marhaba. These are common scam vectors.",
      },
      {
        icon: "📞",
        title: "Clarify the cancellation policy",
        body: "Ask the host about their refund and cancellation policy before paying. Confirm it in writing via Marhaba chat.",
      },
      {
        icon: "🔒",
        title: "Never share card or bank PINs",
        body: "No legitimate host will ask for your card PIN, bank login, or OTP code. If asked, report the listing immediately.",
      },
      {
        icon: "📅",
        title: "Agree on the payment timeline",
        body: "Clarify whether full payment is due at booking, at check-in, or split across both. Document the agreed schedule in writing.",
      },
    ],

    /* ── FAQ ── */
    faqHeading: "Payment FAQs",
    faqs: [
      {
        q: "Does Marhaba take a commission from payments?",
        a: "No. Marhaba charges hosts a flat subscription fee every six months and takes no commission from any transaction between guests and hosts.",
      },
      {
        q: "What if the host asks me to pay before the booking is confirmed?",
        a: "Do not pay before a booking is confirmed and the listing is exactly as described. If a host pressures you to pay outside the platform or before confirmation, treat it as a red flag and report it.",
      },
      {
        q: "Can Marhaba help me get a refund?",
        a: "Because Marhaba does not process payments, we cannot issue or guarantee refunds. Refunds are between you and the host. We encourage you to agree on a clear refund policy before paying and to keep written records of all payment agreements.",
      },
      {
        q: "What currency should I use?",
        a: "Libyan Dinar (LYD) is the standard. Always agree on the currency upfront, especially for international guests, and confirm the exchange rate if paying in another currency.",
      },
      {
        q: "Is it safe to share my bank account number with a host?",
        a: "Sharing your IBAN or account number for receiving transfers is standard practice. Never share your PIN, password, or OTP with anyone.",
      },
      {
        q: "What should I do if I suspect payment fraud?",
        a: "Stop the transaction immediately, do not send any more money, and report the listing via your dashboard. You can also contact us at safety@mar-haba.ly.",
      },
    ],

    /* ── CTA ── */
    ctaEyebrow: "Have a payment concern?",
    ctaTitle: "Our support team can help",
    ctaBody:
      "If you've encountered a suspicious payment request or believe you've been defrauded, contact us right away.",
    ctaButton: "Contact Support",

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
    badge: "كيف تعمل المدفوعات",
    title: "طرق ",
    title1: "الدفع",
    subtitle:
      "مرحبا لا تعالج المدفوعات. جميع المعاملات تتم مباشرةً بين الضيوف والمضيفين.",
    effective: "لا رسوم على المعاملات",
    lastUpdated: "تحتفظ بـ 100% مما تكسبه",

    noticeBadge: "تنبيه مهم",
    noticeText:
      "مرحبا منصة إدراج عقارات وليست معالج مدفوعات. لا نحتفظ بأي أموال ولا ننقلها ولا نضمنها بين الضيوف والمضيفين. تُرتَّب جميع ترتيبات الدفع بصورة خاصة ومباشرة بين الطرفين.",

    howHeading: "كيف يعمل النظام",
    howSteps: [
      {
        step: "01",
        title: "ابحث وتواصل",
        body: "تصفح القوائم وراسل المضيف مباشرةً عبر منصة مرحبا لتأكيد التوفر ومناقشة شروط الدفع.",
      },
      {
        step: "02",
        title: "اتفق على الشروط",
        body: "تفق على المبلغ الإجمالي والعملة وطريقة الدفع وسياسة الاسترداد قبل تأكيد الحجز. احتفظ بسجل كتابي في محادثة مرحبا.",
      },
      {
        step: "03",
        title: "ادفع مباشرةً",
        body: "أكمل الدفع مباشرةً مع المضيف باستخدام الطريقة المتفق عليها — تحويل بنكي أو محفظة إلكترونية أو نقداً. مرحبا غير متورطة في هذه الخطوة.",
      },
      {
        step: "04",
        title: "أكّد وأقِم",
        body: "بمجرد تأكيد الدفع مع المضيف، يصبح حجزك محدداً. سجّل الدخول واستمتع بإقامتك.",
      },
    ],

    methodsHeading: "طرق الدفع الشائعة في ليبيا",
    methodsSubheading:
      "هذه هي الطرق التي يستخدمها المضيفون والضيوف عادةً. تفق دائماً على الطريقة قبل الحجز.",
    methods: [
      {
        icon: "🏦",
        title: "التحويل البنكي",
        tag: "الأكثر توصية",
        tagColor: "#059669",
        body: "تحويلات مباشرة بين الحسابات البنكية الليبية (مصرف الرياض، بنك الوحدة، بنك أمان، وغيرها). يترك سجلاً واضحاً — موصى به للمبالغ الكبيرة.",
        pros: ["سجل قابل للتتبع", "آمن للمبالغ الكبيرة", "مقبول على نطاق واسع"],
        cons: ["قد يستغرق 1–2 يوم عمل", "يتطلب بيانات الحساب البنكي"],
      },
      {
        icon: "📱",
        title: "المحافظ الإلكترونية",
        tag: "شائع",
        tagColor: "#2563eb",
        body: "تُستخدم خدمات مثل موبي كاش وتداول على نطاق واسع للتحويلات الفورية بين الأفراد. سريعة ومريحة للمبالغ الصغيرة.",
        pros: ["تحويل فوري", "سهلة الاستخدام", "لا تحتاج حساباً بنكياً"],
        cons: ["قد تطبق حدود على المعاملات", "أقل شيوعاً للمبالغ الكبيرة"],
      },
      {
        icon: "💵",
        title: "النقد",
        tag: "شائع",
        tagColor: "#d97706",
        body: "النقد بالدينار الليبي (LYD) لا يزال طريقة شائعة، خاصةً للإقامات القصيرة. اطلب دائماً إيصالاً كتابياً من المضيف.",
        pros: ["تأكيد فوري", "بدون رسوم", "مفهوم على نطاق واسع"],
        cons: ["لا سجل للمعاملة", "خطر بدون إيصال", "غير مريح للمبالغ الكبيرة"],
      },
      {
        icon: "💳",
        title: "بطاقة الخصم / الائتمان",
        tag: "توفر محدود",
        tagColor: "#6b7280",
        body: "مدفوعات البطاقات بين الأفراد غير متاحة على نطاق واسع في ليبيا. استخدم هذه الطريقة فقط إذا كان المضيف يمتلك جهاز بطاقة موثوقاً ومتحققاً منه.",
        pros: ["طريقة مألوفة", "بعض الحماية من الاحتيال"],
        cons: ["نادر بين الأفراد", "قد تطبق رسوم", "تحقق من شرعية الجهاز"],
      },
    ],

    tipsHeading: "أفضل ممارسات الدفع",
    tips: [
      {
        icon: "📝",
        title: "احصل دائماً على تأكيد كتابي",
        body: "استخدم محادثة مرحبا لتأكيد المبلغ المتفق عليه والطريقة وشروط الاسترداد. لقطات الشاشة من هذه المحادثة هي دليلك عند أي نزاع.",
      },
      {
        icon: "🧾",
        title: "اطلب إيصالاً عند الدفع نقداً",
        body: "إذا دفعت نقداً، اطلب من المضيف إرسال إقرار كتابي عبر محادثة مرحبا يؤكد المبلغ المستلم.",
      },
      {
        icon: "🚩",
        title: "انتبه لعلامات التحذير",
        body: "لا تدفع أبداً عبر روابط خارجية أو تطبيقات مجهولة أو عملات رقمية قبل تأكيد الحجز على مرحبا. هذه طرق شائعة للاحتيال.",
      },
      {
        icon: "📞",
        title: "وضّح سياسة الإلغاء",
        body: "اسأل المضيف عن سياسة الاسترداد والإلغاء قبل الدفع. أكّدها كتابةً عبر محادثة مرحبا.",
      },
      {
        icon: "🔒",
        title: "لا تشارك أرقام PIN أو كلمات المرور",
        body: "لن يطلب منك أي مضيف شرعي رقم PIN أو بيانات تسجيل الدخول أو رمز OTP. إذا طُلب منك ذلك، أبلغ عن القائمة فوراً.",
      },
      {
        icon: "📅",
        title: "اتفق على جدول الدفع",
        body: "وضّح ما إذا كان يجب دفع المبلغ كاملاً عند الحجز أو عند تسجيل الدخول أو تقسيمه. وثّق الجدول المتفق عليه كتابةً.",
      },
    ],

    faqHeading: "أسئلة شائعة حول المدفوعات",
    faqs: [
      {
        q: "هل تأخذ مرحبا عمولة من المدفوعات؟",
        a: "لا. تفرض مرحبا على المضيفين رسوم اشتراك ثابتة كل ستة أشهر ولا تأخذ أي عمولة من أي معاملة بين الضيوف والمضيفين.",
      },
      {
        q: "ماذا لو طلب المضيف الدفع قبل تأكيد الحجز؟",
        a: "لا تدفع قبل تأكيد الحجز والتحقق من مطابقة القائمة للواقع تماماً. إذا ضغط عليك المضيف للدفع خارج المنصة أو قبل التأكيد، فاعتبره علامة تحذير وأبلغ عنه.",
      },
      {
        q: "هل تستطيع مرحبا مساعدتي في استرداد أموالي؟",
        a: "بما أن مرحبا لا تعالج المدفوعات، فلا يمكنها إصدار استردادات أو ضمانها. تتم الاستردادات بينك وبين المضيف. نحثك على الاتفاق على سياسة استرداد واضحة قبل الدفع والاحتفاظ بسجلات كتابية لجميع اتفاقيات الدفع.",
      },
      {
        q: "ما العملة التي يجب استخدامها؟",
        a: "الدينار الليبي (LYD) هو المعيار. اتفق دائماً على العملة مسبقاً، خاصةً للضيوف الدوليين، وأكّد سعر الصرف إذا كنت تدفع بعملة أخرى.",
      },
      {
        q: "هل من الآمن مشاركة رقم حسابي البنكي مع المضيف؟",
        a: "مشاركة الـ IBAN أو رقم الحساب لاستقبال التحويلات ممارسة معيارية. لا تشارك رقم PIN أو كلمة المرور أو رمز OTP مع أي أحد.",
      },
      {
        q: "ماذا أفعل إذا اشتبهت في عملية احتيال؟",
        a: "أوقف المعاملة فوراً، لا ترسل المزيد من الأموال، وأبلغ عن القائمة عبر لوحة التحكم. يمكنك أيضاً التواصل معنا على safety@mar-haba.ly.",
      },
    ],

    ctaEyebrow: "لديك مخاوف بشأن الدفع؟",
    ctaTitle: "فريق الدعم لدينا جاهز للمساعدة",
    ctaBody:
      "إذا واجهت طلب دفع مريباً أو تعتقد أنك تعرضت للاحتيال، تواصل معنا فوراً.",
    ctaButton: "تواصل مع الدعم",

    footer: {
      desc: "منصة التأجير قصير الأمد الموثوقة في ليبيا تربط المضيفين والمسافرين.",
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
    },
  },
};

export default function PaymentsPage() {
  const [lang, setLang] = useState("en");
  const [openFaq, setOpenFaq] = useState(null);

  const c = content[lang];
  const isAr = lang === "ar";

  const navLinks = [
    { id: "home", label: isAr ? "→ الرئيسية" : "← Home", href: "/" },
  ];

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(232,197,71,0.12)_0%,transparent_60%)] pointer-events-none" />
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
          <p className="text-white/50 text-[15px] mb-6">{c.subtitle}</p>
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

      {/* ── NOTICE BANNER ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3 items-start">
          <span className="text-xl shrink-0 mt-0.5">⚠️</span>
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest me-2">
              {c.noticeBadge}
            </span>
            <span className="text-[13px] text-amber-800 leading-[1.7]">
              {c.noticeText}
            </span>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-4">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-6 font-semibold">
          {c.howHeading}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.howSteps.map((s, i) => (
            <div key={i} className="relative">
              {/* connector line */}
              {i < c.howSteps.length - 1 && (
                <div className="hidden lg:block absolute top-6 start-full w-4 h-px bg-gray-200 z-10" />
              )}
              <div className="border border-gray-200 rounded-2xl p-5 h-full hover:border-yellow-300 hover:shadow-sm transition-all">
                <div className="text-[28px] font-bold text-gray-100 leading-none mb-3 font-['Fraunces',serif]">
                  {s.step}
                </div>
                <div
                  className={`font-semibold text-gray-900 text-[14px] mb-1.5 ${
                    isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                  }`}
                >
                  {s.title}
                </div>
                <div className="text-[12px] text-gray-500 leading-[1.7]">
                  {s.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAYMENT METHODS ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-4">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-1 font-semibold">
          {c.methodsHeading}
        </div>
        <p className="text-[13px] text-gray-500 mb-6">{c.methodsSubheading}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {c.methods.map((m) => (
            <div
              key={m.title}
              className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all"
            >
              {/* Card header */}
              <div className="px-5 pt-5 pb-4 flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-xl shrink-0">
                  {m.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-semibold text-gray-900 text-[15px] ${
                        isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                      }`}
                    >
                      {m.title}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${m.tagColor}18`,
                        color: m.tagColor,
                      }}
                    >
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 leading-[1.65] mt-1">
                    {m.body}
                  </p>
                </div>
              </div>

              {/* Pros / Cons */}
              <div className="border-t border-gray-100 grid grid-cols-2">
                <div className="px-4 py-3 border-e border-gray-100">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1.5">
                    {isAr ? "المزايا" : "Pros"}
                  </div>
                  <ul className="flex flex-col gap-1">
                    {m.pros.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-1.5 text-[11px] text-gray-600"
                      >
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 py-3">
                  <div className="text-[10px] font-bold text-red-500 uppercase tracking-wide mb-1.5">
                    {isAr ? "العيوب" : "Cons"}
                  </div>
                  <ul className="flex flex-col gap-1">
                    {m.cons.map((con) => (
                      <li
                        key={con}
                        className="flex items-start gap-1.5 text-[11px] text-gray-600"
                      >
                        <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TIPS ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-4">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-6 font-semibold">
          {c.tipsHeading}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {c.tips.map((tip) => (
            <div
              key={tip.title}
              className="border border-gray-200 rounded-2xl p-5 hover:border-yellow-300 hover:shadow-sm transition-all flex flex-col gap-3"
            >
              <span className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-lg shrink-0">
                {tip.icon}
              </span>
              <div>
                <div
                  className={`font-semibold text-gray-900 text-[13px] mb-1 ${
                    isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                  }`}
                >
                  {tip.title}
                </div>
                <div className="text-[12px] text-gray-500 leading-[1.7]">
                  {tip.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-12">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-6 font-semibold">
          {c.faqHeading}
        </div>
        <div className="flex flex-col gap-2 max-w-3xl">
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
                    className={`transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
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

      {/* ── BOTTOM CTA ── */}
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
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-7 py-3.5 rounded-xl text-sm font-bold no-underline hover:bg-yellow-300 transition-colors"
          >
            ✉️ {c.ctaButton}
          </Link>
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