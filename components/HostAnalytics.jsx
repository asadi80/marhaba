'use client';

import { useState, useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export default function HostAnalytics({ listingId = null }) {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    trackPageView(window.location.pathname);
    fetchHostStats();
  }, [period, listingId]);
  
  const fetchHostStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = listingId 
        ? `/api/analytics/host-stats?listingId=${listingId}&period=${period}`
        : `/api/analytics/host-stats?period=${period}`;
      
      const response = await fetch(url);
      
      if (response.status === 401) {
        setError('Please login to view your listing analytics');
        return;
      }
      
      if (response.status === 403) {
        setError('You need to be a host to view these analytics');
        return;
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching host stats:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="text-center p-8">Loading your analytics...</div>;
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Listing Analytics</h1>
      
      {/* Summary Cards - Only for hosts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Total Views (30 days)</h3>
          <p className="text-3xl font-bold">{stats?.summary?.total_views || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Unique Visitors</h3>
          <p className="text-3xl font-bold">{stats?.summary?.total_unique_views || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Bookings</h3>
          <p className="text-3xl font-bold">{stats?.summary?.total_bookings || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Revenue</h3>
          <p className="text-3xl font-bold">${stats?.summary?.total_revenue || 0}</p>
        </div>
      </div>
      
      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => setPeriod('daily')}
          className={`px-4 py-2 rounded ${period === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Daily
        </button>
        <button 
          onClick={() => setPeriod('monthly')}
          className={`px-4 py-2 rounded ${period === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Monthly
        </button>
      </div>
      
      {/* Detailed Stats Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats?.stats?.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {period === 'daily' && item.date}
                  {period === 'monthly' && `${item.year}-${item.month}`}
                </td>
                <td className="px-6 py-4 text-sm">{item.title}</td>
                <td className="px-6 py-4 text-sm">{item.views || item.total_views}</td>
                <td className="px-6 py-4 text-sm">{item.unique_views || item.total_unique_views}</td>
                <td className="px-6 py-4 text-sm">{item.bookings_count || item.total_bookings}</td>
                <td className="px-6 py-4 text-sm">${item.booking_value || item.total_booking_value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}