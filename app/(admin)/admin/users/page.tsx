'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, Search, Mail, Calendar, CheckCircle, MapPin, Edit2, X } from 'lucide-react';
import { appointmentService, endUserService, adminUserService, type EndUserRecord } from '@/app/lib/api';
import { formatDate, formatKES } from '@/app/lib/format';

type AppointmentRecord = {
  end_user_profile?: string | null;
  status?: string;
  amount?: number | string | null;
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<EndUserRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleChangeModal, setRoleChangeModal] = useState<{ userId: string; userName: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [usersResponse, appointmentsResponse] = await Promise.all([
          endUserService.getAll(),
          appointmentService.getAll(),
        ]);

        const normalizeList = (payload: unknown): unknown[] => {
          if (Array.isArray(payload)) {
            return payload;
          }

          if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            const candidateKeys = ['results', 'items', 'data', 'users', 'end_users', 'records', 'objects'];
            for (const key of candidateKeys) {
              const value = record[key];
              if (Array.isArray(value)) {
                return value;
              }
            }

            const nestedArray = Object.values(record).find((value) => Array.isArray(value));
            if (nestedArray) {
              return nestedArray as unknown[];
            }

            if ('id' in record || 'user' in record || 'email' in record) {
              return [payload];
            }
          }

          return [];
        };

        const userItems = normalizeList(usersResponse?.data);
        const appointmentItems = normalizeList(appointmentsResponse?.data);

        setUsers(Array.isArray(userItems) ? (userItems as EndUserRecord[]) : []);
        setAppointments(Array.isArray(appointmentItems) ? (appointmentItems as AppointmentRecord[]) : []);
      } catch {
        setError('Could not load end users.');
        setUsers([]);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const appointmentStatsByUser = useMemo(() => {
    const map: Record<string, { appointments: number; totalSpent: number; active: boolean }> = {};
    appointments.forEach((appointment) => {
      const userId = appointment.end_user_profile;
      if (!userId) {
        return;
      }
      if (!map[userId]) {
        map[userId] = { appointments: 0, totalSpent: 0, active: false };
      }
      map[userId].appointments += 1;
      map[userId].totalSpent += Number(appointment.amount || 0);
      if ((appointment.status || '') !== 'CANCELLED') {
        map[userId].active = true;
      }
    });
    return map;
  }, [appointments]);

  const visibleUsers = useMemo(() => users, [users]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => {
        const userStats = appointmentStatsByUser[user.id];
        return Boolean(user.user?.is_active || userStats?.active);
      }).length,
      newThisMonth: users.filter((user) => {
        if (!user.created_at) {
          return false;
        }
        const created = new Date(user.created_at);
        const now = new Date();
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
      }).length,
      totalRevenue: users.reduce((sum, user) => sum + Number(appointmentStatsByUser[user.id]?.totalSpent || 0), 0),
    }),
    [appointmentStatsByUser, users],
  );

  const roleBadgeClasses = (role?: string) => {
    const normalized = String(role || 'USER').trim().toUpperCase();
    if (normalized === 'ADMIN') {
      return 'bg-red-100 text-red-700 border border-red-200';
    }
    if (normalized === 'NURSE') {
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
    return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  };

  const handleChangeRole = async () => {
    if (!roleChangeModal || !selectedRole) return;
    
    setIsSavingRole(true);
    try {
      await adminUserService.changeRole(roleChangeModal.userId, selectedRole);
      // Update the local users list
      setUsers(users.map(user => 
        user.id === roleChangeModal.userId && user.user
          ? { ...user, user: { ...user.user, role: selectedRole } }
          : user
      ));
      setRoleChangeModal(null);
      setSelectedRole('');
      alert('Role updated successfully!');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to change role';
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSavingRole(false);
    }
  };

  return (
    <div className="space-y-6 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Live end-user list from `/api/end-users/`</p>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Users className="mb-2 h-8 w-8 text-purple-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="mt-1 text-sm text-gray-600">Total Users</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <CheckCircle className="mb-2 h-8 w-8 text-green-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          <p className="mt-1 text-sm text-gray-600">Active Users</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Calendar className="mb-2 h-8 w-8 text-blue-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.newThisMonth}</p>
          <p className="mt-1 text-sm text-gray-600">New This Month</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Calendar className="mb-2 h-8 w-8 text-orange-600" />
          <p className="text-3xl font-bold text-gray-900">KES {formatKES(stats.totalRevenue)}</p>
          <p className="mt-1 text-sm text-gray-600">Request Value</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Location</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Appointments</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Request Value</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const fullName = `${user.user?.first_name || ''} ${user.user?.last_name || ''}`.trim() || user.user?.email || user.id;
                const userStats = appointmentStatsByUser[user.id] || { appointments: 0, totalSpent: 0, active: false };
                const status = user.user?.is_active || userStats.active ? 'active' : 'inactive';
                const role = String(user.user?.role || 'USER').toUpperCase();

                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{fullName}</p>
                        <p className="text-xs text-gray-500">Joined {user.created_at ? formatDate(user.created_at) : 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="mb-1 flex items-center text-gray-900">
                        <Mail className="mr-2 h-4 w-4 text-gray-400" />
                        {user.user?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                        {[user.current_city, user.current_country].filter(Boolean).join(', ') || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{userStats.appointments}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {formatKES(userStats.totalSpent)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClasses(role)}`}>
                          {role}
                        </span>
                        <button
                          onClick={() => {
                            setRoleChangeModal({ userId: user.id, userName: fullName });
                            setSelectedRole(role);
                          }}
                          className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Change role"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && visibleUsers.length === 0 && (
          <div className="px-6 py-8 text-sm text-gray-600">No users matched the current filters.</div>
        )}
        {isLoading && <div className="px-6 py-8 text-sm text-gray-600">Loading users...</div>}
      </div>

      {/* Role Change Modal */}
      {roleChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change User Role</h3>
              <button
                onClick={() => {
                  setRoleChangeModal(null);
                  setSelectedRole('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Changing role for: <span className="font-semibold">{roleChangeModal.userName}</span>
            </p>
            
            <div className="space-y-3 mb-6">
              {['USER', 'NURSE', 'ADMIN'].map((role) => (
                <label key={role} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className={`ml-3 rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClasses(role)}`}>
                    {role}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRoleChangeModal(null);
                  setSelectedRole('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                disabled={isSavingRole}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingRole ? 'Saving...' : 'Change Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
