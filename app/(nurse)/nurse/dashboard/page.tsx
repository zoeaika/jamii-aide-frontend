'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, DollarSign, Star, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { getAccountVerificationState, nurseService } from '@/app/lib/api';
import { formatKES } from '@/app/lib/format';

type AssignedAppointment = {
  id: string;
  family_member?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  service_type?: string;
  shift_type?: string;
  status?: string;
  status_display?: string;
  amount?: number;
};

export default function NurseDashboardPage() {
  const [assignedAppointments, setAssignedAppointments] = useState<AssignedAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationState, setVerificationState] = useState(getAccountVerificationState());

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await nurseService.me();
        const items = response?.data?.assigned_appointments ?? [];
        setAssignedAppointments(Array.isArray(items) ? (items as AssignedAppointment[]) : []);
      } catch {
        setError('Could not load your dashboard right now.');
        setAssignedAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') || localStorage.getItem('user') : null;
    if (!storedUser) {
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setVerificationState(getAccountVerificationState(parsed));
    } catch {
      setVerificationState(getAccountVerificationState());
    }
  }, []);

  const isPendingAccess = verificationState.isPending;

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayVisits = assignedAppointments.filter((appointment) => String(appointment.appointment_date || '').startsWith(today)).length;
    const todayEarnings = assignedAppointments
      .filter((appointment) => String(appointment.appointment_date || '').startsWith(today))
      .reduce((sum, appointment) => sum + Number(appointment.amount || 0), 0);
    const weekVisits = assignedAppointments.length;
    return {
      todayVisits,
      todayEarnings,
      weekVisits,
      rating: 0,
    };
  }, [assignedAppointments]);

  // Backend returns these oldest-date-first; re-sort so the soonest upcoming visits
  // surface first instead of being crowded out of the top-5 slice by past ones.
  const upcomingFirst = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...assignedAppointments].sort((a, b) => {
      const aUpcoming = a.appointment_date >= today ? 0 : 1;
      const bUpcoming = b.appointment_date >= today ? 0 : 1;
      if (aUpcoming !== bUpcoming) return aUpcoming - bUpcoming;
      return aUpcoming === 0
        ? a.appointment_date.localeCompare(b.appointment_date)
        : b.appointment_date.localeCompare(a.appointment_date);
    });
  }, [assignedAppointments]);

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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

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
          <p className="text-2xl font-bold text-gray-900">KES {formatKES(stats.todayEarnings)}</p>
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
        {isPendingAccess ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Actions stay locked until your account is verified. You can still review your portal while waiting for approval.
          </div>
        ) : (
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
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Assigned Care Requests</h2>
        {isLoading ? (
          <p className="text-sm text-gray-600">Loading assigned appointments...</p>
        ) : upcomingFirst.length === 0 ? (
          <p className="text-sm text-gray-600">No assigned appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {upcomingFirst.slice(0, 5).map((appointment) => {
              const familyMember = appointment.family_member;
              const patientName = familyMember?.full_name || `${familyMember?.first_name || ''} ${familyMember?.last_name || ''}`.trim() || 'N/A';
              return (
                <div key={appointment.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{patientName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {appointment.appointment_date} | {appointment.start_time} - {appointment.end_time}
                      </p>
                      {appointment.reason && <p className="text-sm text-gray-700 mt-1">{appointment.reason}</p>}
                    </div>
                    <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
                      {appointment.status_display || appointment.status || 'Assigned'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
