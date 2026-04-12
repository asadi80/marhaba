'use client';

import { useState, useEffect } from 'react';

// Helper functions for date handling
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

function HostCalendar({ blockedDates, bookings, onRangeSelect, existingBlockedRanges }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [blockedDatesSet, setBlockedDatesSet] = useState(new Set());
  const [bookedDatesMap, setBookedDatesMap] = useState(new Map());

  // Process existing blocked dates
  useEffect(() => {
    const blocked = new Set();
    if (existingBlockedRanges) {
      existingBlockedRanges.forEach(range => {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        let current = new Date(start);
        while (current < end) {
          blocked.add(getLocalDateString(current));
          current.setDate(current.getDate() + 1);
        }
      });
    }
    setBlockedDatesSet(blocked);
  }, [existingBlockedRanges]);

  // Process bookings (confirmed and pending)
  useEffect(() => {
    const booked = new Map();
    if (bookings && bookings.length > 0) {
      bookings.forEach(booking => {
        const start = new Date(booking.checkIn);
        const end = new Date(booking.checkOut);
        const status = booking.status;
        let current = new Date(start);
        while (current < end) {
          const dateStr = getLocalDateString(current);
          if (!booked.has(dateStr)) {
            booked.set(dateStr, status);
          }
          current.setDate(current.getDate() + 1);
        }
      });
    }
    setBookedDatesMap(booked);
  }, [bookings]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isDateBlocked = (date) => {
    return blockedDatesSet.has(getLocalDateString(date));
  };

  const getBookingStatus = (date) => {
    return bookedDatesMap.get(getLocalDateString(date));
  };

  const isDateBooked = (date) => {
    return bookedDatesMap.has(getLocalDateString(date));
  };

  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateInRange = (date) => {
    if (!selectedStartDate || !hoverDate) return false;
    if (selectedEndDate) return false;
    return date > selectedStartDate && date <= hoverDate;
  };

  const isDateSelected = (date) => {
    if (!selectedStartDate) return false;
    if (selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate;
    }
    return date.getTime() === selectedStartDate.getTime();
  };

  const isDateAvailableForBlocking = (date) => {
    return !isDateBlocked(date) && !isDateBooked(date) && !isDateInPast(date);
  };

  const handleDateClick = (date) => {
    if (!isDateAvailableForBlocking(date)) {
      return;
    }

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (date > selectedStartDate) {
        // Complete the selection
        setSelectedEndDate(date);
        onRangeSelect({
          startDate: getLocalDateString(selectedStartDate),
          endDate: getLocalDateString(date),
        });
      } else if (date < selectedStartDate) {
        // Reset start date
        setSelectedStartDate(date);
      }
    }
  };

  const handleDateHover = (date) => {
    if (!selectedStartDate || selectedEndDate) return;
    if (date > selectedStartDate && isDateAvailableForBlocking(date)) {
      setHoverDate(date);
    } else {
      setHoverDate(null);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const changeMonth = (increment) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setHoverDate(null);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-md transition"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-md transition"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, isCurrentMonth }, index) => {
          const bookingStatus = getBookingStatus(date);
          const isBooked = !!bookingStatus;
          const isBlocked = isDateBlocked(date);
          const isPast = isDateInPast(date);
          const isSelected = isDateSelected(date);
          const isInRange = isDateInRange(date);
          const isAvailableForBlocking = isDateAvailableForBlocking(date);
          
          let bgColor = 'bg-white';
          let textColor = 'text-gray-900';
          let hoverClass = 'hover:bg-red-100';
          
          if (isSelected) {
            bgColor = 'bg-red-600';
            textColor = 'text-white';
            hoverClass = 'hover:bg-red-700';
          } else if (isInRange) {
            bgColor = 'bg-red-100';
            textColor = 'text-red-900';
          } else if (isBlocked) {
            bgColor = 'bg-gray-400';
            textColor = 'text-white line-through';
            hoverClass = 'cursor-not-allowed';
          } else if (bookingStatus === 'confirmed') {
            bgColor = 'bg-red-100';
            textColor = 'text-red-600 line-through';
            hoverClass = 'cursor-not-allowed';
          } else if (bookingStatus === 'pending') {
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-700 line-through';
            hoverClass = 'cursor-not-allowed';
          } else if (isPast) {
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-400';
            hoverClass = 'cursor-not-allowed';
          } else if (!isCurrentMonth) {
            textColor = 'text-gray-300';
          }
          
          let tooltip = '';
          if (isBlocked) tooltip = 'Blocked by you';
          if (bookingStatus === 'confirmed') tooltip = 'Confirmed booking';
          if (bookingStatus === 'pending') tooltip = 'Pending booking - awaiting confirmation';
          if (isPast && !isBooked && !isBlocked) tooltip = 'Past date - cannot block';
          if (isAvailableForBlocking) tooltip = 'Available to block';
          
          return (
            <button
              key={index}
              onClick={() => isAvailableForBlocking && handleDateClick(date)}
              onMouseEnter={() => isAvailableForBlocking && !isSelected && handleDateHover(date)}
              onMouseLeave={() => setHoverDate(null)}
              disabled={!isAvailableForBlocking}
              title={tooltip}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all relative
                ${bgColor} ${textColor} ${hoverClass}
                ${!isAvailableForBlocking ? 'cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected ? 'shadow-md scale-95' : ''}
              `}
            >
              {date.getDate()}
              {bookingStatus === 'pending' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              )}
              {bookingStatus === 'confirmed' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {(selectedStartDate || selectedEndDate) && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              {selectedStartDate && (
                <span className="text-gray-600">
                  Selected to block: {selectedStartDate.toLocaleDateString()}
                  {selectedEndDate && ` - ${selectedEndDate.toLocaleDateString()}`}
                </span>
              )}
            </div>
            <button
              onClick={clearSelection}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
          <span className="text-gray-600">Available to block</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-600">Selected to block</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span className="text-gray-600">Selected Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-gray-600 line-through">Blocked by you</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span className="text-yellow-700 line-through">Pending Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span className="text-red-600 line-through">Confirmed Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-gray-600">Past Date</span>
        </div>
      </div>
    </div>
  );
}

export default function HostDateManager({ listingId, blockedDates, bookings, onDatesUpdated }) {
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
  };

  const handleBlockSubmit = async () => {
    if (!selectedRange) {
      setError('Please select a date range on the calendar');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const start = new Date(selectedRange.startDate);
    const end = new Date(selectedRange.endDate);

    if (start >= end) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    if (start < new Date()) {
      setError('Cannot block past dates');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: selectedRange.startDate,
          endDate: selectedRange.endDate,
          reason: reason || 'Blocked by host',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess('Dates blocked successfully!');
      setSelectedRange(null);
      setReason('');
      setShowBlockForm(false);
      
      if (onDatesUpdated) {
        onDatesUpdated();
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBlock = async (blockId) => {
    if (!confirm('Are you sure you want to remove this blocked date range?')) return;
    
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess('Blocked dates removed successfully!');
      
      if (onDatesUpdated) {
        onDatesUpdated();
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-md font-semibold text-gray-700">Manage Blocked Dates</h4>
          <p className="text-xs text-gray-500 mt-1">
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span> Pending bookings
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2 mr-1"></span> Confirmed bookings
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full ml-2 mr-1"></span> Already blocked
          </p>
        </div>
        <button
          onClick={() => {
            setShowBlockForm(!showBlockForm);
            setSelectedRange(null);
            setReason('');
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium"
        >
          {showBlockForm ? 'Cancel' : '+ Block Dates'}
        </button>
      </div>

      {showBlockForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date Range to Block (Click start date, then end date)
            </label>
            <HostCalendar
              blockedDates={blockedDates}
              bookings={bookings}
              onRangeSelect={handleRangeSelect}
              existingBlockedRanges={blockedDates}
            />
          </div>

          {selectedRange && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected to block:</strong> {formatDate(selectedRange.startDate)} - {formatDate(selectedRange.endDate)}
              </p>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Maintenance, Personal use, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {error && (
            <div className="mt-3 text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-3 text-green-500 text-sm bg-green-50 p-2 rounded">
              {success}
            </div>
          )}

          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowBlockForm(false);
                setSelectedRange(null);
                setReason('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBlockSubmit}
              disabled={loading || !selectedRange}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Blocking...' : 'Block Selected Dates'}
            </button>
          </div>
        </div>
      )}

      {blockedDates && blockedDates.length > 0 && (
        <div className="space-y-2 mt-3">
          <p className="text-sm font-medium text-gray-600">Currently Blocked Date Ranges:</p>
          {blockedDates.map((block, index) => (
            <div key={index} className="bg-red-50 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-red-800">
                  {formatDate(block.startDate)} - {formatDate(block.endDate)}
                </p>
                {block.reason && (
                  <p className="text-xs text-red-600 mt-1">{block.reason}</p>
                )}
              </div>
              <button
                onClick={() => handleRemoveBlock(block._id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}