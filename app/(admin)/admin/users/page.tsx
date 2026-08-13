'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, Search, Mail, Calendar, CheckCircle, Clock, Edit2, X, Check, Ban } from 'lucide-react';
import {
  appointmentService,
  endUserService,
  adminUserService,
  type AdminUserRecord,
  type EndUserRecord,
} from '@/app/lib/api';
import { formatDate, formatKES } from '@/app/lib/format';

type AppointmentRecord = {
  end_user_profile?: string | null;
  status?: string;
  amount?: number | string | null;
};

const isPendingApproval = (user: AdminUserRecord) => {
  const role = String(user.role || '').toUpperCase();
  const requiresReview = role === 'NURSE' || role === 'ORGANIZATION_ADMIN';
  return requiresReview && !(user.is_verified && user.is_active);
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [appointmentStatsByEndUserId, setAppointmentStatsByEndUserId] = useState<
    Record<string, { appointments: number; totalSpent: number; active: boolean }>
  >({});
  const [endUserIdByUserId, setEndUserIdByUserId] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleChangeModal, setRoleChangeModal] = useState<{ userId: string; userName: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [decisionUserId, setDecisionUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [usersResponse, endUsersResponse, appointmentsResponse] = await Promise.all([
          adminUserService.getAll(),
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

        const userItems = normalizeList(usersResponse?.data) as AdminUserRecord[];
        const endUserItems = normalizeList(endUsersResponse?.data) as EndUserRecord[];
        const appointmentItems = normalizeList(appointmentsResponse?.data) as AppointmentRecord[];

        // Appointments key off EndUserProfile.id, not CustomUser.id — build the bridge.
        const endUserIdMap: Record<string, string> = {};
        endUserItems.forEach((endUser) => {
          const userId = endUser.user?.id;
          if (userId && endUser.id) {
            endUserIdMap[userId] = endUser.id;
          }
        });

        const statsByEndUserId: Record<string, { appointments: number; totalSpent: number; active: boolean }> = {};
        appointmentItems.forEach((appointment) => {
          const endUserId = appointment.end_user_profile;
          if (!endUserId) {
            return;
          }
          if (!statsByEndUserId[endUserId]) {
            statsByEndUserId[endUserId] = { appointments: 0, totalSpent: 0, active: false };
          }
          statsByEndUserId[endUserId].appointments += 1;
          statsByEndUserId[endUserId].totalSpent += Number(appointment.amount || 0);
          if ((appointment.status || '') !== 'CANCELLED') {
            statsByEndUserId[endUserId].active = true;
          }
        });

        setUsers(Array.isArray(userItems) ? userItems : []);
        setEndUserIdByUserId(endUserIdMap);
        setAppointmentStatsByEndUserId(statsByEndUserId);
      } catch {
        setError('Could not load users.');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const statsForUser = (user: AdminUserRecord) => {
    const endUserId = endUserIdByUserId[user.id];
    return (endUserId && appointmentStatsByEndUserId[endUserId]) || { appointments: 0, totalSpent: 0, active: false };
  };

  const visibleUsers = useMemo(
    () =>
      users.filter((user) => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const matchesSearch = [fullName, user.email, user.organization_name]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filterStatus === 'pending') return isPendingApproval(user);
        if (filterStatus === 'active') return Boolean(user.is_active) && !isPendingApproval(user);
        if (filterStatus === 'inactive') return !user.is_active;
        return true;
      }),
    [filterStatus, searchQuery, users],
  );

  const stats = useMemo(
    () => ({
      total: users.length,
      pending: users.filter(isPendingApproval).length,
      newThisMonth: users.filter((user) => {
        if (!user.created_at) return false;
        const created = new Date(user.created_at);
        const now = new Date();
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
      }).length,
      totalRevenue: users.reduce((sum, user) => sum + Number(statsForUser(user).totalSpent || 0), 0),
    }),
    [users, appointmentStatsByEndUserId, endUserIdByUserId],
  );

  const roleBadgeClasses = (role?: string) => {
    const normalized = String(role || 'USER').trim().toUpperCase();
    if (normalized === 'ADMIN') {
      return 'bg-red-100 text-red-700 border border-red-200';
    }
    if (normalized === 'NURSE') {
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
    if (normalized === 'ORGANIZATION_ADMIN') {
      return 'bg-purple-100 text-purple-700 border border-purple-200';
    }
    return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  };

  const handleChangeRole = async () => {
    if (!roleChangeModal || !selectedRole) return;

    setIsSavingRole(true);
    try {
      await adminUserService.changeRole(roleChangeModal.userId, selectedRole);
      setUsers(users.map((user) => (user.id === roleChangeModal.userId ? { ...user, role: selectedRole } : user)));
      setRoleChangeModal(null);
      setSelectedRole('');
      alert('Role updated successfully!');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.role || err?.response?.data?.message || 'Failed to change role';
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setDecisionUserId(userId);
    try {
      await adminUserService.approve(userId);
      setUsers(users.map((user) => (user.id === userId ? { ...user, is_verified: true, is_active: true } : user)));
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to approve account');
    } finally {
      setDecisionUserId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Reject this account? The user will be unable to sign in until re-approved.')) return;
    setDecisionUserId(userId);
    try {
      await adminUserService.reject(userId);
      setUsers(users.map((user) => (user.id === userId ? { ...user, is_verified: false, is_active: false } : user)));
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to reject account');
    } finally {
      setDecisionUserId(null);
    }
  };

  return (
    <div className="space-y-6 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Live roster from `/api/admin/users/` — all roles</p>
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
          <Clock className="mb-2 h-8 w-8 text-amber-600" />
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <p className="mt-1 text-sm text-gray-600">Pending Approval</p>
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
              placeholder="Search users by name, email, or organization..."
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
            <option value="pending">Pending Approval</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Appointments</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Request Value</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Approval</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || user.id;
                const userStats = statsForUser(user);
                const status = user.is_active ? 'active' : 'inactive';
                const role = String(user.role || 'USER').toUpperCase();
                const pending = isPendingApproval(user);

                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{fullName}</p>
                        <p className="text-xs text-gray-500">
                          Joined {user.created_at ? formatDate(user.created_at) : 'Unknown'}
                          {user.organization_name ? ` · ${user.organization_name}` : ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="mb-1 flex items-center text-gray-900">
                        <Mail className="mr-2 h-4 w-4 text-gray-400" />
                        {user.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{userStats.appointments}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {formatKES(userStats.totalSpent)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClasses(role)}`}>
                          {role}
                        </span>
                        {role !== 'ADMIN' && (
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
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {pending ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={decisionUserId === user.id}
                            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={decisionUserId === user.id}
                            className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
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
              {['USER', 'NURSE', 'ORGANIZATION_ADMIN'].map((role) => (
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
