"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/hooks/useLanguage";

const content = {
  en: {
    dir: "ltr",
    brand: { prefix: "مر", highlight: "حبا" },
    badge: "Host Resources",
    title: "Pricing",
    title1: "Tips",
    subtitle: "Maximize your earnings with smart, data-driven pricing strategies",
    lastUpdated: "Last Updated: June 1, 2025",
    effective: "For Hosts on Marhaba",
    toc: "Table of Contents",
    backHome: "← Back to Home",
    sections: [
      {
        id: "intro",
        title: "Introduction",
        icon: "💡",
        content:
          "Pricing your property correctly is one of the most powerful tools you have as a host on Marhaba. Set it too high and guests scroll past; set it too low and you leave real money on the table. This guide walks you through proven strategies to help you price confidently, fill your calendar, and earn more — consistently.",
      },
      {
        id: "research",
        title: "Research Your Market",
        icon: "🔍",
        content:
          "Before setting any price, understand what similar properties in your area are charging. Good research gives you a defensible starting point.",
        subsections: [
          {
            title: "What to Look For",
            items: [
              "Browse listings in your city or neighbourhood with similar bedrooms, amenities, and property type",
              "Note their nightly rates on weekdays vs weekends and during local holidays",
              "Check how many reviews they have — high-review listings can usually charge a premium",
              "Look at occupancy signals: if a listing is rarely available, their price is working",
            ],
          },
          {
            title: "Key Questions to Answer",
            items: [
              "What is the average nightly rate for comparable properties in my area?",
              "Is my location more desirable (closer to the beach, city centre, or attractions)?",
              "Do I offer amenities competitors don't — pool, parking, fast Wi-Fi, laundry?",
              "What is the peak travel season in my area, and when is it slow?",
            ],
          },
        ],
      },
      {
        id: "base",
        title: "Set Your Base Price",
        icon: "🏷️",
        content:
          "Your base price is your default nightly rate — the foundation everything else is built on. Get this right and the rest falls into place.",
        items: [
          "Start 10–15% below comparable listings to build your first reviews quickly — then raise once you have 5+ positive reviews",
          "Calculate your minimum acceptable rate: monthly costs (utilities, cleaning, subscription fee, maintenance) ÷ realistic occupied nights",
          "Factor in your cleaning time and any turnover costs per guest",
          "Your base price should feel competitive, not cheap — guests associate price with quality",
          "Round to psychologically friendly numbers: 85 LYD performs better than 83 LYD or 90 LYD",
        ],
      },
      {
        id: "seasonal",
        title: "Seasonal & Dynamic Pricing",
        icon: "📅",
        content:
          "Flat pricing leaves money on the table. Demand for short-term rentals shifts dramatically by season, local events, and even day of week.",
        subsections: [
          {
            title: "High-Demand Periods — Raise Your Price",
            items: [
              "Libyan national holidays and long weekends (raise 20–40%)",
              "Summer months if near the coast or popular tourist areas",
              "Local festivals, sporting events, or conferences in your city",
              "University graduation seasons if near a campus",
              "Eid al-Fitr and Eid al-Adha — book out weeks in advance",
            ],
          },
          {
            title: "Low-Demand Periods — Attract Bookings",
            items: [
              "Offer a 10–20% weekday discount to attract business travelers or those with flexible schedules",
              "Run a last-minute deal (15–25% off) for dates 2–3 days away that are still empty",
              "Offer a longer-stay discount: 7+ nights gets 10% off, 30+ nights gets 20% off",
              "Reduce your minimum stay requirement during slow periods to fill gaps",
            ],
          },
        ],
      },
      {
        id: "discounts",
        title: "Smart Discount Strategies",
        icon: "🎯",
        content:
          "Discounts, when used strategically, increase total revenue — not decrease it. The goal is to fill nights that would otherwise sit empty.",
        items: [
          "Early-bird discount: guests who book 30+ days in advance get 8–12% off — rewards planners and secures your calendar",
          "Last-minute discount: fill gaps 2–4 days out with 15–20% off rather than leaving the night empty",
          "Weekly discount: guests staying 7+ nights get 10% off — longer stays mean less turnover and cleaning effort",
          "Monthly discount: guests staying 28+ nights get 20–25% off — ideal for business travelers and expats",
          "Return guest loyalty: offer 5–10% off privately to guests who've stayed before and left good reviews",
          "Never discount so deep that you feel resentful hosting — that energy affects the guest experience",
        ],
      },
      {
        id: "amenities",
        title: "Price for Your Amenities",
        icon: "✨",
        content:
          "Every meaningful amenity you add justifies a higher price. Guests filter by amenities — make yours work for you.",
        subsections: [
          {
            title: "High-Value Amenities Worth Premium Pricing",
            items: [
              "Private pool or rooftop access — justify a 25–40% premium over comparable listings",
              "Free secure parking — in city centres this alone can add 20–30 LYD per night",
              "Fast, reliable Wi-Fi (100 Mbps+) — a must for remote workers, worth calling out explicitly",
              "Air conditioning and heating — essential in Libya's climate, justify higher summer rates",
              "Full kitchen with modern appliances — attracts longer stays and families",
            ],
          },
          {
            title: "Small Touches That Support Your Price",
            items: [
              "Professional photos — listings with quality photos can charge 20–40% more",
              "Welcome basket with local snacks — guests mention this in reviews; reviews support higher prices",
              "Detailed local guide — positions you as an expert host, justifies premium",
              "Flexible check-in/check-out — guests pay for convenience",
            ],
          },
        ],
      },
      {
        id: "reviews",
        title: "Use Reviews to Justify Price Increases",
        icon: "⭐",
        content:
          "Your review count and rating directly affect how much you can charge. A property with 50 five-star reviews can charge significantly more than a new listing with none.",
        items: [
          "After your first 5 positive reviews, raise your base price by 10–15%",
          "After 20+ reviews with a high rating, you can price at or above the market average",
          "Respond to every review — hosts who engage professionally appear more trustworthy",
          "Address any negative feedback in your next stay to protect your rating",
          "Highlight specific guest compliments in your listing description to reinforce value",
        ],
      },
      {
        id: "minimum",
        title: "Minimum Stay Strategy",
        icon: "📆",
        content:
          "Minimum night requirements protect you from frequent turnover but can also block bookings. Here's how to balance both.",
        items: [
          "High season: set a 2–3 night minimum to avoid single-night gaps that can't be filled",
          "Low season: drop to 1-night minimum to maximise occupancy",
          "Long weekends and holidays: set 3-night minimums to capture the full demand window",
          "For monthly discounts to kick in: set a 28-night option that auto-applies the discount",
          "Avoid strict 7-night minimums year-round — you'll lose the large segment of 2–4 night bookers",
        ],
      },
      {
        id: "mistakes",
        title: "Common Pricing Mistakes to Avoid",
        icon: "⚠️",
        highlight: true,
        content:
          "Even experienced hosts fall into these traps. Avoiding them is often worth more than any pricing tactic.",
        items: [
          "Setting and forgetting — never updating your price seasonally or in response to market shifts",
          "Pricing based on emotion, not data — what you paid for a renovation doesn't determine market value",
          "Ignoring local events — a major festival nearby can double demand overnight",
          "Pricing too high with zero reviews — guests need social proof before they'll pay a premium",
          "Making cleaning fees so high they inflate the total price and deter bookings",
          "Offering deep discounts on peak dates — you don't need to discount when demand is already high",
        ],
      },
      {
        id: "checklist",
        title: "Monthly Pricing Checklist",
        icon: "✅",
        content:
          "Set a reminder to review your pricing monthly. Here's what to check each time:",
        items: [
          "Review your occupancy rate for the past 30 days — if above 85%, raise your price 5–10%",
          "Check if any local events or holidays are coming up in the next 60 days",
          "Update weekend vs weekday pricing if you haven't recently",
          "Review competitor listings — have similar properties raised or lowered their rates?",
          "Check your recent reviews — does guest feedback suggest you're undercharging (e.g., 'great value')?",
          "Confirm your discounts are still active: early-bird, weekly, monthly",
          "Update your photos if your property has improved — better photos support higher pricing",
        ],
      },
      {
        id: "subscription",
        title: "Marhaba's Flat-Rate Subscription",
        icon: "💼",
        content:
          "Unlike platforms that take a commission from every booking, Marhaba charges hosts a single flat-rate subscription fee every six (6) months. This means:",
        items: [
          "You keep 100% of whatever you charge guests — no per-booking commission cuts",
          "You can price competitively without worrying that the platform takes a percentage",
          "Your subscription cost is fixed and predictable — easy to factor into your break-even calculation",
          "You can run discounts freely without worrying about losing platform commission on a discounted rate",
          "Guests pay you directly — faster, simpler, and more flexible payment arrangements",
        ],
        footer:
          "This model rewards hosts who price well and maintain high occupancy. The more you earn, the more you keep.",
      },
      {
        id: "contact",
        title: "Need Help?",
        icon: "📬",
        content:
          "If you have questions about pricing, your listing, or your subscription, our team is here to help.",
        contactCard: {
          name: "Marhaba Host Support",
          email: "support@mar-haba.ly",
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

  /* ════════════════════════════════════════════
     ARABIC
  ════════════════════════════════════════════ */
  ar: {
    dir: "rtl",
    brand: { prefix: "مر", highlight: "حبا" },
    badge: "موارد المضيفين",
    title: "نصائح ",
    title1: "التسعير",
    subtitle: "زِد أرباحك باستراتيجيات تسعير ذكية ومبنية على البيانات",
    lastUpdated: "آخر تحديث: 1 يونيو 2025",
    effective: "للمضيفين في مرحبا",
    toc: "جدول المحتويات",
    backHome: "→ العودة للرئيسية",
    sections: [
      {
        id: "intro",
        title: "مقدمة",
        icon: "💡",
        content:
          "التسعير الصحيح لعقارك هو من أقوى الأدوات المتاحة لك كمضيف على مرحبا. ارفعه كثيرًا ويتجاهلك الضيوف، اخفضه كثيرًا وتترك أرباحًا حقيقية على الطاولة. يأخذك هذا الدليل عبر استراتيجيات مُجرَّبة تساعدك على التسعير بثقة، وملء تقويمك، وتحقيق دخل أعلى — باستمرار.",
      },
      {
        id: "research",
        title: "ابحث في سوقك",
        icon: "🔍",
        content:
          "قبل تحديد أي سعر، افهم ما تفرضه العقارات المماثلة في منطقتك. يمنحك البحث الجيد نقطة انطلاق قوية ومبررة.",
        subsections: [
          {
            title: "ما الذي تبحث عنه",
            items: [
              "تصفّح القوائم في مدينتك أو حيّك بنفس عدد الغرف والمرافق ونوع العقار",
              "لاحظ الأسعار الليلية في أيام الأسبوع مقابل عطل نهاية الأسبوع والعطل الرسمية",
              "تحقق من عدد التقييمات — القوائم ذات التقييمات الكثيرة تستطيع عادةً فرض سعر أعلى",
              "انتبه لمؤشرات الإشغال: إذا كانت القائمة نادرًا ما تتوفر، فسعرها يُحقق نتائج جيدة",
            ],
          },
          {
            title: "أسئلة جوهرية يجب الإجابة عنها",
            items: [
              "ما متوسط السعر الليلي للعقارات المماثلة في منطقتي؟",
              "هل موقعي أكثر جذبًا (قريب من الشاطئ أو وسط المدينة أو المعالم السياحية)؟",
              "هل أقدم مرافق لا يقدمها المنافسون — مسبح، موقف سيارات، واي فاي سريع، غسيل ملابس؟",
              "ما موسم السفر الذروة في منطقتي، ومتى يكون الطلب منخفضًا؟",
            ],
          },
        ],
      },
      {
        id: "base",
        title: "حدد سعرك الأساسي",
        icon: "🏷️",
        content:
          "سعرك الأساسي هو سعرك الليلي الافتراضي — الأساس الذي يُبنى عليه كل شيء آخر. أتقنه وسيتبع الباقي.",
        items: [
          "ابدأ بسعر أقل بنسبة 10–15% من القوائم المماثلة لبناء أول تقييماتك بسرعة — ثم ارفع بعد الحصول على 5 تقييمات إيجابية",
          "احسب الحد الأدنى المقبول: التكاليف الشهرية (مرافق، تنظيف، رسوم الاشتراك، صيانة) ÷ الليالي المشغولة الواقعية",
          "احتسب وقت التنظيف وأي تكاليف تسليم بين الضيوف",
          "يجب أن يبدو سعرك الأساسي تنافسيًا لا رخيصًا — يربط الضيوف السعر بالجودة",
          "قرّب إلى أرقام مريحة نفسيًا: 85 دينار يؤدي أداءً أفضل من 83 دينار أو 90 دينار",
        ],
      },
      {
        id: "seasonal",
        title: "التسعير الموسمي والديناميكي",
        icon: "📅",
        content:
          "السعر الثابت يُضيّع فرص الربح. الطلب على الإيجارات قصيرة الأمد يتغير بشكل كبير بحسب الموسم والأحداث المحلية وحتى اليوم من الأسبوع.",
        subsections: [
          {
            title: "فترات الطلب المرتفع — ارفع سعرك",
            items: [
              "الأعياد الوطنية الليبية وعطل نهاية الأسبوع الطويلة (ارفع 20–40%)",
              "أشهر الصيف إذا كنت قرب الساحل أو المناطق السياحية الشهيرة",
              "المهرجانات المحلية والفعاليات الرياضية والمؤتمرات في مدينتك",
              "مواسم تخرج الجامعات إذا كنت قرب حرم جامعي",
              "عيد الفطر وعيد الأضحى — تُحجز قبل أسابيع من موعدها",
            ],
          },
          {
            title: "فترات انخفاض الطلب — اجذب الحجوزات",
            items: [
              "قدّم خصم 10–20% لأيام الأسبوع لاستقطاب رجال الأعمال أو أصحاب الجداول المرنة",
              "قدّم عرضًا للحجز اللحظي (15–25% خصم) على المواعيد التي لا تزال شاغرة قبل 2–3 أيام",
              "قدّم خصمًا للإقامات الطويلة: 7 ليالٍ فأكثر خصم 10%، 30 ليلة فأكثر خصم 20%",
              "خفّض الحد الأدنى لعدد الليالي في فترات الهدوء لملء الفجوات",
            ],
          },
        ],
      },
      {
        id: "discounts",
        title: "استراتيجيات الخصم الذكية",
        icon: "🎯",
        content:
          "الخصومات عند استخدامها باستراتيجية تزيد الإيراد الكلي ولا تُنقصه. الهدف هو ملء الليالي التي ستبقى فارغة.",
        items: [
          "خصم الحجز المبكر: الضيوف الذين يحجزون قبل 30 يومًا أو أكثر يحصلون على 8–12% خصم — يكافئ المخططين ويؤمّن تقويمك",
          "خصم اللحظة الأخيرة: امنح 15–20% خصمًا لملء الفجوات قبل 2–4 أيام بدلًا من ترك الليلة فارغة",
          "خصم أسبوعي: 7 ليالٍ فأكثر بخصم 10% — الإقامات الأطول تعني تسليمًا وتنظيفًا أقل",
          "خصم شهري: 28 ليلة فأكثر بخصم 20–25% — مثالي لرجال الأعمال والمغتربين",
          "وفاء الضيوف العائدين: قدّم 5–10% خصمًا بشكل خاص للضيوف الذين أقاموا من قبل وتركوا تقييمات جيدة",
          "لا تخصم لدرجة تشعر فيها بالاستياء من الاستضافة — هذا الشعور يؤثر على تجربة الضيف",
        ],
      },
      {
        id: "amenities",
        title: "سعّر وفق مرافقك",
        icon: "✨",
        content:
          "كل مرفق ذي قيمة تضيفه يبرر سعرًا أعلى. يقوم الضيوف بالتصفية حسب المرافق — اجعل مرافقك تعمل لصالحك.",
        subsections: [
          {
            title: "مرافق عالية القيمة تستحق سعرًا مميزًا",
            items: [
              "مسبح خاص أو وصول للسطح — يبرر زيادة 25–40% عن القوائم المماثلة",
              "موقف سيارات آمن مجاني — في المناطق الحضرية يضيف وحده 20–30 دينار في الليلة",
              "واي فاي سريع وموثوق (100 ميجابت/ثانية أو أكثر) — ضرورة للعمل عن بُعد، يستحق إبرازه صراحةً",
              "تكييف وتدفئة — ضروري في مناخ ليبيا، يبرر أسعارًا صيفية أعلى",
              "مطبخ متكامل بأجهزة حديثة — يجذب الإقامات الأطول والعائلات",
            ],
          },
          {
            title: "لمسات صغيرة تدعم سعرك",
            items: [
              "صور احترافية — القوائم ذات الصور الجيدة تتقاضى 20–40% أكثر",
              "سلة ترحيبية بوجبات خفيفة محلية — يذكرها الضيوف في تقييماتهم؛ والتقييمات تدعم أسعارًا أعلى",
              "دليل محلي مفصّل — يُظهرك كمضيف خبير ويبرر السعر المميز",
              "مرونة في مواعيد الوصول والمغادرة — يدفع الضيوف مقابل الراحة",
            ],
          },
        ],
      },
      {
        id: "reviews",
        title: "استخدم التقييمات لتبرير زيادة السعر",
        icon: "⭐",
        content:
          "عدد تقييماتك وتقييمك مباشرةً يؤثران على مقدار ما يمكنك فرضه. عقار بـ50 تقييمًا خمس نجوم يستطيع فرض سعر أعلى بكثير من قائمة جديدة بلا تقييمات.",
        items: [
          "بعد أول 5 تقييمات إيجابية، ارفع سعرك الأساسي بنسبة 10–15%",
          "بعد 20 تقييمًا أو أكثر بتقييم مرتفع، يمكنك التسعير عند متوسط السوق أو فوقه",
          "ردّ على كل تقييم — المضيفون الذين يتعاملون باحترافية يظهرون بمصداقية أعلى",
          "عالج أي ملاحظات سلبية في إقامتك التالية للحفاظ على تقييمك",
          "أبرز مجاملات محددة من الضيوف في وصف قائمتك لتعزيز القيمة",
        ],
      },
      {
        id: "minimum",
        title: "استراتيجية الحد الأدنى للإقامة",
        icon: "📆",
        content:
          "متطلبات الحد الأدنى لعدد الليالي تحميك من التسليم المتكرر لكنها قد تُعيق الحجوزات أيضًا. إليك كيف توازن بينهما.",
        items: [
          "الموسم المرتفع: ضع حدًا أدنى 2–3 ليالٍ لتفادي الفجوات الفردية التي يصعب ملؤها",
          "الموسم المنخفض: اخفض إلى ليلة واحدة كحد أدنى لتعظيم الإشغال",
          "عطل نهاية الأسبوع الطويلة والأعياد: ضع حدًا أدنى 3 ليالٍ للاستفادة من نافذة الطلب الكاملة",
          "لتفعيل الخصومات الشهرية: أنشئ خيار 28 ليلة يُطبّق الخصم تلقائيًا",
          "تجنب اشتراط 7 ليالٍ كحد أدنى طوال العام — ستخسر الشريحة الكبيرة من الحاجزين لـ2–4 ليالٍ",
        ],
      },
      {
        id: "mistakes",
        title: "أخطاء التسعير الشائعة التي يجب تجنبها",
        icon: "⚠️",
        highlight: true,
        content:
          "حتى المضيفون ذوو الخبرة يقعون في هذه الفخاخ. تجنبها غالبًا يستحق أكثر من أي تكتيك تسعيري.",
        items: [
          "تثبيت السعر ونسيانه — عدم تحديثه موسميًا أو استجابةً لتغيرات السوق",
          "التسعير بناءً على المشاعر لا البيانات — ما دفعته في التجديد لا يحدد قيمة السوق",
          "تجاهل الأحداث المحلية — مهرجان كبير قريب يمكن أن يضاعف الطلب بين عشية وضحاها",
          "التسعير المرتفع جدًا مع صفر تقييمات — الضيوف يحتاجون دليلًا اجتماعيًا قبل دفع سعر مميز",
          "جعل رسوم التنظيف مرتفعة لدرجة تضخّم السعر الإجمالي وتُنفّر الحجوزات",
          "تقديم خصومات عميقة في مواعيد الذروة — لا تحتاج للخصم حين يكون الطلب مرتفعًا أصلًا",
        ],
      },
      {
        id: "checklist",
        title: "قائمة التحقق الشهرية للتسعير",
        icon: "✅",
        content:
          "ضع تذكيرًا لمراجعة تسعيرك شهريًا. إليك ما يجب التحقق منه في كل مرة:",
        items: [
          "راجع معدل إشغالك خلال الـ30 يومًا الماضية — إذا تجاوز 85%، ارفع سعرك 5–10%",
          "تحقق من الأحداث المحلية أو الأعياد القادمة خلال الـ60 يومًا المقبلة",
          "حدّث التسعير لأيام الأسبوع مقابل عطلات نهاية الأسبوع إن لم تفعل ذلك مؤخرًا",
          "راجع القوائم المنافسة — هل رفعت عقارات مماثلة أسعارها أم خفضتها؟",
          "تحقق من تقييماتك الأخيرة — هل تشير ملاحظات الضيوف إلى أنك تسعّر بأقل مما يجب؟ (مثال: 'قيمة رائعة')",
          "تأكد من نشاط خصوماتك: المبكر، الأسبوعي، الشهري",
          "حدّث صورك إذا تحسّن عقارك — الصور الأفضل تدعم تسعيرًا أعلى",
        ],
      },
      {
        id: "subscription",
        title: "الاشتراك الثابت في مرحبا",
        icon: "💼",
        content:
          "على خلاف المنصات التي تأخذ عمولة من كل حجز، تفرض مرحبا على المضيفين رسوم اشتراك ثابتة واحدة كل ستة (6) أشهر. هذا يعني:",
        items: [
          "تحتفظ بـ100% مما تفرضه على الضيوف — لا خصومات عمولة من كل حجز",
          "يمكنك التسعير بشكل تنافسي دون القلق من أن المنصة تأخذ نسبة مئوية",
          "تكلفة اشتراكك ثابتة ومتوقعة — سهل احتسابها في حساب نقطة التعادل",
          "يمكنك تقديم خصومات بحرية دون القلق من خسارة عمولة المنصة على السعر المخفض",
          "يدفع لك الضيوف مباشرةً — ترتيبات دفع أسرع وأبسط وأكثر مرونة",
        ],
        footer:
          "هذا النموذج يكافئ المضيفين الذين يُحسنون التسعير ويحافظون على إشغال مرتفع. كلما زادت أرباحك، زاد ما تحتفظ به.",
      },
      {
        id: "contact",
        title: "هل تحتاج مساعدة؟",
        icon: "📬",
        content:
          "إذا كان لديك أسئلة حول التسعير أو قائمتك أو اشتراكك، فريقنا هنا للمساعدة.",
        contactCard: {
          name: "دعم مضيفي مرحبا",
          email: "support@mar-haba.ly",
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

export default function PricingTipsPage() {
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
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 flex gap-10">
        {/* TOC — desktop sidebar */}
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

            {/* Sidebar tip card */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-[11px] text-yellow-800 leading-[1.6]">
                {isAr
                  ? "💡 نصيحة سريعة: المضيفون الذين يراجعون أسعارهم شهريًا يكسبون في المتوسط 22% أكثر مقارنةً بأولئك الذين لا يفعلون."
                  : "💡 Quick stat: Hosts who review their pricing monthly earn on average 22% more than those who don't."}
              </p>
            </div>

            <div className="mt-4 p-4 bg-[#1a1a2e] rounded-2xl">
              <p className="text-[11px] text-yellow-400/80 leading-[1.6]">
                {isAr
                  ? "تحتفظ بـ 100% مما تكسبه. لا عمولات على الحجوزات."
                  : "You keep 100% of what you earn. No per-booking commissions."}
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
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

                {/* Highlight box (dark navy) */}
                {s.highlight ? (
                  <div className="bg-[#1a1a2e] rounded-2xl p-6 border-l-4 border-yellow-400 mb-4">
                    <p className="text-white/80 text-[14px] leading-[1.8]">{s.content}</p>
                  </div>
                ) : s.content ? (
                  <p className="text-gray-600 text-[14px] leading-[1.8] mb-4">{s.content}</p>
                ) : null}

                {/* Subsections (two-column on md+) */}
                {s.subsections && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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

                {/* Flat item list */}
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

                {/* Footer note */}
                {s.footer && (
                  <p className="text-gray-500 text-[13px] mt-3 italic">{s.footer}</p>
                )}

                {/* Contact card */}
                {s.contactCard && (
                  <div className="mt-4 border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-yellow-400 text-xl shrink-0">
                      🏢
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {s.contactCard.name}
                      </div>
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

                {/* Divider between sections */}
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
                ? "آخر تحديث: 1 يونيو 2025. هذا الدليل للأغراض الإرشادية فقط."
                : "Last updated: June 1, 2025. This guide is for informational purposes only."}
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