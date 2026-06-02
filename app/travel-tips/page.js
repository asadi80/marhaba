"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const content = {
  en: {
    dir: "ltr",
    badge: "Explore Libya",
    title: "Travel",
    title1: "Tips",
    subtitle:
      "Everything you need to know before and during your trip across Libya",
    pill1: "Libya local insights",
    pill2: "Updated for travellers",

    /* ── REGIONS ── */
    regionsHeading: "Popular Regions",
    regions: [
      {
        icon: "🏛️",
        name: "Tripoli",
        tag: "Capital",
        tagColor: "#2563eb",
        desc: "Libya's vibrant capital blends Ottoman heritage with modern city life. Explore the old medina, Red Castle Museum, and the lively Green Square.",
        tips: ["Best visited Oct–Apr", "Medina best explored on foot", "Friday markets are unmissable"],
      },
      {
        icon: "🏺",
        name: "Benghazi",
        tag: "Eastern Hub",
        tagColor: "#059669",
        desc: "Libya's second city offers a rich mix of history and coastal charm. The old town, Cathedral, and Fish Market are highlights.",
        tips: ["Seafood is exceptional here", "Check local conditions before travel", "Cooler sea breeze year-round"],
      },
      {
        icon: "🏜️",
        name: "Sabha & Fezzan",
        tag: "Desert",
        tagColor: "#d97706",
        desc: "The Saharan heartland. Dramatic dunes, ancient rock art at Acacus, and the surreal Ubari sand sea make this a bucket-list destination.",
        tips: ["Oct–Mar only — summer is extreme", "Always travel with a local guide", "Carry extra water and fuel"],
      },
      {
        icon: "🌊",
        name: "Misrata & Coast",
        tag: "Coastal",
        tagColor: "#0891b2",
        desc: "White sandy beaches stretch along the Mediterranean. Misrata's markets and the ancient ruins of Leptis Magna nearby are world-class.",
        tips: ["Leptis Magna is a UNESCO site", "Beach season: Jun–Sep", "Cool evenings even in summer"],
      },
      {
        icon: "🗿",
        name: "Ghadames",
        tag: "UNESCO",
        tagColor: "#7c3aed",
        desc: "The 'Pearl of the Desert' — a UNESCO World Heritage city with labyrinthine white-washed streets carved by Berber hands over centuries.",
        tips: ["UNESCO World Heritage Site", "Best in spring and autumn", "Guided tours strongly recommended"],
      },
      {
        icon: "🌿",
        name: "Green Mountain (Jebel Akhdar)",
        tag: "Nature",
        tagColor: "#059669",
        desc: "A lush highland escape with juniper forests, ancient Greek ruins at Cyrene, and cool mountain air. A dramatic contrast to the desert.",
        tips: ["Cyrene ruins are extraordinary", "Cool even in July", "Great for hiking and camping"],
      },
    ],

    /* ── BEFORE YOU GO ── */
    beforeHeading: "Before You Go",
    beforeCategories: [
      {
        icon: "📋",
        title: "Visas & Entry",
        color: "#2563eb",
        items: [
          "Check visa requirements for your nationality well in advance — requirements change frequently.",
          "Carry printed copies of your booking confirmations, host contact details, and return travel plans.",
          "Ensure your passport is valid for at least 6 months beyond your travel dates.",
          "Register your trip with your country's embassy or consulate in Libya where possible.",
        ],
      },
      {
        icon: "💊",
        title: "Health & Vaccinations",
        color: "#059669",
        items: [
          "Consult a travel health clinic at least 6 weeks before departure for recommended vaccinations.",
          "Pack a personal first-aid kit including any prescription medications — some may be unavailable locally.",
          "Drink bottled water only. Avoid ice in drinks unless you are certain of the water source.",
          "Travel health insurance covering medical evacuation is strongly advised.",
        ],
      },
      {
        icon: "📡",
        title: "Connectivity",
        color: "#d97706",
        items: [
          "Local SIM cards (Libyana, Al-Madar) are available at Tripoli and Benghazi airports. Data speeds are variable.",
          "Download offline maps (Maps.me or Google Maps offline) before you arrive — connectivity is unreliable in rural areas.",
          "WhatsApp and Telegram are the standard communication apps used locally.",
          "Carry a portable power bank — power cuts occur in some areas.",
        ],
      },
      {
        icon: "💰",
        title: "Money & Budget",
        color: "#dc2626",
        items: [
          "Libyan Dinar (LYD) is the only accepted currency. Exchange at official bureaux — street exchange is illegal.",
          "International credit and debit cards are not widely accepted. Bring sufficient cash.",
          "ATMs exist in major cities but are often out of cash or out of service. Do not rely on them.",
          "Notify your home bank before travelling to avoid your card being blocked abroad.",
        ],
      },
    ],

    /* ── DURING YOUR STAY ── */
    duringHeading: "During Your Stay",
    duringTips: [
      {
        icon: "🕌",
        title: "Respect Local Culture",
        body: "Libya is a conservative Muslim country. Dress modestly in public — covered shoulders and knees for both men and women. During Ramadan, avoid eating, drinking, or smoking in public during daylight hours.",
      },
      {
        icon: "📸",
        title: "Photography Etiquette",
        body: "Always ask permission before photographing people. Avoid photographing military installations, government buildings, airports, and checkpoints — this is strictly prohibited and can result in serious consequences.",
      },
      {
        icon: "🚗",
        title: "Getting Around",
        body: "Shared taxis (service taxis) are the most common intercity transport. Agree on the fare before you get in. For longer distances, hiring a private driver through your host is safer and more comfortable.",
      },
      {
        icon: "🍽️",
        title: "Food & Dining",
        body: "Libyan cuisine is wonderful — try couscous, bazeen, sharba, and fresh Mediterranean seafood. Restaurants in major cities cater to most tastes. Alcohol is prohibited in Libya.",
      },
      {
        icon: "🌡️",
        title: "Climate & Seasons",
        body: "Coastal areas are Mediterranean — warm summers (30–40°C), mild winters. The interior is extreme — desert summers can exceed 50°C. Plan visits to desert areas strictly between October and March.",
      },
      {
        icon: "🤝",
        title: "Hospitality",
        body: "Libyans are famously hospitable. Accepting tea or coffee when offered is a sign of respect. If invited to someone's home, a small gift such as sweets or pastries is a welcome gesture.",
      },
      {
        icon: "🗣️",
        title: "Language",
        body: "Arabic is the official language. Libyan Arabic dialect differs from Modern Standard Arabic. English is spoken in hotels and tourist areas, but learning a few Arabic phrases will be warmly appreciated.",
      },
      {
        icon: "⏰",
        title: "Friday Closures",
        body: "Friday is the Islamic day of rest. Government offices, many shops, and some restaurants close. Plan activities and errands around this, particularly in smaller cities and towns.",
      },
    ],

    /* ── PACKING LIST ── */
    packingHeading: "Suggested Packing List",
    packingCategories: [
      {
        label: "Essentials",
        color: "#1a1a2e",
        items: ["Passport + copies", "Visa documents", "Travel insurance docs", "Emergency contacts printed", "Local cash (LYD)"],
      },
      {
        label: "Clothing",
        color: "#2563eb",
        items: ["Modest clothing (covered shoulders & knees)", "Light layers for evenings", "Sun hat & sunglasses", "Comfortable walking shoes", "Warm jacket for desert nights"],
      },
      {
        label: "Health & Safety",
        color: "#dc2626",
        items: ["Prescription medications (extra supply)", "Sunscreen SPF 50+", "Insect repellent", "Water purification tablets", "Personal first-aid kit"],
      },
      {
        label: "Tech & Connectivity",
        color: "#d97706",
        items: ["Portable power bank", "Universal adapter", "Offline maps downloaded", "Local SIM card (buy on arrival)", "Torch / headlamp"],
      },
    ],

    /* ── FAQ ── */
    faqHeading: "Travel FAQs",
    faqs: [
      {
        q: "Is Libya safe to travel to?",
        a: "Conditions vary significantly by region. Tripoli, Benghazi, Misrata, and Ghadames are visited by travellers regularly. Always check your government's travel advisory before booking, register with your embassy, and stay informed of local conditions throughout your trip.",
      },
      {
        q: "What is the best time of year to visit Libya?",
        a: "October to April is ideal for most of the country. Coastal areas are pleasant year-round. The Saharan interior (Sabha, Acacus, Ubari) should only be visited between October and March due to extreme summer heat.",
      },
      {
        q: "Do I need a guide?",
        a: "For major cities, independent travel is manageable. For the desert south, ancient sites, and remote areas, a local guide is strongly recommended for both safety and to get the most from your experience.",
      },
      {
        q: "Can I use my foreign phone in Libya?",
        a: "Most foreign phones work on Libyan networks (check roaming with your provider). A local SIM (Libyana or Al-Madar) is inexpensive and available at airports — recommended for extended stays.",
      },
      {
        q: "Are there ATMs in Libya?",
        a: "ATMs exist in Tripoli and Benghazi but are frequently out of cash or service. Do not rely on them. Bring sufficient Libyan Dinar exchanged at official bureaux.",
      },
      {
        q: "What should I wear in Libya?",
        a: "Modest dress is expected and respectful — covered shoulders and knees for both men and women. In more conservative areas and during Ramadan, women may wish to cover their hair as an extra courtesy.",
      },
    ],

    ctaEyebrow: "Ready to explore Libya?",
    ctaTitle: "Find your perfect stay",
    ctaBody:
      "Browse thousands of verified listings across Libya's most beautiful destinations — from coastal hideaways to desert retreats.",
    ctaButton: "Browse Listings",

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
    badge: "اكتشف ليبيا",
    title: "نصائح",
    title1: "السفر",
    subtitle: "كل ما تحتاج معرفته قبل رحلتك وخلالها في أرجاء ليبيا",
    pill1: "رؤى محلية عن ليبيا",
    pill2: "محدَّث للمسافرين",

    regionsHeading: "المناطق الشعبية",
    regions: [
      {
        icon: "🏛️",
        name: "طرابلس",
        tag: "العاصمة",
        tagColor: "#2563eb",
        desc: "تمزج العاصمة الليبية النابضة بالحياة بين الإرث العثماني والحياة العصرية. استكشف المدينة القديمة ومتحف السرايا الحمراء وميدان الجزائر الصاخب.",
        tips: ["أفضل وقت للزيارة: أكتوبر–أبريل", "المدينة القديمة تُستكشف مشياً", "أسواق الجمعة لا تُفوَّت"],
      },
      {
        icon: "🏺",
        name: "بنغازي",
        tag: "بوابة الشرق",
        tagColor: "#059669",
        desc: "ثاني مدن ليبيا تجمع بين التاريخ العريق والسحر الساحلي. المدينة القديمة والكاتدرائية وسوق السمك من أبرز معالمها.",
        tips: ["المأكولات البحرية استثنائية هنا", "تحقق من الأوضاع المحلية قبل السفر", "نسيم بحري منعش طوال العام"],
      },
      {
        icon: "🏜️",
        name: "سبها والفزان",
        tag: "الصحراء",
        tagColor: "#d97706",
        desc: "قلب الصحراء الكبرى. الكثبان الرهيبة والرسوم الصخرية القديمة في أكاكوس وبحر رمال أوباري الخيالي — وجهة أحلام كل مسافر.",
        tips: ["أكتوبر–مارس فقط — الصيف قاسٍ", "سافر دائماً مع مرشد محلي", "احمل مياهاً ووقوداً إضافياً"],
      },
      {
        icon: "🌊",
        name: "مصراتة والساحل",
        tag: "ساحلي",
        tagColor: "#0891b2",
        desc: "شواطئ رملية بيضاء تمتد على البحر المتوسط. أسواق مصراتة وأطلال لبدة الكبرى القريبة تُعدّ من درر العالم.",
        tips: ["لبدة الكبرى موقع يونسكو", "موسم الشاطئ: يونيو–سبتمبر", "أمسيات منعشة حتى في الصيف"],
      },
      {
        icon: "🗿",
        name: "غدامس",
        tag: "يونسكو",
        tagColor: "#7c3aed",
        desc: "«لؤلؤة الصحراء» — مدينة مدرجة في قائمة التراث العالمي لليونسكو بشوارعها المتشابكة المبيَّضة التي نحتها الأمازيغ عبر القرون.",
        tips: ["موقع تراث عالمي لليونسكو", "أفضل في الربيع والخريف", "الجولات المصحوبة بمرشد موصى بها بشدة"],
      },
      {
        icon: "🌿",
        name: "الجبل الأخضر",
        tag: "طبيعة",
        tagColor: "#059669",
        desc: "ملاذ جبلي خضير بغابات العرعر والآثار اليونانية في شحات وهواء جبلي منعش. تناقض مذهل مع الصحراء.",
        tips: ["آثار شحات رائعة الجمال", "بارد حتى في يوليو", "رائع للمشي والتخييم"],
      },
    ],

    beforeHeading: "قبل السفر",
    beforeCategories: [
      {
        icon: "📋",
        title: "التأشيرات والدخول",
        color: "#2563eb",
        items: [
          "تحقق من متطلبات التأشيرة لجنسيتك مسبقاً — المتطلبات تتغير بشكل متكرر.",
          "احتفظ بنسخ مطبوعة من تأكيدات حجزك وبيانات التواصل مع المضيف وخطط السفر.",
          "تأكد من صلاحية جواز سفرك لمدة 6 أشهر على الأقل بعد تواريخ سفرك.",
          "سجّل رحلتك لدى سفارة بلدك أو قنصليتها في ليبيا كلما أمكن.",
        ],
      },
      {
        icon: "💊",
        title: "الصحة والتطعيمات",
        color: "#059669",
        items: [
          "استشر عيادة صحة السفر قبل 6 أسابيع من المغادرة للاطلاع على التطعيمات الموصى بها.",
          "احمل حقيبة إسعافات أولية شخصية وأدويتك الموصوفة — قد لا تتوفر بعضها محلياً.",
          "اشرب المياه المعبأة فقط. تجنّب الثلج في المشروبات إلا إذا كنت متأكداً من مصدر المياه.",
          "التأمين الصحي للسفر الذي يغطي الإخلاء الطبي موصى به بشدة.",
        ],
      },
      {
        icon: "📡",
        title: "الاتصالات",
        color: "#d97706",
        items: [
          "شرائح SIM المحلية (ليبيانا، المدار) متوفرة في مطاري طرابلس وبنغازي. سرعة الإنترنت متفاوتة.",
          "حمّل خرائط غير متصلة (Maps.me أو خرائط جوجل) قبل الوصول — الاتصال ضعيف في المناطق الريفية.",
          "واتساب وتيليغرام هما تطبيقا التواصل القياسيان محلياً.",
          "احمل بطارية احتياطية محمولة — قد تحدث انقطاعات في الكهرباء في بعض المناطق.",
        ],
      },
      {
        icon: "💰",
        title: "المال والميزانية",
        color: "#dc2626",
        items: [
          "الدينار الليبي (LYD) هو العملة المقبولة الوحيدة. استبدل في مكاتب الصرف الرسمية — الصرف في الشارع مخالف للقانون.",
          "بطاقات الائتمان والخصم الدولية غير مقبولة على نطاق واسع. احضر نقوداً كافية.",
          "أجهزة الصراف الآلي موجودة في المدن الكبرى لكنها كثيراً ما تكون فارغة أو معطلة. لا تعتمد عليها.",
          "أخطر بنكك المحلي قبل السفر لتجنّب حجب بطاقتك في الخارج.",
        ],
      },
    ],

    duringHeading: "خلال إقامتك",
    duringTips: [
      {
        icon: "🕌",
        title: "احترم الثقافة المحلية",
        body: "ليبيا دولة إسلامية محافظة. ارتدِ ملابس محتشمة في الأماكن العامة — تغطية الكتفين والركبتين للرجال والنساء على حد سواء. خلال رمضان، تجنّب الأكل والشرب والتدخين في الأماكن العامة أثناء النهار.",
      },
      {
        icon: "📸",
        title: "آداب التصوير",
        body: "اطلب الإذن دائماً قبل تصوير الأشخاص. تجنّب تصوير المنشآت العسكرية والمباني الحكومية والمطارات ونقاط التفتيش — محظور بشكل صارم وقد يُفضي إلى عواقب وخيمة.",
      },
      {
        icon: "🚗",
        title: "التنقل",
        body: "سيارات الأجرة المشتركة (سيارات الخدمة) هي وسيلة النقل بين المدن الأكثر شيوعاً. اتفق على الأجرة قبل الركوب. للمسافات الأطول، يُعدّ استئجار سائق خاص عبر مضيفك أكثر أماناً وراحةً.",
      },
      {
        icon: "🍽️",
        title: "الطعام والمطاعم",
        body: "المطبخ الليبي رائع — جرّب الكسكس والبازين والشربة والمأكولات البحرية المتوسطية الطازجة. تلبي المطاعم في المدن الكبرى معظم الأذواق. الكحول محظور في ليبيا.",
      },
      {
        icon: "🌡️",
        title: "المناخ والمواسم",
        body: "المناطق الساحلية متوسطية المناخ — صيف دافئ (30–40 درجة) وشتاء معتدل. الداخل قاسٍ — يتجاوز صيف الصحراء 50 درجة. خطط لزيارة المناطق الصحراوية بين أكتوبر ومارس حصراً.",
      },
      {
        icon: "🤝",
        title: "كرم الضيافة",
        body: "الليبيون مشهورون بكرمهم. قبول الشاي أو القهوة عند تقديمها علامة احترام. إذا دُعيت إلى منزل أحدهم، فهدية صغيرة كالحلويات أو المعجنات ستُقدَّر كثيراً.",
      },
      {
        icon: "🗣️",
        title: "اللغة",
        body: "العربية هي اللغة الرسمية. يختلف الليبي العامّي عن الفصحى. الإنجليزية مستخدمة في الفنادق والمناطق السياحية، لكن تعلّم بعض العبارات العربية سيلقى ترحيباً حاراً.",
      },
      {
        icon: "⏰",
        title: "إغلاقات يوم الجمعة",
        body: "الجمعة يوم الراحة الإسلامي. تُغلق الدوائر الحكومية والكثير من المحلات وبعض المطاعم. خطط لأنشطتك ومهامك مع مراعاة ذلك، لا سيما في المدن والبلدات الأصغر.",
      },
    ],

    packingHeading: "قائمة التعبئة المقترحة",
    packingCategories: [
      {
        label: "الأساسيات",
        color: "#1a1a2e",
        items: ["جواز السفر + نسخ", "وثائق التأشيرة", "وثائق التأمين السفري", "جهات الطوارئ مطبوعة", "نقود محلية (دينار ليبي)"],
      },
      {
        label: "الملابس",
        color: "#2563eb",
        items: ["ملابس محتشمة (تغطية الكتفين والركبتين)", "طبقات خفيفة للمساء", "قبعة للشمس ونظارة شمسية", "حذاء مريح للمشي", "معطف دافئ لليالي الصحراء"],
      },
      {
        label: "الصحة والسلامة",
        color: "#dc2626",
        items: ["أدوية موصوفة (كمية إضافية)", "واقٍ من الشمس SPF 50+", "طارد الحشرات", "أقراص تنقية المياه", "حقيبة إسعافات أولية شخصية"],
      },
      {
        label: "التقنية والاتصالات",
        color: "#d97706",
        items: ["بطارية احتياطية محمولة", "محول كهربائي عالمي", "خرائط غير متصلة محمّلة", "شريحة SIM محلية (تُشترى عند الوصول)", "مصباح يدوي / جبهي"],
      },
    ],

    faqHeading: "أسئلة شائعة عن السفر",
    faqs: [
      {
        q: "هل ليبيا آمنة للسفر؟",
        a: "تتفاوت الأوضاع تفاوتاً كبيراً بحسب المنطقة. يزور المسافرون طرابلس وبنغازي ومصراتة وغدامس بانتظام. تحقق دائماً من تحذيرات السفر الصادرة عن حكومتك قبل الحجز، وسجّل نفسك لدى سفارتك، وابقَ على اطلاع بالأوضاع المحلية طوال رحلتك.",
      },
      {
        q: "ما أفضل وقت لزيارة ليبيا؟",
        a: "أكتوبر إلى أبريل مثالي لمعظم مناطق البلاد. المناطق الساحلية لطيفة طوال العام. ينبغي زيارة الداخل الصحراوي (سبها، أكاكوس، أوباري) بين أكتوبر ومارس فقط بسبب الحر الشديد في الصيف.",
      },
      {
        q: "هل أحتاج إلى مرشد سياحي؟",
        a: "في المدن الكبرى، السفر المستقل ممكن. للجنوب الصحراوي والمواقع الأثرية والمناطق النائية، يُوصى بشدة بمرشد محلي لأسباب الأمان وللاستفادة القصوى من تجربتك.",
      },
      {
        q: "هل يعمل هاتفي الأجنبي في ليبيا؟",
        a: "تعمل معظم الهواتف الأجنبية على الشبكات الليبية (تحقق من خدمة التجوال مع مزودك). شريحة SIM محلية (ليبيانا أو المدار) زهيدة الثمن ومتوفرة في المطارات — موصى بها للإقامات الطويلة.",
      },
      {
        q: "هل توجد أجهزة صراف آلي في ليبيا؟",
        a: "توجد في طرابلس وبنغازي لكنها كثيراً ما تكون فارغة من الأموال أو خارج الخدمة. لا تعتمد عليها. احضر دنانير ليبية كافية مستبدلة من مكاتب الصرف الرسمية.",
      },
      {
        q: "ماذا يجب أن أرتدي في ليبيا؟",
        a: "اللباس المحتشم متوقع ومحترم — تغطية الكتفين والركبتين للرجال والنساء. في المناطق الأكثر محافظة وخلال شهر رمضان، قد ترغب المرأة في تغطية شعرها كبادرة احترام إضافية.",
      },
    ],

    ctaEyebrow: "مستعد لاستكشاف ليبيا؟",
    ctaTitle: "اعثر على إقامتك المثالية",
    ctaBody:
      "تصفح آلاف القوائم الموثّقة عبر أجمل وجهات ليبيا — من الملاجئ الساحلية إلى المخيمات الصحراوية.",
    ctaButton: "تصفح القوائم",

    footer: {
      desc: "منصة التأجير قصير الأمد الموثوقة في ليبيا تربط المضيفين والمسافرين.",
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
    },
  },
};

export default function TravelTipsPage() {
  const [lang, setLang] = useState("en");
  const [openFaq, setOpenFaq] = useState(null);
  const [activeRegion, setActiveRegion] = useState(null);

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

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-[#1a1a2e] via-[#2d2d5e] to-[#1a1a2e] py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(232,197,71,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#e8c547 0px,#e8c547 1px,transparent 1px,transparent 40px)",
          }}
        />
        {/* decorative compass rose */}
        <div className="absolute end-8 top-8 opacity-5 text-[120px] pointer-events-none select-none">🧭</div>
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
              🇱🇾 {c.pill1}
            </span>
            <span className="text-[12px] text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              ✏️ {c.pill2}
            </span>
          </div>
        </div>
      </section>

      {/* ── REGIONS ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-4">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-6 font-semibold">
          {c.regionsHeading}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {c.regions.map((r, i) => (
            <div
              key={r.name}
              onClick={() => setActiveRegion(activeRegion === i ? null : i)}
              className="border border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-yellow-300 hover:shadow-md transition-all"
              style={{
                borderColor: activeRegion === i ? "#e8c547" : undefined,
                boxShadow: activeRegion === i ? "0 0 0 1px #e8c547" : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-xl shrink-0">
                    {r.icon}
                  </span>
                  <div>
                    <div
                      className={`font-semibold text-gray-900 text-[15px] leading-tight ${
                        isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                      }`}
                    >
                      {r.name}
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block"
                      style={{ background: `${r.tagColor}18`, color: r.tagColor }}
                    >
                      {r.tag}
                    </span>
                  </div>
                </div>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors mt-1 ${
                    activeRegion === i ? "bg-yellow-400" : "bg-gray-100"
                  }`}
                >
                  <svg
                    width="10" height="10" viewBox="0 0 10 10" fill="none"
                    className={`transition-transform duration-200 ${activeRegion === i ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M2 3.5l3 3 3-3"
                      stroke={activeRegion === i ? "#1a1a2e" : "#6b7280"}
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <p className="text-[12px] text-gray-500 leading-[1.7] mb-3">{r.desc}</p>
              {activeRegion === i && (
                <ul className="flex flex-col gap-1.5 border-t border-gray-100 pt-3 mt-1">
                  {r.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-[12px] text-gray-700">
                      <span className="text-yellow-500 shrink-0 mt-0.5">✦</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BEFORE YOU GO ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-4">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-6 font-semibold">
          {c.beforeHeading}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {c.beforeCategories.map((cat) => (
            <div key={cat.title} className="border border-gray-200 rounded-2xl overflow-hidden">
              <div
                className="px-5 py-3.5 flex items-center gap-3"
                style={{ background: `${cat.color}10`, borderBottom: `1px solid ${cat.color}22` }}
              >
                <span className="text-xl">{cat.icon}</span>
                <span
                  className={`font-semibold text-[14px] ${isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""}`}
                  style={{ color: cat.color }}
                >
                  {cat.title}
                </span>
              </div>
              <ul className="px-5 py-4 flex flex-col gap-2.5">
                {cat.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-600 leading-[1.7]">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-white"
                      style={{ background: cat.color }}
                    >
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── DURING YOUR STAY ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-4">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-6 font-semibold">
          {c.duringHeading}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.duringTips.map((tip) => (
            <div
              key={tip.title}
              className="border border-gray-200 rounded-2xl p-5 hover:border-yellow-300 hover:shadow-sm transition-all flex flex-col gap-3"
            >
              <span className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-lg shrink-0">
                {tip.icon}
              </span>
              <div>
                <div
                  className={`font-semibold text-gray-900 text-[13px] mb-1.5 ${
                    isAr ? "font-['Cairo','Tajawal',sans-serif]" : ""
                  }`}
                >
                  {tip.title}
                </div>
                <div className="text-[12px] text-gray-500 leading-[1.7]">{tip.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PACKING LIST ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-4">
        <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-6 font-semibold">
          {c.packingHeading}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.packingCategories.map((cat) => (
            <div key={cat.label} className="border border-gray-200 rounded-2xl overflow-hidden">
              <div
                className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white"
                style={{ background: cat.color }}
              >
                {cat.label}
              </div>
              <ul className="px-4 py-3 flex flex-col gap-2">
                {cat.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
                    {item}
                  </li>
                ))}
              </ul>
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
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    className={`transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M2 3.5l3 3 3-3"
                      stroke={openFaq === i ? "#e8c547" : "#6b7280"}
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-[13px] text-gray-600 leading-[1.8] pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="bg-[#1a1a2e] mx-4 sm:mx-6 mb-10 rounded-3xl px-8 py-12 max-w-screen-xl lg:mx-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,197,71,0.18)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute end-8 bottom-4 opacity-5 text-[100px] pointer-events-none select-none">🧳</div>
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
            href="/"
            className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-7 py-3.5 rounded-xl text-sm font-bold no-underline hover:bg-yellow-300 transition-colors"
          >
            🏠 {c.ctaButton}
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