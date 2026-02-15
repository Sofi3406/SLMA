'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  User as UserIcon,
  Activity as ActivityIcon,
  DollarSign
} from 'lucide-react';

type ActivityItem = {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
};

const formatDate = (dateStr?: string) => {
  try {
    return format(new Date(dateStr || ''), 'MMM dd, yyyy HH:mm');
  } catch {
    return dateStr || '';
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case 'profile_update':
      return <UserIcon className="w-5 h-5" />;
    case 'event_registration':
      return <Calendar className="w-5 h-5" />;
    case 'donation':
    case 'payment_submission':
    case 'payment_verification':
      return <DollarSign className="w-5 h-5" />;
    default:
      return <ActivityIcon className="w-5 h-5" />;
  }
};

export default function ActivityFeed({ activities }: { activities?: ActivityItem[] }) {
  const list = activities || [];

  if (!list.length) {
    return (
      <div className="p-4 bg-white rounded shadow-sm">
        <p className="text-sm text-gray-500">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
      <ul className="space-y-3">
        {list.map((act) => (
          <li key={act._id} className="flex items-start space-x-3">
            <div className="icon-box bg-gray-100 p-2 rounded">
              {getIcon(act.type)}
            </div>
            <div>
              <p className="text-sm text-gray-800">{act.description}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(act.createdAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
