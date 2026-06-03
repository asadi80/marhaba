"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/hooks/useLanguage";

const content = {
  en: {
    dir: "ltr",
    badge: "Host Guide",
    title: "Start",
    title1: "Hosting",
    subtitle: "Everything you need to know to list your property and welcome guests in Libya",
    lastUpdated: "Last Updated: June 1, 2025",
    effective: "For Hosts · Property Owners",
    toc: "Table of Contents",
    sections: [
      {
        id: "overview",
        title: "Why Host on Marhaba?",
        icon: "🏠",
        content:
          "Marhaba is Libya's dedicated short-term rental platform built for local hosts. We give you the tools to list your property, manage bookings, and connect with travelers — all in one place, in Arabic and English.",
        items: [
          "Libya's only dedicated short-term rental platform",
          "Full Arabic & English interface — list in both languages",
          "Flat-rate subscription — no per-booking commissions",
          "You control your pricing, availability, and house rules",
          "Verified guests only — we confirm guest identities",
        ],
      },
      {
        id: "account",
        title: "Create a Host Account",
        icon: "👤",
        content: "Getting started takes less than 5 minutes. Here's how to set up your host account:",
        steps: [
          {
            num: "01",
            title: "Sign up on Marhaba",
            body: "Click Get Started on the homepage, then choose Host as your account type. Enter your full name, email address, and a secure password.",
          },
          {
            num: "02",
            title: "Verify your email",
            body: "Check your inbox for a confirmation email from Marhaba and click the verification link to activate your account.",
          },
          {
            num: "03",
            title: "Submit your national ID",
            body: "All hosts are required to verify their identity by submitting a copy of their Libyan national ID. This is reviewed by our team before your listings go live.",
          },
          {
            num: "04",
            title: "Access your Host Dashboard",
            body: "Once verified, you'll have full access to your Host Dashboard — where you manage listings, bookings, guests, and your subscription.",
          },
        ],
      },
      {
        id: "subscription",
        title: "Subscription & Pricing",
        icon: "💳",
        highlight: true,
        content:
          "Marhaba charges hosts a flat-rate subscription fee every six (6) months for platform access. There are no per-booking commissions or hidden fees — what you charge guests is entirely yours. Payment is processed securely through our payment provider; we do not store full card details.",
      },
      {
        id: "listing",
        title: "Create Your Listing",
        icon: "📋",
        content: "A great listing attracts more guests. Follow these steps to publish yours:",
        steps: [
          {
            num: "01",
            title: "Go to Add Listing",
            body: "From your Host Dashboard, click Add New Listing. You'll be guided through each section of the listing form.",
          },
          {
            num: "02",
            title: "Add property details",
            body: "Enter your property title, description, type (apartment, villa, chalet, etc.), and select all relevant categories — beachfront, mountain, city, desert, pool, and more.",
          },
          {
            num: "03",
            title: "Upload photos",
            body: "Add high-quality photos of every room, the exterior, and any standout features. Listings with 6+ photos receive significantly more booking requests. Natural light makes a huge difference.",
          },
          {
            num: "04",
            title: "Set your price",
            body: "Enter your nightly rate in Libyan Dinar (LYD). You can update pricing at any time from your dashboard. Consider seasonal demand when setting rates.",
          },
          {
            num: "05",
            title: "Set availability",
            body: "Use the availability calendar to mark which dates your property is open. Keep it updated — stale calendars lead to declined requests and frustrated guests.",
          },
          {
            num: "06",
            title: "Add amenities & house rules",
            body: "List all amenities (WiFi, kitchen, parking, AC, etc.) and clearly state your house rules — check-in/out times, pet policy, smoking policy, max guests.",
          },
          {
            num: "07",
            title: "Publish",
            body: "Review everything and hit Publish. Your listing will go live immediately and appear in search results and the homepage.",
          },
        ],
      },
      {
        id: "bookings",
        title: "Managing Bookings",
        icon: "📅",
        content: "Once your listing is live, booking requests will start coming in. Here's how to manage them:",
        subsections: [
          {
            title: "Receiving requests",
            items: [
              "You'll get an email notification for every new booking request",
              "Open the request from your Host Dashboard under Bookings",
              "Review the guest's profile, message, and requested dates",
              "Confirm or decline within 24 hours — prompt responses build your reputation",
            ],
          },
          {
            title: "After confirming",
            items: [
              "The guest receives a confirmation email with your contact details",
              "Coordinate check-in time, directions, and any special arrangements directly",
              "Arrange payment with the guest directly — Marhaba does not process guest payments",
              "Mark the booking as completed after the guest checks out",
            ],
          },
          {
            title: "No-shows & cancellations",
            items: [
              "If a guest doesn't show, mark it as a No-Show from the booking record",
              "No-show flags help maintain platform quality and protect future hosts",
              "Set your own cancellation policy — it appears on your listing so guests can read it before booking",
            ],
          },
        ],
      },
      {
        id: "payment",
        title: "Payments — Important Notice",
        icon: "💰",
        highlight: true,
        content:
          "Marhaba does not process or facilitate payments between hosts and guests. All financial arrangements for accommodation are made directly and privately between you and your guest. You set your payment method (cash, bank transfer, etc.) and collect it independently. Marhaba is not liable for any payment disputes between hosts and guests.",
      },
      {
        id: "tips",
        title: "Tips for Great Hosting",
        icon: "⭐",
        content: "The best hosts on Marhaba share these habits:",
        items: [
          "Respond to booking requests within a few hours — speed signals reliability",
          "Keep your calendar up to date so you only receive bookings you can honor",
          "Write a warm, detailed description — guests book the story, not just the space",
          "Be available to answer questions before and during a guest's stay",
          "Ensure the property is clean, well-stocked, and exactly as described",
          "Send guests check-in instructions the day before arrival",
          "Ask guests to leave a review — positive reviews bring more bookings",
        ],
      },
      {
        id: "rules",
        title: "Host Responsibilities",
        icon: "📜",
        content: "As a Marhaba host, you agree to:",
        items: [
          "Provide accurate, up-to-date listing information at all times",
          "Respond to guest requests promptly and professionally",
          "Honor confirmed bookings — last-minute cancellations harm guest trust",
          "Ensure the property meets the standard described in your listing",
          "Comply with all applicable Libyan laws regarding short-term rentals",
          "Treat all guests respectfully regardless of their background",
          "Keep your subscription active to maintain your live listings",
        ],
      },
      {
        id: "safety",
        title: "Safety & Verification",
        icon: "🔒",
        content:
          "We take trust seriously on both sides. Your safety as a host matters just as much as your guests'.",
        items: [
          "All guests create verified accounts before sending booking requests",
          "You can view a guest's profile and message history before accepting",
          "Never share your home access details until you're comfortable with the guest",
          "Report any suspicious guest behaviour via the Report button on any booking",
          "Our support team is available 24/7 at support@mar-haba.ly",
        ],
      },
      {
        id: "support",
        title: "Need Help?",
        icon: "📬",
        content:
          "Our team is here to help you every step of the way — in Arabic or English.",
        contactCard: {
          name: "Marhaba Host Support",
          email: "support@mar-haba.ly",
          location: "Libya",
          response: "Replies within 24 hours",
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
    badge: "دليل المضيف",
    title: "ابدأ",
    title1: "الاستضافة",
    subtitle: "كل ما تحتاج لمعرفته لإدراج عقارك واستقبال الضيوف في ليبيا",
    lastUpdated: "آخر تحديث: 1 يونيو 2025",
    effective: "للمضيفين · أصحاب العقارات",
    toc: "جدول المحتويات",
    sections: [
      {
        id: "overview",
        title: "لماذا تستضيف على مرحبا؟",
        icon: "🏠",
        content:
          "مرحبا هي منصة التأجير قصير الأمد الليبية المخصصة للمضيفين المحليين. نمنحك الأدوات اللازمة لإدراج عقارك وإدارة الحجوزات والتواصل مع المسافرين — كل ذلك في مكان واحد، بالعربية والإنجليزية.",
        items: [
          "المنصة الليبية الوحيدة المخصصة للتأجير قصير الأمد",
          "واجهة كاملة بالعربية والإنجليزية — أدرج عقارك بكلتا اللغتين",
          "اشتراك بسعر ثابت — بدون عمولات على كل حجز",
          "أنت تتحكم في أسعارك وتوافرك وقواعد منزلك",
          "ضيوف موثقون فقط — نتحقق من هويات الضيوف",
        ],
      },
      {
        id: "account",
        title: "أنشئ حساب مضيف",
        icon: "👤",
        content: "البدء يستغرق أقل من 5 دقائق. إليك كيفية إعداد حساب المضيف:",
        steps: [
          {
            num: "٠١",
            title: "سجّل في مرحبا",
            body: "اضغط ابدأ في الصفحة الرئيسية، ثم اختر مضيف كنوع الحساب. أدخل اسمك الكامل والبريد الإلكتروني وكلمة مرور آمنة.",
          },
          {
            num: "٠٢",
            title: "تحقق من بريدك الإلكتروني",
            body: "تحقق من بريدك الوارد للحصول على رسالة تأكيد من مرحبا واضغط رابط التحقق لتفعيل حسابك.",
          },
          {
            num: "٠٣",
            title: "أرسل هويتك الوطنية",
            body: "يُطلب من جميع المضيفين التحقق من هويتهم بتقديم نسخة من هويتهم الوطنية الليبية. تراجعها فريقنا قبل نشر قوائمك.",
          },
          {
            num: "٠٤",
            title: "ادخل لوحة تحكم المضيف",
            body: "بمجرد التحقق، ستحصل على وصول كامل للوحة تحكم المضيف — حيث تدير القوائم والحجوزات والضيوف واشتراكك.",
          },
        ],
      },
      {
        id: "subscription",
        title: "الاشتراك والتسعير",
        icon: "💳",
        highlight: true,
        content:
          "تفرض مرحبا على المضيفين رسوم اشتراك ثابتة كل ستة (6) أشهر مقابل الوصول للمنصة. لا توجد عمولات على الحجوزات ولا رسوم مخفية — ما تفرضه على الضيوف هو ملك لك بالكامل. تُعالج المدفوعات بأمان عبر مزود الدفع؛ لا نخزن تفاصيل البطاقة الكاملة.",
      },
      {
        id: "listing",
        title: "أنشئ قائمتك",
        icon: "📋",
        content: "قائمة رائعة تجذب المزيد من الضيوف. اتبع هذه الخطوات لنشر قائمتك:",
        steps: [
          {
            num: "٠١",
            title: "اذهب إلى إضافة قائمة",
            body: "من لوحة تحكم المضيف، اضغط إضافة قائمة جديدة. سيتم توجيهك عبر كل قسم من نموذج القائمة.",
          },
          {
            num: "٠٢",
            title: "أضف تفاصيل العقار",
            body: "أدخل عنوان عقارك ووصفه ونوعه (شقة، فيلا، شاليه، إلخ)، واختر جميع الفئات ذات الصلة — شاطئ، جبال، مدينة، صحراء، مسبح والمزيد.",
          },
          {
            num: "٠٣",
            title: "ارفع الصور",
            body: "أضف صوراً عالية الجودة لكل غرفة والواجهة الخارجية وأي مميزات بارزة. القوائم التي تحتوي على 6 صور أو أكثر تحصل على طلبات حجز أكثر بكثير.",
          },
          {
            num: "٠٤",
            title: "حدد سعرك",
            body: "أدخل سعرك الليلي بالدينار الليبي (LYD). يمكنك تحديث الأسعار في أي وقت من لوحة التحكم. ضع في اعتبارك الطلب الموسمي عند تحديد الأسعار.",
          },
          {
            num: "٠٥",
            title: "حدد التوافر",
            body: "استخدم تقويم التوافر لتحديد التواريخ المتاحة. ابقه محدثاً — التقاويم القديمة تؤدي إلى رفض الطلبات وإحباط الضيوف.",
          },
          {
            num: "٠٦",
            title: "أضف المرافق وقواعد المنزل",
            body: "أدرج جميع المرافق (واي فاي، مطبخ، موقف سيارات، تكييف، إلخ) واذكر بوضوح قواعد منزلك — أوقات تسجيل الوصول والمغادرة، سياسة الحيوانات الأليفة، التدخين، الحد الأقصى للضيوف.",
          },
          {
            num: "٠٧",
            title: "انشر",
            body: "راجع كل شيء واضغط نشر. ستصبح قائمتك مباشرة فوراً وتظهر في نتائج البحث والصفحة الرئيسية.",
          },
        ],
      },
      {
        id: "bookings",
        title: "إدارة الحجوزات",
        icon: "📅",
        content: "بمجرد نشر قائمتك، ستبدأ طلبات الحجز بالوصول. إليك كيفية إدارتها:",
        subsections: [
          {
            title: "استقبال الطلبات",
            items: [
              "ستصلك رسالة بريد إلكتروني لكل طلب حجز جديد",
              "افتح الطلب من لوحة تحكم المضيف تحت الحجوزات",
              "راجع ملف الضيف ورسالته والتواريخ المطلوبة",
              "أكّد أو ارفض خلال 24 ساعة — الردود السريعة تبني سمعتك",
            ],
          },
          {
            title: "بعد التأكيد",
            items: [
              "يتلقى الضيف رسالة تأكيد بمعلومات تواصلك",
              "نسّق وقت تسجيل الوصول والاتجاهات وأي ترتيبات خاصة مباشرة",
              "رتّب الدفع مع الضيف مباشرة — مرحبا لا تعالج مدفوعات الضيوف",
              "ضع علامة على الحجز كمكتمل بعد مغادرة الضيف",
            ],
          },
          {
            title: "عدم الحضور والإلغاءات",
            items: [
              "إذا لم يحضر الضيف، ضع علامة عدم الحضور من سجل الحجز",
              "علامات عدم الحضور تساعد في الحفاظ على جودة المنصة وحماية المضيفين المستقبليين",
              "حدد سياسة الإلغاء الخاصة بك — تظهر في قائمتك ليقرأها الضيوف قبل الحجز",
            ],
          },
        ],
      },
      {
        id: "payment",
        title: "المدفوعات — إشعار مهم",
        icon: "💰",
        highlight: true,
        content:
          "لا تعالج مرحبا أو تسهّل المدفوعات بين المضيفين والضيوف. جميع الترتيبات المالية للإقامة تتم مباشرة وبشكل خاص بينك وبين ضيفك. أنت تحدد طريقة الدفع (نقداً، تحويل بنكي، إلخ) وتجمعه بشكل مستقل. مرحبا ليست مسؤولة عن أي نزاعات مالية بين المضيفين والضيوف.",
      },
      {
        id: "tips",
        title: "نصائح للاستضافة الرائعة",
        icon: "⭐",
        content: "أفضل المضيفين في مرحبا يشتركون في هذه العادات:",
        items: [
          "ردّ على طلبات الحجز في غضون ساعات — السرعة تعني الموثوقية",
          "ابقِ تقويمك محدثاً حتى تستقبل الحجوزات التي تستطيع الوفاء بها فقط",
          "اكتب وصفاً دافئاً ومفصلاً — الضيوف يحجزون القصة وليس المساحة فقط",
          "كن متاحاً للإجابة على الأسئلة قبل إقامة الضيف وخلالها",
          "تأكد من أن العقار نظيف ومجهز وكما هو موصوف بالضبط",
          "أرسل للضيوف تعليمات تسجيل الوصول قبل يوم من وصولهم",
          "اطلب من الضيوف ترك تقييم — التقييمات الإيجابية تجلب المزيد من الحجوزات",
        ],
      },
      {
        id: "rules",
        title: "مسؤوليات المضيف",
        icon: "📜",
        content: "بوصفك مضيفاً في مرحبا، أنت توافق على:",
        items: [
          "تقديم معلومات قائمة دقيقة ومحدثة في جميع الأوقات",
          "الرد على طلبات الضيوف بسرعة واحترافية",
          "الوفاء بالحجوزات المؤكدة — الإلغاءات المفاجئة تضر بثقة الضيوف",
          "التأكد من أن العقار يلبي المعيار الموصوف في قائمتك",
          "الامتثال لجميع القوانين الليبية المعمول بها المتعلقة بالإيجار قصير الأمد",
          "معاملة جميع الضيوف باحترام بغض النظر عن خلفياتهم",
          "الإبقاء على اشتراكك نشطاً للحفاظ على قوائمك المنشورة",
        ],
      },
      {
        id: "safety",
        title: "السلامة والتوثيق",
        icon: "🔒",
        content:
          "نأخذ الثقة بجدية من كلا الجانبين. سلامتك كمضيف مهمة بنفس قدر أهمية سلامة ضيوفك.",
        items: [
          "جميع الضيوف ينشئون حسابات موثقة قبل إرسال طلبات الحجز",
          "يمكنك عرض ملف الضيف وسجل رسائله قبل القبول",
          "لا تشارك تفاصيل الوصول للمنزل حتى تطمئن للضيف",
          "أبلغ عن أي سلوك مشبوه من الضيوف عبر زر الإبلاغ في أي حجز",
          "فريق الدعم متاح 24/7 على support@mar-haba.ly",
        ],
      },
      {
        id: "support",
        title: "تحتاج مساعدة؟",
        icon: "📬",
        content:
          "فريقنا هنا لمساعدتك في كل خطوة — بالعربية أو الإنجليزية.",
        contactCard: {
          name: "دعم المضيفين في مرحبا",
          email: "support@mar-haba.ly",
          location: "ليبيا",
          response: "يرد خلال 24 ساعة",
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

export default function StartHostingPage() {
 
  const [activeSection, setActiveSection] = useState(null);
   const { lang, toggleLanguage } = useLanguage();
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
 toggleLanguage={toggleLanguage}      />

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#1a1a2e] via-[#2d2d5e] to-[#1a1a2e] py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(232,197,71,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_70%,rgba(55,138,221,0.08)_0%,transparent_50%)] pointer-events-none" />
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

          {/* Quick-action CTAs */}
          <div className="flex gap-3 mt-8 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-6 py-3 rounded-xl text-sm font-bold no-underline hover:bg-yellow-300 transition-colors"
            >
              {isAr ? "ابدأ الاستضافة ←" : "Start Hosting →"}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl text-sm font-medium no-underline border border-white/20 hover:bg-white/15 transition-colors"
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </Link>
          </div>

          {/* Trust badges row */}
          <div className="flex gap-6 mt-10 flex-wrap">
            {[
              { icon: "💳", en: "No commission", ar: "بدون عمولة" },
              { icon: "🎛️", en: "You set the price", ar: "أنت تحدد السعر" },
              { icon: "🇱🇾", en: "Libya-built platform", ar: "منصة ليبية" },
            ].map((b) => (
              <div key={b.en} className="flex items-center gap-2 text-xs text-white/50">
                <span className="w-[20px] h-[20px] rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center shrink-0 text-[11px]">
                  {b.icon}
                </span>
                {isAr ? b.ar : b.en}
              </div>
            ))}
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

            {/* Sidebar CTA */}
            <div className="mt-8 bg-[#1a1a2e] rounded-2xl p-5">
              <p className="text-[11px] text-yellow-400/70 font-semibold uppercase tracking-widest mb-2">
                {isAr ? "جاهز للبدء؟" : "Ready to start?"}
              </p>
              <p className="text-[13px] text-white/60 leading-[1.6] mb-4">
                {isAr
                  ? "أنشئ حسابك وأدرج عقارك اليوم."
                  : "Create your account and list your property today."}
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 bg-yellow-400 text-[#1a1a2e] px-4 py-2 rounded-lg text-[12px] font-bold no-underline w-full justify-center"
              >
                {isAr ? "ابدأ الاستضافة" : "Start Hosting"} →
              </Link>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-[11px] text-yellow-800 leading-[1.6]">
                {isAr
                  ? "هل لديك أسئلة؟ راسلنا على support@mar-haba.ly"
                  : "Questions? Email us at support@mar-haba.ly"}
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
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
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

                {/* Highlight block */}
                {s.highlight ? (
                  <div className="bg-[#1a1a2e] rounded-2xl p-6 border-l-4 border-yellow-400">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-400 text-[11px] font-bold uppercase tracking-widest">
                        {isAr ? "تنبيه مهم" : "Important Notice"}
                      </span>
                    </div>
                    <p className="text-white/80 text-[14px] leading-[1.8]">{s.content}</p>
                  </div>
                ) : s.content ? (
                  <p className="text-gray-600 text-[14px] leading-[1.8] mb-5">{s.content}</p>
                ) : null}

                {/* Numbered steps */}
                {s.steps && (
                  <div className="flex flex-col gap-4 mt-1">
                    {s.steps.map((step) => (
                      <div
                        key={step.num}
                        className="flex gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center shrink-0">
                          <span className="text-yellow-400 text-[12px] font-bold">
                            {step.num}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-[14px] text-gray-900 mb-1">
                            {step.title}
                          </div>
                          <p className="text-[13px] text-gray-600 leading-[1.75]">{step.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subsections */}
                {s.subsections && (
                  <div className="flex flex-col gap-5 mt-2">
                    {s.subsections.map((sub) => (
                      <div key={sub.title} className="bg-gray-50 rounded-2xl p-5">
                        <div className="text-[11px] tracking-[0.1em] uppercase text-gray-400 mb-3 font-semibold">
                          {sub.title}
                        </div>
                        <ul className="flex flex-col gap-2">
                          {sub.items.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2.5 text-[13px] text-gray-700"
                            >
                              <span className="w-[18px] h-[18px] rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0 mt-0.5">
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                  <path
                                    d="M1 4l2 2 4-4"
                                    stroke="#e8c547"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
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

                {/* Bullet list */}
                {s.items && (
                  <ul className="flex flex-col gap-2 mt-2">
                    {s.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-[13px] text-gray-700"
                      >
                        <span className="w-[18px] h-[18px] rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0 mt-0.5">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path
                              d="M1 4l2 2 4-4"
                              stroke="#e8c547"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {s.footer && (
                  <p className="text-gray-400 text-[13px] mt-3 italic">{s.footer}</p>
                )}

                {/* Contact card */}
                {s.contactCard && (
                  <div className="mt-4 border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-xl shrink-0">
                      🏢
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {s.contactCard.name}
                      </div>
                      <div className="text-[13px] text-gray-500 mb-0.5">
                        {isAr ? "البريد الإلكتروني" : "Email"}:{" "}
                        <a
                          href={`mailto:${s.contactCard.email}`}
                          className="text-[#1a1a2e] font-medium no-underline hover:text-yellow-600"
                        >
                          {s.contactCard.email}
                        </a>
                      </div>
                      <div className="text-[13px] text-gray-500 mb-0.5">
                        {isAr ? "الموقع" : "Location"}: {s.contactCard.location}
                      </div>
                      <div className="text-[12px] text-yellow-600 font-medium mt-1">
                        ⚡ {s.contactCard.response}
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

          {/* Bottom CTA */}
          <div className="mt-12 bg-gradient-to-br from-[#1a1a2e] to-[#2d2d5e] rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,197,71,0.15)_0%,transparent_60%)] pointer-events-none" />
            <div className="relative">
              <div className="text-[10px] tracking-[0.12em] uppercase text-yellow-400/60 mb-3">
                {isAr ? "ابدأ اليوم" : "Start today"}
              </div>
              <h3
                className={`font-light text-[22px] text-white mb-2 ${
                  isAr
                    ? "font-['Cairo','Tajawal',sans-serif]"
                    : "font-['Fraunces',serif] italic"
                }`}
              >
                {isAr ? "حوّل عقارك إلى دخل" : "Turn your property into income"}
              </h3>
              <p className="text-white/40 text-[13px] mb-6">
                {isAr
                  ? "انضم لمئات المضيفين الليبيين على مرحبا"
                  : "Join hundreds of Libyan hosts on Marhaba"}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-6 py-3 rounded-xl text-sm font-bold no-underline"
                >
                  {isAr ? "أنشئ حساب مضيف" : "Create Host Account"} →
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl text-sm font-medium no-underline border border-white/20"
                >
                  {isAr ? "تصفح القوائم" : "Browse Listings"}
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom notice */}
          <div className="mt-6 bg-gray-50 rounded-2xl p-5 text-center">
            <p className="text-[12px] text-gray-400">
              {isAr
                ? "تم تحديث هذه الصفحة في 1 يونيو 2025. للاستفسارات: support@mar-haba.ly"
                : "This page was last updated on June 1, 2025. For hosting enquiries: support@mar-haba.ly"}
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