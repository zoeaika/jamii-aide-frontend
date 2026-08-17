'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Navigation, AlertCircle, ToggleRight } from 'lucide-react';
import { getAccountVerificationState, nurseService } from '@/app/lib/api';
import { formatKES } from '@/app/lib/format';

type Appointment = {
  id: string;
  family_member?:
    | string
    | {
        full_name?: string;
        first_name?: string;
        last_name?: string;
      };
  appointment_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  visit_address?: string;
  visit_city?: string;
  status: string;
  status_display?: string;
  amount?: number;
  reason?: string;
};

const resolvePatientName = (appointment: Appointment) => {
  if (!appointment.family_member) {
    return 'N/A';
  }

  if (typeof appointment.family_member === 'string') {
    return String(appointment.family_member).trim() || 'N/A';
  }

  const fullName = String(appointment.family_member.full_name || '').trim();
  if (fullName) {
    return fullName;
  }

  const combined = `${String(appointment.family_member.first_name || '').trim()} ${String(appointment.family_member.last_name || '').trim()}`.trim();
  return combined || 'N/A';
};

export default function NurseSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationState, setVerificationState] = useState(getAccountVerificationState());

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await nurseService.me();
        const items = response?.data?.assigned_appointments ?? [];
        setAppointments(Array.isArray(items) ? (items as Appointment[]) : []);
      } catch {
        setError('Could not load your schedule right now.');
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAppointments();
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

  const visibleAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => ['NURSE_SUGGESTED', 'APPROVED', 'CONFIRMED', 'COMPLETED'].includes(String(appointment.status || '')))
        .filter((appointment) => String(appointment.appointment_date || '').startsWith(selectedDate))
        .sort((a, b) => String(a.start_time || '').localeCompare(String(b.start_time || ''))),
    [appointments, selectedDate],
  );

  const confirmedCount = visibleAppointments.filter((appointment) => appointment.status === 'CONFIRMED').length;
  const todayEarnings = visibleAppointments.reduce((sum, appointment) => sum + Number(appointment.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-2">Manage your appointments and visits</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
          {isPendingAccess ? (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed"
              disabled
            >
              Locked Until Verified
            </button>
          ) : (
            <Link
              href="/nurse/availability"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              <ToggleRight className="h-5 w-5" />
              Manage Availability
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Today&apos;s Visits</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{visibleAppointments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Distance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">0 km</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Today&apos;s Earnings</p>
          <p className="text-2xl font-bold text-green-600 mt-1">KES {formatKES(todayEarnings)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {confirmedCount} of {visibleAppointments.length}
          </p>
        </div>
      </div>

      {isPendingAccess && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Scheduling and visit actions are unavailable until your account is verified.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading your assigned schedule...</div>
        ) : visibleAppointments.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">No approved care visits scheduled for this date.</div>
        ) : (
        visibleAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              {/* Left Section */}
              <div className="flex items-start space-x-4 flex-1">
                {/* Time */}
                <div className="text-center min-w-[80px]">
                  <div className="text-lg font-bold text-gray-900">
                    {appointment.start_time || '--:--'}
                  </div>
                  <div className="text-xs text-gray-500">to {appointment.end_time || '--:--'}</div>
                </div>

                <div className="h-20 w-px bg-gray-300"></div>

                {/* Patient Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Patient: {resolvePatientName(appointment)}</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{appointment.service_type}</p>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{appointment.visit_address || 'Address not provided'}, {appointment.visit_city || 'City not provided'}</span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Care notes:</strong> {appointment.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section */}
              <div className="ml-6 flex flex-col items-end space-y-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'COMPLETED' || appointment.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-700'
                      : appointment.status === 'APPROVED'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                    {appointment.status_display || String(appointment.status || 'Pending').toLowerCase()}
                </span>
                <p className="text-xl font-bold text-gray-900">
                  KES {formatKES(appointment.amount || 0)}
                </p>
                <div className="flex flex-col space-y-2 w-full">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium whitespace-nowrap flex items-center justify-center disabled:opacity-50"
                    disabled={isPendingAccess}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isPendingAccess ? 'Unavailable' : 'Start Visit'}
                  </button>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium whitespace-nowrap disabled:opacity-50"
                    disabled={isPendingAccess}
                  >
                    {isPendingAccess ? 'Locked' : 'View Details'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))) }
      </div>
    </div>
  );
}
