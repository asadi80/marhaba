"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const content = {
  en: {
    dir: "ltr",
    badge: "Host Resources",
    title: "Everything you need",
    title1: "to host well",
    subtitle: "Guides, tools, and tips to help you run a successful listing on Marhaba",
    lastUpdated: "Last Updated: June 1, 2025",
    effective: "For Hosts · Property Owners",
    toc: "Table of Contents",
    sections: [
      {
        id: "photography",
        title: "Photography Guide",
        icon: "📸",
        content:
          "Your photos are the single most important factor in a guest's decision to book. Listings with great photos receive up to 3× more booking requests.",
        steps: [
          {
            num: "01",
            title: "Shoot in natural light",
            body: "Open all curtains and blinds. Shoot mid-morning when daylight is brightest but not harsh. Turn off overhead lights — they create ugly orange casts on camera.",
          },
          {
            num: "02",
            title: "Shoot every room",
            body: "Cover: entrance, living area, every bedroom, bathroom(s), kitchen, outdoor spaces, and any unique features. Guests want to see the full picture before committing.",
          },
          {
            num: "03",
            title: "Stage before shooting",
            body: "Make beds neatly. Remove clutter, personal items, and trash bins from view. Add a small detail — a plant, a folded towel, a bowl of fruit — to make spaces feel lived-in but welcoming.",
          },
          {
            num: "04",
            title: "Shoot wide, then detail",
            body: "Start with a wide establishing shot of each room from the doorway or corner. Then capture 1–2 detail shots of interesting features: a view, a fireplace, a terrace.",
          },
          {
            num: "05",
            title: "Upload 6+ photos",
            body: "Listings with 6 or more photos see significantly more engagement. Use all 6 slots — variety matters more than perfection.",
          },
        ],
      },
      {
        id: "pricing",
        title: "Pricing Strategy",
        icon: "💰",
        content: "Pricing is a balance between competitiveness and your costs. Here's how to approach it:",
        subsections: [
          {
            title: "Setting your base rate",
            items: [
              "Research similar properties in your city or region on Marhaba",
              "Factor in your costs: utilities, cleaning, maintenance, and subscription fee",
              "Start slightly lower than comparable listings to build up bookings and reputation early",
              "Your price is shown per night in Libyan Dinar (LYD) — round numbers feel cleaner",
            ],
          },
          {
            title: "Seasonal adjustments",
            items: [
              "Raise rates during peak travel months (summer for coastal, winter for desert/mountain)",
              "Consider weekend premiums if your area sees weekend-heavy traffic",
              "Lower rates during slow seasons to keep occupancy up rather than leaving the listing idle",
              "You can update your price any time from the Host Dashboard — it takes effect immediately",
            ],
          },
          {
            title: "Discounts that work",
            items: [
              "Offer a slightly lower rate to first guests — early reviews are worth more than the difference",
              "Long stays (5+ nights) justify a small discount — lower nightly rate, higher total revenue",
              "Communicate any special pricing directly with the guest when they message you",
            ],
          },
        ],
      },
      {
        id: "description",
        title: "Writing a Great Description",
        icon: "✍️",
        content:
          "Your description sells the experience, not just the space. Guests are picturing their stay as they read — help them see it clearly.",
        steps: [
          {
            num: "01",
            title: "Lead with the highlight",
            body: "Open with the one thing that makes your property special: the view, the location, the pool, the quiet. Don't bury the best part.",
          },
          {
            num: "02",
            title: "Describe the space accurately",
            body: "Cover bedrooms, bathrooms, living areas, and kitchen. Mention capacity. If there are quirks (a narrow staircase, a shared wall), say so — honesty prevents bad reviews.",
          },
          {
            num: "03",
            title: "Paint the neighbourhood",
            body: "What's nearby? Beach, market, highway access, restaurants? Guests often choose a location as much as a property — help them understand what they're getting.",
          },
          {
            num: "04",
            title: "Write in both languages",
            body: "Marhaba serves Arabic and English speakers. Write your title and description in both to maximise reach. Keep both versions accurate — don't just run a translation.",
          },
        ],
      },
      {
        id: "calendar",
        title: "Managing Your Calendar",
        icon: "📅",
        content: "A stale or inaccurate calendar is the fastest way to damage your reputation as a host.",
        items: [
          "Update your availability calendar every week — at minimum",
          "Block dates immediately when you know the property is unavailable (maintenance, personal use, family visits)",
          "Never confirm a booking for dates you're not certain about — last-minute cancellations hurt guests and your standing",
          "Use the Host Date Manager on your listing page to block specific date ranges with reasons",
          "If you're away for extended periods, set the listing to Inactive rather than leaving gaps",
          "Confirmed bookings are automatically blocked — you don't need to do anything extra",
        ],
      },
      {
        id: "communication",
        title: "Guest Communication",
        icon: "💬",
        content: "Fast, warm, and clear communication is what separates great hosts from average ones.",
        subsections: [
          {
            title: "Before booking",
            items: [
              "Respond to booking requests within 2–4 hours during waking hours",
              "If you need more time, send a quick acknowledgement: 'Got your request, I'll confirm shortly'",
              "Read the guest's message carefully — personalise your reply to their specific trip",
              "Ask about arrival time early so you can plan check-in coordination",
            ],
          },
          {
            title: "Before check-in",
            items: [
              "Send check-in instructions the day before arrival",
              "Include: exact address, parking instructions, door code or key handoff details, WiFi name and password",
              "Add your phone number so guests can reach you on arrival day",
              "A warm welcome message goes a long way — 'We're so glad you're coming, let us know if you need anything'",
            ],
          },
          {
            title: "During the stay",
            items: [
              "Check in with the guest 2–3 hours after arrival: 'Hope you've settled in well — anything you need?'",
              "Respond to any issues or questions within 1–2 hours during the day",
              "Don't hover — guests want privacy. One check-in is enough unless they reach out",
              "If something breaks or goes wrong, acknowledge it immediately and offer a solution",
            ],
          },
          {
            title: "After check-out",
            items: [
              "Thank the guest for staying and for leaving the property in good condition",
              "Kindly ask them to leave a review — most guests are happy to if prompted",
              "If there was an issue, follow up with the guest privately before it becomes a complaint",
            ],
          },
        ],
      },
      {
        id: "checkin",
        title: "Check-in & Check-out",
        icon: "🔑",
        content: "A smooth arrival sets the tone for the entire stay. A rough one starts the stay in a hole.",
        steps: [
          {
            num: "01",
            title: "Confirm check-in time in advance",
            body: "Agree on a check-in window with the guest at least 24 hours before arrival. Standard is 2–4 PM but flexibility earns goodwill.",
          },
          {
            num: "02",
            title: "Prepare the property",
            body: "Fresh linens, clean towels, an empty fridge or cleared kitchen space, stocked toilet paper. First impressions are made in the first 60 seconds.",
          },
          {
            num: "03",
            title: "Key handoff options",
            body: "Meet the guest in person (ideal), leave a key with a trusted neighbour, or use a lockbox with a code. Share the handoff method clearly in your pre-arrival message.",
          },
          {
            num: "04",
            title: "Leave a welcome note",
            body: "A handwritten or printed note with WiFi details, your contact number, emergency contacts, and a local tip (a great restaurant, a hidden beach) makes guests feel genuinely hosted.",
          },
          {
            num: "05",
            title: "Set clear check-out expectations",
            body: "Tell guests your check-out time in your listing and again before they arrive. Standard is 11 AM–12 PM. Leave instructions: where to leave keys, whether to strip beds, what to do with rubbish.",
          },
        ],
      },
      {
        id: "reviews",
        title: "Getting Great Reviews",
        icon: "⭐",
        content: "Reviews are your reputation on Marhaba. A strong review history drives future bookings more than almost anything else.",
        items: [
          "Deliver exactly what you promised in your listing — no surprises, no downgrades",
          "Small unexpected touches go a long way: a welcome snack, a local recommendation card, a fresh flower",
          "Ask for a review at check-out: 'If you enjoyed your stay, we'd really appreciate a review'",
          "Respond graciously to positive reviews — it shows future guests you're engaged",
          "If you receive a critical review, respond calmly and constructively — don't argue",
          "Address any issues raised in reviews by actually fixing them — repeat complaints signal neglect",
        ],
      },
      {
        id: "maintenance",
        title: "Property Maintenance",
        icon: "🔧",
        content: "A well-maintained property means fewer complaints, better reviews, and longer-term value.",
        subsections: [
          {
            title: "Between every stay",
            items: [
              "Full clean of all rooms, bathrooms, and kitchen",
              "Fresh linen and towels for every guest — no exceptions",
              "Restock essentials: toilet paper, hand soap, dish soap, garbage bags",
              "Check all appliances work: AC, hot water, WiFi router, TV",
              "Replace any broken or damaged items before the next guest arrives",
            ],
          },
          {
            title: "Monthly checks",
            items: [
              "Test smoke and carbon monoxide detectors",
              "Check plumbing for leaks or slow drains",
              "Inspect doors, windows, and locks — security matters",
              "Clean AC filters for air quality and efficiency",
              "Deep clean behind appliances, under beds, inside wardrobes",
            ],
          },
          {
            title: "Seasonal maintenance",
            items: [
              "Before summer: service AC units, check pool/outdoor area if applicable",
              "Before winter: check heating, seal any drafts, inspect roof and gutters",
              "After extended vacancies: air out the property, check for pests, run all water fixtures",
            ],
          },
        ],
      },
      {
        id: "safety",
        title: "Safety Standards",
        icon: "🔒",
        content: "You are responsible for providing a safe environment for your guests. These are the basics every listing should have.",
        items: [
          "Working smoke detector in every sleeping area and common space",
          "Fire extinguisher in or near the kitchen — checked and in date",
          "First aid kit accessible to guests — mention its location in your welcome note",
          "Emergency contact numbers posted visibly: host phone, nearest hospital, police",
          "All locks functioning properly on entry doors and ground-floor windows",
          "Clear emergency exit path — no blocked hallways or locked emergency exits",
          "Gas and electrical installations checked by a qualified person at least annually",
          "Swimming pool (if applicable): fenced, with life-saving equipment nearby",
        ],
      },
      {
        id: "legal",
        title: "Legal & Compliance",
        icon: "📜",
        content:
          "As a host in Libya, you are responsible for understanding and complying with local laws. Marhaba provides a platform — legal compliance is your obligation.",
        items: [
          "Confirm that short-term rentals are permitted in your building or area under Libyan law",
          "Declare rental income as required by Libyan tax law",
          "Ensure your property meets local safety and habitability standards",
          "If renting someone else's property, confirm you have the legal right to sublease",
          "Keep records of guest stays for any governmental reporting requirements",
          "Marhaba does not provide legal advice — consult a qualified Libyan lawyer if in doubt",
        ],
        footer: "Laws may vary by region. When in doubt, seek local legal advice before listing.",
      },
      {
        id: "support",
        title: "Host Support",
        icon: "📬",
        content: "Our team is here to help you succeed — in Arabic or English.",
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
    badge: "موارد المضيف",
    title: "كل ما تحتاجه",
    title1: "للاستضافة ناجحة",
    subtitle: "أدلة وأدوات ونصائح لمساعدتك على إدارة قائمة ناجحة في مرحبا",
    lastUpdated: "آخر تحديث: 1 يونيو 2025",
    effective: "للمضيفين · أصحاب العقارات",
    toc: "جدول المحتويات",
    sections: [
      {
        id: "photography",
        title: "دليل التصوير",
        icon: "📸",
        content:
          "صورك هي العامل الأهم في قرار الضيف بالحجز. القوائم ذات الصور الرائعة تحصل على ضعف طلبات الحجز أو أكثر.",
        steps: [
          {
            num: "٠١",
            title: "التصوير في الضوء الطبيعي",
            body: "افتح جميع الستائر والنوافذ. التقط الصور في منتصف الصباح عندما يكون الضوء ساطعاً. أطفئ الأضواء العلوية — تُضفي لوناً برتقالياً غير جذاب في الصور.",
          },
          {
            num: "٠٢",
            title: "صوّر كل غرفة",
            body: "غطِّ: المدخل، المعيشة، كل غرفة نوم، الحمام/الحمامات، المطبخ، المساحات الخارجية، وأي ميزات مميزة. الضيوف يريدون رؤية الصورة الكاملة قبل الحجز.",
          },
          {
            num: "٠٣",
            title: "رتّب قبل التصوير",
            body: "رتّب الأسرّة بعناية. أزل الفوضى والأغراض الشخصية وسلال المهملات من المشهد. أضف لمسة صغيرة — نبتة، منشفة مطوية، وعاء فاكهة — لتجعل المساحات تبدو مرحّبة.",
          },
          {
            num: "٠٤",
            title: "صوّر واسعاً ثم التفاصيل",
            body: "ابدأ بلقطة عامة لكل غرفة من الباب أو الزاوية. ثم التقط 1-2 لقطات تفصيلية لميزات مثيرة: إطلالة، مدفأة، شرفة.",
          },
          {
            num: "٠٥",
            title: "ارفع 6 صور أو أكثر",
            body: "القوائم ذات 6 صور أو أكثر تحقق تفاعلاً أكبر بشكل ملحوظ. استخدم جميع الخانات الست — التنوع أهم من الكمال.",
          },
        ],
      },
      {
        id: "pricing",
        title: "استراتيجية التسعير",
        icon: "💰",
        content: "التسعير توازن بين التنافسية وتكاليفك. إليك كيفية التعامل معه:",
        subsections: [
          {
            title: "تحديد السعر الأساسي",
            items: [
              "ابحث عن عقارات مشابهة في مدينتك أو منطقتك على مرحبا",
              "احسب تكاليفك: المرافق، التنظيف، الصيانة، ورسوم الاشتراك",
              "ابدأ بسعر أقل قليلاً من القوائم المماثلة لبناء الحجوزات والسمعة في البداية",
              "السعر يُعرض لكل ليلة بالدينار الليبي — الأرقام المستديرة تبدو أوضح",
            ],
          },
          {
            title: "التعديلات الموسمية",
            items: [
              "ارفع الأسعار خلال أشهر الذروة (الصيف للساحل، الشتاء للصحراء/الجبال)",
              "فكّر في أسعار عطلة نهاية الأسبوع إذا كانت منطقتك تشهد طلباً مرتفعاً فيها",
              "اخفض الأسعار في المواسم الهادئة للحفاظ على الإشغال بدلاً من ترك القائمة خاملة",
              "يمكنك تحديث سعرك في أي وقت من لوحة تحكم المضيف — يسري فوراً",
            ],
          },
          {
            title: "الخصومات المجدية",
            items: [
              "قدّم سعراً أقل للضيوف الأوائل — التقييمات المبكرة تستحق الفرق",
              "الإقامات الطويلة (5 ليالٍ أو أكثر) تبرر خصماً بسيطاً — سعر ليلي أقل، عائد إجمالي أعلى",
              "تواصل مع الضيف مباشرة عبر الرسائل حول أي تسعير خاص",
            ],
          },
        ],
      },
      {
        id: "description",
        title: "كتابة وصف رائع",
        icon: "✍️",
        content:
          "وصفك يبيع التجربة، وليس المساحة فقط. الضيوف يتخيلون إقامتهم أثناء القراءة — ساعدهم على رؤية الصورة بوضوح.",
        steps: [
          {
            num: "٠١",
            title: "ابدأ بالميزة الأبرز",
            body: "افتح بالشيء الذي يجعل عقارك مميزاً: الإطلالة، الموقع، المسبح، الهدوء. لا تدفن أفضل ما لديك في النهاية.",
          },
          {
            num: "٠٢",
            title: "صف المساحة بدقة",
            body: "غطِّ غرف النوم والحمامات والمعيشة والمطبخ. اذكر السعة. إذا كانت هناك خصوصية (درج ضيق، جدار مشترك)، اذكرها — الصدق يمنع التقييمات السيئة.",
          },
          {
            num: "٠٣",
            title: "صف الحي",
            body: "ما القريب منك؟ شاطئ، سوق، طريق رئيسي، مطاعم؟ الضيوف يختارون الموقع بنفس أهمية العقار — ساعدهم على فهم ما سيحصلون عليه.",
          },
          {
            num: "٠٤",
            title: "اكتب باللغتين",
            body: "مرحبا تخدم العرب والناطقين بالإنجليزية. اكتب عنوانك ووصفك بكلتا اللغتين لتوسيع انتشارك. حافظ على دقة كلا الإصدارين — لا تكتفي بالترجمة الحرفية.",
          },
        ],
      },
      {
        id: "calendar",
        title: "إدارة التقويم",
        icon: "📅",
        content: "التقويم القديم أو غير الدقيق هو أسرع طريقة لإلحاق الضرر بسمعتك كمضيف.",
        items: [
          "حدّث تقويم التوافر أسبوعياً على الأقل",
          "احجب التواريخ فوراً عند معرفة أن العقار غير متاح (صيانة، استخدام شخصي، زيارات عائلية)",
          "لا تؤكد حجزاً لتواريخ غير متأكد منها — الإلغاءات المفاجئة تضر الضيوف وتضر سمعتك",
          "استخدم مدير التواريخ في صفحة قائمتك لحجب نطاقات تواريخ محددة مع ذكر الأسباب",
          "إذا كنت غائباً لفترات طويلة، اضبط القائمة على غير نشط بدلاً من ترك ثغرات",
          "الحجوزات المؤكدة تُحجب تلقائياً — لا تحتاج إلى فعل أي شيء إضافي",
        ],
      },
      {
        id: "communication",
        title: "التواصل مع الضيوف",
        icon: "💬",
        content: "التواصل السريع والودود والواضح هو ما يميز المضيفين الرائعين عن العاديين.",
        subsections: [
          {
            title: "قبل الحجز",
            items: [
              "رد على طلبات الحجز خلال 2-4 ساعات في ساعات الاستيقاظ",
              "إذا احتجت وقتاً أطول، أرسل إقراراً سريعاً: 'استلمت طلبك، سأؤكد قريباً'",
              "اقرأ رسالة الضيف بعناية — خصّص ردك لرحلته تحديداً",
              "اسأل عن وقت الوصول مبكراً لتتمكن من التخطيط لتنسيق تسجيل الوصول",
            ],
          },
          {
            title: "قبل تسجيل الوصول",
            items: [
              "أرسل تعليمات تسجيل الوصول قبل يوم من الوصول",
              "اشمل: العنوان الدقيق، تعليمات الموقف، رمز الباب أو تفاصيل تسليم المفتاح، اسم الواي فاي وكلمة المرور",
              "أضف رقم هاتفك حتى يتمكن الضيوف من الوصول إليك يوم الوصول",
              "رسالة ترحيب دافئة تقطع شوطاً طويلاً — 'يسعدنا قدومك، أخبرنا إذا احتجت أي شيء'",
            ],
          },
          {
            title: "خلال الإقامة",
            items: [
              "تفقّد الضيف بعد 2-3 ساعات من الوصول: 'أرجو أنك استقررت جيداً — أي شيء تحتاجه؟'",
              "رد على أي مشكلة أو سؤال خلال 1-2 ساعة خلال النهار",
              "لا تتدخل — الضيوف يريدون الخصوصية. تفقّد واحد يكفي ما لم يتواصلوا",
              "إذا تعطل شيء أو حدث خطأ ما، اعترف به فوراً وقدّم حلاً",
            ],
          },
          {
            title: "بعد المغادرة",
            items: [
              "اشكر الضيف على الإقامة وعلى تركه العقار بحالة جيدة",
              "اطلب منه بلطف ترك تقييم — معظم الضيوف سعداء بالفعل إذا طُلب منهم",
              "إذا كانت هناك مشكلة، تابع مع الضيف بشكل خاص قبل أن تتحول إلى شكوى",
            ],
          },
        ],
      },
      {
        id: "checkin",
        title: "تسجيل الوصول والمغادرة",
        icon: "🔑",
        content: "الاستقبال السلس يحدد نبرة الإقامة بأكملها. الاستقبال الصعب يبدأ الإقامة بشكل سيء.",
        steps: [
          {
            num: "٠١",
            title: "أكّد وقت الوصول مسبقاً",
            body: "اتفق مع الضيف على نافذة تسجيل وصول قبل 24 ساعة على الأقل من الوصول. المعيار 2-4 مساءً لكن المرونة تكسب حسن النية.",
          },
          {
            num: "٠٢",
            title: "جهّز العقار",
            body: "شراشف نظيفة، مناشف جديدة، ثلاجة فارغة أو مساحة مطبخ منظمة، ورق مرحاض مخزون. الانطباعات الأولى تُصنع في أول 60 ثانية.",
          },
          {
            num: "٠٣",
            title: "خيارات تسليم المفتاح",
            body: "قابل الضيف شخصياً (الأمثل)، أو اترك مفتاحاً مع جار موثوق، أو استخدم صندوق مفاتيح برمز. شارك طريقة التسليم بوضوح في رسالة ما قبل الوصول.",
          },
          {
            num: "٠٤",
            title: "اترك ملاحظة ترحيب",
            body: "ملاحظة بخط اليد أو مطبوعة تحتوي تفاصيل الواي فاي، رقم هاتفك، أرقام الطوارئ، ونصيحة محلية (مطعم رائع، شاطئ خفي) تجعل الضيوف يشعرون باستضافة حقيقية.",
          },
          {
            num: "٠٥",
            title: "حدد توقعات المغادرة بوضوح",
            body: "أخبر الضيوف بوقت المغادرة في قائمتك وأيضاً قبل وصولهم. المعيار 11 صباحاً - 12 ظهراً. اترك تعليمات: أين يتركون المفاتيح، هل يخلعون الشراشف، ماذا يفعلون بالنفايات.",
          },
        ],
      },
      {
        id: "reviews",
        title: "الحصول على تقييمات رائعة",
        icon: "⭐",
        content: "التقييمات هي سمعتك على مرحبا. سجل تقييمات قوي يدفع الحجوزات المستقبلية أكثر من أي شيء آخر.",
        items: [
          "قدّم بالضبط ما وعدت به في قائمتك — لا مفاجآت، لا تخفيضات في المستوى",
          "اللمسات الصغيرة غير المتوقعة تقطع شوطاً طويلاً: وجبة خفيفة ترحيبية، بطاقة توصيات محلية، زهرة طازجة",
          "اطلب تقييماً عند المغادرة: 'إذا استمتعت بإقامتك، نقدّر كثيراً تقييماً منك'",
          "رد بلطف على التقييمات الإيجابية — يُظهر للضيوف المستقبليين اهتمامك",
          "إذا تلقيت تقييماً نقدياً، رد بهدوء وبناء — لا تجادل",
          "عالج أي مشكلات مُثيرة في التقييمات بإصلاحها فعلياً — الشكاوى المتكررة تُشير إلى الإهمال",
        ],
      },
      {
        id: "maintenance",
        title: "صيانة العقار",
        icon: "🔧",
        content: "العقار جيد الصيانة يعني شكاوى أقل وتقييمات أفضل وقيمة على المدى البعيد.",
        subsections: [
          {
            title: "بين كل إقامة",
            items: [
              "تنظيف شامل لجميع الغرف والحمامات والمطبخ",
              "شراشف ومناشف جديدة لكل ضيف — بدون استثناء",
              "إعادة تخزين الأساسيات: ورق المرحاض، صابون اليدين، سائل الجلي، أكياس القمامة",
              "تحقق من عمل جميع الأجهزة: التكييف، الماء الساخن، جهاز الراوتر، التلفاز",
              "استبدل أي أشياء مكسورة أو تالفة قبل وصول الضيف التالي",
            ],
          },
          {
            title: "فحوصات شهرية",
            items: [
              "اختبر أجهزة كشف الدخان وأول أكسيد الكربون",
              "تحقق من السباكة بحثاً عن تسربات أو مصارف بطيئة",
              "افحص الأبواب والنوافذ والأقفال — الأمان مهم",
              "نظّف فلاتر التكييف لجودة الهواء والكفاءة",
              "تنظيف عميق خلف الأجهزة وتحت الأسرة وداخل الخزائن",
            ],
          },
          {
            title: "الصيانة الموسمية",
            items: [
              "قبل الصيف: صيانة وحدات التكييف، فحص المسبح/المنطقة الخارجية إذا وُجدت",
              "قبل الشتاء: فحص التدفئة، سد التسريبات، فحص السقف والمزاريب",
              "بعد فترات الشغور الطويلة: تهوية العقار، التحقق من الحشرات، تشغيل جميع صنابير المياه",
            ],
          },
        ],
      },
      {
        id: "safety",
        title: "معايير السلامة",
        icon: "🔒",
        content: "أنت مسؤول عن توفير بيئة آمنة لضيوفك. هذه هي الأساسيات التي يجب أن تتوفر في كل قائمة.",
        items: [
          "كاشف دخان يعمل في كل غرفة نوم ومساحة مشتركة",
          "طفاية حريق في المطبخ أو بالقرب منه — محفوظة وصالحة",
          "طقم إسعافات أولية في متناول الضيوف — اذكر مكانه في ملاحظة الترحيب",
          "أرقام الطوارئ معلّقة بشكل واضح: هاتف المضيف، أقرب مستشفى، الشرطة",
          "جميع الأقفال تعمل بشكل صحيح على أبواب المدخل ونوافذ الطابق الأرضي",
          "مسار إخلاء طوارئ واضح — لا ممرات مسدودة أو مخارج طوارئ مقفلة",
          "التركيبات الغازية والكهربائية يفحصها شخص مؤهل سنوياً على الأقل",
          "المسبح (إذا وُجد): مسيّج مع معدات إنقاذ قريبة",
        ],
      },
      {
        id: "legal",
        title: "القانون والامتثال",
        icon: "📜",
        content:
          "بوصفك مضيفاً في ليبيا، أنت مسؤول عن فهم القوانين المحلية والامتثال لها. مرحبا توفر منصة — الامتثال القانوني التزامك أنت.",
        items: [
          "تأكد من أن الإيجار قصير الأمد مسموح به في مبناك أو منطقتك بموجب القانون الليبي",
          "أعلن عن دخل الإيجار كما يقتضي قانون الضرائب الليبي",
          "تأكد من أن عقارك يلبي معايير السلامة والسكن المحلية",
          "إذا كنت تؤجر عقار شخص آخر، تأكد من امتلاكك الحق القانوني للإيجار من الباطن",
          "احتفظ بسجلات إقامات الضيوف لأي متطلبات إبلاغ حكومية",
          "مرحبا لا تقدم استشارات قانونية — استشر محامياً ليبياً مؤهلاً عند الشك",
        ],
        footer: "قد تختلف القوانين حسب المنطقة. عند الشك، اطلب مشورة قانونية محلية قبل الإدراج.",
      },
      {
        id: "support",
        title: "دعم المضيفين",
        icon: "📬",
        content: "فريقنا هنا لمساعدتك على النجاح — بالعربية أو الإنجليزية.",
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

// ── Quick-access resource cards shown below the hero ─────────────────────────
const QUICK_LINKS = {
  en: [
    { icon: "📸", label: "Photography",     id: "photography" },
    { icon: "💰", label: "Pricing",          id: "pricing"     },
    { icon: "📅", label: "Calendar",         id: "calendar"    },
    { icon: "💬", label: "Communication",    id: "communication"},
    { icon: "🔑", label: "Check-in",         id: "checkin"     },
    { icon: "⭐", label: "Reviews",          id: "reviews"     },
    { icon: "🔧", label: "Maintenance",      id: "maintenance" },
    { icon: "🔒", label: "Safety",           id: "safety"      },
  ],
  ar: [
    { icon: "📸", label: "التصوير",          id: "photography" },
    { icon: "💰", label: "التسعير",          id: "pricing"     },
    { icon: "📅", label: "التقويم",          id: "calendar"    },
    { icon: "💬", label: "التواصل",          id: "communication"},
    { icon: "🔑", label: "تسجيل الوصول",    id: "checkin"     },
    { icon: "⭐", label: "التقييمات",        id: "reviews"     },
    { icon: "🔧", label: "الصيانة",          id: "maintenance" },
    { icon: "🔒", label: "السلامة",          id: "safety"      },
  ],
};

export default function HostResourcesPage() {
  const [lang, setLang]               = useState("en");
  const [activeSection, setActiveSection] = useState(null);
  const c    = content[lang];
  const isAr = lang === "ar";
  const ql   = QUICK_LINKS[lang];

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(232,197,71,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_70%,rgba(55,138,221,0.08)_0%,transparent_50%)] pointer-events-none" />
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
              isAr ? "font-['Cairo','Tajawal',sans-serif]" : "font-['Fraunces',serif] italic"
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

          {/* Hero CTAs */}
          <div className="flex gap-3 mt-8 flex-wrap">
            <Link
              href="/host/listings"
              className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-6 py-3 rounded-xl text-sm font-bold no-underline hover:bg-yellow-300 transition-colors"
            >
              {isAr ? "لوحة تحكم المضيف ←" : "Host Dashboard →"}
            </Link>
            <Link
              href="/start-hosting"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl text-sm font-medium no-underline border border-white/20 hover:bg-white/15 transition-colors"
            >
              {isAr ? "دليل البدء" : "Getting Started Guide"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── QUICK-ACCESS CARDS ── */}
      <div className="border-b border-gray-100 bg-[#fafaf9]">
        <div className="max-w-screen-xl mx-auto px-6 py-6">
          <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-4 font-semibold">
            {isAr ? "انتقل إلى" : "Jump to"}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {ql.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setActiveSection(link.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 hover:border-yellow-400/50 hover:shadow-sm transition-all no-underline group"
              >
                <span className="text-2xl">{link.icon}</span>
                <span className="text-[10px] font-semibold text-gray-500 text-center leading-tight group-hover:text-[#1a1a2e] transition-colors">
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
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
                  <span>{i + 1}. {s.title}</span>
                </a>
              ))}
            </nav>

            {/* Sidebar CTAs */}
            <div className="mt-8 bg-[#1a1a2e] rounded-2xl p-5">
              <p className="text-[11px] text-yellow-400/70 font-semibold uppercase tracking-widest mb-2">
                {isAr ? "جاهز؟" : "Ready?"}
              </p>
              <p className="text-[13px] text-white/60 leading-[1.6] mb-4">
                {isAr ? "ادخل للوحة تحكم المضيف." : "Go to your Host Dashboard."}
              </p>
              <Link
                href="/host/listings"
                className="inline-flex items-center gap-1.5 bg-yellow-400 text-[#1a1a2e] px-4 py-2 rounded-lg text-[12px] font-bold no-underline w-full justify-center"
              >
                {isAr ? "لوحة التحكم" : "Host Dashboard"} →
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

                {/* Intro text */}
                {s.content && (
                  <p className="text-gray-600 text-[14px] leading-[1.8] mb-5">{s.content}</p>
                )}

                {/* Numbered steps */}
                {s.steps && (
                  <div className="flex flex-col gap-4 mt-1">
                    {s.steps.map((step) => (
                      <div
                        key={step.num}
                        className="flex gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center shrink-0">
                          <span className="text-yellow-400 text-[12px] font-bold">{step.num}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-[14px] text-gray-900 mb-1">{step.title}</div>
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

                {/* Bullet list */}
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
                  <p className="text-gray-400 text-[13px] mt-3 italic">{s.footer}</p>
                )}

                {/* Contact card */}
                {s.contactCard && (
                  <div className="mt-4 border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-xl shrink-0">
                      🏢
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{s.contactCard.name}</div>
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
                  isAr ? "font-['Cairo','Tajawal',sans-serif]" : "font-['Fraunces',serif] italic"
                }`}
              >
                {isAr ? "حوّل عقارك إلى دخل" : "Put these resources to work"}
              </h3>
              <p className="text-white/40 text-[13px] mb-6">
                {isAr
                  ? "انضم لمئات المضيفين الليبيين على مرحبا"
                  : "Manage your listings, bookings, and availability from one place"}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href="/host/listings"
                  className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-6 py-3 rounded-xl text-sm font-bold no-underline"
                >
                  {isAr ? "لوحة تحكم المضيف" : "Go to Host Dashboard"} →
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl text-sm font-medium no-underline border border-white/20"
                >
                  {isAr ? "تواصل مع الدعم" : "Contact Support"}
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom notice */}
          <div className="mt-6 bg-gray-50 rounded-2xl p-5 text-center">
            <p className="text-[12px] text-gray-400">
              {isAr
                ? "تم تحديث هذه الصفحة في 1 يونيو 2025 · support@mar-haba.ly"
                : "Last updated June 1, 2025 · Questions? support@mar-haba.ly"}
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
              <Link href="/privacy"  className="text-xs text-[#999] no-underline hover:text-yellow-400 transition-colors">{c.footer.privacy}</Link>
              <Link href="/terms"    className="text-xs text-[#999] no-underline hover:text-yellow-400 transition-colors">{c.footer.terms}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}