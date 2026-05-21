import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f6f2]">
      {/* Spinner with gold colors matching the design */}
      <div className="relative mb-6">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#e8c547]/20 border-t-[#e8c547] border-r-[#e8c547]/60 animate-spin" />
      </div>
      
      {/* "مرحبا" text with "مر" in black and "حبا" in gold */}
      <div className="font-['Cairo','Tajawal',sans-serif] font-medium text-[26px] tracking-[1px]">
        <span className="text-black">مر</span>
        <span className="font-bold text-[#e8c547]">حبا</span>
      </div>
      
      {/* Optional subtle loading dots for extra flair */}
      <div className="flex gap-1 mt-4">
        <div className="w-1.5 h-1.5 rounded-full bg-[#e8c547]/40 animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#e8c547]/60 animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#e8c547] animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default LoadingScreen;