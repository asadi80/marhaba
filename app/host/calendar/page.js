'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HostCalendar() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedListing, setSelectedListing] = useState('all');
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    generateCalendar();
  }, [currentDate, bookings, selectedListing]);

  const fetchData = async () => {
    try {
      // Fetch bookings
      const bookingsResponse = await fetch('/api/bookings');
      const bookingsData = await bookingsResponse.json();
      
      if (!bookingsResponse.ok) {
        throw new Error(bookingsData.message);
      }
      setBookings(bookingsData.bookings);

      // Fetch host listings
      const listingsResponse = await fetch('/api/host/listings');
      const listingsData = await listingsResponse.json();
      setListings(listingsData.listings);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      const dayBookings = getBookingsForDate(currentDay);
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        bookings: dayBookings,
        hasBookings: dayBookings.length > 0,
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const getBookingsForDate = (date) => {
    const dateStr = date.toDateString();
    
    return bookings.filter(booking => {
      if (selectedListing !== 'all' && booking.listing?._id !== selectedListing) {
        return false;
      }
      
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const currentDate = new Date(date);
      
      // Check if current date falls within booking period
      return currentDate >= checkIn && currentDate < checkOut;
    });
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBookingStatusTextColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-700 bg-green-50';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50';
      case 'cancelled':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Host Dashboard</h1>
              <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                🏠 Host Account
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/host-dashboard" className="text-gray-700 hover:text-gray-900">
                Overview
              </Link>
              <Link href="/host/listings" className="text-gray-700 hover:text-gray-900">
                My Listings
              </Link>
              <Link href="/host/bookings" className="text-gray-700 hover:text-gray-900">
                Bookings List
              </Link>
              <Link href="/host/calendar" className="text-gray-700 hover:text-gray-900 font-medium">
                Calendar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">Booking Calendar</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-md transition"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-md transition"
                  >
                    →
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Today
                  </button>
                </div>
                <h3 className="text-xl font-semibold text-gray-700">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
              </div>
              
              {/* Listing Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Filter by listing:</label>
                <select
                  value={selectedListing}
                  onChange={(e) => setSelectedListing(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Listings</option>
                  {listings.map((listing) => (
                    <option key={listing._id} value={listing._id}>
                      {listing.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300"></div>
                <span className="text-sm text-gray-600">No Bookings</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] border rounded-lg p-2 transition ${
                    day.isCurrentMonth
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                  } ${day.hasBookings ? 'hover:shadow-md' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.bookings.slice(0, 3).map((booking, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleBookingClick(booking)}
                        className={`w-full text-left text-xs p-1 rounded ${getBookingStatusColor(booking.status)} text-white hover:opacity-80 transition`}
                      >
                        <div className="truncate">
                          {booking.listing?.title || 'Booking'}
                        </div>
                        <div className="text-[10px] opacity-90">
                          {booking.user?.name?.split(' ')[0]}
                        </div>
                      </button>
                    ))}
                    {day.bookings.length > 3 && (
                      <div className="text-xs text-gray-500 text-center mt-1">
                        +{day.bookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusTextColor(selectedBooking.status)}`}>
                          {selectedBooking.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Property</p>
                        <p className="font-medium text-gray-900">{selectedBooking.listing?.title}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-700">{selectedBooking.listing?.location}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Guest</p>
                        <p className="text-gray-700">{selectedBooking.user?.name}</p>
                        <p className="text-sm text-gray-500">{selectedBooking.user?.email}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Check-in</p>
                          <p className="font-medium text-gray-900">{formatDate(selectedBooking.checkIn)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Check-out</p>
                          <p className="font-medium text-gray-900">{formatDate(selectedBooking.checkOut)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Guests</p>
                          <p className="text-gray-700">{selectedBooking.guests}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Price</p>
                          <p className="text-lg font-bold text-indigo-600">${selectedBooking.totalPrice}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Booked on</p>
                        <p className="text-gray-600">{formatDate(selectedBooking.createdAt)}</p>
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        {selectedBooking.status === 'pending' && (
                          <button
                            onClick={() => {
                              handleConfirmBooking(selectedBooking._id);
                              closeModal();
                            }}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                          >
                            Confirm Booking
                          </button>
                        )}
                        {selectedBooking.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              handleCancelBooking(selectedBooking._id);
                              closeModal();
                            }}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                          >
                            Cancel Booking
                          </button>
                        )}
                        <Link
                          href={`/listings/${selectedBooking.listing?._id}`}
                          className="flex-1 bg-gray-600 text-white text-center px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                          View Listing
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}