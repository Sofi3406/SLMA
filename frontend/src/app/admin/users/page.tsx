'use client';

import React from 'react';
import UserListClient from '@/components/admin/UserListClient';

export default function AdminUsersPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-gray-600">Create, promote, deactivate, and delete users.</p>
      </div>

      <div className="page-body mt-6">
        <UserListClient />
      </div>
    </div>
  );
}
