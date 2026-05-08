// app/verify-email-pending/page.jsx (Both languages always visible)
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailPendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* English Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Please Verify Your Email
            </h1>
            
            <p className="text-gray-600 mb-2">
              We've sent a verification link to:
            </p>
            
            <p className="text-amber-600 font-semibold mb-6 break-all">
              {email || "your email address"}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                📧 Check your inbox and click the verification link to activate your account.
                <br />
                <span className="text-xs text-amber-600">(Check your spam folder if you don't see it)</span>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-6"></div>

          {/* Arabic Section */}
          <div className="text-center" style={{ direction: 'rtl' }}>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              يرجى تأكيد بريدك الإلكتروني
            </h1>
            
            <p className="text-gray-600 mb-2">
              لقد أرسلنا رابط التحقق إلى:
            </p>
            
            <p className="text-amber-600 font-semibold mb-6 break-all">
              {email || "بريدك الإلكتروني"}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                📧 تحقق من صندوق الوارد واضغط على رابط التحقق لتفعيل حسابك.
                <br />
                <span className="text-xs text-amber-600">(تحقق من مجلد البريد العشوائي إذا لم تجده)</span>
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition duration-200 text-center mt-6"
          >
            Go to Login / تسجيل الدخول
          </Link>

          <div className="mt-4 text-center">
            <Link 
              href="/resend-verification" 
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              Didn't receive the email? Click here to resend / لم تستلم البريد الإلكتروني؟ اضغط هنا لإعادة الإرسال
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailPendingContent />
    </Suspense>
  );
}