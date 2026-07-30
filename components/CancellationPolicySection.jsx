// components/CancellationPolicySection.jsx

export const POLICY_PRESETS = [
  {
    id: "flexible",
    icon: "🟢",
    labelEn: "Flexible",
    labelAr: "مرن",
    descEn: "Full refund if cancelled 24 hours before check-in.",
    descAr: "استرداد كامل إذا تم الإلغاء قبل 24 ساعة من تسجيل الوصول.",
    rulesEn: [
      "Full refund up to 24 hours before check-in",
      "No refund within 24 hours of check-in",
    ],
    rulesAr: [
      "استرداد كامل حتى 24 ساعة قبل تسجيل الوصول",
      "لا استرداد خلال 24 ساعة من تسجيل الوصول",
    ],
  },
  {
    id: "moderate",
    icon: "🟡",
    labelEn: "Moderate",
    labelAr: "معتدل",
    descEn: "Full refund if cancelled 5 days before check-in.",
    descAr: "استرداد كامل إذا تم الإلغاء قبل 5 أيام من تسجيل الوصول.",
    rulesEn: [
      "Full refund if cancelled 5 or more days before check-in",
      "50% refund if cancelled 2–4 days before check-in",
      "No refund within 48 hours of check-in",
    ],
    rulesAr: [
      "استرداد كامل إذا ألغيت قبل 5 أيام أو أكثر من تسجيل الوصول",
      "استرداد 50٪ إذا ألغيت قبل 2-4 أيام من تسجيل الوصول",
      "لا استرداد خلال 48 ساعة من تسجيل الوصول",
    ],
  },
  {
    id: "strict",
    icon: "🔴",
    labelEn: "Strict",
    labelAr: "صارم",
    descEn: "No refund once the booking is confirmed.",
    descAr: "لا استرداد بمجرد تأكيد الحجز.",
    rulesEn: [
      "No refund after booking is confirmed",
      "Guest is responsible for the full amount regardless of cancellation",
    ],
    rulesAr: [
      "لا استرداد بعد تأكيد الحجز",
      "الضيف مسؤول عن المبلغ الكامل بغض النظر عن الإلغاء",
    ],
  },
  {
    id: "custom",
    icon: "✏️",
    labelEn: "Custom",
    labelAr: "مخصص",
    descEn: "Write your own cancellation policy.",
    descAr: "اكتب سياسة الإلغاء الخاصة بك.",
    rulesEn: [],
    rulesAr: [],
  },
];

// ─── bilingual suggestion pairs ───────────────────────────────────────────────
const RULE_PAIRS = [
  {
    en: "50% refund if cancelled 24h before check-in",
    ar: "استرداد 50٪ إذا ألغيت قبل 24 ساعة من الوصول",
  },
  {
    en: "Full refund if cancelled 3 days before check-in",
    ar: "استرداد كامل إذا ألغيت قبل 3 أيام من الوصول",
  },
  {
    en: "50% refund if cancelled 48h before check-in",
    ar: "استرداد 50٪ إذا ألغيت قبل 48 ساعة من الوصول",
  },
  {
    en: "No refund after confirmation",
    ar: "لا استرداد بعد التأكيد",
  },
  {
    en: "No refund within 48 hours of check-in",
    ar: "لا استرداد خلال 48 ساعة من تسجيل الوصول",
  },
  {
    en: "Guest must notify host at least 3 days in advance",
    ar: "يجب على الضيف إخطار المضيف قبل 3 أيام على الأقل",
  },
  {
    en: "Refund processed within 7 business days",
    ar: "تتم معالجة المبالغ المستردة خلال 7 أيام عمل",
  },
  {
    en: "Force majeure exceptions apply",
    ar: "تطبق استثناءات القوة القاهرة",
  },
];

// ─── Schema stored in formData.cancellation_policy ────────────────────────────
// {
//   type: "flexible" | "moderate" | "strict" | "custom",
//   descriptionEn: string,
//   descriptionAr: string,
//   // legacy flat fields kept for backward compat
//   description: string,
//   rules: string[],
//   // bilingual rule pairs
//   rulePairs: { en: string, ar: string }[],
// }

import { useState } from "react";

export function CancellationPolicySection({
  formData,
  setFormData,
  isAr,
  bodyFontClass,
  fieldInput,
}) {
  // ── Normalize legacy policy shape ──────────────────────────────────────────
  const rawPolicy = formData.cancellation_policy ?? {
    type: "flexible",
    descriptionEn: "",
    descriptionAr: "",
    rulePairs: [],
  };

  // If stored with old flat schema, migrate on the fly
  const policy = {
    type: rawPolicy.type ?? "flexible",
    descriptionEn: rawPolicy.descriptionEn ?? rawPolicy.description ?? "",
    descriptionAr: rawPolicy.descriptionAr ?? rawPolicy.description ?? "",
    rulePairs: rawPolicy.rulePairs ?? (rawPolicy.rules ?? []).map((r) => ({ en: r, ar: r })),
  };

  // ── Write helper ────────────────────────────────────────────────────────────
  const setPolicy = (updates) =>
    setFormData((p) => ({
      ...p,
      cancellation_policy: { ...policy, ...updates },
    }));

  // ── Apply a preset ──────────────────────────────────────────────────────────
  const applyPreset = (preset) => {
    if (preset.id === "custom") {
      setPolicy({ type: "custom", descriptionEn: "", descriptionAr: "", rulePairs: [] });
    } else {
      setPolicy({
        type: preset.id,
        descriptionEn: preset.descEn,
        descriptionAr: preset.descAr,
        rulePairs: preset.rulesEn.map((en, i) => ({ en, ar: preset.rulesAr[i] ?? "" })),
      });
    }
  };

  // ── Rule pair helpers ───────────────────────────────────────────────────────
  const addRulePair = () =>
    setPolicy({ rulePairs: [...policy.rulePairs, { en: "", ar: "" }] });

  const updateRulePair = (i, lang, val) => {
    const pairs = [...policy.rulePairs];
    pairs[i] = { ...pairs[i], [lang]: val };
    setPolicy({ rulePairs: pairs });
  };

  const removeRulePair = (i) =>
    setPolicy({ rulePairs: policy.rulePairs.filter((_, idx) => idx !== i) });

  const addSuggestion = (pair) => {
    const already = policy.rulePairs.some((p) => p.en === pair.en);
    if (!already) setPolicy({ rulePairs: [...policy.rulePairs, { en: pair.en, ar: pair.ar }] });
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const selectedPreset = POLICY_PRESETS.find((p) => p.id === policy.type);
  const [editLang, setEditLang] = useState("en"); // which language the host is editing in the rule inputs

  const hasContent =
    policy.rulePairs.length > 0 ||
    policy.descriptionEn ||
    policy.descriptionAr;

  return (
    <div className="mb-5">
      <label
        className={`block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5 ${bodyFontClass}`}
      >
        {isAr ? "سياسة الإلغاء" : "Cancellation Policy"} *
      </label>

      {/* ── Preset selector ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {POLICY_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              policy.type === preset.id
                ? "border-[#e8c547] bg-[#fdf8e7]"
                : "border-black/10 bg-[#fafaf8] hover:border-black/25"
            } ${bodyFontClass}`}
          >
            <span className="text-lg">{preset.icon}</span>
            <span
              className={`text-[12px] font-semibold ${
                policy.type === preset.id ? "text-[#7a6012]" : "text-[#333]"
              }`}
            >
              {isAr ? preset.labelAr : preset.labelEn}
            </span>
            <span className="text-[11px] text-[#999] leading-snug">
              {isAr ? preset.descAr : preset.descEn}
            </span>
          </button>
        ))}
      </div>

      {/* ── Bilingual description ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label
            className={`block text-[10px] tracking-[0.08em] uppercase text-[#aaa] mb-1 ${bodyFontClass}`}
          >
            🇬🇧 Description (English)
          </label>
          <textarea
            rows={2}
            value={policy.descriptionEn}
            onChange={(e) => setPolicy({ descriptionEn: e.target.value })}
            placeholder="Add any extra details about your cancellation policy..."
            className={`${fieldInput} resize-none`}
            dir="ltr"
          />
        </div>
        <div>
          <label
            className={`block text-[10px] tracking-[0.08em] uppercase text-[#aaa] mb-1 ${bodyFontClass}`}
          >
            🇱🇾 الوصف (عربي)
          </label>
          <textarea
            rows={2}
            value={policy.descriptionAr}
            onChange={(e) => setPolicy({ descriptionAr: e.target.value })}
            placeholder="أضف أي تفاصيل إضافية حول سياسة الإلغاء..."
            className={`${fieldInput} resize-none`}
            dir="rtl"
          />
        </div>
      </div>

      {/* ── Rule pairs ── */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label
            className={`block text-[10px] tracking-[0.08em] uppercase text-[#aaa] ${bodyFontClass}`}
          >
            {isAr ? "بنود السياسة (ثنائي اللغة)" : "Policy Rules (bilingual)"}
          </label>
          {/* Toggle which lang shows in the input fields */}
          <div className="flex items-center gap-1 bg-[#f0efe9] rounded-full p-0.5">
            {["en", "ar"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setEditLang(l)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border-none cursor-pointer transition-all ${
                  editLang === l
                    ? "bg-[#1a1a2e] text-[#e8c547]"
                    : "bg-transparent text-[#999]"
                } ${bodyFontClass}`}
              >
                {l === "en" ? "🇬🇧 EN" : "🇱🇾 AR"}
              </button>
            ))}
          </div>
        </div>

        {policy.rulePairs.map((pair, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <div className="w-5 h-5 rounded shrink-0 bg-[#e8c547] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5l2.5 2.5L8 2.5"
                  stroke="#1a1a2e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <input
                type="text"
                value={pair.en}
                onChange={(e) => updateRulePair(i, "en", e.target.value)}
                placeholder="Rule in English..."
                className={`${fieldInput} text-[12px] ${editLang === "ar" ? "hidden" : ""}`}
                dir="ltr"
              />
              <input
                type="text"
                value={pair.ar}
                onChange={(e) => updateRulePair(i, "ar", e.target.value)}
                placeholder="البند بالعربية..."
                className={`${fieldInput} text-[12px] ${editLang === "en" ? "hidden" : ""}`}
                dir="rtl"
              />
              {/* Always show both as small pills so host can see both */}
              <div className="flex gap-2 flex-wrap">
                {pair.en && (
                  <span className="text-[10px] bg-[#e8f4ff] text-[#1a5fa5] rounded px-2 py-0.5 font-mono">
                    🇬🇧 {pair.en}
                  </span>
                )}
                {pair.ar && (
                  <span className="text-[10px] bg-[#fdf8e7] text-[#7a6012] rounded px-2 py-0.5" dir="rtl">
                    🇱🇾 {pair.ar}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRulePair(i)}
              className="bg-transparent border-none text-[#e05a5a] text-lg cursor-pointer px-2"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Quick-add bilingual suggestions */}
        <div className="mt-3 mb-2">
          <div
            className={`text-[10px] tracking-[0.08em] uppercase text-[#bbb] mb-2 ${bodyFontClass}`}
          >
            {isAr ? "إضافة سريعة" : "Quick add"}
          </div>
          <div className="flex flex-wrap gap-2">
            {RULE_PAIRS.map((pair) => {
              const active = policy.rulePairs.some((p) => p.en === pair.en);
              return (
                <button
                  key={pair.en}
                  type="button"
                  onClick={() => addSuggestion(pair)}
                  className={`border rounded-full px-3 py-1 text-[11px] cursor-pointer transition-colors ${bodyFontClass} ${
                    active
                      ? "bg-[#e8c547] text-[#1a1a2e] border-[#e8c547]"
                      : "border-black/10 bg-[#fafaf8] text-[#888] hover:border-[#e8c547] hover:text-[#7a6012]"
                  }`}
                >
                  + {isAr ? pair.ar : pair.en}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={addRulePair}
          className={`text-xs text-[#e8c547] bg-transparent border border-dashed border-[#e8c547]/50 rounded-lg cursor-pointer py-2 px-3 mt-2 w-full hover:border-[#e8c547] transition-colors ${bodyFontClass}`}
        >
          + {isAr ? "إضافة بند مخصص (ثنائي اللغة)" : "Add custom bilingual rule"}
        </button>
      </div>

      {/* ── Live preview (bilingual) ── */}
      {hasContent && (
        <div className="mt-4 bg-[#1a1a2e] rounded-2xl p-4 border-l-4 border-[#e8c547]">
          <div
            className={`text-[10px] tracking-[0.1em] uppercase text-[#e8c547]/60 mb-3 ${bodyFontClass}`}
          >
            {isAr ? "معاينة — ما سيراه الضيف" : "Preview — what guests will see"}
          </div>

          {/* English preview */}
          <div className="mb-4">
            <div className={`flex items-center gap-2 mb-2 ${bodyFontClass}`}>
              <span className="text-[11px] text-white/30">🇬🇧</span>
              <span className="text-base">{selectedPreset?.icon}</span>
              <span className="text-[13px] font-semibold text-white">
                {selectedPreset?.labelEn} Cancellation Policy
              </span>
            </div>
            {policy.descriptionEn && (
              <p className={`text-[12px] text-white/60 mb-2 italic ${bodyFontClass}`} dir="ltr">
                {policy.descriptionEn}
              </p>
            )}
            <ul className="flex flex-col gap-1.5" dir="ltr">
              {policy.rulePairs.filter((p) => p.en).map((pair, i) => (
                <li key={i} className={`flex items-start gap-2 text-[12px] text-white/75 ${bodyFontClass}`}>
                  <span className="text-[#e8c547] shrink-0 mt-0.5">•</span>
                  {pair.en}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-white/10 my-3" />

          {/* Arabic preview */}
          <div>
            <div className={`flex items-center gap-2 mb-2 ${bodyFontClass}`} dir="rtl">
              <span className="text-[11px] text-white/30">🇱🇾</span>
              <span className="text-base">{selectedPreset?.icon}</span>
              <span className="text-[13px] font-semibold text-white">
                سياسة الإلغاء — {selectedPreset?.labelAr}
              </span>
            </div>
            {policy.descriptionAr && (
              <p
                className={`text-[12px] text-white/60 mb-2 italic ${bodyFontClass}`}
                dir="rtl"
              >
                {policy.descriptionAr}
              </p>
            )}
            <ul className="flex flex-col gap-1.5" dir="rtl">
              {policy.rulePairs.filter((p) => p.ar).map((pair, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 text-[12px] text-white/75 ${bodyFontClass}`}
                >
                  <span className="text-[#e8c547] shrink-0 mt-0.5">•</span>
                  {pair.ar}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}