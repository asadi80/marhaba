"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const content = {
  en: {
    dir: "ltr",
    badge: "Legal",
    title: "Terms o",
    title1: "f Service",
    subtitle: "The rules that govern your use of the Marhaba platform",
    lastUpdated: "Last Updated: June 1, 2025",
    effective: "Effective Date: June 1, 2025",
    toc: "Table of Contents",
    backHome: "← Back to Home",
    sections: [
      {
        id: "acceptance",
        title: "Acceptance of Terms",
        icon: "✅",
        content: `By accessing or using Marhaba ("the Platform"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you must not use the Platform. These Terms apply to all users, including hosts and guests.`,
      },
      {
        id: "overview",
        title: "Platform Overview",
        icon: "🏠",
        content: `Marhaba is an online listing platform that connects property owners ("Hosts") with travelers seeking short-term accommodation ("Guests") in Libya. Marhaba is not a party to any agreement made between a Host and a Guest, and does not provide accommodation, rental, travel, or payment services.`,
      },
      {
        id: "accounts",
        title: "Account Registration",
        icon: "👤",
        content: "To use the Platform, you must:",
        items: [
          "Be at least 18 years of age",
          "Provide accurate, complete, and current registration information",
          "Maintain the security and confidentiality of your account credentials",
          "Notify us immediately of any unauthorized access or security breach",
          "Accept full responsibility for all activity that occurs under your account",
        ],
        footer: "We reserve the right to refuse registration or suspend/terminate accounts at our discretion.",
      },
      {
        id: "hosts",
        title: "Host Responsibilities",
        icon: "🏡",
        content: "As a Host on Marhaba, you agree to:",
        items: [
          "List only properties you own or have legal authority to rent",
          "Provide accurate descriptions, photos, pricing, and availability",
          "Honour confirmed bookings and communicate promptly with Guests",
          "Comply with all applicable Libyan laws and local regulations governing short-term rentals",
          "Pay the flat-rate subscription fee of [amount] LYD every six (6) months to maintain an active listing",
          "Record and report accurate Guest no-show and cancellation information",
          "Not discriminate against Guests on the basis of nationality, religion, gender, or any other protected characteristic",
        ],
        highlight: {
          title: "⚠️ No-Show Policy",
          text: "Hosts who accumulate three (3) or more unresolved no-show flags within a 12-month period may have their listings suspended or removed pending review.",
        },
      },
      {
        id: "guests",
        title: "Guest Responsibilities",
        icon: "🧳",
        content: "As a Guest on Marhaba, you agree to:",
        items: [
          "Provide accurate personal information during booking",
          "Contact the Host directly to arrange payment and confirm accommodation details",
          "Respect the Host's property, house rules, and check-in/check-out times",
          "Not use the Platform for fraudulent, deceptive, or unlawful purposes",
          "Report concerns or disputes involving a Host through our support channels",
        ],
      },
      {
        id: "payments",
        title: "Payments & Subscriptions",
        icon: "💳",
        highlight: true,
        content: `Marhaba does not process, hold, or transfer any payments between Hosts and Guests. All accommodation payments are made privately and directly between the parties. Marhaba is not responsible for payment disputes, refunds, or losses arising from direct transactions.`,
        subsection: {
          title: "Host Subscription",
          items: [
            "Hosts are charged a flat-rate subscription fee every six (6) months",
            "Subscription fees are non-refundable except where required by law",
            "Failure to pay within the grace period will result in listing deactivation",
            "Reactivation is available upon full payment of any outstanding balance",
          ],
        },
      },
      {
        id: "prohibited",
        title: "Prohibited Conduct",
        icon: "🚫",
        content: "You must not use the Platform to:",
        items: [
          "Post false, misleading, or fraudulent listings or reviews",
          "Harass, threaten, or abuse other users",
          "Circumvent or manipulate the Platform's booking or review systems",
          "Collect or harvest other users' personal data without consent",
          "Distribute spam, malware, or other harmful content",
          "Use automated tools to scrape, index, or access Platform data without written permission",
          "Violate any applicable local, national, or international law or regulation",
        ],
      },
      {
        id: "content",
        title: "User Content",
        icon: "📸",
        content: `You retain ownership of any content (photos, descriptions, reviews) you upload to the Platform. By uploading content, you grant Marhaba a non-exclusive, royalty-free, worldwide license to use, display, and reproduce that content solely for operating and promoting the Platform. You represent that your content does not infringe any third-party intellectual property rights and does not contain illegal, defamatory, or harmful material.`,
      },
      {
        id: "liability",
        title: "Limitation of Liability",
        icon: "⚖️",
        content: `To the fullest extent permitted by applicable law, Marhaba, its officers, directors, employees, and agents shall not be liable for: (a) any indirect, incidental, special, or consequential damages; (b) any loss arising from transactions or disputes between Hosts and Guests; (c) any inaccuracies in listings or user-submitted content; or (d) temporary or permanent unavailability of the Platform. Our total liability for any claim shall not exceed the subscription fees paid by you in the six months preceding the claim.`,
      },
      {
        id: "termination",
        title: "Termination",
        icon: "🔴",
        content: "Either party may terminate this agreement:",
        items: [
          "You may delete your account at any time through the platform settings",
          "We may suspend or permanently terminate your account if you breach these Terms",
          "We may discontinue the Platform with reasonable notice",
          "Upon termination, your right to use the Platform ceases immediately",
          "Sections relating to liability, intellectual property, and dispute resolution survive termination",
        ],
      },
      {
        id: "governing",
        title: "Governing Law & Disputes",
        icon: "🏛️",
        content: `These Terms are governed by the laws of Libya. Any dispute arising from or related to these Terms or your use of the Platform shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to the competent courts of Libya.`,
      },
      {
        id: "changes",
        title: "Changes to Terms",
        icon: "📝",
        content: `We may update these Terms at any time. Material changes will be communicated via email or in-app notice at least 14 days before they take effect. Continued use of the Platform after the effective date constitutes acceptance of the revised Terms.`,
      },
      {
        id: "contact",
        title: "Contact Us",
        icon: "📬",
        content: "For questions regarding these Terms of Service, please contact:",
        contactCard: {
          name: "Marhaba Platform",
          email: "legal@marhaba.ly",
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
    badge: "قانوني",
    title: "شروط ",
    title1: "الخدمة",
    subtitle: "القواعد التي تحكم استخدامك لمنصة مرحبا",
    lastUpdated: "آخر تحديث: 1 يونيو 2025",
    effective: "تاريخ السريان: 1 يونيو 2025",
    toc: "جدول المحتويات",
    backHome: "→ العودة للرئيسية",
    sections: [
      {
        id: "acceptance",
        title: "قبول الشروط",
        icon: "✅",
        content: `بالوصول إلى مرحبا ("المنصة") أو استخدامها، فإنك توافق على الالتزام بشروط الخدمة هذه وسياسة الخصوصية الخاصة بنا. إذا كنت لا توافق، فيجب عليك عدم استخدام المنصة. تنطبق هذه الشروط على جميع المستخدمين، بما في ذلك المضيفون والضيوف.`,
      },
      {
        id: "overview",
        title: "نظرة عامة على المنصة",
        icon: "🏠",
        content: `مرحبا هي منصة إدراج إلكترونية تربط أصحاب العقارات ("المضيفون") بالمسافرين الباحثين عن إقامة قصيرة الأمد ("الضيوف") في ليبيا. مرحبا ليست طرفاً في أي اتفاق يُبرم بين مضيف وضيف، ولا تقدم خدمات إقامة أو إيجار أو سفر أو دفع.`,
      },
      {
        id: "accounts",
        title: "تسجيل الحساب",
        icon: "👤",
        content: "لاستخدام المنصة، يجب عليك:",
        items: [
          "أن يكون عمرك 18 عاماً على الأقل",
          "تقديم معلومات تسجيل دقيقة وكاملة وحديثة",
          "الحفاظ على أمان وسرية بيانات اعتماد حسابك",
          "إخطارنا فوراً بأي وصول غير مصرح به أو اختراق أمني",
          "تحمل المسؤولية الكاملة عن جميع الأنشطة التي تحدث في حسابك",
        ],
        footer: "نحتفظ بالحق في رفض التسجيل أو تعليق/إنهاء الحسابات وفق تقديرنا.",
      },
      {
        id: "hosts",
        title: "مسؤوليات المضيف",
        icon: "🏡",
        content: "بصفتك مضيفاً على مرحبا، فإنك توافق على:",
        items: [
          "إدراج العقارات التي تملكها أو لديك صلاحية قانونية لتأجيرها فقط",
          "تقديم أوصاف دقيقة وصور وأسعار وتوافر",
          "الوفاء بالحجوزات المؤكدة والتواصل السريع مع الضيوف",
          "الامتثال لجميع القوانين الليبية المعمول بها واللوائح المحلية",
          "دفع رسوم الاشتراك الثابتة البالغة [المبلغ] دينار كل ستة (6) أشهر",
          "تسجيل والإبلاغ عن معلومات دقيقة لعدم حضور الضيوف والإلغاءات",
          "عدم التمييز ضد الضيوف على أساس الجنسية أو الدين أو الجنس",
        ],
        highlight: {
          title: "⚠️ سياسة عدم الحضور",
          text: "المضيفون الذين يتراكم لديهم ثلاثة (3) بلاغات عدم حضور أو أكثر لم يُحل خلال 12 شهراً قد يتم تعليق قوائمهم أو إزالتها.",
        },
      },
      {
        id: "guests",
        title: "مسؤوليات الضيف",
        icon: "🧳",
        content: "بصفتك ضيفاً على مرحبا، فإنك توافق على:",
        items: [
          "تقديم معلومات شخصية دقيقة أثناء الحجز",
          "التواصل مع المضيف مباشرة لترتيب الدفع وتأكيد تفاصيل الإقامة",
          "احترام ممتلكات المضيف وقواعد المنزل وأوقات الوصول والمغادرة",
          "عدم استخدام المنصة لأغراض احتيالية أو خادعة أو غير قانونية",
          "الإبلاغ عن المخاوف أو النزاعات عبر قنوات الدعم لدينا",
        ],
      },
      {
        id: "payments",
        title: "المدفوعات والاشتراكات",
        icon: "💳",
        highlight: true,
        content: `لا تقوم مرحبا بمعالجة أو الاحتفاظ أو تحويل أي مدفوعات بين المضيفين والضيوف. جميع مدفوعات الإقامة تتم بشكل خاص ومباشر بين الأطراف. مرحبا غير مسؤولة عن نزاعات المدفوعات أو المبالغ المستردة أو الخسائر الناجمة عن المعاملات المباشرة.`,
        subsection: {
          title: "اشتراك المضيف",
          items: [
            "يُفرض على المضيفين رسوم اشتراك ثابتة كل ستة (6) أشهر",
            "رسوم الاشتراك غير قابلة للاسترداد إلا حيثما يقتضي القانون",
            "سيؤدي الفشل في الدفع خلال فترة السماح إلى تعطيل القائمة",
            "يمكن إعادة التنشيط عند السداد الكامل لأي رصيد مستحق",
          ],
        },
      },
      {
        id: "prohibited",
        title: "السلوك المحظور",
        icon: "🚫",
        content: "يجب ألا تستخدم المنصة من أجل:",
        items: [
          "نشر قوائم أو مراجعات كاذبة أو مضللة أو احتيالية",
          "مضايقة أو تهديد أو إساءة استخدام المستخدمين الآخرين",
          "التحايل على أنظمة الحجز أو المراجعة في المنصة أو التلاعب بها",
          "جمع أو حصاد البيانات الشخصية للمستخدمين الآخرين دون موافقة",
          "توزيع البريد المزعج أو البرامج الضارة أو أي محتوى ضار آخر",
          "استخدام أدوات آلية لجمع بيانات المنصة دون إذن كتابي",
          "انتهاك أي قانون أو لائحة محلية أو وطنية أو دولية",
        ],
      },
      {
        id: "content",
        title: "محتوى المستخدم",
        icon: "📸",
        content: `تحتفظ بملكية أي محتوى (صور وأوصاف ومراجعات) تقوم بتحميله على المنصة. بتحميل المحتوى، فإنك تمنح مرحبا ترخيصاً غير حصري وبدون إتاوات وعالمي النطاق لاستخدام هذا المحتوى وعرضه وإعادة إنتاجه فقط لتشغيل المنصة والترويج لها. أنت تؤكد أن محتواك لا ينتهك أي حقوق ملكية فكرية تابعة لطرف ثالث.`,
      },
      {
        id: "liability",
        title: "تحديد المسؤولية",
        icon: "⚖️",
        content: `إلى أقصى حد يسمح به القانون المعمول به، لن تكون مرحبا ومسؤولوها ومديروها وموظفوها ووكلاؤها مسؤولين عن: (أ) أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية؛ (ب) أي خسارة تنشأ عن معاملات أو نزاعات بين المضيفين والضيوف؛ (ج) أي معلومات غير دقيقة في القوائم؛ أو (د) عدم توفر المنصة مؤقتاً أو بشكل دائم.`,
      },
      {
        id: "termination",
        title: "الإنهاء",
        icon: "🔴",
        content: "يمكن لأي طرف إنهاء هذه الاتفاقية:",
        items: [
          "يمكنك حذف حسابك في أي وقت من خلال إعدادات المنصة",
          "قد نعلق حسابك أو ننهيه بشكل دائم إذا انتهكت هذه الشروط",
          "قد نوقف المنصة مع إشعار معقول",
          "عند الإنهاء، يتوقف حقك في استخدام المنصة فوراً",
          "تبقى الأقسام المتعلقة بالمسؤولية والملكية الفكرية وحل النزاعات سارية بعد الإنهاء",
        ],
      },
      {
        id: "governing",
        title: "القانون الحاكم والنزاعات",
        icon: "🏛️",
        content: `تخضع هذه الشروط لقوانين ليبيا. يجب أولاً محاولة حل أي نزاع ينشأ عن هذه الشروط أو استخدامك للمنصة من خلال التفاوض بحسن نية. إذا لم يُحل خلال 30 يوماً، يُحال النزاع إلى المحاكم المختصة في ليبيا.`,
      },
      {
        id: "changes",
        title: "التغييرات على الشروط",
        icon: "📝",
        content: `قد نقوم بتحديث هذه الشروط في أي وقت. ستُبلَّغ بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار داخل التطبيق قبل 14 يوماً على الأقل من سريانها. الاستمرار في استخدام المنصة بعد التاريخ الفعلي يعني قبول الشروط المُعدَّلة.`,
      },
      {
        id: "contact",
        title: "تواصل معنا",
        icon: "📬",
        content: "للأسئلة المتعلقة بشروط الخدمة هذه، يرجى التواصل:",
        contactCard: {
          name: "منصة مرحبا",
          email: "legal@marhaba.ly",
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

export default function TermsPage() {
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
       
        lang={lang}
        toggleLanguage={() => setLang(lang === "en" ? "ar" : "en")}
      />

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#1a1a2e] via-[#2d2d5e] to-[#1a1a2e] py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(232,197,71,0.12)_0%,transparent_60%)] pointer-events-none" />
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
            <span className="font-bold text-[#e8c547]">{c.title1}</span>
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
            <div className="mt-8 p-4 bg-[#1a1a2e] rounded-2xl">
              <p className="text-[11px] text-yellow-400/80 leading-[1.6]">
                {isAr
                  ? "هل لديك أسئلة قانونية؟ تواصل معنا على legal@marhaba.ly"
                  : "Legal questions? Contact us at legal@marhaba.ly"}
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

                {/* Highlighted notice box */}
                {s.highlight === true ? (
                  <div className="bg-[#1a1a2e] rounded-2xl p-6 border-l-4 border-yellow-400 mb-4">
                    <p className="text-white/80 text-[14px] leading-[1.8]">{s.content}</p>
                  </div>
                ) : s.content ? (
                  <p className="text-gray-600 text-[14px] leading-[1.8] mb-4">{s.content}</p>
                ) : null}

                {s.items && (
                  <ul className="flex flex-col gap-2 mb-4">
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

                {/* Inline highlight block (e.g. No-show policy) */}
                {s.highlight && typeof s.highlight === "object" && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                    <div className="font-semibold text-yellow-800 text-[13px] mb-1.5">{s.highlight.title}</div>
                    <p className="text-[13px] text-yellow-700 leading-[1.7]">{s.highlight.text}</p>
                  </div>
                )}

                {/* Subsection (e.g. Host Subscription under Payments) */}
                {s.subsection && (
                  <div className="mt-4 bg-gray-50 rounded-2xl p-5">
                    <div className="text-[11px] tracking-[0.1em] uppercase text-gray-400 mb-3 font-semibold">
                      {s.subsection.title}
                    </div>
                    <ul className="flex flex-col gap-2">
                      {s.subsection.items.map((item) => (
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
              <Link href="/privacy" className="text-xs text-[#999] no-underline hover:text-yellow-400 transition-colors">
                {c.footer.privacy}
              </Link>
              <Link href="/terms" className="text-xs text-yellow-400 no-underline font-semibold">
                {c.footer.terms}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}