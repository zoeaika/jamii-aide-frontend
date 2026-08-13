'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, Star, Award, Shield, Save, Camera, Edit, Power, ArrowRight } from 'lucide-react';
import { getAccountVerificationState, nurseService } from '@/app/lib/api';

type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'OFF_DUTY';

const availabilityBadge = (status?: AvailabilityStatus) => {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Available', classes: 'bg-green-100 text-green-700 border border-green-200' };
    case 'BUSY':
      return { label: 'Busy — ongoing visit', classes: 'bg-orange-100 text-orange-700 border border-orange-200' };
    case 'OFFLINE':
      return { label: 'Offline', classes: 'bg-gray-100 text-gray-700 border border-gray-200' };
    case 'OFF_DUTY':
      return { label: 'Off duty', classes: 'bg-slate-100 text-slate-600 border border-slate-200' };
    default:
      return { label: 'Loading...', classes: 'bg-gray-100 text-gray-500 border border-gray-200' };
  }
};

export default function NurseProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [verificationState, setVerificationState] = useState(getAccountVerificationState());
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    specializations: [] as string[],
    languages: [] as string[],
    certifications: [] as string[],
  });
  const [nurseId, setNurseId] = useState<string | null>(null);
  const [isAcceptingRequests, setIsAcceptingRequests] = useState<boolean | undefined>(undefined);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus | undefined>(undefined);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);

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

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const response = await nurseService.me();
        setNurseId(response?.data?.id ?? null);
        setIsAcceptingRequests(Boolean(response?.data?.is_accepting_requests));
        setAvailabilityStatus(response?.data?.availability_status);
      } catch {
        // Availability card just stays in its loading state; rest of profile still renders.
      }
    };

    void loadAvailability();
  }, []);

  const isPendingAccess = verificationState.isPending;
  const badge = availabilityBadge(availabilityStatus);

  const handleToggleOnline = async () => {
    if (!nurseId) return;
    setIsTogglingOnline(true);
    try {
      const response = await nurseService.toggleAvailability(nurseId, !isAcceptingRequests);
      setIsAcceptingRequests(Boolean(response?.data?.is_accepting_requests));
      setAvailabilityStatus(response?.data?.availability_status);
    } catch {
      // Silently keep prior state; the availability page surfaces a retry-able error too.
    } finally {
      setIsTogglingOnline(false);
    }
  };

  const stats = {
    totalVisits: 0,
    rating: 0,
    completionRate: 0,
    responseTime: '-',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={isPendingAccess}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
        >
          <Edit className="h-5 w-5" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {isPendingAccess && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Profile updates stay locked until your verification is approved.
        </div>
      )}

      {/* Availability Toggle */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Availability status</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badge.classes}`}>
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleToggleOnline()}
              disabled={!nurseId || isTogglingOnline || isPendingAccess}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isAcceptingRequests
                  ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Power className="h-4 w-4" />
              {isTogglingOnline ? 'Updating...' : isAcceptingRequests ? 'Go Offline' : 'Go Online'}
            </button>
            <Link
              href="/nurse/availability"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark-blue hover:text-brand-deep-navy"
            >
              Edit working hours <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-4xl font-bold">M</span>
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Camera className="h-4 w-4 text-green-600" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
            <div className="flex items-center space-x-4 text-green-100">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-300 fill-yellow-300 mr-1" />
                <span className="font-semibold">{stats.rating}</span>
              </div>
              <span>•</span>
              <span>{stats.totalVisits} visits completed</span>
              <span>•</span>
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-1" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.totalVisits}</p>
          <p className="text-sm text-gray-600 mt-1">Total Visits</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
          <p className="text-sm text-gray-600 mt-1">Average Rating</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
          <p className="text-sm text-gray-600 mt-1">Completion Rate</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.responseTime}</p>
          <p className="text-sm text-gray-600 mt-1">Response Time</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            disabled={!isEditing}
            rows={3}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Specializations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Specializations</h3>
        <div className="flex flex-wrap gap-2">
          {profile.specializations.map((spec, idx) => (
            <span
              key={idx}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
            >
              {spec}
            </span>
          ))}
          {isEditing && (
            <button className="px-4 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-full text-sm font-medium hover:bg-green-50">
              + Add Specialization
            </button>
          )}
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Languages</h3>
        <div className="flex flex-wrap gap-2">
          {profile.languages.map((lang, idx) => (
            <span
              key={idx}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {lang}
            </span>
          ))}
          {isEditing && (
            <button className="px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50">
              + Add Language
            </button>
          )}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Award className="h-5 w-5 text-purple-600 mr-2" />
          Certifications
        </h3>
        <div className="space-y-3">
          {profile.certifications.map((cert, idx) => (
            <div key={idx} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <Shield className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <span className="text-gray-900 font-medium">{cert}</span>
            </div>
          ))}
          {isEditing && (
            <button className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg font-medium hover:bg-purple-50">
              + Add Certification
            </button>
          )}
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  );
}
