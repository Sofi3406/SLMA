'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Upload,
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/authService';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['cultural', 'educational', 'community', 'sports', 'youth', 'religious']),
  date: z.string().min(1, 'Date is required'),
  endDate: z.string().optional(),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(3, 'Location is required'),
  address: z.string().optional(),
  maxAttendees: z.string().optional(),
  isIslamicEvent: z.boolean().default(false),
  prayerTiming: z.string().optional(),
  suitableFor: z.array(z.string()).default(['families']),
  registrationRequired: z.boolean().default(false),
  registrationUrl: z.string().url().optional().or(z.literal('')),
  isVirtual: z.boolean().default(false),
  googleMeetingLink: z.string().url().optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

const suitableForOptions = [
  { value: 'men', label: 'Men Only' },
  { value: 'women', label: 'Women Only' },
  { value: 'children', label: 'Children' },
  { value: 'families', label: 'Families' },
  { value: 'youth', label: 'Youth' },
  { value: 'elders', label: 'Elders' },
];

const toLocalInputValue = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      category: 'cultural',
      isIslamicEvent: false,
      registrationRequired: false,
      isVirtual: false,
      suitableFor: ['families'],
    },
  });

  const isIslamicEvent = watch('isIslamicEvent');
  const registrationRequired = watch('registrationRequired');
  const isVirtual = watch('isVirtual');

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      toast.error('Please login as an admin');
      router.push('/auth/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoadingEvent(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE}/events/${eventId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load event');

        const event = data.data;
        reset({
          title: event.title || '',
          description: event.description || '',
          category: event.category || 'cultural',
          date: toLocalInputValue(event.date),
          endDate: toLocalInputValue(event.endDate),
          time: event.time || '10:00 AM',
          location: event.location || '',
          address: event.address || '',
          maxAttendees: event.maxAttendees ? String(event.maxAttendees) : '',
          isIslamicEvent: Boolean(event.isIslamicEvent),
          prayerTiming: event.prayerTiming || '',
          suitableFor: event.suitableFor || ['families'],
          registrationRequired: Boolean(event.registrationRequired),
          registrationUrl: event.registrationUrl || '',
          isVirtual: Boolean(event.isVirtual),
          googleMeetingLink: event.googleMeetingLink || '',
        });
        if (event.image) {
          setImagePreview(event.image);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load event');
        router.push('/admin/events');
      } finally {
        setLoadingEvent(false);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId, reset, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, value.join(','));
          } else if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      if (image) {
        formData.append('image', image);
      }

      const token = authService.getToken();
      if (!token) {
        setLoading(false);
        toast.error('Not authenticated. Please login as admin.');
        router.push('/auth/login');
        return;
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update event');
      }

      toast.success('Event updated successfully!');
      router.push('/admin/events');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const toggleSuitableFor = (value: string) => {
    const currentValues = watch('suitableFor') || [];
    if (currentValues.includes(value)) {
      setValue('suitableFor', currentValues.filter(v => v !== value));
    } else {
      setValue('suitableFor', [...currentValues, value]);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Events
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600 mt-2">Update event details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  {...register('title')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Silte Cultural Festival 2024"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  {...register('category')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="cultural">Cultural</option>
                  <option value="religious">Religious</option>
                  <option value="educational">Educational</option>
                  <option value="sports">Sports</option>
                  <option value="community">Community</option>
                  <option value="youth">Youth</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the event in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Date, Time & Location</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  {...register('date')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                <input
                  type="datetime-local"
                  {...register('endDate')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Time *
                </label>
                <input
                  type="text"
                  {...register('time')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2:00 PM - 5:00 PM"
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Location *
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Worabe Cultural Center"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
                <input
                  type="text"
                  {...register('address')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-2" />
                  Maximum Attendees (Optional)
                </label>
                <input
                  type="number"
                  {...register('maxAttendees')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0 for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suitable For</label>
                <div className="grid grid-cols-2 gap-2">
                  {suitableForOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={watch('suitableFor')?.includes(option.value)}
                        onChange={() => toggleSuitableFor(option.value)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isIslamicEvent')}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Islamic Event</span>
                </label>
              </div>

              {isIslamicEvent && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prayer Timing</label>
                  <input
                    type="text"
                    {...register('prayerTiming')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Asr prayer at 4:30 PM"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('registrationRequired')}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Registration Required</span>
                </label>
              </div>

              {registrationRequired && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration URL</label>
                  <input
                    type="url"
                    {...register('registrationUrl')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.registrationUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/register"
                  />
                  {errors.registrationUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.registrationUrl.message}</p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isVirtual')}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Virtual Event</span>
                </label>
              </div>

              {isVirtual && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Video className="inline w-4 h-4 mr-2" />
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    {...register('googleMeetingLink')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.googleMeetingLink ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://meet.google.com/..."
                  />
                  {errors.googleMeetingLink && (
                    <p className="mt-1 text-sm text-red-600">{errors.googleMeetingLink.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Image</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview} alt="Preview" className="slma-event-thumb object-cover rounded-lg mx-auto" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview('');
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <label className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Click to upload event image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1 text-sm text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/events')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
