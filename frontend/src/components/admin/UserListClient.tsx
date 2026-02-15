'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import Link from 'next/link';
import { UserCheck, XCircle, Trash2, Shield, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserListClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<any>({});

  const fetchUsers = async (p = 1) => {
    try {
      setLoading(true);
      const res = await adminApi.listUsers(p, limit, search);
      setUsers(res.users || []);
      setPagination(res.pagination || {});
      setPage(p);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchUsers(1); 
  }, []);

  const changeRole = async (id: string, role: string) => {
    try {
      await adminApi.changeRole(id, role);
      toast.success('User role updated');
      fetchUsers(page);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await adminApi.setStatus(id, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`);
      fetchUsers(page);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const verifyUser = async (id: string) => {
    try {
      await adminApi.verifyUser(id);
      toast.success('User verified successfully');
      fetchUsers(page);
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify user');
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted');
      fetchUsers(page);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const getStatusBadge = (user: any) => {
    if (!user.isActive) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inactive</span>;
    }
    if (!user.emailVerified) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Unverified</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>;
  };

  const getMembershipBadge = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      pending_payment: 'bg-orange-100 text-orange-800',
      pending_verification: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center space-x-2">
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search by name/email/phone" 
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
        />
        <button 
          onClick={() => fetchUsers(1)} 
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      )}

      {!loading && (
        <div className="overflow-auto bg-white rounded-lg shadow-sm border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.woreda}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(u)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getMembershipBadge(u.membership?.status || 'none')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users/${u._id}`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Profile & Verify"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      {!u.emailVerified && (
                        <button 
                          onClick={() => verifyUser(u._id)} 
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Verify User"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => changeRole(u._id, u.role === 'member' ? 'woreda_admin' : 'member')} 
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Change Role"
                      >
                        <Shield className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => toggleActive(u._id, !u.isActive)} 
                        className={`p-1 ${u.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => removeUser(u._id)} 
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Page {pagination.page || page} of {pagination.pages || 1} • Total: {pagination.total || 0} users
        </div>
        <div className="space-x-2">
          <button 
            onClick={() => fetchUsers(Math.max(1, page - 1))} 
            disabled={page <= 1 || loading} 
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button 
            onClick={() => fetchUsers((page || 1) + 1)} 
            disabled={page >= (pagination.pages || 1) || loading} 
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
