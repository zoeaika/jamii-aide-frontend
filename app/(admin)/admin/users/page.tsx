'use client';

import { useState } from 'react';
import { Users, Search, Filter, UserPlus, Mail, Phone, Calendar, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const users: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    joinDate: string;
    familyMembers: number;
    appointments: number;
    status: string;
    totalSpent: number;
  }> = [];

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    newThisMonth: 0,
    totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all registered users</p>
        </div>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600 mt-1">Total Users</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-sm text-gray-600 mt-1">Active Users</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.newThisMonth}</p>
          <p className="text-sm text-gray-600 mt-1">New This Month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">KES {(stats.totalRevenue / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Location</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Family Members</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Appointments</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Total Spent</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">Joined {new Date(user.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900 mb-1">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{user.location}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {user.familyMembers}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {user.appointments}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                    KES {user.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
