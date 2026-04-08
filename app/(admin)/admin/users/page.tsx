'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, Search, Mail, Calendar, CheckCircle, MapPin } from 'lucide-react';
import { appointmentService, endUserService, type EndUserRecord } from '@/app/lib/api';

type AppointmentRecord = {
  end_user_profile?: string | null;
  status?: string;
  amount?: number | string | null;
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<EndUserRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [usersResponse, appointmentsResponse] = await Promise.all([
          endUserService.getAll(),
          appointmentService.getAll(),
        ]);
        const userItems = usersResponse?.data?.results || usersResponse?.data || [];
        const appointmentItems = appointmentsResponse?.data?.results || appointmentsResponse?.data || [];
        setUsers(Array.isArray(userItems) ? userItems : []);
        setAppointments(Array.isArray(appointmentItems) ? appointmentItems : []);
      } catch {
        setError('Could not load end users.');
        setUsers([]);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const appointmentStatsByUser = useMemo(() => {
    const map: Record<string, { appointments: number; totalSpent: number; active: boolean }> = {};
    appointments.forEach((appointment) => {
      const userId = appointment.end_user_profile;
      if (!userId) {
        return;
      }
      if (!map[userId]) {
        map[userId] = { appointments: 0, totalSpent: 0, active: false };
      }
      map[userId].appointments += 1;
      map[userId].totalSpent += Number(appointment.amount || 0);
      if ((appointment.status || '') !== 'CANCELLED') {
        map[userId].active = true;
      }
    });
    return map;
  }, [appointments]);

  const visibleUsers = useMemo(
    () =>
      users.filter((user) => {
        const userStats = appointmentStatsByUser[user.id] || { appointments: 0, totalSpent: 0, active: false };
        const status = userStats.active || user.user?.is_active ? 'active' : 'inactive';
        const haystack = [
          user.user?.first_name,
          user.user?.last_name,
          user.user?.email,
          user.current_city,
          user.current_country,
        ]
          .join(' ')
          .toLowerCase();
        const matchesSearch = haystack.includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || status === filterStatus;
        return matchesSearch && matchesStatus;
      }),
    [appointmentStatsByUser, filterStatus, searchQuery, users],
  );

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => {
        const userStats = appointmentStatsByUser[user.id];
        return Boolean(user.user?.is_active || userStats?.active);
      }).length,
      newThisMonth: users.filter((user) => {
        if (!user.created_at) {
          return false;
        }
        const created = new Date(user.created_at);
        const now = new Date();
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
      }).length,
      totalRevenue: users.reduce((sum, user) => sum + Number(appointmentStatsByUser[user.id]?.totalSpent || 0), 0),
    }),
    [appointmentStatsByUser, users],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Live end-user list from `/api/end-users/`</p>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Users className="mb-2 h-8 w-8 text-purple-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="mt-1 text-sm text-gray-600">Total Users</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <CheckCircle className="mb-2 h-8 w-8 text-green-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          <p className="mt-1 text-sm text-gray-600">Active Users</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Calendar className="mb-2 h-8 w-8 text-blue-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.newThisMonth}</p>
          <p className="mt-1 text-sm text-gray-600">New This Month</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Calendar className="mb-2 h-8 w-8 text-orange-600" />
          <p className="text-3xl font-bold text-gray-900">KES {stats.totalRevenue.toLocaleString()}</p>
          <p className="mt-1 text-sm text-gray-600">Request Value</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Location</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Appointments</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Request Value</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const fullName = `${user.user?.first_name || ''} ${user.user?.last_name || ''}`.trim() || user.user?.email || user.id;
                const userStats = appointmentStatsByUser[user.id] || { appointments: 0, totalSpent: 0, active: false };
                const status = user.user?.is_active || userStats.active ? 'active' : 'inactive';

                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{fullName}</p>
                        <p className="text-xs text-gray-500">Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="mb-1 flex items-center text-gray-900">
                        <Mail className="mr-2 h-4 w-4 text-gray-400" />
                        {user.user?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                        {[user.current_city, user.current_country].filter(Boolean).join(', ') || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{userStats.appointments}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {userStats.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && visibleUsers.length === 0 && (
          <div className="px-6 py-8 text-sm text-gray-600">No users matched the current filters.</div>
        )}
        {isLoading && <div className="px-6 py-8 text-sm text-gray-600">Loading users...</div>}
      </div>
    </div>
  );
}
