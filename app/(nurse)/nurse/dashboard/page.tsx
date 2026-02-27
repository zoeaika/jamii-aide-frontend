'use client';

import Link from 'next/link';
import { Calendar, Users, DollarSign, Star, TrendingUp, ArrowRight } from 'lucide-react';

export default function NurseDashboardPage() {
  const stats = {
    todayVisits: 0,
    todayEarnings: 0,
    weekVisits: 0,
    rating: 0,
  };

  const quickActions = [
    { title: 'View Schedule', href: '/nurse/schedule', icon: Calendar, color: 'bg-blue-500' },
    { title: 'My Patients', href: '/nurse/patients', icon: Users, color: 'bg-green-500' },
    { title: 'Track Earnings', href: '/nurse/earnings', icon: DollarSign, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here&apos;s your overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.todayVisits}</p>
          <p className="text-sm text-gray-600 mt-1">Today&apos;s Visits</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {stats.todayEarnings.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Today&apos;s Earnings</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.weekVisits}</p>
          <p className="text-sm text-gray-600 mt-1">This Week</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center mb-4">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
          <p className="text-sm text-gray-600 mt-1">Rating</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-green-200 transition group"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition">
                {action.title}
              </h3>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span>Open</span>
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
