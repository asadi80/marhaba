"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const content = {
  en: {
    dir: "ltr",
    brand: { prefix: "مر", highlight: "حبا" },
    badge: "Legal",
    title: "Privacy",
    title1: "Policy",
    subtitle: "How we collect, use, and protect your information",
    lastUpdated: "Last Updated: June 1, 2025",
    effective: "Effective Date: June 1, 2025",
    toc: "Table of Contents",
    backHome: "← Back to Home",
    sections: [
      {
        id: "intro",
        title: "Introduction",
        icon: "📋",
        content: `This Privacy Policy explains how Marhaba ("we," "our," or "us") collects, uses, stores, and protects your personal information when you use our short-term vacation rental platform. By using Marhaba, you agree to the practices described below.`,
      },
      {
        id: "collect",
        title: "Information We Collect",
        icon: "🗂️",
        content: "",
        subsections: [
          {
            title: "From Hosts",
            items: [
              "Full name, email address, phone number, and national ID (for verification)",
              "Property details, photos, descriptions, pricing, and availability calendars",
              "Billing information for the flat-rate subscription fee (processed by our payment provider; we do not store full card details)",
              "Booking management actions (confirmations, cancellations, no-show flags)",
            ],
          },
          {
            title: "From Guests",
            items: [
              "Full name, email address, and phone number",
              "Booking details and communication history with the host",
              "Account preferences and booking history",
            ],
          },
          {
            title: "Automatically Collected",
            items: [
              "IP address, browser type, device identifiers, and operating system",
              "Pages visited, session duration, and feature interactions (usage analytics)",
              "Cookies and similar tracking technologies (see Section 6)",
            ],
          },
        ],
      },
      {
        id: "use",
        title: "How We Use Your Information",
        icon: "⚙️",
        items: [
          "To create and manage your account (host or guest)",
          "To facilitate listing creation, property management, and booking workflows",
          "To process the host's flat-rate subscription billing every six months",
          "To send booking confirmations, reminders, and platform notifications",
          "To allow hosts to record guest no-shows or cancellations",
          "To improve platform features, fix bugs, and analyze usage patterns",
          "To comply with applicable Libyan law and respond to lawful requests from authorities",
          "To prevent fraud, abuse, and violations of our Terms of Service",
        ],
      },
      {
        id: "payments",
        title: "Payments — Important Notice",
        icon: "💳",
        highlight: true,
        content: `Marhaba does not process or facilitate any payments between hosts and guests. All financial transactions related to accommodation are arranged privately and directly between the host and the guest. We are not a party to any such transaction and accept no liability for payment disputes. The only payment Marhaba collects is the flat-rate subscription fee charged to hosts every six (6) months for platform access.`,
      },
      {
        id: "sharing",
        title: "Information Sharing",
        icon: "🔗",
        content: "We do not sell your personal data. We may share information only in these circumstances:",
        items: [
          "With the other party — When a booking is made, relevant contact details are shared between the host and guest to coordinate the stay",
          "Service providers — Third-party vendors (e.g., payment processors, email delivery, hosting) who are contractually bound to protect your data and use it only for specified purposes",
          "Legal requirements — When required by Libyan law, court order, or governmental authority",
          "Business transfers — In the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity",
          "Safety — To protect the safety or legal rights of Marhaba, our users, or the public",
        ],
      },
      {
        id: "security",
        title: "Data Security",
        icon: "🔒",
        content: `We implement reasonable technical and organizational safeguards to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include encrypted data transmission (HTTPS), access controls, and regular security reviews. However, no method of internet transmission is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.`,
      },
      {
        id: "cookies",
        title: "Cookies",
        icon: "🍪",
        content: "We use cookies and similar technologies to:",
        items: [
          "Keep you logged in across sessions",
          "Remember your language and display preferences",
          "Analyze platform usage and performance",
        ],
        footer: "You may disable cookies in your browser settings, but some features may not function correctly as a result.",
      },
      {
        id: "rights",
        title: "Your Rights",
        icon: "⚖️",
        content: "Subject to applicable law, you have the right to:",
        items: [
          "Access — request a copy of the personal data we hold about you",
          "Correction — request that inaccurate data be corrected",
          "Deletion — request deletion of your data, subject to legal retention obligations",
          "Objection — object to certain processing of your data",
          "Account deletion — delete your account at any time through the platform settings",
        ],
        footer: "To exercise any of these rights, contact us at the address in Section 10.",
      },
      {
        id: "retention",
        title: "Data Retention",
        icon: "🗄️",
        content: `We retain your personal data for as long as your account is active or as needed to provide our services. Upon account deletion, we will delete or anonymize your data within 90 days, unless a longer retention period is required by Libyan law or for the resolution of disputes.`,
      },
      {
        id: "minors",
        title: "Children's Privacy",
        icon: "🛡️",
        content: `Marhaba is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided personal information, we will delete it promptly.`,
      },
      {
        id: "changes",
        title: "Changes to This Policy",
        icon: "📝",
        content: `We may update this Privacy Policy from time to time. We will notify registered users of material changes via email or an in-app notice at least 14 days before the changes take effect. Continued use of Marhaba after the effective date constitutes acceptance of the updated policy.`,
      },
      {
        id: "contact",
        title: "Contact Us",
        icon: "📬",
        content: "For questions, requests, or concerns regarding this Privacy Policy, please contact:",
        contactCard: {
          name: "Marhaba Platform",
          email: "privacy@marhaba.ly",
          location: "Libya",
        },
      },
    ],
    footer: {
      desc: "Libya's trusted short-term rental platform connecting hosts and travelers.",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
  },
  ar: {
    dir: "rtl",
    brand: { prefix: "مر", highlight: "حبا" },
    badge: "قانوني",
    title: "سياسة ",
    title1: "الخصوصية",
    subtitle: "كيف نجمع معلوماتك ونستخدمها ونحميها",
    lastUpdated: "آخر تحديث: 1 يونيو 2025",
    effective: "تاريخ السريان: 1 يونيو 2025",
    toc: "جدول المحتويات",
    backHome: "→ العودة للرئيسية",
    sections: [
      {
        id: "intro",
        title: "مقدمة",
        icon: "📋",
        content: `توضح سياسة الخصوصية هذه كيف تقوم مرحبا ("نحن" أو "لنا") بجمع معلوماتك الشخصية واستخدامها وتخزينها وحمايتها عند استخدامك منصتنا لتأجير الإجازات قصيرة الأمد. باستخدامك مرحبا، فإنك توافق على الممارسات الموضحة أدناه.`,
      },
      {
        id: "collect",
        title: "المعلومات التي نجمعها",
        icon: "🗂️",
        content: "",
        subsections: [
          {
            title: "من المضيفين",
            items: [
              "الاسم الكامل وعنوان البريد الإلكتروني ورقم الهاتف والهوية الوطنية (للتحقق)",
              "تفاصيل العقار والصور والأوصاف والأسعار وجداول الإتاحة",
              "معلومات الفوترة لرسوم الاشتراك الثابتة (تُعالج بواسطة مزود الدفع؛ لا نخزن تفاصيل البطاقة الكاملة)",
              "إجراءات إدارة الحجوزات (التأكيدات والإلغاءات وعدم الحضور)",
            ],
          },
          {
            title: "من الضيوف",
            items: [
              "الاسم الكامل وعنوان البريد الإلكتروني ورقم الهاتف",
              "تفاصيل الحجز وسجل التواصل مع المضيف",
              "تفضيلات الحساب وسجل الحجوزات",
            ],
          },
          {
            title: "المجموعة تلقائياً",
            items: [
              "عنوان IP ونوع المتصفح ومعرفات الجهاز ونظام التشغيل",
              "الصفحات المُزارة ومدة الجلسة وتفاعلات الميزات",
              "ملفات تعريف الارتباط وتقنيات تتبع مماثلة (انظر القسم 6)",
            ],
          },
        ],
      },
      {
        id: "use",
        title: "كيف نستخدم معلوماتك",
        icon: "⚙️",
        items: [
          "لإنشاء حسابك وإدارته (مضيف أو ضيف)",
          "لتسهيل إنشاء القوائم وإدارة العقارات وسير عمل الحجوزات",
          "لمعالجة اشتراك المضيف الثابت كل ستة أشهر",
          "لإرسال تأكيدات الحجز والتذكيرات وإشعارات المنصة",
          "للسماح للمضيفين بتسجيل حالات عدم حضور الضيوف أو الإلغاءات",
          "لتحسين ميزات المنصة وإصلاح الأخطاء وتحليل أنماط الاستخدام",
          "للامتثال للقانون الليبي المعمول به والاستجابة للطلبات القانونية",
          "لمنع الاحتيال والانتهاكات",
        ],
      },
      {
        id: "payments",
        title: "المدفوعات — إشعار مهم",
        icon: "💳",
        highlight: true,
        content: `لا تقوم مرحبا بمعالجة أو تسهيل أي مدفوعات بين المضيفين والضيوف. جميع المعاملات المالية المتعلقة بالإقامة تُرتب بشكل خاص ومباشر بين المضيف والضيف. لسنا طرفاً في أي معاملة كهذه ولا نتحمل أي مسؤولية عن نزاعات المدفوعات. الدفع الوحيد الذي تجمعه مرحبا هو رسوم الاشتراك الثابتة المفروضة على المضيفين كل ستة (6) أشهر للوصول إلى المنصة.`,
      },
      {
        id: "sharing",
        title: "مشاركة المعلومات",
        icon: "🔗",
        content: "لا نبيع بياناتك الشخصية. قد نشارك المعلومات فقط في هذه الحالات:",
        items: [
          "مع الطرف الآخر — عند إجراء حجز، تُشارك تفاصيل الاتصال بين المضيف والضيف",
          "مزودو الخدمات — بائعون خارجيون ملزمون تعاقدياً بحماية بياناتك",
          "المتطلبات القانونية — عند الاقتضاء بموجب القانون الليبي أو أمر المحكمة",
          "تحويلات الأعمال — في حالة الاندماج أو الاستحواذ أو بيع الأصول",
          "السلامة — لحماية سلامة مرحبا أو مستخدمينا أو الجمهور",
        ],
      },
      {
        id: "security",
        title: "أمان البيانات",
        icon: "🔒",
        content: `نطبق ضمانات تقنية وتنظيمية معقولة لحماية معلوماتك الشخصية من الوصول أو التغيير أو الإفصاح أو التدمير غير المصرح به. تشمل هذه الضمانات نقل البيانات المشفرة (HTTPS) وضوابط الوصول ومراجعات الأمان المنتظمة.`,
      },
      {
        id: "cookies",
        title: "ملفات تعريف الارتباط",
        icon: "🍪",
        content: "نستخدم ملفات تعريف الارتباط وتقنيات مماثلة من أجل:",
        items: [
          "إبقائك مسجلاً للدخول عبر الجلسات",
          "تذكر تفضيلات اللغة والعرض",
          "تحليل استخدام المنصة والأداء",
        ],
        footer: "يمكنك تعطيل ملفات تعريف الارتباط في إعدادات متصفحك، لكن بعض الميزات قد لا تعمل بشكل صحيح نتيجة لذلك.",
      },
      {
        id: "rights",
        title: "حقوقك",
        icon: "⚖️",
        content: "وفقاً للقانون المعمول به، لديك الحق في:",
        items: [
          "الوصول — طلب نسخة من البيانات الشخصية التي نحتفظ بها عنك",
          "التصحيح — طلب تصحيح البيانات غير الدقيقة",
          "الحذف — طلب حذف بياناتك، مع مراعاة التزامات الاحتفاظ القانونية",
          "الاعتراض — الاعتراض على معالجة معينة لبياناتك",
          "حذف الحساب — حذف حسابك في أي وقت من خلال إعدادات المنصة",
        ],
        footer: "لممارسة أي من هذه الحقوق، تواصل معنا على العنوان في القسم 10.",
      },
      {
        id: "retention",
        title: "الاحتفاظ بالبيانات",
        icon: "🗄️",
        content: `نحتفظ ببياناتك الشخصية طالما حسابك نشط أو حسب الحاجة لتقديم خدماتنا. عند حذف الحساب، سنحذف بياناتك أو نجعلها مجهولة الهوية خلال 90 يوماً، ما لم يكن هناك فترة احتفاظ أطول مطلوبة بموجب القانون الليبي.`,
      },
      {
        id: "minors",
        title: "خصوصية الأطفال",
        icon: "🛡️",
        content: `مرحبا غير مخصصة للاستخدام من قبل الأفراد دون سن 18 عاماً. لا نجمع عن قصد البيانات الشخصية من القاصرين. إذا اكتشفنا أن قاصراً قد قدم معلومات شخصية، فسنحذفها فوراً.`,
      },
      {
        id: "changes",
        title: "التغييرات على هذه السياسة",
        icon: "📝",
        content: `قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطر المستخدمين المسجلين بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار داخل التطبيق قبل 14 يوماً على الأقل من سريان التغييرات.`,
      },
      {
        id: "contact",
        title: "تواصل معنا",
        icon: "📬",
        content: "للأسئلة أو الطلبات أو المخاوف المتعلقة بسياسة الخصوصية هذه، يرجى التواصل:",
        contactCard: {
          name: "منصة مرحبا",
          email: "privacy@marhaba.ly",
          location: "ليبيا",
        },
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

export default function PrivacyPage() {
  const [lang, setLang] = useState("en");
  const [activeSection, setActiveSection] = useState(null);
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

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#1a1a2e] via-[#2d2d5e] to-[#1a1a2e] py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(232,197,71,0.12)_0%,transparent_60%)] pointer-events-none" />
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
          <div className="flex flex-wrap gap-4">
            <span className="text-[12px] text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              {c.effective}
            </span>
            <span className="text-[12px] text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              {c.lastUpdated}
            </span>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="max-w-screen-xl mx-auto px-6 py-12 flex gap-10">
        {/* TOC — desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28">
            <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-4 font-semibold">
              {c.toc}
            </div>
            <nav className="flex flex-col gap-1">
              {c.sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2.5 text-[13px] no-underline py-1.5 px-3 rounded-lg transition-all ${
                    activeSection === s.id
                      ? "bg-[#1a1a2e] text-yellow-400 font-semibold"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base shrink-0">{s.icon}</span>
                  <span>
                    {i + 1}. {s.title}
                  </span>
                </a>
              ))}
            </nav>
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-[11px] text-yellow-800 leading-[1.6]">
                {isAr
                  ? "هل لديك أسئلة؟ تواصل معنا على privacy@marhaba.ly"
                  : "Questions? Contact us at privacy@marhaba.ly"}
              </p>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 min-w-0 max-w-3xl">
          <div className="flex flex-col gap-10">
            {c.sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-28"
                onMouseEnter={() => setActiveSection(s.id)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-lg shrink-0">
                    {s.icon}
                  </span>
                  <h2
                    className={`font-semibold text-[18px] text-gray-900 ${
                      isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                    }`}
                  >
                    {i + 1}. {s.title}
                  </h2>
                </div>

                {s.highlight ? (
                  <div className="bg-[#1a1a2e] rounded-2xl p-6 border-l-4 border-yellow-400">
                    <p className="text-white/80 text-[14px] leading-[1.8]">{s.content}</p>
                  </div>
                ) : s.content ? (
                  <p className="text-gray-600 text-[14px] leading-[1.8] mb-4">{s.content}</p>
                ) : null}

                {s.subsections && (
                  <div className="flex flex-col gap-5 mt-2">
                    {s.subsections.map((sub) => (
                      <div key={sub.title} className="bg-gray-50 rounded-2xl p-5">
                        <div className="text-[11px] tracking-[0.1em] uppercase text-gray-400 mb-3 font-semibold">
                          {sub.title}
                        </div>
                        <ul className="flex flex-col gap-2">
                          {sub.items.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-[13px] text-gray-700">
                              <span className="w-[18px] h-[18px] rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0 mt-0.5">
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                  <path d="M1 4l2 2 4-4" stroke="#e8c547" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {s.items && (
                  <ul className="flex flex-col gap-2 mt-2">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13px] text-gray-700">
                        <span className="w-[18px] h-[18px] rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0 mt-0.5">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 4l2 2 4-4" stroke="#e8c547" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {s.footer && (
                  <p className="text-gray-500 text-[13px] mt-3 italic">{s.footer}</p>
                )}

                {s.contactCard && (
                  <div className="mt-4 border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-yellow-400 text-xl shrink-0">
                      🏢
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{s.contactCard.name}</div>
                      <div className="text-[13px] text-gray-500">
                        Email:{" "}
                        <a
                          href={`mailto:${s.contactCard.email}`}
                          className="text-[#1a1a2e] font-medium no-underline hover:text-yellow-600"
                        >
                          {s.contactCard.email}
                        </a>
                      </div>
                      <div className="text-[13px] text-gray-500">
                        {isAr ? "الموقع" : "Location"}: {s.contactCard.location}
                      </div>
                    </div>
                  </div>
                )}

                {i < c.sections.length - 1 && (
                  <div className="mt-10 border-b border-gray-100" />
                )}
              </section>
            ))}
          </div>

          {/* Bottom notice */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-5 text-center">
            <p className="text-[12px] text-gray-400">
              {isAr
                ? "تم تحديث هذه الوثيقة في 1 يونيو 2025. القانون الساري: ليبيا."
                : "This document was last updated on June 1, 2025. Governing law: Libya."}
            </p>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#111] px-6 pt-12 pb-7 mt-10">
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
              <Link href="/privacy" className="text-xs text-yellow-400 no-underline font-semibold">
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