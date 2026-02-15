'use client';

import React, { useEffect, useState } from 'react';
import { activitiesApi } from '@/services/activitiesApi';
import ActivityFeed from './ActivityFeed';

export default function ActivityListClient() {
  const [activities, setActivities] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<any>({});

  const fetchPage = async (p = 1) => {
    try {
      setLoading(true);
      const res = await activitiesApi.getActivities(p, limit);
      setActivities(res.activities || []);
      setPagination(res.pagination || {});
      setPage(p);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  return (
    <div>
      <div className="mb-3">
        <ActivityFeed activities={activities} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-600">Page {pagination.page || page} of {pagination.pages || 1}</div>
        <div className="space-x-2">
          <button onClick={() => fetchPage(Math.max(1, (page || 1) - 1))} disabled={page <= 1 || loading} className="btn">Prev</button>
          <button onClick={() => fetchPage((page || 1) + 1)} disabled={page >= (pagination.pages || 1) || loading} className="btn">Next</button>
        </div>
      </div>
    </div>
  );
}
