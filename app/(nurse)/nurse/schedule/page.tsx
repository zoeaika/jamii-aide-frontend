'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, User, CheckCircle, XCircle, Navigation } from 'lucide-react';

export default function NurseSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const appointments: Array<{
    id: number;
    time: string;
    patient: string;
    age: number;
    service: string;
    location: string;
    address: string;
    phone: string;
    status: 'confirmed' | 'pending';
    payment: number;
    notes: string;
  }> = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-2">Manage your appointments and visits</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
            Mark Availability
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Today&apos;s Visits</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Distance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">0 km</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Today&apos;s Earnings</p>
          <p className="text-2xl font-bold text-green-600 mt-1">KES 0</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {appointments.filter((appointment) => appointment.status === 'confirmed').length} of {appointments.length}
          </p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              {/* Left Section */}
              <div className="flex items-start space-x-4 flex-1">
                {/* Time */}
                <div className="text-center min-w-[80px]">
                  <div className="text-lg font-bold text-gray-900">
                    {appointment.time.split(' ')[0]}
                  </div>
                  <div className="text-xs text-gray-500">{appointment.time.split(' ')[1]}</div>
                </div>

                <div className="h-20 w-px bg-gray-300"></div>

                {/* Patient Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.patient}</h3>
                    <span className="text-sm text-gray-500">• {appointment.age} yrs</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{appointment.service}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{appointment.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{appointment.phone}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section */}
              <div className="ml-6 flex flex-col items-end space-y-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {appointment.status}
                </span>
                <p className="text-xl font-bold text-gray-900">
                  KES {appointment.payment.toLocaleString()}
                </p>
                <div className="flex flex-col space-y-2 w-full">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium whitespace-nowrap flex items-center justify-center">
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Visit
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium whitespace-nowrap">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
