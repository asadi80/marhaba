// app/resend-verification/page.jsx (updated)
"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(isAr 
          ? "✓ تم إرسال بريد التحقق! يرجى التحقق من صندوق الوارد الخاص بك." 
          : "✓ Verification email sent! Please check your inbox.");
        setEmail("");
      } else {
        setError(data.message || (isAr ? "فشل إرسال بريد التحقق" : "Failed to send verification email"));
      }
    } catch (error) {
      setError(isAr ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* English Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Resend Verification Email</h2>
            <p className="text-gray-600 mt-2">
              Enter your email to receive a new verification link
            </p>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-6"></div>

          {/* Arabic Section */}
          <div className="text-center mb-8" style={{ direction: 'rtl' }}>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">إعادة إرسال بريد التحقق</h2>
            <p className="text-gray-600 mt-2">
              أدخل بريدك الإلكتروني لاستلام رابط تحقق جديد
            </p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address / البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="you@example.com / example@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isAr ? "جاري الإرسال..." : "Sending...") 
                : (isAr ? "إعادة إرسال بريد التحقق" : "Resend Verification Email")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-amber-600 hover:text-amber-700">
              {isAr ? "العودة إلى تسجيل الدخول" : "Back to Login"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}