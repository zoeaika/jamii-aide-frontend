'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Save } from 'lucide-react';
import { familyMemberService } from '@/app/lib/api';

type FamilyMember = {
  id: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  city?: string | null;
  location?: string | null;
  chronic_conditions?: string | null;
};

export default function EditFamilyMemberPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const memberId = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    location: '',
    conditions: '',
  });

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { first_name: 'Family', last_name: 'Member' };
    }
    if (parts.length === 1) {
      return { first_name: parts[0], last_name: 'Member' };
    }
    return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
  };

  const dateOfBirthFromAge = (ageInput: string) => {
    const age = Number(ageInput);
    const year = Number.isFinite(age) && age > 0 ? new Date().getFullYear() - age : new Date().getFullYear();
    return `${year}-01-01`;
  };

  useEffect(() => {
    const loadMember = async () => {
      if (!memberId) {
        setError('Missing family member id.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const response = await familyMemberService.getById(memberId);
        const member = (response?.data || {}) as FamilyMember;
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
        const age = member.date_of_birth
          ? String(Math.max(0, new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()))
          : '';

        setFormData({
          fullName: fullName || 'Family Member',
          age,
          gender: member.gender || '',
          phone: (member.phone_number || member.phone || '').trim(),
          location: (member.city || member.location || '').trim(),
          conditions: (member.chronic_conditions || '').trim(),
        });
      } catch (fetchError) {
        console.error('Failed to load member for edit:', fetchError);
        setError('Unable to load family member details.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadMember();
  }, [memberId]);

  const canSubmit = useMemo(
    () => Boolean(formData.fullName.trim() && formData.age.trim() && formData.gender.trim()),
    [formData],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!memberId || !canSubmit) return;

    setIsSaving(true);
    setError('');

    try {
      const { first_name, last_name } = splitName(formData.fullName);
      await familyMemberService.update(memberId, {
        first_name,
        last_name,
        date_of_birth: dateOfBirthFromAge(formData.age),
        gender: formData.gender,
        phone_number: formData.phone.trim(),
        phone: formData.phone.trim(),
        city: formData.location.trim(),
        location: formData.location.trim(),
        chronic_conditions: formData.conditions.trim(),
      });
      router.push(`/dashboard/family/${memberId}`);
    } catch (saveError: any) {
      console.error('Failed to update family member:', saveError);
      const details = saveError?.response?.data;
      const fieldMessage =
        details && typeof details === 'object'
          ? Object.entries(details)
              .map(([field, message]) => {
                const first = Array.isArray(message) ? message[0] : message;
                return `${field}: ${String(first)}`;
              })
              .join(' | ')
          : '';
      setError(fieldMessage || 'Could not update this profile. Please check your details and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={memberId ? `/dashboard/family/${memberId}` : '/dashboard/family'} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Family Member</h1>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-gray-600">Loading form...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData((curr) => ({ ...curr, fullName: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
              <input
                type="number"
                min={0}
                required
                value={formData.age}
                onChange={(e) => setFormData((curr) => ({ ...curr, age: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData((curr) => ({ ...curr, gender: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select gender</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Health Conditions</label>
            <textarea
              value={formData.conditions}
              onChange={(e) => setFormData((curr) => ({ ...curr, conditions: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="e.g., Hypertension, Diabetes"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((curr) => ({ ...curr, phone: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+254 712 345 678"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City/Town</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData((curr) => ({ ...curr, location: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Nakuru"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href={memberId ? `/dashboard/family/${memberId}` : '/dashboard/family'}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || isSaving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
