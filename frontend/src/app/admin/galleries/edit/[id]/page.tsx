'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/authService';

const gallerySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  location: z.string().optional(),
  category: z.enum(['infrastructure', 'education', 'healthcare', 'cultural', 'community', 'general'])
});

type GalleryFormData = z.infer<typeof gallerySchema>;

export default function EditGalleryPage() {
  const router = useRouter();
  const params = useParams();
  const galleryId = params?.id as string;

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: { category: 'general' }
  });

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      toast.error('Please login as an admin');
      router.push('/auth/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoadingItem(true);
        const token = authService.getToken();
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE}/galleries/admin/${galleryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load gallery item');

        const item = data.data;
        reset({
          title: item.title || '',
          description: item.description || '',
          location: item.location || '',
          category: item.category || 'general'
        });
        if (item.image) setImagePreview(item.image);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load gallery item');
        router.push('/admin/galleries');
      } finally {
        setLoadingItem(false);
      }
    };

    if (galleryId) fetchItem();
  }, [galleryId, reset, router]);

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
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: GalleryFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
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
      const response = await fetch(`${API_BASE}/galleries/${galleryId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update gallery item');
      }

      toast.success('Gallery item updated successfully!');
      router.push('/admin/galleries');
    } catch (error) {
      console.error('Error updating gallery item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update gallery item');
    } finally {
      setLoading(false);
    }
  };

  if (loadingItem) {
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
            Back to Gallery
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Gallery Item</h1>
          <p className="text-gray-600 mt-2">Update gallery content</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Gallery Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  {...register('title')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Worabe Community Center"
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
                  <option value="infrastructure">Infrastructure</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="cultural">Cultural</option>
                  <option value="community">Community</option>
                  <option value="general">General</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Worabe, Silte Zone"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the image..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Image Upload</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="slma-event-thumb rounded-lg object-cover" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload a gallery image</p>
                </div>
              )}

              <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700">
                <Upload size={18} />
                Choose Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
