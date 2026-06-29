'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users, UserCheck, Calendar, TrendingUp, Activity, Bell, Search, UserCog
} from 'lucide-react';
import { appointmentService, endUserService, nurseService, notificationService, type EndUserRecord, type NurseRecord } from '@/app/lib/api';

type AppointmentRecord = {
  id: string;
  appointment_date: string;
  status: string;
  amount?: number | string | null;
  visit_city?: string;
  reason?: string;
};

const monthLabel = (date: Date) => date.toLocaleString('en-US', { month: 'short' });

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<EndUserRecord[]>([]);
  const [nurses, setNurses] = useState<NurseRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [usersResult, nursesResult, appointmentsResult, unreadResult] = await Promise.allSettled([
          endUserService.getAll(),
          nurseService.getAll(),
          appointmentService.getAll(),
          notificationService.unreadCount(),
        ]);
        const userItems =
          usersResult.status === 'fulfilled'
            ? usersResult.value?.data?.results || usersResult.value?.data || []
            : [];
        const nurseItems =
          nursesResult.status === 'fulfilled'
            ? nursesResult.value?.data?.results || nursesResult.value?.data || []
            : [];
        const appointmentItems =
          appointmentsResult.status === 'fulfilled'
            ? appointmentsResult.value?.data?.results || appointmentsResult.value?.data || []
            : [];
        const unreadCountValue =
          unreadResult.status === 'fulfilled'
            ? Number(unreadResult.value?.data?.unread_count ?? 0) || 0
            : 0;

        setUsers(Array.isArray(userItems) ? userItems : []);
        setNurses(Array.isArray(nurseItems) ? nurseItems : []);
        setAppointments(Array.isArray(appointmentItems) ? appointmentItems : []);
        setUnreadCount(unreadCountValue);

        const failures = [usersResult, nursesResult, appointmentsResult, unreadResult].filter(
          (result) => result.status === 'rejected',
        ).length;
        if (failures > 0) {
          setError('Some admin metrics could not be loaded, but available live data is shown.');
        }
      } catch {
        setError('Could not load admin dashboard metrics.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const activeNurses = nurses.filter((nurse) => nurse.is_active).length;
    const todayAppointments = appointments.filter((appointment) => appointment.appointment_date === today).length;
    const pendingMatching = appointments.filter((appointment) =>
      ['SUBMITTED', 'UNDER_REVIEW', 'NURSE_SUGGESTED'].includes(appointment.status)).length;
    const monthlyRequestValue = appointments.reduce((sum, appointment) => sum + Number(appointment.amount || 0), 0);

    return {
      totalUsers: users.length,
      activeNurses,
      todayAppointments,
      pendingMatching,
      monthlyRequestValue,
    };
  }, [appointments, nurses, users]);

  const recentAppointments = useMemo(
    () =>
      [...appointments]
        .sort((a, b) => String(b.appointment_date).localeCompare(String(a.appointment_date)))
        .slice(0, 5),
    [appointments],
  );

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
        .slice(0, 5),
    [users],
  );

  const topNurses = useMemo(
    () =>
      [...nurses]
        .sort((a, b) => Number(b.completed_appointments || 0) - Number(a.completed_appointments || 0))
        .slice(0, 4),
    [nurses],
  );

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      return { key, label: monthLabel(monthDate), value: 0 };
    });

    appointments.forEach((appointment) => {
      const key = String(appointment.appointment_date || '').slice(0, 7);
      const month = months.find((item) => item.key === key);
      if (month) {
        month.value += 1;
      }
    });

    return months;
  }, [appointments]);

  return (
    <div className="space-y-6 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-600 mt-1">Live platform counts from the connected backend</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 shadow-sm transition">
            <UserCog className="h-5 w-5" />
            <span className="hidden sm:inline">Manage Users</span>
          </Link>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search is coming soon"
              disabled
              className="w-80 rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-gray-400 outline-none"
            />
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Pending admin review</p>
          <p className="mt-1 text-2xl font-bold text-amber-950">{stats.pendingMatching}</p>
          <p className="mt-1 text-sm text-amber-800">Requests in submitted, review, or suggested states</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">Unread notifications</p>
          <p className="mt-1 text-2xl font-bold text-blue-950">{unreadCount}</p>
          <p className="mt-1 text-sm text-blue-800">Your admin notification feed</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-900">Connected backend</p>
          <p className="mt-1 text-2xl font-bold text-green-950">{isLoading ? '...' : 'Online'}</p>
          <p className="mt-1 text-sm text-green-800">Counts are loading from live API endpoints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/users" className="block rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <Users className="mb-4 h-8 w-8 opacity-80" />
          <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-sm text-blue-100">End Users</p>
        </Link>
        <Link href="/admin/nurses" className="block rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <UserCheck className="mb-4 h-8 w-8 opacity-80" />
          <p className="text-3xl font-bold">{stats.activeNurses}</p>
          <p className="text-sm text-green-100">Active Nurses</p>
        </Link>
        <Link href="/admin/appointments" className="block rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <Calendar className="mb-4 h-8 w-8 opacity-80" />
          <p className="text-3xl font-bold">{stats.todayAppointments}</p>
          <p className="text-sm text-purple-100">Today&apos;s Appointments</p>
        </Link>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <Bell className="mb-4 h-8 w-8 opacity-80" />
          <p className="text-3xl font-bold">KES {stats.monthlyRequestValue.toLocaleString()}</p>
          <p className="text-sm text-orange-100">Visible Request Value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
            <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
            Appointment Trend
          </h2>
          <div className="flex h-64 items-end justify-around gap-3">
            {monthlyTrend.map((month) => (
              <div key={month.key} className="flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-purple-400"
                  style={{ height: `${Math.max(12, month.value * 24)}px` }}
                />
                <span className="mt-2 text-xs font-medium text-gray-600">{month.label}</span>
                <span className="text-xs font-bold text-gray-900">{month.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
            <Activity className="mr-2 h-5 w-5 text-green-600" />
            Queue Snapshot
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Total appointments</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Approved appointments</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {appointments.filter((appointment) => appointment.status === 'APPROVED').length}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Completed nurse visits</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {nurses.reduce((sum, nurse) => sum + Number(nurse.completed_appointments || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Recent Appointments</h2>
          <div className="space-y-3">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="rounded-lg border border-gray-100 p-3">
                <p className="font-semibold text-gray-900">{appointment.reason || appointment.id}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {appointment.appointment_date} • {appointment.visit_city || 'Unknown city'}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500">{appointment.status}</p>
              </div>
            ))}
            {!isLoading && recentAppointments.length === 0 && <p className="text-sm text-gray-600">No appointments yet.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Latest Users and Top Nurses</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-500">New end users</p>
              <div className="space-y-2">
                {recentUsers.map((user) => (
                  <div key={user.id} className="rounded-lg bg-gray-50 p-3">
                    <p className="font-medium text-gray-900">
                      {`${user.user?.first_name || ''} ${user.user?.last_name || ''}`.trim() || user.user?.email || user.id}
                    </p>
                    <p className="text-sm text-gray-600">{user.current_city || 'Unknown city'}, {user.current_country || 'Unknown country'}</p>
                  </div>
                ))}
                {!isLoading && recentUsers.length === 0 && <p className="text-sm text-gray-600">No users loaded.</p>}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-500">Top nurses by completed appointments</p>
              <div className="space-y-2">
                {topNurses.map((nurse) => (
                  <div key={nurse.id} className="rounded-lg bg-gray-50 p-3">
                    <p className="font-medium text-gray-900">
                      {`${nurse.user?.first_name || ''} ${nurse.user?.last_name || ''}`.trim() || nurse.user?.email || nurse.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      Completed: {Number(nurse.completed_appointments || 0)} • Rating: {Number(nurse.rating || 0).toFixed(1)}
                    </p>
                  </div>
                ))}
                {!isLoading && topNurses.length === 0 && <p className="text-sm text-gray-600">No nurse activity yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
