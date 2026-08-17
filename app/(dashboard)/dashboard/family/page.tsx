'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Phone, MapPin, Trash2 } from 'lucide-react';
import { familyMemberService } from '@/app/lib/api';
import { formatDate } from '@/app/lib/format';

type FamilyMember = {
  id: number | string;
  name: string;
  age: number;
  gender: string;
  location: string;
  phone: string;
  conditions: string[];
  lastVisit: string;
  nextAppointment: string | null;
};

const getAgeFromDateOfBirth = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) {
    return 0;
  }
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return 0;
  }
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
};

const splitConditions = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

export default function FamilyMembersPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadError, setLoadError] = useState('');
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const loadMembers = async () => {
    setLoadError('');
    try {
      const response = await familyMemberService.getAll();
      const apiItems = response?.data?.results || response?.data || [];
      if (Array.isArray(apiItems)) {
        setFamilyMembers(
          apiItems.map((member: any) => ({
            id: member.id,
            name: String(member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Family Member'),
            age: getAgeFromDateOfBirth(member.date_of_birth),
            gender: String(member.gender || ''),
            location: String(member.city || member.location || member.address || ''),
            phone: String(member.phone || member.phoneNumber || ''),
            conditions: splitConditions(member.chronic_conditions || member.medical_conditions || member.conditions),
            lastVisit: String(member.lastVisit || member.created_at || new Date().toISOString()),
            nextAppointment: member.nextAppointment || null,
          })),
        );
        return;
      }
    } catch (error) {
      console.error('Failed to load family members from backend:', error);
    }
    setFamilyMembers([]);
    setLoadError('Unable to load backend family members.');
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const handleDelete = async (member: FamilyMember) => {
    if (!confirm(`Remove ${member.name} from your family members? This cannot be undone.`)) {
      return;
    }
    setDeletingId(member.id);
    try {
      await familyMemberService.remove(String(member.id));
      setFamilyMembers((curr) => curr.filter((m) => m.id !== member.id));
    } catch {
      alert('Could not remove this family member. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    localStorage.removeItem('family_members');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-600 mt-2">Manage profiles and health information</p>
        </div>
        <Link
          href="/dashboard/family/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2 shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span>Add Family Member</span>
        </Link>
      </div>

      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </div>
      )}

      {familyMembers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No family members yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add your first family member to start coordinating their healthcare.
          </p>
          <Link
            href="/dashboard/family/new"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Add Family Member</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.gender || 'Gender not set'} - {member.age} years</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => void handleDelete(member)}
                    disabled={deletingId === member.id}
                    className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove family member"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{member.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{member.phone}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Medical Conditions:</p>
                <div className="flex flex-wrap gap-2">
                  {member.conditions.length > 0 ? member.conditions.map((condition, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full"
                    >
                      {condition}
                    </span>
                  )) : (
                    <span className="text-sm text-gray-500">No medical conditions recorded.</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Last Visit</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(member.lastVisit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Next Appointment</p>
                    <p className="font-semibold text-gray-900">
                      {member.nextAppointment ? formatDate(member.nextAppointment) : 'Not scheduled'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
                <Link
                  href={`/dashboard/family/${member.id}`}
                  className="flex-1 py-2 text-center border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm"
                >
                  View Profile
                </Link>
                <Link
                  href={`/dashboard/appointments/new?member=${member.id}`}
                  className="flex-1 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
