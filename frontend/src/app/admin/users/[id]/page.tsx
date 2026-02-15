'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/services/adminApi';
import { authService } from '@/services/authService';
import {
  ArrowLeft,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Image as ImageIcon,
  FileText,
  Award,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const buildUploadUrl = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const normalized = value.replace(/\\/g, '/');
  if (normalized.includes('/uploads/')) {
    const idx = normalized.indexOf('/uploads/');
    return `${BASE_URL}${normalized.slice(idx)}`;
  }
  if (normalized.startsWith('uploads/')) return `${BASE_URL}/${normalized}`;
  if (normalized.startsWith('/uploads/')) return `${BASE_URL}${normalized}`;
  return `${BASE_URL}/uploads/${normalized}`;
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAdmin()) {
      router.push('/dashboard');
      return;
    }
    if (!id) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getUser(id);
        setUser(res.user);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load user');
        router.push('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const verifyUser = async () => {
    try {
      await adminApi.verifyUser(id);
      toast.success('User verified successfully');
      setUser((u: any) => u ? { ...u, emailVerified: true } : null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify user');
    }
  };

  const getProfileImageUrl = () => {
    return buildUploadUrl(user?.profile?.photo);
  };

  const getFirstName = () => {
    const rawName = (user?.name || '').trim();
    if (!rawName) return '—';
    return rawName.split(' ')[0];
  };

  const getNationalIdUrl = () => {
    const nid = user?.nationalId;
    if (!nid?.filename && !nid?.path) return null;
    return buildUploadUrl(nid.path || `registration/${nid.filename}`);
  };

  const getReceiptUrl = () => {
    const receipt = user?.payment?.receipt;
    if (!receipt?.filename) return null;
    return `${BASE_URL}/uploads/receipts/${receipt.filename}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header with profile image and verify */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="slma-avatar-xs rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/40">
                {getProfileImageUrl() ? (
                  <img src={getProfileImageUrl()!} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{user.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-green-100">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.emailVerified ? 'bg-green-500/80' : 'bg-yellow-500/80'
                  }`}>
                    {user.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
                    {user.membership?.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            {!user.emailVerified && (
              <button
                onClick={verifyUser}
                className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                <UserCheck className="w-5 h-5" />
                Verify User
              </button>
            )}
          </div>
        </div>

        {/* Full profile information */}
        <div className="p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-green-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">First Name</span>
                <p className="font-medium">{getFirstName()}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Father Name</span>
                <p className="font-medium">{user.fatherName || '—'}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Woreda</p>
                  <p className="font-medium capitalize">{(user.woreda || '—').replace(/-/g, ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Marital Status</span>
                <p className="font-medium capitalize">{user.maritalStatus || '—'}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Student / Employee</span>
                <p className="font-medium capitalize">{user.userType || '—'}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Profession</span>
                <p className="font-medium capitalize">{(user.profession || '—').replace(/_/g, ' ')}</p>
              </div>
              {user.currentResident && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <span className="text-sm">Current Resident</span>
                  <p className="font-medium">{user.currentResident}</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-green-600" />
              National ID Document
            </h2>
            <div className="border rounded-lg p-4 bg-gray-50">
              {getNationalIdUrl() ? (
                <div>
                  <a
                    href={getNationalIdUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium"
                  >
                    <FileText className="w-5 h-5" />
                    View National ID
                  </a>
                  {user.nationalId?.mimetype?.startsWith('image/') && (
                    <div className="mt-2">
                      <img
                        src={getNationalIdUrl()!}
                        alt="National ID"
                        className="slma-doc-thumb rounded border object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No National ID uploaded</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              Profile Photo
            </h2>
            <div className="border rounded-lg p-4 bg-gray-50">
              {getProfileImageUrl() ? (
                <img
                  src={getProfileImageUrl()!}
                  alt="Profile"
                  className="slma-avatar-xs rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <p className="text-gray-500">No profile photo</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Membership & Payment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Plan</p>
                <p className="font-medium capitalize">{user.membershipPlan || '—'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Membership ID</p>
                <p className="font-medium">{user.membership?.membershipId || '—'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Payment Status</p>
                <p className="font-medium capitalize">{user.payment?.status || '—'}</p>
              </div>
            </div>
            {getReceiptUrl() && user.payment?.status === 'pending' && (
              <div className="mt-4">
                <a
                  href={getReceiptUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium"
                >
                  <FileText className="w-5 h-5" />
                  View Payment Receipt
                </a>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
