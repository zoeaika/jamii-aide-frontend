'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Phone, Save, ArrowLeft, User } from 'lucide-react';
import { familyMemberService } from '@/app/lib/api';

type FamilyMemberFormState = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  city: string;
  address: string;
  medical_conditions: string;
};

export default function NewFamilyMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FamilyMemberFormState>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    city: '',
    address: '',
    medical_conditions: '',
  });

  const updateField = <K extends keyof FamilyMemberFormState>(field: K, value: FamilyMemberFormState[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await familyMemberService.create({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        medical_conditions: formData.medical_conditions.trim(),
      });
      router.push('/dashboard/family');
    } catch (submitError: any) {
      console.error('Failed to save family member to backend:', submitError);
      const details = submitError?.response?.data;
      const detailMessage =
        (Array.isArray(details?.first_name) && details.first_name[0]) ||
        (Array.isArray(details?.last_name) && details.last_name[0]) ||
        (Array.isArray(details?.date_of_birth) && details.date_of_birth[0]) ||
        (Array.isArray(details?.gender) && details.gender[0]) ||
        (Array.isArray(details?.non_field_errors) && details.non_field_errors[0]) ||
        (typeof details?.detail === 'string' && details.detail) ||
        (typeof details === 'string' && details) ||
        (submitError?.message === 'Network Error'
          ? 'Unable to reach the backend. Please confirm the API server is running and try again.'
          : 'Unable to save family member. Please check the form and try again.');
      setError(detailMessage);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <div className="mb-8">
        <Link
          href="/dashboard/family"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Family Members
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add Family Member</h1>
        <p className="text-gray-600 mt-2">Create a complete profile for better care coordination and reporting.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Zoe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Wanjiku"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) => updateField('date_of_birth', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select gender</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+254 712 345 678"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City/Town *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Nyali"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Street address"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
            <textarea
              value={formData.medical_conditions}
              onChange={(e) => updateField('medical_conditions', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="e.g., Hypertension, Diabetes"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link
            href="/dashboard/family"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>{isLoading ? 'Saving...' : 'Save Family Member'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
