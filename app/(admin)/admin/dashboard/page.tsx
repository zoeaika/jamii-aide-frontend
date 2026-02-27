'use client';

import { 
  Users, UserCheck, Calendar, DollarSign, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Clock, Eye, Activity, Bell, Search
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = {
    totalUsers: 0,
    activeNurses: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    growth: {
      users: 0,
      nurses: 0,
      appointments: 0,
      revenue: 0
    }
  };

  const alerts: Array<{ type: string; icon: typeof AlertCircle; message: string; action: string; color: string }> = [];
  const recentActivity: Array<{ time: string; user: string; action: string; location: string }> = [];
  const topNurses: Array<{ name: string; visits: number; rating: number; earnings: number }> = [];
  const revenueTrend: number[] = [];

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-600 mt-1">Real-time platform analytics and monitoring</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users, nurses, appointments..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Alert Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, idx) => (
          <div key={idx} className={`bg-${alert.color}-50 border-l-4 border-${alert.color}-500 p-4 rounded-r-lg`}>
            <div className="flex items-start">
              <alert.icon className={`h-5 w-5 text-${alert.color}-600 mr-3 flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <p className={`text-sm font-medium text-${alert.color}-800`}>{alert.message}</p>
                <button className={`text-xs text-${alert.color}-700 font-semibold mt-1 hover:underline`}>
                  {alert.action} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 opacity-80" />
            <div className={`flex items-center space-x-1 text-sm ${stats.growth.users > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {stats.growth.users > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{stats.growth.users}%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-blue-100 text-sm">Total Users</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="h-8 w-8 opacity-80" />
            <div className={`flex items-center space-x-1 text-sm ${stats.growth.nurses > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {stats.growth.nurses > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{stats.growth.nurses}%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.activeNurses}</p>
          <p className="text-green-100 text-sm">Active Nurses</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 opacity-80" />
            <Activity className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.todayAppointments}</p>
          <p className="text-purple-100 text-sm">Today&apos;s Appointments</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-80" />
            <div className={`flex items-center space-x-1 text-sm ${stats.growth.revenue > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {stats.growth.revenue > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{stats.growth.revenue}%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">KES {(stats.monthlyRevenue / 1000000).toFixed(1)}M</p>
          <p className="text-orange-100 text-sm">Monthly Revenue</p>
        </div>
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            Revenue Trend (6 Months)
          </h2>
          <div className="h-64 flex items-end justify-around space-x-3">
            {revenueTrend.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all hover:from-purple-700 hover:to-purple-500 cursor-pointer" 
                  style={{ height: `${value * 40}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2 font-medium">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][idx]}
                </span>
                <span className="text-xs font-bold text-gray-900">{value}M</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 text-green-600 mr-2" />
            System Health
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Server Uptime</span>
                <span className="font-bold text-green-600">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">API Response Time</span>
                <span className="font-bold text-blue-600">124ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Database Load</span>
                <span className="font-bold text-orange-600">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-600 mb-2">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Nurses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Live Activity Feed</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">{activity.user}</span>
                    <span className="text-gray-600"> {activity.action}</span>
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{activity.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Nurses */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Nurses</h2>
          <div className="space-y-4">
            {topNurses.map((nurse, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{nurse.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <span>{nurse.visits} visits</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-yellow-500 mr-1" />
                        {nurse.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">KES {(nurse.earnings / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">earned</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
