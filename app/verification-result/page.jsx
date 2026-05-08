// app/verification-result/page.jsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

function VerificationResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  
  const verified = searchParams.get("verified");
  const error = searchParams.get("error");
  const role = searchParams.get("role");
  
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (verified === "true") {
      // Start countdown to redirect to login
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [verified, router]);

  // Success state
  if (verified === "true") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              {isAr ? "تم تأكيد البريد الإلكتروني!" : "Email Verified!"}
            </h1>
            
            <p className="text-gray-600 mb-2">
              {isAr 
                ? "تم تأكيد بريدك الإلكتروني بنجاح." 
                : "Your email has been successfully verified."}
            </p>
            
            {role === "host" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
                <p className="text-sm text-yellow-800">
                  {isAr 
                    ? "📝 حساب المضيف الخاص بك قيد المراجعة. ستتلقى بريداً إلكترونياً عند الموافقة عليه." 
                    : "📝 Your host account is pending review. You'll receive an email once approved."}
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
              <p className="text-sm text-blue-800">
                {isAr 
                  ? `سيتم توجيهك إلى صفحة تسجيل الدخول بعد ${countdown} ثواني...` 
                  : `You will be redirected to the login page in ${countdown} seconds...`}
              </p>
            </div>

            <Link
              href="/login"
              className="block w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition duration-200 text-center mt-4"
            >
              {isAr ? "تسجيل الدخول الآن" : "Login Now"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {isAr ? "فشل التحقق" : "Verification Failed"}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error === "invalid-token" && (isAr ? "رمز التحقق غير صالح" : "Invalid verification token")}
            {error === "invalid-expired" && (isAr ? "رمز التحقق منتهي الصلاحية. يرجى طلب رابط جديد." : "Verification link has expired. Please request a new one.")}
            {error === "server-error" && (isAr ? "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى." : "Server error. Please try again.")}
            {!error && (isAr ? "حدث خطأ أثناء التحقق من بريدك الإلكتروني" : "An error occurred while verifying your email")}
          </p>

          <div className="space-y-3">
            <Link
              href="/resend-verification"
              className="block w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition duration-200 text-center"
            >
              {isAr ? "طلب رابط تحقق جديد" : "Request New Verification Link"}
            </Link>
            
            <Link
              href="/login"
              className="block w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition duration-200 text-center"
            >
              {isAr ? "العودة إلى تسجيل الدخول" : "Back to Login"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerificationResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerificationResultContent />
    </Suspense>
  );
}