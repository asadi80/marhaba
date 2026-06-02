"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const content = {
  en: {
    dir: "ltr",
    badge: "Guide",
    title: "How t",
    title1: "o Book",
    subtitle: "Everything you need to know to find and book your perfect stay in Libya",
    backHome: "← Back to Home",
    stepsTitle: "Booking in 4 simple steps",
    steps: [
      {
        number: "01",
        icon: "🔍",
        title: "Browse Listings",
        desc: "Explore available properties across Libya. Use category filters — beachfront, mountain, city, desert and more — or allow location access to see stays near you.",
        tips: [
          "Use the category bar to filter by property type",
          "Enable location to find nearby listings",
          "Browse photos and read full descriptions carefully",
        ],
      },
      {
        number: "02",
        icon: "📋",
        title: "Review the Listing",
        desc: "Open a listing to see all details: photos, amenities, pricing per night, location, and host information. Make sure the property meets your needs before contacting.",
        tips: [
          "Check the price per night carefully",
          "Read the full property description",
          "Note the exact location and any house rules",
        ],
      },
      {
        number: "03",
        icon: "📞",
        title: "Contact the Host Directly",
        desc: "Marhaba connects you with the host — all booking arrangements, dates, and payment are handled directly between you and the host. Use the contact details provided on the listing.",
        tips: [
          "Confirm availability for your dates",
          "Agree on payment method with the host",
          "Ask any questions before committing",
        ],
        warning: "Marhaba does not process payments. All financial transactions are made directly with the host.",
      },
      {
        number: "04",
        icon: "✅",
        title: "Confirm & Enjoy",
        desc: "Once you've agreed on dates and payment with the host, your booking is confirmed. Get the check-in details and enjoy your stay!",
        tips: [
          "Get confirmation from the host in writing",
          "Save the host's contact number",
          "Arrive at the agreed check-in time",
        ],
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        q: "Do I need an account to browse listings?",
        a: "You can browse listings without an account, but you'll need to sign up to access host contact details and manage bookings.",
      },
      {
        q: "How do I pay for my stay?",
        a: "Payment is arranged directly with the host. Marhaba does not process any payments — you and the host agree on the payment method privately.",
      },
      {
        q: "What if I need to cancel?",
        a: "Cancellation policies are set by each host. Discuss and agree on a cancellation policy with the host before confirming your booking.",
      },
      {
        q: "Is my booking guaranteed once I contact the host?",
        a: "Your booking is only confirmed once the host explicitly accepts and you've agreed on all details. Always get written confirmation.",
      },
      {
        q: "What if there's a problem with my accommodation?",
        a: "Contact the host directly first to resolve any issues. If you need further assistance, reach out to Marhaba support.",
      },
      {
        q: "Can I book for multiple nights?",
        a: "Yes — simply agree on the number of nights and total price directly with the host when you make contact.",
      },
    ],
    tipsTitle: "Tips for a great stay",
    tips: [
      { icon: "💬", title: "Communicate clearly", desc: "Be specific about your arrival time, number of guests, and any special requirements." },
      { icon: "📸", title: "Check the photos", desc: "Look through all listing photos carefully. Don't hesitate to ask the host for more pictures." },
      { icon: "📍", title: "Confirm the location", desc: "Verify the exact address and how to get there before your travel day." },
      { icon: "🤝", title: "Respect house rules", desc: "Every host has their own rules. Read and respect them to ensure a smooth stay." },
      { icon: "⭐", title: "Leave a review", desc: "After your stay, leaving an honest review helps future travelers and rewards great hosts." },
      { icon: "🔒", title: "Stay safe", desc: "Never send money before verifying the listing. If something feels off, trust your instincts." },
    ],
    ctaTitle: "Ready to find your stay?",
    ctaDesc: "Browse hundreds of listings across Libya and connect with trusted local hosts.",
    ctaBrowse: "Browse Listings",
    ctaSignup: "Create Account",
    footer: {
      desc: "Libya's trusted short-term rental platform connecting hosts and travelers.",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
  },
  ar: {
    dir: "rtl",
    badge: "دليل",
    title: "كيفية",
    title1: " الحجز",
    subtitle: "كل ما تحتاج معرفته للعثور على إقامتك المثالية وحجزها في ليبيا",
    backHome: "→ العودة للرئيسية",
    stepsTitle: "الحجز في 4 خطوات بسيطة",
    steps: [
      {
        number: "01",
        icon: "🔍",
        title: "تصفح القوائم",
        desc: "استكشف العقارات المتاحة في جميع أنحاء ليبيا. استخدم فلاتر التصنيف — شاطئ، جبال، مدينة، صحراء والمزيد — أو اسمح بالوصول إلى موقعك لرؤية الإقامات القريبة منك.",
        tips: [
          "استخدم شريط التصنيف للتصفية حسب نوع العقار",
          "فعّل خدمة الموقع للعثور على القوائم القريبة",
          "تصفح الصور واقرأ الأوصاف الكاملة بعناية",
        ],
      },
      {
        number: "02",
        icon: "📋",
        title: "مراجعة القائمة",
        desc: "افتح القائمة لرؤية جميع التفاصيل: الصور والمرافق والسعر لكل ليلة والموقع ومعلومات المضيف. تأكد من أن العقار يلبي احتياجاتك قبل التواصل.",
        tips: [
          "تحقق من السعر لكل ليلة بعناية",
          "اقرأ وصف العقار كاملاً",
          "لاحظ الموقع الدقيق وأي قواعد للمنزل",
        ],
      },
      {
        number: "03",
        icon: "📞",
        title: "تواصل مع المضيف مباشرة",
        desc: "مرحبا تربطك بالمضيف — جميع ترتيبات الحجز والتواريخ والدفع تتم مباشرة بينك وبين المضيف. استخدم تفاصيل الاتصال المقدمة في القائمة.",
        tips: [
          "تأكد من التوافر في تواريخك",
          "اتفق على طريقة الدفع مع المضيف",
          "اسأل أي أسئلة قبل الالتزام",
        ],
        warning: "مرحبا لا تعالج المدفوعات. جميع المعاملات المالية تتم مباشرة مع المضيف.",
      },
      {
        number: "04",
        icon: "✅",
        title: "تأكيد والاستمتاع",
        desc: "بمجرد الاتفاق مع المضيف على التواريخ والدفع، يتم تأكيد حجزك. احصل على تفاصيل تسجيل الوصول واستمتع بإقامتك!",
        tips: [
          "احصل على تأكيد من المضيف كتابياً",
          "احفظ رقم اتصال المضيف",
          "اصل في وقت تسجيل الوصول المتفق عليه",
        ],
      },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      {
        q: "هل أحتاج إلى حساب لتصفح القوائم؟",
        a: "يمكنك تصفح القوائم بدون حساب، لكنك ستحتاج إلى التسجيل للوصول إلى تفاصيل الاتصال بالمضيف وإدارة الحجوزات.",
      },
      {
        q: "كيف أدفع مقابل إقامتي؟",
        a: "يتم ترتيب الدفع مباشرة مع المضيف. مرحبا لا تعالج أي مدفوعات — أنت والمضيف تتفقون على طريقة الدفع بشكل خاص.",
      },
      {
        q: "ماذا لو احتجت إلى الإلغاء؟",
        a: "تحدد كل مضيف سياسة الإلغاء الخاصة به. ناقش واتفق على سياسة الإلغاء مع المضيف قبل تأكيد حجزك.",
      },
      {
        q: "هل حجزي مضمون بمجرد التواصل مع المضيف؟",
        a: "يتم تأكيد حجزك فقط بعد قبول المضيف الصريح واتفاقكم على جميع التفاصيل. احصل دائماً على تأكيد كتابي.",
      },
      {
        q: "ماذا لو كانت هناك مشكلة في إقامتي؟",
        a: "تواصل مع المضيف مباشرة أولاً لحل أي مشاكل. إذا كنت بحاجة إلى مزيد من المساعدة، تواصل مع دعم مرحبا.",
      },
      {
        q: "هل يمكنني الحجز لعدة ليالٍ؟",
        a: "نعم — فقط اتفق على عدد الليالي والسعر الإجمالي مباشرة مع المضيف عند التواصل.",
      },
    ],
    tipsTitle: "نصائح لإقامة رائعة",
    tips: [
      { icon: "💬", title: "تواصل بوضوح", desc: "كن محدداً بشأن وقت وصولك وعدد الضيوف وأي متطلبات خاصة." },
      { icon: "📸", title: "تحقق من الصور", desc: "تصفح جميع صور القائمة بعناية. لا تتردد في طلب المزيد من الصور من المضيف." },
      { icon: "📍", title: "تأكد من الموقع", desc: "تحقق من العنوان الدقيق وكيفية الوصول إليه قبل يوم سفرك." },
      { icon: "🤝", title: "احترم قواعد المنزل", desc: "لكل مضيف قواعده الخاصة. اقرأها واحترمها لضمان إقامة سلسة." },
      { icon: "⭐", title: "اترك تقييماً", desc: "بعد إقامتك، ترك تقييم صادق يساعد المسافرين المستقبليين ويكافئ المضيفين الرائعين." },
      { icon: "🔒", title: "ابقَ آمناً", desc: "لا ترسل أموالاً قبل التحقق من القائمة. إذا شعرت بشيء غير صحيح، ثق بحدسك." },
    ],
    ctaTitle: "هل أنت مستعد للعثور على إقامتك؟",
    ctaDesc: "تصفح مئات القوائم في جميع أنحاء ليبيا وتواصل مع مضيفين محليين موثوقين.",
    ctaBrowse: "تصفح القوائم",
    ctaSignup: "إنشاء حساب",
    footer: {
      desc: "منصة التأجير قصير الأمد الموثوقة في ليبيا تربط المضيفين والمسافرين.",
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
    },
  },
};

export default function HowToBookPage() {
  const [lang, setLang] = useState("en");
  const [openFaq, setOpenFaq] = useState(null);
  const c = content[lang];
  const isAr = lang === "ar";

  const navLinks = [
    { id: "home", label: isAr ? "→ الرئيسية" : "← Home", href: "/" },
  ];

  return (
    <div dir={c.dir} className="bg-white min-h-screen text-gray-900">
      <Navbar
        NAV_LINKS={navLinks}
        user={null}
        lang={lang}
        toggleLanguage={() => setLang(lang === "en" ? "ar" : "en")}
      />

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#1a1a2e] via-[#2d2d5e] to-[#1a1a2e] py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(232,197,71,0.12)_0%,transparent_60%)] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,#e8c547 0px,#e8c547 1px,transparent 1px,transparent 40px)" }}
        />
        <div className="max-w-screen-xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 px-3.5 py-1.5 rounded-full text-[11px] tracking-widest uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
            {c.badge}
          </div>
          <h1
            className={`font-light text-[clamp(32px,5vw,56px)] text-white leading-[1.1] mb-3 max-w-2xl ${
              isAr ? "font-['Cairo','Tajawal',sans-serif]" : "font-['Fraunces',serif] italic"
            }`}
          >
             {c.title}
            <span className="font-bold text-[#e8c547]">{c.title1}</span>
          </h1>
          <p className="text-white/50 text-[15px] max-w-xl leading-relaxed">{c.subtitle}</p>
        </div>
      </section>

      {/* STEPS */}
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-2 font-semibold">
          {c.stepsTitle}
        </div>

        <div className="mt-10 flex flex-col gap-0">
          {c.steps.map((step, i) => (
            <div key={step.number} className="relative flex gap-6 md:gap-10">
              {/* Timeline line */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[#1a1a2e] flex items-center justify-center text-yellow-400 font-bold text-[13px] shrink-0 z-10">
                  {step.number}
                </div>
                {i < c.steps.length - 1 && (
                  <div className="w-px flex-1 bg-gray-200 my-2" />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 ${i < c.steps.length - 1 ? "pb-10" : "pb-2"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{step.icon}</span>
                  <h3
                    className={`font-semibold text-[18px] text-gray-900 ${
                      isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                    }`}
                  >
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-500 text-[14px] leading-[1.8] mb-4 max-w-2xl">{step.desc}</p>

                {/* Tips */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-3 max-w-2xl">
                  <ul className="flex flex-col gap-2">
                    {step.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2.5 text-[13px] text-gray-700">
                        <span className="w-[18px] h-[18px] rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0 mt-0.5">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 4l2 2 4-4" stroke="#e8c547" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warning */}
                {step.warning && (
                  <div className="bg-[#1a1a2e] rounded-2xl p-4 max-w-2xl border-l-4 border-yellow-400">
                    <p className="text-white/80 text-[13px] leading-[1.7]">
                      ⚠️ {step.warning}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TIPS GRID */}
      <div className="bg-gray-50 py-16 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-2 font-semibold">
            {c.tipsTitle}
          </div>
          <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {c.tips.map((tip) => (
              <div key={tip.title} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="text-2xl mb-3">{tip.icon}</div>
                <div className={`font-semibold text-[15px] text-gray-900 mb-1.5 ${isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""}`}>
                  {tip.title}
                </div>
                <p className="text-[13px] text-gray-500 leading-[1.7]">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-2 font-semibold">
          {c.faqTitle}
        </div>
        <div className="mt-8 max-w-3xl flex flex-col gap-3">
          {c.faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-transparent border-none cursor-pointer transition-colors ${
                  openFaq === i ? "bg-[#1a1a2e]" : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-[14px] font-medium ${
                    openFaq === i ? "text-yellow-400" : "text-gray-900"
                  } ${isAr ? "font-['Cairo','Tajawal',sans-serif] text-right" : ""}`}
                >
                  {faq.q}
                </span>
                <span
                  className={`text-lg shrink-0 transition-transform ${
                    openFaq === i ? "rotate-45 text-yellow-400" : "text-gray-400"
                  }`}
                >
                  +
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <p className={`text-[13px] text-gray-600 leading-[1.8] ${isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""}`}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-screen-xl mx-auto px-6 pb-16">
        <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#2d2d5e] rounded-3xl px-10 py-14 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,197,71,0.2)_0%,transparent_60%)]" />
          <div className="relative z-10">
            <h2
              className={`font-light text-[clamp(24px,4vw,40px)] text-white mb-3 leading-[1.15] ${
                isAr ? "font-['Cairo','Tajawal',sans-serif]" : "font-['Fraunces',serif] italic"
              }`}
            >
              {c.ctaTitle}
            </h2>
            <p className="text-[14px] text-white/45 max-w-md mx-auto mb-7 leading-[1.75]">{c.ctaDesc}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/listings"
                className="bg-yellow-400 text-[#1a1a2e] px-7 py-3.5 rounded-xl text-sm font-bold no-underline hover:bg-yellow-300 transition-colors"
              >
                {c.ctaBrowse} →
              </Link>
              <Link
                href="/signup"
                className="bg-white/10 text-white px-7 py-3.5 rounded-xl text-sm font-medium no-underline border border-white/20 hover:bg-white/15 transition-colors"
              >
                {c.ctaSignup}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
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
            <p className="text-sm text-[#555] max-w-xs leading-[1.7]">{c.footer.desc}</p>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-[#444]">
              &copy; {new Date().getFullYear()} Marhaba. {c.footer.rights}
            </p>
            <div className="flex gap-5">
              <Link href="/privacy" className="text-xs text-[#999] no-underline hover:text-yellow-400 transition-colors">
                {c.footer.privacy}
              </Link>
              <Link href="/terms" className="text-xs text-[#999] no-underline hover:text-yellow-400 transition-colors">
                {c.footer.terms}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}