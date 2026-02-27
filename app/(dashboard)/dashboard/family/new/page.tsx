'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, MapPin, Save, ArrowLeft } from 'lucide-react';

const FAMILY_MEMBERS_STORAGE_KEY = 'family_members';

export default function NewFamilyMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    relationship: '',
    phone: '',
    location: '',
    address: '',
    conditions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newMember = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      age: Number(formData.age),
      relationship: formData.relationship,
      location: formData.location.trim(),
      phone: formData.phone.trim(),
      conditions: formData.conditions
        ? formData.conditions
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      lastVisit: new Date().toISOString().split('T')[0],
      nextAppointment: null,
    };

    try {
      const raw = localStorage.getItem(FAMILY_MEMBERS_STORAGE_KEY);
      const existingMembers = raw ? JSON.parse(raw) : [];
      const updatedMembers = [...existingMembers, newMember];
      localStorage.setItem(FAMILY_MEMBERS_STORAGE_KEY, JSON.stringify(updatedMembers));
    } catch (error) {
      console.error('Failed to save family member:', error);
    } finally {
      router.push('/dashboard/family');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/family"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Family Members
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add Family Member</h1>
        <p className="text-gray-600 mt-2">Create a profile for your loved one</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Family Member Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., 68"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                required
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select relationship</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Aunt">Aunt</option>
                <option value="Uncle">Uncle</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+254 712 345 678"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City/Town *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Nakuru"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Street address"
              />
            </div>
          </div>
        </div>

        {/* Health Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Conditions
            </label>
            <textarea
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="e.g., Hypertension, Diabetes"
            />
          </div>
        </div>

        {/* Buttons */}
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
