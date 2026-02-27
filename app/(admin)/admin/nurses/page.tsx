'use client';

import { useMemo, useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  Star,
  MapPin,
  Shield,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

type ProfessionalType = 'PHYSIOTHERAPIST' | 'CAREGIVER_NURSE' | 'PALLIATIVE_CARE_NURSE';
type NurseRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  specializations: string[];
  professional_type: ProfessionalType;
  rating: number;
  totalVisits: number;
  earnings: number;
  status: string;
  verificationDate: string | null;
};

const nurses: NurseRecord[] = [];

export default function AdminNursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProfessionalType, setFilterProfessionalType] = useState<'all' | ProfessionalType>('all');

  const visibleNurses = useMemo(
    () =>
      nurses.filter((nurse) => {
        const matchesSearch = [nurse.name, nurse.location, nurse.specializations.join(' '), nurse.professional_type]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || nurse.status === filterStatus;
        const matchesProfessionalType = filterProfessionalType === 'all' || nurse.professional_type === filterProfessionalType;
        return matchesSearch && matchesStatus && matchesProfessionalType;
      }),
    [filterProfessionalType, filterStatus, searchQuery],
  );

  const stats = {
    total: nurses.length,
    verified: nurses.filter((n) => n.status === 'verified').length,
    pending: nurses.filter((n) => n.status === 'pending').length,
    totalEarnings: nurses.reduce((sum, n) => sum + n.earnings, 0),
  };

  const typeLabel = (value: ProfessionalType) =>
    value
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nurse Management</h1>
          <p className="text-gray-600 mt-2">Verify and manage healthcare nurses</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{stats.pending} Pending Verification</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <UserCheck className="h-8 w-8 text-green-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600 mt-1">Total Nurses</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.verified}</p>
          <p className="text-sm text-gray-600 mt-1">Verified</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <Clock className="h-8 w-8 text-yellow-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-600 mt-1">Pending Review</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <Shield className="h-8 w-8 text-purple-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">KES {(stats.totalEarnings / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search nurses by name, location, specialization..."
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
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterProfessionalType}
            onChange={(e) => setFilterProfessionalType(e.target.value as 'all' | ProfessionalType)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="all">All Professional Types</option>
            <option value="PHYSIOTHERAPIST">Physiotherapist</option>
            <option value="CAREGIVER_NURSE">Caregiver Nurse</option>
            <option value="PALLIATIVE_CARE_NURSE">Palliative Care Nurse</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-gray-500 flex items-center">
          <Filter className="h-4 w-4 mr-1" />
          Backend filter supported: `/api/nurses/?professional_type=...`
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleNurses.map((nurse) => (
          <div key={nurse.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{nurse.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{nurse.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{nurse.location}</span>
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                  nurse.status === 'verified' ? 'bg-green-100 text-green-700' : nurse.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {nurse.status === 'verified' && <CheckCircle className="h-3 w-3" />}
                {nurse.status === 'pending' && <Clock className="h-3 w-3" />}
                <span>{nurse.status}</span>
              </span>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500">Professional Type</p>
              <p className="text-sm font-semibold text-gray-800">{typeLabel(nurse.professional_type)}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Specializations:</p>
              <div className="flex flex-wrap gap-2">
                {nurse.specializations.map((spec, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">{spec}</span>
                ))}
              </div>
            </div>

            {nurse.status === 'verified' && (
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 font-bold text-gray-900">{nurse.rating}</span>
                  </div>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{nurse.totalVisits}</p>
                  <p className="text-xs text-gray-600">Visits</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">KES {(nurse.earnings / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-600">Earned</p>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600 mb-4">
              <p>{nurse.email}</p>
              <p>{nurse.phone}</p>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium text-sm flex items-center justify-center">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
              {nurse.status === 'pending' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">Approve</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
