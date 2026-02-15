'use client';

import React from 'react';
import ActivityListClient from '@/components/features/activity/ActivityListClient';

export default function ActivityPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-2xl font-semibold">My Activity</h1>
        <p className="text-sm text-gray-600">A history of your recent actions and events.</p>
      </div>

      <div className="page-body mt-6">
        <ActivityListClient />
      </div>
    </div>
  );
}
