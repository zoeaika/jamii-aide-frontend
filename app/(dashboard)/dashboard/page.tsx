'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  UserPlus, 
  Calendar, 
  Activity,
  Heart,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { appointmentService, familyMemberService } from '@/app/lib/api';

export default function DashboardPage() {
  const [familyMemberCount, setFamilyMemberCount] = useState(0);
  const [upcomingAppointmentsCount, setUpcomingAppointmentsCount] = useState(0);
  const [activityMessage, setActivityMessage] = useState('No recent backend activity yet.');

  useEffect(() => {
    const loadFamilyMembers = async () => {
      try {
        const response = await familyMemberService.getAll();
        const items = response?.data?.results || response?.data || [];
        setFamilyMemberCount(Array.isArray(items) ? items.length : 0);
      } catch {
        setFamilyMemberCount(0);
      }
    };

    void loadFamilyMembers();
    window.addEventListener('focus', loadFamilyMembers);
    return () => {
      window.removeEventListener('focus', loadFamilyMembers);
    };
  }, []);

  useEffect(() => {
    const countUpcoming = (items: any[]) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const blocked = new Set(['CANCELLED', 'COMPLETED', 'REJECTED']);
      return items.filter((item) => {
        const dateRaw = item?.appointment_date;
        if (!dateRaw) return false;
        const date = new Date(dateRaw);
        if (Number.isNaN(date.getTime())) return false;
        date.setHours(0, 0, 0, 0);
        const status = String(item?.status || '').toUpperCase();
        return date >= today && !blocked.has(status);
      }).length;
    };

    const loadUpcomingAppointments = async () => {
      try {
        const response = await appointmentService.getAll();
        const apiItems = response?.data?.results || response?.data || [];
        const items = Array.isArray(apiItems) ? apiItems : [];
        setUpcomingAppointmentsCount(countUpcoming(items));
        setActivityMessage(items.length > 0 ? 'Your latest requests are coming from the backend.' : 'No recent backend activity yet.');
      } catch {
        setUpcomingAppointmentsCount(0);
        setActivityMessage('Backend activity is unavailable right now.');
      }
    };

    void loadUpcomingAppointments();
    window.addEventListener('focus', loadUpcomingAppointments);
    return () => {
      window.removeEventListener('focus', loadUpcomingAppointments);
    };
  }, []);

  useEffect(() => {
    localStorage.removeItem('family_members');
    localStorage.removeItem('appointments_local');
  }, []);

  const quickActions = [
    {
      title: 'Add Family Member',
      description: 'Create a profile for your loved one',
      icon: UserPlus,
      href: '/dashboard/family/new',
      color: 'bg-blue-500',
    },
    {
      title: 'Book Appointment',
      description: 'Schedule a Healthcare Nurse visit',
      icon: Calendar,
      href: '/dashboard/appointments/new',
      color: 'bg-green-500',
    },
    {
      title: 'View Health Records',
      description: 'Access medical history',
      icon: Activity,
      href: '/dashboard/medical-records',
      color: 'bg-orange-500',
    },
  ];

  const stats = [
    {
      label: 'Family Members',
      value: String(familyMemberCount),
      icon: Heart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Upcoming Appointments',
      value: String(upcomingAppointmentsCount),
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-8 pt-16">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your family&apos;s healthcare coordination.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition group"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>Get started</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="font-medium text-gray-900">Live backend status</p>
            <p className="mt-1 text-sm text-gray-600">{activityMessage}</p>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Updated from current API data
            </p>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Add a family member</p>
                <p className="text-sm text-blue-100 mt-1">
                  Create profiles with medical history and emergency contacts
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Choose a Healthcare Nurse</p>
                <p className="text-sm text-blue-100 mt-1">
                  Browse verified nurses and book your first appointment
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Stay connected</p>
                <p className="text-sm text-blue-100 mt-1">
                  Get real-time updates and manage care from anywhere
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/family/new"
            className="mt-6 block w-full bg-white text-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Add Your First Family Member
          </Link>
        </div>
      </div>
    </div>
  );
}
