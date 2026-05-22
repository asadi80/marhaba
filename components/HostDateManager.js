//commponent/HostDateManger
'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';



const getLocalDateString = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// ─── HostCalendar ─────────────────────────────────────────────────────────────
function HostCalendar({ blockedDates, bookings, onRangeSelect, existingBlockedRanges, language = 'en' }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [blockedDatesSet, setBlockedDatesSet] = useState(new Set());
  const [bookedDatesMap, setBookedDatesMap] = useState(new Map());

  const translations = {
    en: {
      monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      weekDays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      clear: "Clear",
      available: "Available",
      selected: "Selected",
      range: "Range",
      blocked: "Blocked by you",
      pending: "Pending",
      confirmed: "Confirmed",
      past: "Past"
    },
    ar: {
      monthNames: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
      weekDays: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
      clear: "مسح",
      available: "متاح",
      selected: "محدد",
      range: "نطاق",
      blocked: "محظور بواسطتك",
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      past: "ماضي"
    }
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    const blocked = new Set();
    existingBlockedRanges?.forEach(range => {
      let current = new Date(range.startDate);
      const end = new Date(range.endDate);
      while (current < end) { blocked.add(getLocalDateString(current)); current.setDate(current.getDate() + 1); }
    });
    setBlockedDatesSet(blocked);
  }, [existingBlockedRanges]);

  useEffect(() => {
    const booked = new Map();
    bookings?.forEach(booking => {
      let current = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      while (current < end) { const s = getLocalDateString(current); if (!booked.has(s)) booked.set(s, booking.status); current.setDate(current.getDate() + 1); }
    });
    setBookedDatesMap(booked);
  }, [bookings]);

  const isBlocked = (d) => blockedDatesSet.has(getLocalDateString(d));
  const getBookingStatus = (d) => bookedDatesMap.get(getLocalDateString(d));
  const isBooked = (d) => bookedDatesMap.has(getLocalDateString(d));
  const isPast = (d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t; };
  const isAvailable = (d) => !isBlocked(d) && !isBooked(d) && !isPast(d);
  const isInRange = (d) => {
    if (!selectedStartDate || selectedEndDate || !hoverDate) return false;
    return d > selectedStartDate && d <= hoverDate;
  };
  const isSelected = (d) => {
    if (!selectedStartDate) return false;
    if (selectedEndDate) return d >= selectedStartDate && d <= selectedEndDate;
    return d.getTime() === selectedStartDate.getTime();
  };
  const isStart = (d) => selectedStartDate && d.getTime() === selectedStartDate.getTime();
  const isEnd = (d) => selectedEndDate && d.getTime() === selectedEndDate.getTime();

  const handleDateClick = (date) => {
    if (!isAvailable(date)) return;
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date); setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (date > selectedStartDate) {
        setSelectedEndDate(date);
        onRangeSelect({ startDate: getLocalDateString(selectedStartDate), endDate: getLocalDateString(date) });
      } else { setSelectedStartDate(date); }
    }
  };

  const getDaysInMonth = (date) => {
    const y = date.getFullYear(), m = date.getMonth();
    const firstDay = new Date(y, m, 1), lastDay = new Date(y, m + 1, 0);
    const days = [];
    for (let i = firstDay.getDay() - 1; i >= 0; i--) days.push({ date: new Date(y, m, -i), isCurrentMonth: false });
    for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(y, m, i), isCurrentMonth: true });
    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++) days.push({ date: new Date(y, m + 1, i), isCurrentMonth: false });
    return days;
  };

  const clearSelection = () => { setSelectedStartDate(null); setSelectedEndDate(null); setHoverDate(null); };
  const days = getDaysInMonth(currentMonth);

  const getDayClasses = (date, isCurrentMonth) => {
    const status = getBookingStatus(date);
    const blocked = isBlocked(date);
    const past = isPast(date);
    const avail = isAvailable(date);
    const start = isStart(date);
    const end = isEnd(date);
    const inRange = isInRange(date);
    const hasEnd = !!selectedEndDate;

    const base = `relative aspect-square border-0 text-[13px] flex items-center justify-center transition-all duration-100 cursor-pointer ${isRTL ? 'font-[\'Cairo\',\'Tajawal\',sans-serif]' : ''}`;

    if (!isCurrentMonth) return `${base} opacity-30 cursor-default`;
    if (start && hasEnd) return `${base} !bg-[#1a1a2e] !text-[#e8c547] font-bold ${isRTL ? 'rounded-r-full' : 'rounded-l-full'}`;
    if (end) return `${base} !bg-[#1a1a2e] !text-[#e8c547] font-bold ${isRTL ? 'rounded-l-full' : 'rounded-r-full'}`;
    if (start) return `${base} !bg-[#1a1a2e] !text-[#e8c547] font-bold rounded-full`;
    if (inRange) return `${base} bg-[#e8c547]/15 text-[#222] rounded-none`;
    if (blocked) return `${base} bg-[#ebebeb] text-[#999] cursor-not-allowed line-through rounded-full`;
    if (status === "confirmed") return `${base} bg-[#FCEBEB] text-[#791F1F] cursor-not-allowed line-through rounded-full`;
    if (status === "pending") return `${base} bg-[#FAEEDA] text-[#633806] cursor-not-allowed line-through rounded-full`;
    if (past) return `${base} text-[#ccc] cursor-not-allowed`;
    return `${base} hover:bg-[#f0f0f0] text-[#222] rounded-full`;
  };

  return (
    <div 
      className={`bg-white rounded-2xl border-[1.5px] border-[#e5e5e5] p-5 select-none ${isRTL ? 'text-right' : ''}`} 
      dir={isRTL ? 'rtl' : 'ltr'}
      style={isRTL ? { fontFamily: "'Cairo', 'Tajawal', sans-serif" } : {}}
    >
      <div className="flex justify-between items-center mb-5">
        <button
          className="w-8 h-8 rounded-full border-[1.5px] border-[#e5e5e5] bg-white cursor-pointer flex items-center justify-center text-sm text-[#222] hover:border-[#222] transition-colors"
          onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth()-1); setCurrentMonth(d); }}
        >{isRTL ? '→' : '←'}</button>
        <span className="text-[15px] font-bold text-[#222]">
          {t.monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          className="w-8 h-8 rounded-full border-[1.5px] border-[#e5e5e5] bg-white cursor-pointer flex items-center justify-center text-sm text-[#222] hover:border-[#222] transition-colors"
          onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth()+1); setCurrentMonth(d); }}
        >{isRTL ? '←' : '→'}</button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {t.weekDays.map(d => (
          <div key={d} className="text-center text-[11px] font-bold tracking-[0.05em] text-[#717171] py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map(({ date, isCurrentMonth }, i) => {
          const status = getBookingStatus(date);
          const avail = isAvailable(date);
          return (
            <button
              key={i}
              type="button"
              className={getDayClasses(date, isCurrentMonth)}
              style={{ opacity: !isCurrentMonth ? 0.3 : 1 }}
              onClick={() => isCurrentMonth && handleDateClick(date)}
              onMouseEnter={() => { if (avail && selectedStartDate && !selectedEndDate && date > selectedStartDate) setHoverDate(date); }}
              onMouseLeave={() => setHoverDate(null)}
              disabled={!avail && isCurrentMonth}
            >
              {date.getDate()}
              {status === "pending" && <span className="absolute top-[3px] right-[3px] w-[5px] h-[5px] rounded-full bg-[#e8c547]" />}
              {status === "confirmed" && <span className="absolute top-[3px] right-[3px] w-[5px] h-[5px] rounded-full bg-[#A32D2D]" />}
            </button>
          );
        })}
      </div>

      {(selectedStartDate || selectedEndDate) && (
        <div className="mt-3.5 px-3.5 py-3 bg-[#f7f7f7] rounded-[10px] flex justify-between items-center">
          <span className="text-[13px] text-[#222] font-medium">
            {selectedStartDate?.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}{selectedEndDate ? ` → ${selectedEndDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}` : ""}
          </span>
          <button className="text-[12px] text-[#717171] bg-none border-none cursor-pointer font-medium underline" onClick={clearSelection}>{t.clear}</button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[#f0f0f0] flex flex-wrap gap-x-4 gap-y-2">
        {[
          { bg: "bg-white border border-[#ddd]", label: t.available },
          { bg: "bg-[#1a1a2e]", label: t.selected },
          { bg: "bg-[#e8c547]/15", label: t.range },
          { bg: "bg-[#ebebeb]", label: t.blocked },
          { bg: "bg-[#FAEEDA]", label: t.pending },
          { bg: "bg-[#FCEBEB]", label: t.confirmed },
          { bg: "bg-[#f0f0f0]", label: t.past },
        ].map(({ bg, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[11px] text-[#717171]">
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${bg}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HostDateManager ──────────────────────────────────────────────────────────
export default function HostDateManager({ listingId, blockedDates, bookings, onDatesUpdated, language = "en" }) {
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get language from cookies on mount
  useEffect(() => {
    
    // Optional: Listen for language changes
    const handleLanguageChange = () => {
      setLanguage(getLanguageFromCookies());
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const translations = {
    en: {
      manageBlockedDates: "Manage Blocked Dates",
      pending: "Pending",
      confirmed: "Confirmed",
      blocked: "Blocked",
      blockDates: "Block Dates",
      cancel: "Cancel",
      selectDateRange: "Select date range to block",
      reasonOptional: "Reason (optional)",
      reasonPlaceholder: "e.g. Maintenance, Personal use…",
      blockSelected: "Block Selected Dates",
      blocking: "Blocking…",
      currentlyBlocked: "Currently blocked",
      remove: "Remove",
      pleaseSelectRange: "Please select a date range on the calendar",
      endDateAfterStart: "End date must be after start date",
      cannotBlockPast: "Cannot block past dates",
      datesBlocked: "Dates blocked successfully!",
      removeConfirmation: "Remove this blocked date range?",
      blockedRemoved: "Blocked dates removed!"
    },
    ar: {
      manageBlockedDates: "إدارة التواريخ المحظورة",
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      blocked: "محظور",
      blockDates: "حظر التواريخ",
      cancel: "إلغاء",
      selectDateRange: "حدد نطاق التاريخ للحظر",
      reasonOptional: "السبب (اختياري)",
      reasonPlaceholder: "مثال: صيانة، استخدام شخصي...",
      blockSelected: "حظر التواريخ المحددة",
      blocking: "جاري الحظر...",
      currentlyBlocked: "المحظور حالياً",
      remove: "إزالة",
      pleaseSelectRange: "الرجاء تحديد نطاق تاريخ على التقويم",
      endDateAfterStart: "يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء",
      cannotBlockPast: "لا يمكن حظر التواريخ الماضية",
      datesBlocked: "تم حظر التواريخ بنجاح!",
      removeConfirmation: "هل تريد إزالة نطاق التاريخ المحظور؟",
      blockedRemoved: "تم إزالة التواريخ المحظورة!"
    }
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  const handleBlockSubmit = async () => {
    if (!selectedRange) { setError(t.pleaseSelectRange); return; }
    setLoading(true); setError(''); setSuccess('');
    const start = new Date(selectedRange.startDate), end = new Date(selectedRange.endDate);
    if (start >= end) { setError(t.endDateAfterStart); setLoading(false); return; }
    if (start < new Date()) { setError(t.cannotBlockPast); setLoading(false); return; }
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: selectedRange.startDate, endDate: selectedRange.endDate, reason: reason || (language === 'ar' ? 'محظور بواسطة المضيف' : 'Blocked by host') }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(t.datesBlocked);
      setSelectedRange(null); setReason(''); setShowBlockForm(false);
      onDatesUpdated?.();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRemoveBlock = async (blockId) => {
    if (!confirm(t.removeConfirmation)) return;
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(t.blockedRemoved);
      onDatesUpdated?.();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const fmtDate = (s) => new Date(s).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div 
      className={`mt-5 ${isRTL ? 'font-[\'Cairo\',\'Tajawal\',sans-serif]' : ''}`} 
      dir={isRTL ? 'rtl' : 'ltr'}
      style={isRTL ? { fontFamily: "'Cairo', 'Tajawal', sans-serif" } : {}}
    >
      <div className="flex flex-col justify-between justify-center mb-4">
        <div>
          <div className="text-[15px] font-bold text-[#222] mb-1">{t.manageBlockedDates}</div>
          <div className="text-[12px] text-[#717171] flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#e8c547] flex-shrink-0" /> {t.pending}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A32D2D] flex-shrink-0" /> {t.confirmed}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ebebeb] border border-[#ddd] flex-shrink-0" /> {t.blocked}
            </span>
          </div>
        </div>
        <button
          className={`rounded-3xl px-[18px] py-2 text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-opacity mt-2 hover:opacity-85 border-0 ${
            showBlockForm ? 'bg-[#f7f7f7] text-[#717171]' : 'bg-[#1a1a2e] text-[#e8c547]'
          }`}
          onClick={() => { setShowBlockForm(!showBlockForm); setSelectedRange(null); setReason(''); }}
        >
          {showBlockForm ? t.cancel : `+ ${t.blockDates}`}
        </button>
      </div>

      {showBlockForm && (
        <div className="bg-[#f7f7f7] rounded-2xl p-5 mb-4 border-[1.5px] border-[#f0f0f0]">
          <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-[#717171] mb-2">
            {t.selectDateRange}
          </label>
          <HostCalendar
            blockedDates={blockedDates}
            bookings={bookings}
            onRangeSelect={setSelectedRange}
            existingBlockedRanges={blockedDates}
            language={language}
          />

          {selectedRange && (
            <div className="mt-3.5 px-4 py-3 bg-white border-[1.5px] border-[#e8c547] rounded-[10px] text-[13px] font-semibold text-[#222]">
              📅 {fmtDate(selectedRange.startDate)} → {fmtDate(selectedRange.endDate)}
            </div>
          )}

          <div className="mt-3.5">
            <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-[#717171] mb-2">
              {t.reasonOptional}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.reasonPlaceholder}
              className="w-full px-3.5 py-2.5 bg-white border-[1.5px] border-[#e5e5e5] rounded-[10px] text-[14px] text-[#222] outline-none transition-colors focus:border-[#e8c547]"
            />
          </div>

          {error && (
            <div className="bg-[#FCEBEB] border-[1.5px] border-[#A32D2D]/20 rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#791F1F] mt-2.5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-[#EAF3DE] border-[1.5px] border-[#27500A]/15 rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#27500A] mt-2.5">
              {success}
            </div>
          )}

          <div className="flex justify-end gap-2.5 mt-4">
            <button
              className="bg-white text-[#717171] border-[1.5px] border-[#e5e5e5] rounded-[10px] px-5 py-2.5 text-[13px] font-semibold cursor-pointer hover:border-[#aaa] transition-colors"
              onClick={() => { setShowBlockForm(false); setSelectedRange(null); setReason(''); }}
            >
              {t.cancel}
            </button>
            <button
              className="bg-[#1a1a2e] text-[#e8c547] border-0 rounded-[10px] px-5 py-2.5 text-[13px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={loading || !selectedRange}
              onClick={handleBlockSubmit}
            >
              {loading ? t.blocking : t.blockSelected}
            </button>
          </div>
        </div>
      )}

      {success && !showBlockForm && (
        <div className="bg-[#EAF3DE] border-[1.5px] border-[#27500A]/15 rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#27500A] mt-2.5">
          {success}
        </div>
      )}
      {error && !showBlockForm && (
        <div className="bg-[#FCEBEB] border-[1.5px] border-[#A32D2D]/20 rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#791F1F] mt-2.5">
          {error}
        </div>
      )}

      {blockedDates?.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          <div className="text-[12px] font-bold tracking-[0.06em] uppercase text-[#999] mb-2.5">
            {t.currentlyBlocked}
          </div>
          {blockedDates.map((block, i) => (
            <div
              key={i}
              className="bg-[#FCEBEB] border-[1.5px] border-[#A32D2D]/12 rounded-xl px-4 py-3 flex justify-between items-start gap-2.5"
            >
              <div>
                <div className="text-[13px] text-[#791F1F] font-semibold">
                  {fmtDate(block.startDate)} → {fmtDate(block.endDate)}
                </div>
                {block.reason && (
                  <div className="text-[12px] text-[#A32D2D] mt-0.5 opacity-75">{block.reason}</div>
                )}
              </div>
              <button
                className="bg-none border-none text-[#A32D2D] text-[12px] cursor-pointer font-semibold underline flex-shrink-0"
                onClick={() => handleRemoveBlock(block.id)}
              >
                {t.remove}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}