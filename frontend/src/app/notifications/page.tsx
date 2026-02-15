'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import api from '@/services/api';
import { getEvents } from '@/lib/eventsApi';
import type { Event } from '@/lib/eventsApi';
import { Bell, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const getNextPaymentDue = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return format(d, 'd MMMM yyyy');
};

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, eventsRes] = await Promise.all([
          api.get('/auth/me'),
          getEvents({ upcomingOnly: true, limit: 10 })
        ]);
        setUser(meRes.data?.user);
        const evList = Array.isArray(eventsRes.events) ? eventsRes.events : Array.isArray(eventsRes.data) ? eventsRes.data : [];
        setEvents(evList);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  const backHref = authService.isAdmin() ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-green-600" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monthly payment reminders and upcoming events
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Monthly Payment Notification */}
          {user?.membership?.status === 'active' && (
            <div className="p-6 flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Monthly Payment Reminder</p>
                <p className="text-sm text-gray-600 mt-1">
                  Your monthly payment is coming due on <strong>{getNextPaymentDue()}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Please ensure your payment is completed before this date to maintain your membership.
                </p>
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Upcoming Events
            </h2>
            {events.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events</p>
            ) : (
              <ul className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <li key={event._id} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/events/${event._id}`}
                        className="font-medium text-gray-900 hover:text-green-600"
                      >
                        {event.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {format(new Date(event.date), 'd MMMM yyyy')} • {event.location}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/events"
              className="inline-block mt-4 text-sm text-green-600 hover:text-green-800 font-medium"
            >
              View all events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
