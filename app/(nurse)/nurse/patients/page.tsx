'use client';

import { useState } from 'react';
import { Search, User, MapPin, Calendar, Phone, Mail, FileText, Heart } from 'lucide-react';

export default function NursePatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const patients: Array<{
    id: number;
    name: string;
    age: number;
    location: string;
    phone: string;
    email: string;
    conditions: string[];
    lastVisit: string;
    nextVisit: string | null;
    totalVisits: number;
    notes: string;
  }> = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600 mt-2">View and manage patient information</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <User className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Patients</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {patients.reduce((sum, p) => sum + p.totalVisits, 0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total Visits</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Heart className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {patients.filter((p) => p.nextVisit).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Scheduled Visits</p>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{patient.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">{patient.age} years old</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {patient.totalVisits} visits
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{patient.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{patient.email}</span>
              </div>
            </div>

            {/* Health Conditions */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Health Conditions:</p>
              <div className="flex flex-wrap gap-2">
                {patient.conditions.map((condition, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            {patient.notes && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Notes:</p>
                <p className="text-sm text-gray-900">{patient.notes}</p>
              </div>
            )}

            {/* Visit Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600 mb-1">Last Visit</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Next Visit</p>
                  <p className="font-semibold text-gray-900">
                    {patient.nextVisit
                      ? new Date(patient.nextVisit).toLocaleDateString()
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium text-sm flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-2" />
                  View Records
                </button>
                <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
