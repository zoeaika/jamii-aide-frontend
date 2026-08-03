'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Building2, CheckCircle, ClipboardList, UserCheck } from 'lucide-react';
import { appointmentService, nurseService, organizationAdminService } from '@/app/lib/api';

type NurseItem = {
  id: string;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  professional_type?: string | null;
  professional_type_display?: string;
  is_active?: boolean;
};

type AppointmentItem = {
  id: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  family_member_name?: string;
  reason?: string;
  suggested_nurse_name?: string | null;
  assigned_nurse_name?: string | null;
  approved_nurse_name?: string | null;
  nurse_name?: string | null;
};

type OrganizationAdminProfile = {
  id?: string;
  organization?: {
    id?: string;
    name?: string;
    slug?: string;
  };
};

const statusBadgeClass = (status?: string) => {
  const normalized = String(status || '').trim().toUpperCase();
  if (normalized === 'APPROVED' || normalized === 'CONFIRMED' || normalized === 'COMPLETED') {
    return 'bg-green-100 text-green-700';
  }
  if (normalized === 'REJECTED' || normalized === 'CANCELLED') {
    return 'bg-red-100 text-red-700';
  }
  if (normalized === 'NURSE_SUGGESTED') {
    return 'bg-blue-100 text-blue-700';
  }
  return 'bg-amber-100 text-amber-800';
};

const nurseDisplayName = (nurse: NurseItem) => {
  const fullName = `${nurse.user?.first_name || ''} ${nurse.user?.last_name || ''}`.trim();
  return fullName || nurse.user?.email || nurse.id;
};

export default function OrganizationAdminPortalPage() {
  const [profile, setProfile] = useState<OrganizationAdminProfile | null>(null);
  const [nurses, setNurses] = useState<NurseItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPortalData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [profileResult, nursesResult, appointmentsResult, pendingResult] = await Promise.allSettled([
          organizationAdminService.me(),
          nurseService.getAll(),
          appointmentService.getAll(),
          appointmentService.pendingMatching(),
        ]);

        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value?.data || null);
        }

        const nurseItems = nursesResult.status === 'fulfilled' ? nursesResult.value?.data?.results || nursesResult.value?.data || [] : [];
        const appointmentItems = appointmentsResult.status === 'fulfilled' ? appointmentsResult.value?.data?.results || appointmentsResult.value?.data || [] : [];
        const pendingItems = pendingResult.status === 'fulfilled' ? pendingResult.value?.data?.results || pendingResult.value?.data || [] : [];

        setNurses(Array.isArray(nurseItems) ? nurseItems : []);
        setAppointments(Array.isArray(appointmentItems) ? appointmentItems : []);
        setPendingAppointments(Array.isArray(pendingItems) ? pendingItems : []);
      } catch {
        setError('Could not load organization portal data.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadPortalData();
  }, []);

  const activeNurseCount = useMemo(() => nurses.filter((nurse) => Boolean(nurse.is_active)).length, [nurses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Admin Portal</h1>
          <p className="mt-1 text-sm text-gray-600">
            {profile?.organization?.name || profile?.organization?.slug || 'Your organization'} · manage nurses and appointments.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-800 p-6 text-white shadow-sm">
        <h2 className="text-xl font-semibold">Manage your care team and appointment flow</h2>
        <p className="mt-2 text-sm text-purple-100">
          Review pending matching requests, supervise nurses, and keep your organization aligned from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-2 inline-flex rounded-lg bg-purple-100 p-2 text-purple-700">
            <Building2 className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{nurses.length}</p>
          <p className="text-sm text-gray-600">Total Nurses</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-2 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700">
            <UserCheck className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeNurseCount}</p>
          <p className="text-sm text-gray-600">Active Nurses</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-2 inline-flex rounded-lg bg-amber-100 p-2 text-amber-700">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingAppointments.length}</p>
          <p className="text-sm text-gray-600">Pending Matching</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Nurses</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Professional Type</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {nurses.map((nurse) => (
                <tr key={nurse.id} className="border-b border-gray-100 text-sm">
                  <td className="px-3 py-3 font-medium text-gray-900">{nurseDisplayName(nurse)}</td>
                  <td className="px-3 py-3 text-gray-700">{nurse.user?.email || 'N/A'}</td>
                  <td className="px-3 py-3 text-gray-700">{nurse.professional_type_display || nurse.professional_type || 'N/A'}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${nurse.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {nurse.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && nurses.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-gray-600" colSpan={4}>No nurses found for this organization.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="appointments" className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Pending Matching Appointments</h2>
        <div className="space-y-4">
          {pendingAppointments.map((appointment) => (
            <div key={appointment.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{appointment.family_member_name || 'Family member'}</p>
                  <p className="text-sm text-gray-600">{appointment.reason || 'No reason provided'}</p>
                  <p className="mt-1 text-xs text-gray-500">{appointment.appointment_date || 'Date TBD'} {appointment.start_time ? `at ${appointment.start_time}` : ''}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(appointment.status)}`}>
                  {appointment.status || 'SUBMITTED'}
                </span>
              </div>
            </div>
          ))}
          {!isLoading && pendingAppointments.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">No pending matching appointments right now.</div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">All Organization Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                <th className="px-3 py-3">Family Member</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Nurse</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-gray-100 text-sm">
                  <td className="px-3 py-3 font-medium text-gray-900">{appointment.family_member_name || 'N/A'}</td>
                  <td className="px-3 py-3 text-gray-700">{appointment.appointment_date || 'TBD'} {appointment.start_time ? `at ${appointment.start_time}` : ''}</td>
                  <td className="px-3 py-3 text-gray-700">{appointment.assigned_nurse_name || appointment.approved_nurse_name || appointment.suggested_nurse_name || appointment.nurse_name || 'Unassigned'}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(appointment.status)}`}>{appointment.status || 'SUBMITTED'}</span>
                  </td>
                </tr>
              ))}
              {!isLoading && appointments.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-gray-600" colSpan={4}>No appointments found for this organization.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">Loading organization portal data...</div>
      )}

      {!isLoading && !error && nurses.length === 0 && appointments.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>Portal is connected but no scaffolded records were returned yet. This is expected for newly created organizations.</span>
          </div>
        </div>
      )}
    </div>
  );
}
