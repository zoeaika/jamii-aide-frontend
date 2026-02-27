'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Plus, User, Phone, Mail, Calendar, MapPin, Heart, ChevronRight, Edit, Trash2 } from 'lucide-react';

const FAMILY_MEMBERS_STORAGE_KEY = 'family_members';

type FamilyMember = {
  id: number | string;
  name: string;
  age: number;
  relationship: string;
  location: string;
  phone: string;
  conditions: string[];
  lastVisit: string;
  nextAppointment: string | null;
};

export default function FamilyMembersPage() {
  const [familyMembers] = useState<FamilyMember[]>(() => {
    try {
      const raw = localStorage.getItem(FAMILY_MEMBERS_STORAGE_KEY);
      const savedMembers = raw ? JSON.parse(raw) : [];
      return Array.isArray(savedMembers) ? savedMembers : [];
    } catch (error) {
      console.error('Failed to load family members:', error);
      return [];
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Family Members List */}
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
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.relationship} • {member.age} years</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Edit className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
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

              {/* Health Conditions */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Health Conditions:</p>
                <div className="flex flex-wrap gap-2">
                  {member.conditions.map((condition, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              {/* Appointments */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Last Visit</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(member.lastVisit).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Next Appointment</p>
                    <p className="font-semibold text-gray-900">
                      {member.nextAppointment 
                        ? new Date(member.nextAppointment).toLocaleDateString()
                        : 'Not scheduled'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
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
