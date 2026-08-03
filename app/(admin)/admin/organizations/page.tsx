'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Building2, CalendarClock, CheckCircle2, Plus, Users } from 'lucide-react';
import { adminOrganizationService, appointmentService, nurseService } from '@/app/lib/api';

type OrganizationRecord = {
  id?: string;
  name?: string;
  business_name?: string;
  organization_name?: string;
  organization?: {
    name?: string;
    business_name?: string;
    slug?: string;
  };
  administrator?: {
    id?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  administrator_name?: string;
  primary_contact?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  is_active?: boolean;
  status?: string;
  nurse_count?: number | string | null;
  affiliated_nurses_count?: number | string | null;
  nurses_count?: number | string | null;
  active_appointments_count?: number | string | null;
  current_appointments?: number | string | null;
  appointments_count?: number | string | null;
  [key: string]: unknown;
};

type AppointmentRecord = {
  id?: string;
  status?: string;
  [key: string]: unknown;
};

type NurseRecord = {
  id?: string;
  [key: string]: unknown;
};

const getDisplayText = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
};

const getNameFromPerson = (person: unknown) => {
  if (!person || typeof person !== 'object') {
    return '';
  }

  const maybePerson = person as Record<string, unknown>;
  const fullName = getDisplayText(maybePerson.full_name);
  if (fullName) {
    return fullName;
  }

  const firstName = getDisplayText(maybePerson.first_name);
  const lastName = getDisplayText(maybePerson.last_name);
  return [firstName, lastName].filter(Boolean).join(' ');
};

const getOrgDisplayName = (organization: OrganizationRecord) => {
  return (
    getDisplayText(organization.business_name) ||
    getDisplayText(organization.name) ||
    getDisplayText(organization.organization_name) ||
    getDisplayText(organization.organization?.business_name) ||
    getDisplayText(organization.organization?.name) ||
    'Unnamed organization'
  );
};

const getOrgAdministrator = (organization: OrganizationRecord) => {
  return (
    getDisplayText(organization.administrator_name) ||
    getNameFromPerson(organization.administrator) ||
    getDisplayText(organization.organization?.name) ||
    'Unassigned'
  );
};

const getOrgPrimaryContact = (organization: OrganizationRecord) => {
  return (
    getDisplayText(organization.primary_contact_name) ||
    getNameFromPerson(organization.primary_contact) ||
    getDisplayText(organization.primary_contact_email) ||
    'No primary contact'
  );
};

const getCountValue = (organization: OrganizationRecord, keys: string[]) => {
  for (const key of keys) {
    const value = organization[key as keyof OrganizationRecord];
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return 0;
};

const isActive = (organization: OrganizationRecord) => {
  const status = String(organization.status || '').trim().toUpperCase();
  if (status === 'ACTIVE' || status === 'ENABLED' || status === 'TRUE') {
    return true;
  }
  if (status === 'INACTIVE' || status === 'DISABLED' || status === 'FALSE') {
    return false;
  }
  return Boolean(organization.is_active);
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [nurses, setNurses] = useState<NurseRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [organizationsResult, nursesResult, appointmentsResult] = await Promise.allSettled([
          adminOrganizationService.getAll(),
          nurseService.getAll(),
          appointmentService.getAll(),
        ]);

        const organizationItems = organizationsResult.status === 'fulfilled'
          ? organizationsResult.value?.data?.results || organizationsResult.value?.data || []
          : [];
        const nurseItems = nursesResult.status === 'fulfilled'
          ? nursesResult.value?.data?.results || nursesResult.value?.data || []
          : [];
        const appointmentItems = appointmentsResult.status === 'fulfilled'
          ? appointmentsResult.value?.data?.results || appointmentsResult.value?.data || []
          : [];

        setOrganizations(Array.isArray(organizationItems) ? organizationItems : []);
        setNurses(Array.isArray(nurseItems) ? nurseItems : []);
        setAppointments(Array.isArray(appointmentItems) ? appointmentItems : []);

        if (organizationsResult.status === 'rejected' && nursesResult.status === 'rejected' && appointmentsResult.status === 'rejected') {
          setError('Could not load organization data.');
        }
      } catch {
        setError('Could not load organization data.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const stats = useMemo(() => {
    const activeOrganizations = organizations.filter((organization) => isActive(organization)).length;
    const totalAffiliatedNurses = organizations.reduce((sum, organization) => {
      return sum + getCountValue(organization, ['nurse_count', 'affiliated_nurses_count', 'nurses_count']);
    }, 0);
    const activeAppointments = appointments.filter((appointment) => {
      const status = String(appointment.status || '').trim().toUpperCase();
      return ['APPROVED', 'CONFIRMED', 'UNDER_REVIEW', 'NURSE_SUGGESTED', 'SUBMITTED'].includes(status);
    }).length;

    return {
      totalOrganizations: organizations.length,
      activeOrganizations,
      totalAffiliatedNurses: totalAffiliatedNurses || nurses.length,
      activeAppointments: activeAppointments || appointments.length,
    };
  }, [appointments, nurses.length, organizations]);

  return (
    <div className="space-y-6 pt-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Organizations</h1>
          <p className="mt-1 text-gray-600">Manage partner organizations and the nurses affiliated with them.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-dark-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-deep-navy"
        >
          <Plus className="h-4 w-4" />
          Add Organization
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Total organizations</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalOrganizations}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Active organizations</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.activeOrganizations}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Total affiliated nurses</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalAffiliatedNurses}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Active appointments</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.activeAppointments}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Organizations</h2>
            <p className="text-sm text-gray-600">Track partner status, administrators, nurses, and appointment activity.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="px-3 py-3">Organization</th>
                <th className="px-3 py-3">Administrator</th>
                <th className="px-3 py-3">Primary contact</th>
                <th className="px-3 py-3">Nurses</th>
                <th className="px-3 py-3">Active Appointments</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-600">
                    Loading organizations...
                  </td>
                </tr>
              )}

              {!isLoading && organizations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-600">
                    No organizations have been returned yet.
                  </td>
                </tr>
              )}

              {!isLoading && organizations.map((organization) => {
                const organizationName = getOrgDisplayName(organization);
                const nurseCount = getCountValue(organization, ['nurse_count', 'affiliated_nurses_count', 'nurses_count']);
                const activeAppointmentCount = getCountValue(organization, ['active_appointments_count', 'current_appointments', 'appointments_count']);
                const active = isActive(organization);

                return (
                  <tr key={organization.id || organizationName} className="border-b border-gray-100 align-top">
                    <td className="px-3 py-3">
                      <div className="font-semibold text-gray-900">{organizationName}</div>
                      <div className="mt-1 text-xs text-gray-500">Partner organization</div>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{getOrgAdministrator(organization)}</td>
                    <td className="px-3 py-3 text-gray-700">{getOrgPrimaryContact(organization)}</td>
                    <td className="px-3 py-3 text-gray-700">{nurseCount}</td>
                    <td className="px-3 py-3 text-gray-700">{activeAppointmentCount}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Organization Actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            'View organization details',
            'Add/Edit organization',
            'Assign Organization Administrator',
            'View affiliated nurses',
            'Add or remove nurses from the organization',
            'View organization appointments',
            'Activate/Deactivate organization',
          ].map((action) => (
            <span key={action} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <Building2 className="h-4 w-4 text-brand-dark-blue" />
              {action}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
