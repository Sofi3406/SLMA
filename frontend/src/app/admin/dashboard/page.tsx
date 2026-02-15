'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText,
  Shield,
  TrendingUp,
  AlertCircle,
  UserCheck,
  XCircle,
  Settings,
  Bell,
  FolderKanban,
  Image,
  Users2
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  pendingVerifications: number;
  pendingPayments: number;
  totalEvents: number;
  activeMembers: number;
  verifiedPayments: number;
  pendingDonationReceipts: number;
  rejectedDonationReceipts: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      const currentUser = authService.getUser();
      const token = authService.getToken();

      if (!currentUser || !token) {
        router.push('/auth/login');
        return;
      }

      if (!authService.isAdmin()) {
        router.push('/dashboard');
        return;
      }

      setUser(currentUser);
      
      // Fetch admin stats
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data || data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View, verify, and manage all users',
      icon: <Users className="w-8 h-8" />,
      miniIcon: Users,
      href: '/admin/users',
      color: 'bg-blue-500',
      count: stats?.totalUsers || 0
    },
    {
      title: 'Verify Payments',
      description: 'Review and verify payment receipts',
      icon: <DollarSign className="w-8 h-8" />,
      miniIcon: DollarSign,
      href: '/admin/payments',
      color: 'bg-green-500',
      count: stats?.pendingPayments || 0,
      badge: stats?.pendingPayments > 0 ? 'pending' : null
    },
    {
      title: 'Verify Donations',
      description: 'Review donation payment receipts',
      icon: <FileText className="w-8 h-8" />,
      miniIcon: FileText,
      href: '/admin/donations',
      color: 'bg-teal-500',
      count: stats?.pendingDonationReceipts || 0,
      badge: stats?.pendingDonationReceipts > 0 ? 'pending' : null
    },
    {
      title: 'Manage Events',
      description: 'Create and manage community events',
      icon: <Calendar className="w-8 h-8" />,
      miniIcon: Calendar,
      href: '/admin/events',
      color: 'bg-amber-500',
      count: stats?.totalEvents || 0
    },
    {
      title: 'Manage Projects',
      description: 'Create and manage community projects',
      icon: <FolderKanban className="w-8 h-8" />,
      miniIcon: FolderKanban,
      href: '/admin/projects',
      color: 'bg-emerald-500'
    },
    {
      title: 'Manage Galleries',
      description: 'Upload and manage gallery items',
      icon: <Image className="w-8 h-8" />,
      miniIcon: Image,
      href: '/admin/galleries',
      color: 'bg-rose-500'
    },
    {
      title: 'Manage Co-Founders',
      description: 'Add and update co-founder profiles',
      icon: <Users2 className="w-8 h-8" />,
      miniIcon: Users2,
      href: '/admin/co-founders',
      color: 'bg-sky-500'
    },
    {
      title: 'User Verifications',
      description: 'Accept and verify new user registrations',
      icon: <UserCheck className="w-8 h-8" />,
      miniIcon: UserCheck,
      href: '/admin/users?tab=verifications',
      color: 'bg-orange-500',
      count: stats?.pendingVerifications || 0,
      badge: stats?.pendingVerifications > 0 ? 'pending' : null
    },
    {
      title: 'Notifications',
      description: 'Payment reminders and events',
      icon: <Bell className="w-8 h-8" />,
      miniIcon: Bell,
      href: '/notifications',
      color: 'bg-teal-500'
    }
  ];

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600 bg-blue-100',
      change: '+12%'
    },
    {
      label: 'Active Members',
      value: stats?.activeMembers || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600 bg-green-100',
      change: '+5%'
    },
    {
      label: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-yellow-600 bg-yellow-100',
      change: stats?.pendingPayments > 0 ? 'Action needed' : 'All clear'
    },
    {
      label: 'Pending Donations',
      value: stats?.pendingDonationReceipts || 0,
      icon: <FileText className="w-6 h-6" />,
      color: 'text-teal-600 bg-teal-100',
      change: stats?.pendingDonationReceipts > 0 ? 'Action needed' : 'All clear'
    },
    {
      label: 'Verified Payments',
      value: stats?.verifiedPayments || 0,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-amber-700 bg-amber-100',
      change: '+8%'
    },
    {
      label: 'Total Events',
      value: stats?.totalEvents || 0,
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-indigo-600 bg-indigo-100',
      change: '+3'
    },
    {
      label: 'Pending Verifications',
      value: stats?.pendingVerifications || 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'text-red-600 bg-red-100',
      change: stats?.pendingVerifications > 0 ? 'Review needed' : 'All clear'
    },
  ];

  return (
    <div className="admin-dashboard min-h-screen">
      {/* Header */}
      <div className="admin-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 admin-hero-inner">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="admin-chip">
                <Shield className="w-4 h-4" />
                Admin Access
              </span>
              <h1 className="admin-title text-3xl md:text-4xl mt-3">Admin Dashboard</h1>
              <p className="admin-subtitle mt-2 text-sm md:text-base">
                Welcome back, {user.name} • {user.role === 'super_admin' ? 'Super Admin' : 'Woreda Admin'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/profile/edit" className="admin-ghost-button">
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
              <span className="admin-chip">Status: Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="admin-stat-card p-6 admin-reveal"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="admin-action-card p-6 group admin-reveal"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex justify-end mb-3 relative z-10">
                  {action.miniIcon && (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500">
                      <action.miniIcon className="w-4 h-4 text-slate-700" />
                    </span>
                  )}
                </div>
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  {action.badge && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      {action.count} {action.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 relative z-10">{action.description}</p>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-2xl font-bold text-gray-900">{action.count}</span>
                  <span className="text-sm text-gray-400 group-hover:text-gray-600">View →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

