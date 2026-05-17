'use client';

import { useState, useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export default function PublicAnalytics() {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Track the page view
    trackPageView(window.location.pathname, document.referrer);
    
    // Fetch public stats
    fetchStats();
  }, [period]);
  
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/public-stats?period=${period}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="text-center p-8">Loading analytics...</div>;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Website Analytics</h1>
      
      {/* Summary Cards - Visible to everyone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Today's Views</h3>
          <p className="text-3xl font-bold">{stats?.summary?.today_views || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Today's Visitors</h3>
          <p className="text-3xl font-bold">{stats?.summary?.today_visitors || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">This Week's Views</h3>
          <p className="text-3xl font-bold">{stats?.summary?.week_views || 0}</p>
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
        <button 
          onClick={() => setPeriod('yearly')}
          className={`px-4 py-2 rounded ${period === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Yearly
        </button>
      </div>
      
      {/* Chart/Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitors</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page Views</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats?.data?.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {period === 'daily' && item.date}
                  {period === 'monthly' && `${item.year}-${item.month}`}
                  {period === 'yearly' && item.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.total_visits || item.visits}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.unique_visitors}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.page_views || item.total_page_views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}