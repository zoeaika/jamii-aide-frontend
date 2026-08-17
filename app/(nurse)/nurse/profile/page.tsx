'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, Star, Award, Shield, Save, Camera, Edit, Power, ArrowRight, X } from 'lucide-react';
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

type EditableProfile = {
  bio: string;
  specializations: string[];
  languages: string[];
  certifications: string[];
};

const emptyEditable = (): EditableProfile => ({ bio: '', specializations: [], languages: [], certifications: [] });

export default function NurseProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [verificationState, setVerificationState] = useState(getAccountVerificationState());

  const [nurseId, setNurseId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stats, setStats] = useState({ totalVisits: 0, rating: 0, completedVisits: 0, totalReviews: 0 });

  const [savedProfile, setSavedProfile] = useState<EditableProfile>(emptyEditable());
  const [draftProfile, setDraftProfile] = useState<EditableProfile>(emptyEditable());
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const [isAcceptingRequests, setIsAcceptingRequests] = useState<boolean | undefined>(undefined);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus | undefined>(undefined);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await nurseService.me();
      const data = response?.data || {};
      setNurseId(data.id ?? null);
      setName(`${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim() || data.user?.email || 'Nurse');
      setEmail(data.user?.email || '');
      setPhone(data.user?.phone || '');
      setStats({
        totalVisits: Number(data.total_appointments || 0),
        rating: Number(data.rating || 0),
        completedVisits: Number(data.completed_appointments || 0),
        totalReviews: Number(data.total_reviews || 0),
      });
      const nextProfile: EditableProfile = {
        bio: data.bio || '',
        specializations: Array.isArray(data.specializations) ? data.specializations : [],
        languages: Array.isArray(data.languages) ? data.languages : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
      };
      setSavedProfile(nextProfile);
      setDraftProfile(nextProfile);
      setIsAcceptingRequests(Boolean(data.is_accepting_requests));
      setAvailabilityStatus(data.availability_status);
    } catch {
      setError('Could not load your profile right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') || localStorage.getItem('user') : null;
    if (!storedUser) {
      return;
    }
    try {
      setVerificationState(getAccountVerificationState(JSON.parse(storedUser)));
    } catch {
      setVerificationState(getAccountVerificationState());
    }
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
      // Keep prior state; the dedicated availability page surfaces a retry-able error too.
    } finally {
      setIsTogglingOnline(false);
    }
  };

  const startEditing = () => {
    setDraftProfile(savedProfile);
    setNewSpecialization('');
    setNewLanguage('');
    setNewCertification('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftProfile(savedProfile);
    setIsEditing(false);
  };

  const addTag = (field: keyof Omit<EditableProfile, 'bio'>, value: string, reset: (v: string) => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setDraftProfile((curr) => ({ ...curr, [field]: [...curr[field], trimmed] }));
    reset('');
  };

  const removeTag = (field: keyof Omit<EditableProfile, 'bio'>, index: number) => {
    setDraftProfile((curr) => ({ ...curr, [field]: curr[field].filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!nurseId) return;
    setIsSaving(true);
    setError('');
    try {
      await nurseService.update(nurseId, draftProfile);
      setSavedProfile(draftProfile);
      setIsEditing(false);
    } catch {
      setError('Could not save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
          onClick={() => (isEditing ? cancelEditing() : startEditing())}
          disabled={isPendingAccess || isLoading}
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

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

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
              <span className="text-4xl font-bold">{name.charAt(0) || '?'}</span>
            </div>
            {isEditing && (
              <button
                className="absolute bottom-0 right-0 w-8 h-8 bg-white/60 rounded-full flex items-center justify-center shadow-lg cursor-not-allowed"
                disabled
                title="Coming soon — profile photo upload is not yet available"
              >
                <Camera className="h-4 w-4 text-green-600" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{name || (isLoading ? 'Loading...' : 'Nurse')}</h2>
            <div className="flex items-center space-x-4 text-green-100">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-300 fill-yellow-300 mr-1" />
                <span className="font-semibold">{stats.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span>{stats.completedVisits} visits completed</span>
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
          <p className="text-2xl font-bold text-gray-900">{stats.rating.toFixed(1)}</p>
          <p className="text-sm text-gray-600 mt-1">Average Rating</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.completedVisits}</p>
          <p className="text-sm text-gray-600 mt-1">Completed Visits</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
          <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
          <p className="text-sm text-gray-500 mt-1">Contact details are managed by support and can&apos;t be edited here.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                disabled
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={draftProfile.bio}
            onChange={(e) => setDraftProfile((curr) => ({ ...curr, bio: e.target.value }))}
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
          {draftProfile.specializations.map((spec, idx) => (
            <span
              key={`${spec}-${idx}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
            >
              {spec}
              {isEditing && (
                <button onClick={() => removeTag('specializations', idx)} className="hover:text-green-900">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}
          {draftProfile.specializations.length === 0 && !isEditing && (
            <span className="text-sm text-gray-500">No specializations listed.</span>
          )}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('specializations', newSpecialization, setNewSpecialization))}
              placeholder="e.g. Wound Care"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => addTag('specializations', newSpecialization, setNewSpecialization)}
              className="px-4 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50"
            >
              + Add
            </button>
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Languages</h3>
        <div className="flex flex-wrap gap-2">
          {draftProfile.languages.map((lang, idx) => (
            <span
              key={`${lang}-${idx}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {lang}
              {isEditing && (
                <button onClick={() => removeTag('languages', idx)} className="hover:text-blue-900">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}
          {draftProfile.languages.length === 0 && !isEditing && (
            <span className="text-sm text-gray-500">No languages listed.</span>
          )}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('languages', newLanguage, setNewLanguage))}
              placeholder="e.g. Swahili"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => addTag('languages', newLanguage, setNewLanguage)}
              className="px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50"
            >
              + Add
            </button>
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Award className="h-5 w-5 text-purple-600 mr-2" />
          Certifications
        </h3>
        <div className="space-y-3">
          {draftProfile.certifications.map((cert, idx) => (
            <div
              key={`${cert}-${idx}`}
              className="flex items-center justify-between space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
            >
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{cert}</span>
              </div>
              {isEditing && (
                <button onClick={() => removeTag('certifications', idx)} className="text-purple-600 hover:text-purple-900">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {draftProfile.certifications.length === 0 && !isEditing && (
            <p className="text-sm text-gray-500">No certifications listed.</p>
          )}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('certifications', newCertification, setNewCertification))}
              placeholder="e.g. Nursing Council of Kenya License"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => addTag('certifications', newCertification, setNewCertification)}
              className="px-4 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50"
            >
              + Add
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={cancelEditing}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
