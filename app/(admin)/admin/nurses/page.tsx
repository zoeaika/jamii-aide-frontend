'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  UserCheck,
  Search,
  Star,
  MapPin,
  Shield,
  Eye,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { nurseService, type NurseRecord } from '@/app/lib/api';

type ProfessionalType = 'PHYSIOTHERAPIST' | 'CAREGIVER_NURSE' | 'PALLIATIVE_CARE_NURSE';

export default function AdminNursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProfessionalType, setFilterProfessionalType] = useState<'all' | ProfessionalType>('all');
  const [nurses, setNurses] = useState<NurseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await nurseService.getAll(filterProfessionalType === 'all' ? undefined : filterProfessionalType);
        const items = response?.data?.results || response?.data || [];
        setNurses(Array.isArray(items) ? items : []);
      } catch {
        setError('Could not load nurses.');
        setNurses([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [filterProfessionalType]);

  const visibleNurses = useMemo(
    () =>
      nurses.filter((nurse) => {
        const status = 'approved';

        const matchesSearch = [
          nurse.user?.first_name,
          nurse.user?.last_name,
          nurse.user?.email,
          nurse.professional_type_display,
          ...(nurse.specializations || []),
          nurse.service_areas,
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || status === filterStatus;
        return matchesSearch && matchesStatus;
      }),
    [filterStatus, nurses, searchQuery],
  );

  const stats = useMemo(
    () => ({
      total: nurses.length,
      approved: nurses.length,
      totalCompleted: nurses.reduce((sum, nurse) => sum + Number(nurse.completed_appointments || 0), 0),
    }),
    [nurses],
  );

  return (
    <div className="space-y-6 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nurse Management</h1>
          <p className="text-gray-600 mt-2">Live nurse directory from `/api/nurses/`</p>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <UserCheck className="mb-2 h-8 w-8 text-green-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="mt-1 text-sm text-gray-600">Total Nurses</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <CheckCircle className="mb-2 h-8 w-8 text-green-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
          <p className="mt-1 text-sm text-gray-600">Approved</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Shield className="mb-2 h-8 w-8 text-purple-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.totalCompleted}</p>
          <p className="mt-1 text-sm text-gray-600">Completed Visits</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search nurses by name, specialization, or service area..."
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
            <option value="approved">Approved</option>
          </select>
          <select
            value={filterProfessionalType}
            onChange={(e) => setFilterProfessionalType(e.target.value as 'all' | ProfessionalType)}
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Professional Types</option>
            <option value="PHYSIOTHERAPIST">Physiotherapist</option>
            <option value="CAREGIVER_NURSE">Caregiver Nurse</option>
            <option value="PALLIATIVE_CARE_NURSE">Palliative Care Nurse</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-gray-500">Backend filter in use: `/api/nurses/?professional_type=...`</div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-600">Loading nurses...</div>
      ) : visibleNurses.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-600">No nurses matched the current filters.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {visibleNurses.map((nurse) => {
            const fullName = `${nurse.user?.first_name || ''} ${nurse.user?.last_name || ''}`.trim() || nurse.user?.email || nurse.id;
            const displayStatus = 'approved';

            return (
              <div key={nurse.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600">
                      <span className="text-2xl font-bold text-white">{fullName.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{fullName}</h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{nurse.service_areas || 'Service area not set'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-700">
                    {displayStatus}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500">Professional Type</p>
                  <p className="text-sm font-semibold text-gray-800">{nurse.professional_type_display || nurse.professional_type || 'Not set'}</p>
                </div>

                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {(nurse.specializations || []).map((specialization) => (
                      <span key={specialization} className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                        {specialization}
                      </span>
                    ))}
                    {(!nurse.specializations || nurse.specializations.length === 0) && (
                      <span className="text-sm text-gray-500">No specializations listed.</span>
                    )}
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-4 border-y border-gray-200 py-4">
                  <div className="text-center">
                    <div className="mb-1 flex items-center justify-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-bold text-gray-900">{Number(nurse.rating || 0).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{Number(nurse.total_appointments || 0)}</p>
                    <p className="text-xs text-gray-600">Appointments</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{Number(nurse.completed_appointments || 0)}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  <p>{nurse.user?.email || 'No email'}</p>
                  <p>{nurse.languages?.join(', ') || 'Languages not set'}</p>
                </div>

                <div className="flex space-x-3">
                  <button className="flex flex-1 items-center justify-center rounded-lg border-2 border-purple-600 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
