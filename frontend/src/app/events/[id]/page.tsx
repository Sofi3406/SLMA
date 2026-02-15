'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString();
  } catch (e) {
    return dateStr || '';
  }
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
        const url = API_BASE ? `${API_BASE}/events/${id}` : `/api/events/${id}`;
        const res = await fetch(url);
        if (res.status === 404) {
          toast.error('Event not found');
          router.push('/events');
          return;
        }
        if (!res.ok) throw new Error('Failed to load event');
        const json = await res.json();
        setEvent(json.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!event) return null;

  const attendeesCount = event.attendees ? event.attendees.length : event.attendeesCount || 0;
  const maxAttendees = event.maxAttendees || 0;
  const remaining = maxAttendees > 0 ? Math.max(0, maxAttendees - attendeesCount) : 'Unlimited';

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {event.image && (
            <img src={event.image} alt={event.title} className="slma-event-thumb object-cover rounded" />
          )}

          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-2">{formatDate(event.date)} {event.time ? ` • ${event.time}` : ''}</div>
            <div className="flex gap-3 items-center mb-3">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">{event.category || 'General'}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">{event.status || 'upcoming'}</span>
              {event.isVirtual ? (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Online</span>
              ) : (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">In-person</span>
              )}
            </div>

            <div className="mb-2">
              <strong>Location:</strong> {event.address || event.location || 'TBD'}
            </div>

            {event.isVirtual && event.googleMeetingLink && (
              <div className="mb-2">
                <strong>Meeting Link:</strong> <a className="text-blue-600" href={event.googleMeetingLink} target="_blank" rel="noreferrer">Join Meeting</a>
              </div>
            )}

            <div className="mb-2">
              <strong>Who can attend:</strong> {event.suitableFor && event.suitableFor.length ? event.suitableFor.join(', ') : 'All'}
            </div>

            <div className="mb-2">
              <strong>Attendees:</strong> {attendeesCount} {maxAttendees > 0 ? `/ ${maxAttendees} (Remaining: ${remaining})` : ''}
            </div>

            {event.registrationRequired && (
              <div className="mb-2">
                <strong>Registration:</strong> Required
                {event.registrationUrl && (
                  <div><a className="text-blue-600" href={event.registrationUrl} target="_blank" rel="noreferrer">Register here</a></div>
                )}
                {event.registrationDeadline && (
                  <div className="text-sm text-gray-600">Deadline: {formatDate(event.registrationDeadline)}</div>
                )}
              </div>
            )}

            {event.organizer && (
              <div className="mt-3 text-sm text-gray-700">
                <strong>Organizer:</strong> {event.organizer.name || event.organizer}
                {event.organizer.email && <span className="ml-2">• {event.organizer.email}</span>}
              </div>
            )}
          </div>
        </div>

        <hr className="my-6" />

        <div className="prose prose-sm max-w-none mb-6 text-gray-800" dangerouslySetInnerHTML={{ __html: event.description || '<p>No description provided.</p>' }} />

        {event.adminNotes && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded"> <strong>Admin notes:</strong> {event.adminNotes}</div>
        )}

        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={() => router.push('/events')}>Back to Events</button>
          {event.registrationRequired && event.registrationUrl && (
            <a className="btn btn-primary" href={event.registrationUrl} target="_blank" rel="noreferrer">Register</a>
          )}
        </div>
      </div>
    </main>
  );
}
