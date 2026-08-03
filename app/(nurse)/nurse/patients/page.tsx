'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, User, MapPin, Calendar, Phone, FileText, Heart, AlertCircle } from 'lucide-react';
import { appointmentService, getAccountVerificationState } from '@/app/lib/api';
import { formatDate } from '@/app/lib/format';

type Appointment = {
  id: string;
  family_member?: string;
  family_member_name?: string;
  patient_name?: string;
  full_name?: string;
  family_member_phone?: string;
  patient_phone?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  reason: string;
  visit_city?: string;
  status: string;
  chronic_conditions?: string[] | string;
};

type PatientSummary = {
  id: string;
  name: string;
  phone: string;
  city: string;
  conditions: string[];
  activeCareRequests: number;
  latestService: string;
  nextVisit: string | null;
};

const normalizeConditions = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

export default function NursePatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationState, setVerificationState] = useState(getAccountVerificationState());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await appointmentService.getAll();
        const appointmentItems = response?.data?.results || response?.data || [];
        setAppointments(Array.isArray(appointmentItems) ? (appointmentItems as Appointment[]) : []);
      } catch {
        setError('Could not load assigned care requests.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
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

  const patientSummaries = useMemo(() => {
    const activeAppointments = appointments.filter((appointment) => ['NURSE_SUGGESTED', 'APPROVED', 'CONFIRMED', 'COMPLETED'].includes(String(appointment.status || '')));

    const grouped: Record<string, Appointment[]> = {};
    activeAppointments.forEach((appointment) => {
      const patientId = String(appointment.family_member || 'unknown');
      if (!grouped[patientId]) {
        grouped[patientId] = [];
      }
      grouped[patientId].push(appointment);
    });

    const summaries: PatientSummary[] = Object.entries(grouped).map(([patientId, records]) => {
      const sorted = [...records].sort((a, b) => String(b.appointment_date).localeCompare(String(a.appointment_date)));
      const upcoming = [...records]
        .filter((record) => new Date(record.appointment_date) >= new Date())
        .sort((a, b) => String(a.appointment_date).localeCompare(String(b.appointment_date)))[0];

      const resolvedName = String(sorted[0]?.family_member_name || sorted[0]?.patient_name || sorted[0]?.full_name || patientId).trim();

      const resolvedPhone =
        String(sorted[0]?.family_member_phone || '').trim() ||
        String(sorted[0]?.patient_phone || '').trim() ||
        'Not provided';

      const mergedConditions = normalizeConditions(
        sorted
          .map((record) => record.chronic_conditions)
          .find((value) => Array.isArray(value) ? value.length > 0 : Boolean(String(value || '').trim())),
      );

      return {
        id: patientId,
        name: resolvedName,
        phone: resolvedPhone,
        city: sorted[0]?.visit_city || 'Not provided',
        conditions: mergedConditions,
        activeCareRequests: records.length,
        latestService: sorted[0]?.service_type || 'N/A',
        nextVisit: upcoming?.appointment_date || null,
      };
    });

    return summaries.filter((summary) =>
      `${summary.name} ${summary.city} ${summary.phone} ${summary.latestService}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [appointments, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600 mt-2">View and manage patient information</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <User className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{patientSummaries.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Patients</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {patientSummaries.reduce((sum, p) => sum + p.activeCareRequests, 0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total Visits</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Heart className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {patientSummaries.filter((p) => p.nextVisit).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Scheduled Visits</p>
        </div>
      </div>

      {isPendingAccess && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Patient and care actions remain unavailable until your account is verified.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Patients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading assigned patient care...</div>
        ) : patientSummaries.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">No approved patient care requests assigned yet.</div>
        ) : (
          patientSummaries.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{patient.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">Age not available</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {patient.activeCareRequests} care requests
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{patient.city}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{patient.phone}</span>
              </div>
            </div>

            {/* Health Conditions */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Health Conditions:</p>
              <div className="flex flex-wrap gap-2">
                {patient.conditions.map((condition, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full"
                  >
                    {condition}
                  </span>
                ))}
                {patient.conditions.length === 0 && (
                  <span className="text-xs text-gray-500">No chronic conditions listed.</span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Latest Approved Service:</p>
              <p className="text-sm text-gray-900">{patient.latestService}</p>
            </div>

            {/* Visit Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600 mb-1">Patient ID</p>
                  <p className="font-semibold text-gray-900">
                    {patient.id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Next Visit</p>
                  <p className="font-semibold text-gray-900">
                    {patient.nextVisit
                      ? formatDate(patient.nextVisit)
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  className="flex-1 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium text-sm flex items-center justify-center disabled:opacity-50"
                  disabled={isPendingAccess}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isPendingAccess ? 'Locked' : 'View Records'}
                </button>
                <button
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50"
                  disabled={isPendingAccess}
                >
                  {isPendingAccess ? 'Unavailable' : 'Start Care'}
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}
