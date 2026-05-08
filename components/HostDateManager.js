'use client';

import { useState, useEffect } from 'react';

const getLocalDateString = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// ─── HostCalendar ─────────────────────────────────────────────────────────────
function HostCalendar({ blockedDates, bookings, onRangeSelect, existingBlockedRanges }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [blockedDatesSet, setBlockedDatesSet] = useState(new Set());
  const [bookedDatesMap, setBookedDatesMap] = useState(new Map());

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

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const WEEK_DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

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

  return (
    <>
      <style jsx>{`
        .hc-wrap { background: #fff; border-radius: 16px; border: 1.5px solid #e5e5e5; padding: 20px; user-select: none; }
        .hc-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .hc-nav-btn { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #e5e5e5; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #222; transition: border-color 0.15s; }
        .hc-nav-btn:hover { border-color: #222; }
        .hc-month { font-size: 15px; font-weight: 700; color: #222; }
        .hc-weekdays { display: grid; grid-template-columns: repeat(7,1fr); margin-bottom: 8px; }
        .hc-weekday { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #717171; padding: 4px 0; }
        .hc-days { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
        .hc-day {
          position: relative; aspect-ratio: 1; border: none; font-size: 13px; font-family: inherit;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: background 0.1s; cursor: pointer;
        }
        .hc-day.available:hover { background: #f0f0f0; }
        .hc-day.sel-start, .hc-day.sel-end { background: #1a1a2e !important; color: #e8c547 !important; font-weight: 700; border-radius: 50%; }
        .hc-day.in-range { background: rgba(232,197,71,0.15); border-radius: 0; color: #222; }
        .hc-day.range-s { border-radius: 50% 0 0 50%; }
        .hc-day.range-e { border-radius: 0 50% 50% 0; }
        .hc-day.blocked-d { background: #ebebeb; color: #999; cursor: not-allowed; text-decoration: line-through; }
        .hc-day.confirmed-d { background: #FCEBEB; color: #791F1F; cursor: not-allowed; text-decoration: line-through; }
        .hc-day.pending-d { background: #FAEEDA; color: #633806; cursor: not-allowed; text-decoration: line-through; }
        .hc-day.past-d { color: #ccc; cursor: not-allowed; }
        .hc-day.other-m { color: #ddd; cursor: default; }
        .hc-dot { position: absolute; top: 3px; right: 3px; width: 5px; height: 5px; border-radius: 50%; }
        .hc-selection { margin-top: 14px; padding: 12px 14px; background: #f7f7f7; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
        .hc-sel-text { font-size: 13px; color: #222; font-weight: 500; }
        .hc-clear { font-size: 12px; color: #717171; background: none; border: none; cursor: pointer; font-weight: 500; text-decoration: underline; }
        .hc-legend { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; display: flex; flex-wrap: wrap; gap: 8px 16px; }
        .hc-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #717171; }
        .hc-swatch { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
      `}</style>
      <div className="hc-wrap">
        <div className="hc-nav">
          <button className="hc-nav-btn" onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth()-1); setCurrentMonth(d); }}>←</button>
          <span className="hc-month">{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button className="hc-nav-btn" onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth()+1); setCurrentMonth(d); }}>→</button>
        </div>
        <div className="hc-weekdays">{WEEK_DAYS.map(d => <div key={d} className="hc-weekday">{d}</div>)}</div>
        <div className="hc-days">
          {days.map(({ date, isCurrentMonth }, i) => {
            const status = getBookingStatus(date);
            const blocked = isBlocked(date);
            const past = isPast(date);
            const sel = isSelected(date);
            const inRange = isInRange(date);
            const avail = isAvailable(date);
            const start = isStart(date);
            const end = isEnd(date);

            let cls = "hc-day";
            if (!isCurrentMonth) cls += " other-m";
            else if (start && selectedEndDate) cls += " sel-start in-range range-s";
            else if (end) cls += " sel-end in-range range-e";
            else if (start) cls += " sel-start";
            else if (inRange) cls += " in-range";
            else if (blocked) cls += " blocked-d";
            else if (status === "confirmed") cls += " confirmed-d";
            else if (status === "pending") cls += " pending-d";
            else if (past) cls += " past-d";
            else if (isCurrentMonth) cls += " available";

            return (
              <button key={i} type="button" className={cls} style={{ opacity: !isCurrentMonth ? 0.3 : 1 }}
                onClick={() => isCurrentMonth && handleDateClick(date)}
                onMouseEnter={() => { if (avail && selectedStartDate && !selectedEndDate && date > selectedStartDate) setHoverDate(date); }}
                onMouseLeave={() => setHoverDate(null)}
                disabled={!avail && isCurrentMonth}
                title={blocked ? "Blocked by you" : status === "confirmed" ? "Confirmed booking" : status === "pending" ? "Pending booking" : past ? "Past date" : "Available to block"}
              >
                {date.getDate()}
                {status === "pending" && <span className="hc-dot" style={{ background: "#e8c547" }} />}
                {status === "confirmed" && <span className="hc-dot" style={{ background: "#A32D2D" }} />}
              </button>
            );
          })}
        </div>

        {(selectedStartDate || selectedEndDate) && (
          <div className="hc-selection">
            <span className="hc-sel-text">
              {selectedStartDate?.toLocaleDateString()}{selectedEndDate ? ` → ${selectedEndDate.toLocaleDateString()}` : ""}
            </span>
            <button className="hc-clear" onClick={clearSelection}>Clear</button>
          </div>
        )}

        <div className="hc-legend">
          {[
            { bg: "#fff", border: "1.5px solid #ddd", label: "Available" },
            { bg: "#1a1a2e", label: "Selected" },
            { bg: "rgba(232,197,71,0.15)", label: "Range" },
            { bg: "#ebebeb", label: "Blocked by you" },
            { bg: "#FAEEDA", label: "Pending" },
            { bg: "#FCEBEB", label: "Confirmed" },
            { bg: "#f0f0f0", label: "Past" },
          ].map(({ bg, border, label }) => (
            <div key={label} className="hc-legend-item">
              <span className="hc-swatch" style={{ background: bg, border: border || "none" }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── HostDateManager ──────────────────────────────────────────────────────────
export default function HostDateManager({ listingId, blockedDates, bookings, onDatesUpdated }) {
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleBlockSubmit = async () => {
    if (!selectedRange) { setError('Please select a date range on the calendar'); return; }
    setLoading(true); setError(''); setSuccess('');
    const start = new Date(selectedRange.startDate), end = new Date(selectedRange.endDate);
    if (start >= end) { setError('End date must be after start date'); setLoading(false); return; }
    if (start < new Date()) { setError('Cannot block past dates'); setLoading(false); return; }
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: selectedRange.startDate, endDate: selectedRange.endDate, reason: reason || 'Blocked by host' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Dates blocked successfully!');
      setSelectedRange(null); setReason(''); setShowBlockForm(false);
      onDatesUpdated?.();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRemoveBlock = async (blockId) => {
    if (!confirm('Remove this blocked date range?')) return;
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Blocked dates removed!');
      onDatesUpdated?.();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const fmtDate = (s) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <style jsx>{`
        .hdm-wrap { margin-top: 20px; }
        .hdm-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .hdm-title { font-size: 15px; font-weight: 700; color: #222; margin-bottom: 4px; }
        .hdm-sub { font-size: 12px; color: #717171; display: flex; align-items: center; gap: 12px; }
        .hdm-sub-dot { display: inline-flex; align-items: center; gap: 5px; }
        .hdm-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .hdm-block-btn {
          background: #1a1a2e; color: #e8c547; border: none; border-radius: 24px;
          padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: opacity 0.15s;
        }
        .hdm-block-btn:hover { opacity: 0.85; }
        .hdm-block-btn.cancel { background: #f7f7f7; color: #717171; }
        .hdm-form { background: #f7f7f7; border-radius: 16px; padding: 20px; margin-bottom: 16px; border: 1.5px solid #f0f0f0; }
        .hdm-form-label { font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: #717171; margin-bottom: 8px; display: block; }
        .hdm-form-input {
          width: 100%; padding: 10px 14px; background: #fff; border: 1.5px solid #e5e5e5;
          border-radius: 10px; font-size: 14px; color: #222; outline: none; font-family: inherit;
          transition: border-color 0.15s;
        }
        .hdm-form-input:focus { border-color: #e8c547; }
        .hdm-selected-range { margin-top: 14px; padding: 12px 16px; background: #fff; border: 1.5px solid #e8c547; border-radius: 10px; font-size: 13px; font-weight: 600; color: #222; }
        .hdm-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
        .hdm-btn-cancel { background: #fff; color: #717171; border: 1.5px solid #e5e5e5; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: border-color 0.15s; }
        .hdm-btn-cancel:hover { border-color: #aaa; }
        .hdm-btn-submit { background: #1a1a2e; color: #e8c547; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .hdm-btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .hdm-alert-err { background: #FCEBEB; border: 1.5px solid rgba(163,45,45,0.2); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #791F1F; margin-top: 10px; }
        .hdm-alert-ok { background: #EAF3DE; border: 1.5px solid rgba(39,80,10,0.15); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #27500A; margin-top: 10px; }
        .hdm-blocks-title { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #999; margin-bottom: 10px; }
        .hdm-blocks { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
        .hdm-block-item { background: #FCEBEB; border: 1.5px solid rgba(163,45,45,0.12); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
        .hdm-block-dates { font-size: 13px; color: #791F1F; font-weight: 600; }
        .hdm-block-reason { font-size: 12px; color: #A32D2D; margin-top: 3px; opacity: 0.75; }
        .hdm-remove-btn { background: none; border: none; color: #A32D2D; font-size: 12px; cursor: pointer; font-weight: 600; text-decoration: underline; flex-shrink: 0; }
      `}</style>

      <div className="hdm-wrap">
        <div className="hdm-header">
          <div>
            <div className="hdm-title">Manage Blocked Dates</div>
            <div className="hdm-sub">
              <span className="hdm-sub-dot"><span className="hdm-dot" style={{ background: "#e8c547" }} /> Pending</span>
              <span className="hdm-sub-dot"><span className="hdm-dot" style={{ background: "#A32D2D" }} /> Confirmed</span>
              <span className="hdm-sub-dot"><span className="hdm-dot" style={{ background: "#ebebeb", border: "1px solid #ddd" }} /> Blocked</span>
            </div>
          </div>
          <button className={`hdm-block-btn${showBlockForm ? " cancel" : ""}`} onClick={() => { setShowBlockForm(!showBlockForm); setSelectedRange(null); setReason(''); }}>
            {showBlockForm ? 'Cancel' : '+ Block Dates'}
          </button>
        </div>

        {showBlockForm && (
          <div className="hdm-form">
            <label className="hdm-form-label">Select date range to block</label>
            <HostCalendar
              blockedDates={blockedDates}
              bookings={bookings}
              onRangeSelect={setSelectedRange}
              existingBlockedRanges={blockedDates}
            />

            {selectedRange && (
              <div className="hdm-selected-range">
                📅 {fmtDate(selectedRange.startDate)} → {fmtDate(selectedRange.endDate)}
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <label className="hdm-form-label">Reason (optional)</label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Maintenance, Personal use…" className="hdm-form-input" />
            </div>

            {error && <div className="hdm-alert-err">{error}</div>}
            {success && <div className="hdm-alert-ok">{success}</div>}

            <div className="hdm-form-actions">
              <button className="hdm-btn-cancel" onClick={() => { setShowBlockForm(false); setSelectedRange(null); setReason(''); }}>Cancel</button>
              <button className="hdm-btn-submit" disabled={loading || !selectedRange} onClick={handleBlockSubmit}>
                {loading ? 'Blocking…' : 'Block Selected Dates'}
              </button>
            </div>
          </div>
        )}

        {success && !showBlockForm && <div className="hdm-alert-ok">{success}</div>}
        {error && !showBlockForm && <div className="hdm-alert-err">{error}</div>}

        {blockedDates?.length > 0 && (
          <div className="hdm-blocks">
            <div className="hdm-blocks-title">Currently blocked</div>
            {blockedDates.map((block, i) => (
              <div key={i} className="hdm-block-item">
                <div>
                  <div className="hdm-block-dates">{fmtDate(block.startDate)} → {fmtDate(block.endDate)}</div>
                  {block.reason && <div className="hdm-block-reason">{block.reason}</div>}
                </div>
                <button className="hdm-remove-btn" onClick={() => handleRemoveBlock(block._id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}