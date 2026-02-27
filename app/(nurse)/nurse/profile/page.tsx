'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Star, Award, Shield, Save, Camera, Edit } from 'lucide-react';

export default function NurseProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
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
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2"
        >
          <Edit className="h-5 w-5" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
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
