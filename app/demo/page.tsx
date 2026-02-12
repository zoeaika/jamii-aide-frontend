'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, Calendar, DollarSign, Activity, Settings, Bell, 
  UserCheck, ClipboardList, TrendingUp, Shield, Search, MapPin, Star, 
  CheckCircle, Clock, Plus, ChevronRight, Home, Pill, BarChart3, Eye,
  LogOut, AlertCircle, Phone, Mail
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function DemoMockupPage() {
  const [activeView, setActiveView] = useState<'user' | 'nurse' | 'admin'>('user');

  // Mock stats data
  const stats = {
    user: {
      familyMembers: 3,
      appointments: 5,
      prescriptions: 4,
      spending: 12500
    },
    nurse: {
      totalVisits: 72,
      rating: 4.9,
      earnings: 144000,
      upcomingVisits: 8
    },
    admin: {
      totalUsers: 2847,
      activeNurses: 156,
      appointments: 1243,
      revenue: 4567000
    }
  };

  // User Dashboard View
  const UserDashboardView = () => (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.user.familyMembers}</p>
          <p className="text-sm text-gray-600 mt-1">Family Members</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.user.appointments}</p>
          <p className="text-sm text-gray-600 mt-1">Upcoming Appointments</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
            <Pill className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.user.prescriptions}</p>
          <p className="text-sm text-gray-600 mt-1">Active Prescriptions</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {stats.user.spending.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">This Month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Plus, label: 'Add Family Member', color: 'blue' },
            { icon: Calendar, label: 'Book Nurse Visit', color: 'green' },
            { icon: Pill, label: 'Order Prescription', color: 'purple' },
            { icon: Activity, label: 'View Health Records', color: 'orange' }
          ].map((action, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-lg bg-${action.color}-500 flex items-center justify-center mb-4`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                {action.label}
              </h3>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <span>Get started</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Family Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { icon: Calendar, title: 'Appointment scheduled', desc: 'Nurse Mary - Tomorrow at 10:00 AM', time: '2 hours ago', color: 'blue' },
              { icon: Pill, title: 'Prescription refilled', desc: 'Hypertension medication delivered', time: '1 day ago', color: 'green' },
              { icon: Activity, title: 'Health report uploaded', desc: 'Lab results from Nakuru Hospital', time: '2 days ago', color: 'purple' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full bg-${activity.color}-50 flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.desc}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Family Members</h2>
          <div className="space-y-4">
            {[
              { name: 'Mama Achieng', age: 68, conditions: 2, lastVisit: 'Yesterday' },
              { name: 'Grandma Atieno', age: 82, conditions: 3, lastVisit: '3 days ago' },
              { name: 'Uncle Ochieng', age: 75, conditions: 1, lastVisit: '1 week ago' }
            ].map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.age} years • {member.conditions} conditions</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Nurse Dashboard View
  const NurseDashboardView = () => (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.nurse.totalVisits}</p>
          <p className="text-sm text-gray-600 mt-1">Total Visits</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center mb-4">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.nurse.rating}</p>
          <p className="text-sm text-gray-600 mt-1">Average Rating</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {stats.nurse.earnings.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.nurse.upcomingVisits}</p>
          <p className="text-sm text-gray-600 mt-1">Upcoming Visits</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="space-y-4">
          {[
            { time: '09:00 AM', patient: 'Mama Achieng', service: 'Blood pressure check', location: 'Nakuru, 2.1km away', status: 'confirmed' },
            { time: '11:30 AM', patient: 'Grandma Atieno', service: 'Medication administration', location: 'Nakuru, 3.5km away', status: 'confirmed' },
            { time: '02:00 PM', patient: 'Uncle Ochieng', service: 'Post-op care', location: 'Nakuru, 5.2km away', status: 'pending' },
            { time: '04:30 PM', patient: 'Mama Wanjiru', service: 'Diabetes monitoring', location: 'Nakuru, 1.8km away', status: 'confirmed' }
          ].map((appointment, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">{appointment.time.split(' ')[0]}</div>
                  <div className="text-xs text-gray-500">{appointment.time.split(' ')[1]}</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <p className="font-semibold text-gray-900">{appointment.patient}</p>
                  <p className="text-sm text-gray-600">{appointment.service}</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {appointment.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'confirmed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {appointment.status}
                </span>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">This Month's Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Visits Completed</span>
                <span className="font-semibold">18/20</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Patient Satisfaction</span>
                <span className="font-semibold">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">On-Time Rate</span>
                <span className="font-semibold">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {[
              { name: 'Sarah K.', rating: 5, comment: 'Very professional and caring. My mother feels comfortable with her.', time: '2 days ago' },
              { name: 'John M.', rating: 5, comment: 'Always on time and thorough. Excellent service!', time: '5 days ago' },
              { name: 'Grace O.', rating: 4, comment: 'Good service, would recommend.', time: '1 week ago' }
            ].map((review, idx) => (
              <div key={idx} className="pb-4 border-b last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{review.name}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-2">{review.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Admin Dashboard View
  const AdminDashboardView = () => (
    <div className="space-y-6 p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
            <Users className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold">{stats.admin.totalUsers.toLocaleString()}</p>
          <p className="text-blue-100 mt-1">Total Users</p>
          <p className="text-xs text-blue-200 mt-2">+12% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
            <UserCheck className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold">{stats.admin.activeNurses}</p>
          <p className="text-green-100 mt-1">Active Nurses</p>
          <p className="text-xs text-green-200 mt-2">+8% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold">{stats.admin.appointments.toLocaleString()}</p>
          <p className="text-purple-100 mt-1">Appointments</p>
          <p className="text-xs text-purple-200 mt-2">This month</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold">KES {(stats.admin.revenue / 1000000).toFixed(1)}M</p>
          <p className="text-orange-100 mt-1">Revenue</p>
          <p className="text-xs text-orange-200 mt-2">+18% from last month</p>
        </div>
      </div>

      {/* Charts and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h2>
          <div className="h-64 flex items-end justify-around space-x-2">
            {[3.2, 3.8, 3.5, 4.1, 4.3, 4.6].map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-600 rounded-t-lg" style={{ height: `${value * 40}px` }}></div>
                <span className="text-xs text-gray-600 mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][idx]}
                </span>
                <span className="text-xs font-semibold text-gray-900">{value}M</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Pending Verifications</span>
              <span className="font-bold text-yellow-600">12</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Support Tickets</span>
              <span className="font-bold text-red-600">8</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Active Sessions</span>
              <span className="font-bold text-green-600">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">System Health</span>
              <span className="font-bold text-green-600">99.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Nurse Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { icon: UserCheck, action: 'New nurse verified', detail: 'Mary Achieng - ID: N-2847', time: '5 min ago', color: 'green' },
              { icon: Users, action: 'New user registered', detail: 'John Doe - Nakuru', time: '12 min ago', color: 'blue' },
              { icon: AlertCircle, action: 'Support ticket created', detail: 'Payment issue - High priority', time: '25 min ago', color: 'red' },
              { icon: DollarSign, action: 'Payment processed', detail: 'KES 3,000 - Subscription', time: '1 hour ago', color: 'green' },
              { icon: Calendar, action: 'Appointment completed', detail: 'Nurse Mary - Mama Achieng', time: '2 hours ago', color: 'purple' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full bg-${activity.color}-50 flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.detail}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pending Nurse Verifications</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">12 Pending</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Jane Wanjiru', location: 'Nairobi', submitted: '2 days ago', docs: 'Complete' },
              { name: 'Peter Kamau', location: 'Nakuru', submitted: '3 days ago', docs: 'Complete' },
              { name: 'Grace Otieno', location: 'Kisumu', submitted: '5 days ago', docs: 'Incomplete' }
            ].map((nurse, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <span className="text-white font-bold">{nurse.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{nurse.name}</p>
                    <p className="text-xs text-gray-600">{nurse.location} • {nurse.submitted}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    nurse.docs === 'Complete' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {nurse.docs}
                  </span>
                  <button className="p-2 hover:bg-white rounded-lg transition">
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
            View All Verifications
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BrandLogo size="md" showText={false} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Jamii Aide</h1>
                <p className="text-xs text-gray-500">Interactive Demo</p>
              </div>
            </div>

            {/* View Switcher */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('user')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeView === 'user'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👨‍👩‍👧 User View
              </button>
              <button
                onClick={() => setActiveView('nurse')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeView === 'nurse'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👩‍⚕️ Nurse View
              </button>
              <button
                onClick={() => setActiveView('admin')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeView === 'admin'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⚙️ Admin View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* Header for current view */}
        <div className="bg-white border-b px-6 py-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeView === 'user' && 'Welcome back, Sarah! 👋'}
            {activeView === 'nurse' && 'Welcome, Nurse Mary! 👩‍⚕️'}
            {activeView === 'admin' && 'Admin Dashboard ⚙️'}
          </h2>
          <p className="text-gray-600 mt-1">
            {activeView === 'user' && "Here's an overview of your family's healthcare coordination"}
            {activeView === 'nurse' && "Your schedule and performance overview"}
            {activeView === 'admin' && "System overview and management"}
          </p>
        </div>

        {/* Render active view */}
        {activeView === 'user' && <UserDashboardView />}
        {activeView === 'nurse' && <NurseDashboardView />}
        {activeView === 'admin' && <AdminDashboardView />}
      </div>
    </div>
  );
}

