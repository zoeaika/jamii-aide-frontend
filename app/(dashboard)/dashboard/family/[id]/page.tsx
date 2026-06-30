'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Phone, UserRound } from 'lucide-react';
import { familyMemberService } from '@/app/lib/api';
import { formatDate } from '@/app/lib/format';

type FamilyMemberDetail = {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  city: string;
  phone: string;
  chronicConditions: string[];
  createdAt?: string;
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
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export default function FamilyMemberDetailPage() {
  const params = useParams<{ id: string }>();
  const memberId = useMemo(() => String(params?.id || ''), [params]);
  const hasMemberId = Boolean(memberId);

  const [member, setMember] = useState<FamilyMemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(hasMemberId);
  const [loadError, setLoadError] = useState(hasMemberId ? '' : 'Missing family member id.');

  useEffect(() => {
    if (!memberId) {
      return;
    }

    let cancelled = false;

    const loadMember = async () => {
      setLoadError('');
      try {
        const response = await familyMemberService.getById(memberId);
        const item = response?.data;

        if (cancelled) {
          return;
        }

        if (!item || typeof item !== 'object') {
          setLoadError('Family member record was not found.');
          setMember(null);
          return;
        }

        setMember({
          id: String(item.id || memberId),
          fullName: String(item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Family Member'),
          age: getAgeFromDateOfBirth(item.date_of_birth),
          gender: String(item.gender || 'Not set'),
          city: String(item.city || item.location || item.address || 'Not set'),
          phone: String(item.phone || item.phoneNumber || 'Not set'),
          chronicConditions: splitConditions(item.chronic_conditions || item.medical_conditions || item.conditions),
          createdAt: item.created_at,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error('Failed to load family member detail:', error);
        setLoadError('Unable to load this family member profile.');
        setMember(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMember();

    return () => {
      cancelled = true;
    };
  }, [memberId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/family" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900">
          <ArrowLeft className="h-4 w-4" />
          Back to family members
        </Link>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Loading family member profile...</p>
        </div>
      </div>
    );
  }

  if (loadError || !member) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/family" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900">
          <ArrowLeft className="h-4 w-4" />
          Back to family members
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-semibold">Profile unavailable</p>
          <p className="mt-1 text-sm">{loadError || 'Family member record was not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/family" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900">
        <ArrowLeft className="h-4 w-4" />
        Back to family members
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <UserRound className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.fullName}</h1>
              <p className="text-sm text-gray-600">{member.gender} - {member.age} years</p>
            </div>
          </div>
          <Link
            href={`/dashboard/appointments/new?member=${member.id}`}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Book appointment
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</p>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                {member.phone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                {member.city}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Record Info</p>
            <div className="mt-3 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Added {member.createdAt ? formatDate(member.createdAt) : 'recently'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Medical Conditions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {member.chronicConditions.length > 0 ? (
              member.chronicConditions.map((condition) => (
                <span key={condition} className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  {condition}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-600">No chronic conditions recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
