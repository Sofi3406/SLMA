'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { authService } from '@/services/authService';
import api from '@/services/api';
import { activitiesApi } from '@/services/activitiesApi';
import ActivityFeed from '@/components/features/activity/ActivityFeed';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Award, 
  Settings, 
  Bell, 
  FileText,
  LogOut,
  User as UserIcon,
  Activity,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
// Format date helper
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState<{ eventsAttended: number; totalDonations: number; totalMembers: number; communityEngagement: number } | null>(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [nextPaymentDue, setNextPaymentDue] = useState<string | null>(null);

  // Set mounted state and compute client-only values (avoids hydration mismatch)
  useEffect(() => {
    setMounted(true);
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    setNextPaymentDue(format(d, 'd MMMM yyyy'));
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    if (!mounted) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Check authentication
        const currentUser = authService.getUser();
        const token = authService.getToken();

        console.log('Dashboard auth check:', { 
          hasUser: !!currentUser, 
          hasToken: !!token,
          mounted 
        });

        // If not authenticated, redirect to login
        if (!currentUser || !token) {
          console.log('Not authenticated, redirecting to login');
          router.push('/auth/login');
          return;
        }

        // If admin, redirect to admin dashboard
        if (authService.isAdmin()) {
          console.log('Admin user detected, redirecting to admin dashboard');
          router.push('/admin/dashboard');
          return;
        }

        console.log('User authenticated, fetching data...');
        
        // Fetch full profile from API (includes all registration fields)
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data?.user) {
            setUser(meRes.data.user);
            localStorage.setItem('slma_user', JSON.stringify(meRes.data.user));
          } else {
            setUser(currentUser);
          }
        } catch {
          setUser(currentUser);
        }

        // Fetch dashboard stats
        try {
          const statsRes = await api.get('/dashboard/stats');
          if (statsRes.data?.success) {
            setStats({
              totalMembers: statsRes.data.totalMembers || 0,
              eventsAttended: statsRes.data.eventsAttended || 0,
              totalDonations: statsRes.data.totalDonations || 0,
              communityEngagement: statsRes.data.communityEngagement || 0
            });
          }
        } catch (statsErr) {
          console.warn('Failed to fetch dashboard stats:', statsErr);
        }

        // Fetch recent activities from API
        try {
          const activities = await activitiesApi.getUserActivities(10);
          setRecentActivities(activities);
        } catch (actErr) {
          console.warn('Failed to fetch recent activities:', actErr);
        }

        // Fetch upcoming events
        try {
          const eventsRes = await api.get('/events', {
            params: { upcomingOnly: true, limit: 3, order: 'asc', sortBy: 'date' }
          });
          if (eventsRes.data?.success) {
            setUpcomingEvents(eventsRes.data.data || []);
          }
        } catch (eventsErr) {
          console.warn('Failed to fetch upcoming events:', eventsErr);
        }

      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, mounted]);

  const handleLogout = () => {
    authService.logout();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'pending': return 'status-pending';
      case 'pending_payment': return 'status-pending_payment';
      case 'pending_verification': return 'status-pending_verification';
      case 'expired': return 'status-expired';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'profile_update': return <UserIcon className="w-4 h-4" />;
      case 'event_registration': return <Calendar className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'community_join': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'cultural': return 'event-type-cultural';
      case 'networking': return 'event-type-networking';
      case 'educational': return 'event-type-educational';
      case 'social': return 'event-type-social';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Return null until mounted - ensures server and client match (avoids hydration error)
  if (!mounted) return null;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12"></div>
          <p className="loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Dashboard Error</h2>
          <p className="error-message">{error}</p>
          <div className="error-buttons">
            <button
              onClick={handleRefresh}
              className="error-button error-button-primary"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="error-button error-button-secondary"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const getDonationType = () => {
    const plan = user.membershipPlan || 'basic';
    const amount = user.payment?.amount ?? (plan === 'premium' ? 1200 : plan === 'active' ? 500 : 0);
    if (plan === 'premium') return `Premium (ETB ${amount})`;
    if (plan === 'active') return `Basic (ETB ${amount})`;
    return `Free (ETB ${amount})`;
  };

  const dashboardStats = [
    { 
      label: 'Membership Status', 
      value: user.membership?.status ? user.membership.status.charAt(0).toUpperCase() + user.membership.status.slice(1).replace('_', ' ') : 'Active', 
      icon: <Award className="text-green-600 w-6 h-6" />,
      color: getMembershipStatusColor(user.membership?.status || 'active')
    },
    { 
      label: 'Member Since', 
      value: user.createdAt ? formatDate(user.createdAt) : user.membership?.startDate ? formatDate(user.membership.startDate) : '—', 
      icon: <Calendar className="text-blue-600 w-6 h-6" />
    },
    { 
      label: 'Events Attended', 
      value: stats?.eventsAttended || '0', 
      icon: <Users className="text-purple-600 w-6 h-6" />
    },
    { 
      label: 'Donation Type', 
      value: getDonationType(), 
      icon: <DollarSign className="text-orange-600 w-6 h-6" />
    },
  ];

  const quickActions = [
    { 
      label: 'Edit Profile', 
      icon: <Settings className="w-5 h-5" />, 
      action: () => router.push('/profile/edit'),
      color: 'bg-blue-500'
    },
    { 
      label: 'Notifications', 
      icon: <Bell className="w-5 h-5" />, 
      action: () => router.push('/notifications'),
      color: 'bg-purple-500'
    },
    { 
      label: 'My Events', 
      icon: <Calendar className="w-5 h-5" />, 
      action: () => router.push('/events'),
      color: 'bg-green-500'
    },
    { 
      label: 'Documents', 
      icon: <FileText className="w-5 h-5" />, 
      action: () => router.push('/documents'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-inner">
            <div>
              <h1 className="header-title">Welcome back, {user.name}!</h1>
              <p className="header-subtitle">
                Your SLMA membership is active. Enjoy all community benefits!
              </p>
            </div>
            
            <div className="membership-card">
              <div className="membership-info">
                <div className="membership-icon">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="membership-id">Membership ID</p>
                  <p className="membership-id-value">{user.membership?.membershipId || 'SLMA-' + user.id?.slice(-6)}</p>
                  <div className="membership-status">
                    <span className={`text-xs px-2 py-1 rounded-full ${getMembershipStatusColor(user.membership?.status || 'active')}`}>
                      {user.membership?.status?.replace('_', ' ') || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-grid">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="stats-grid">
              {dashboardStats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-content">
                    <div>
                      <p className="stat-label">{stat.label}</p>
                      <p className="stat-value">{stat.value}</p>
                    </div>
                    <div className="stat-icon">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Membership Details Card */}
            <div className="membership-details-card">
              <div className="card-header">
                <div className="card-header-content">
                  <h2 className="card-title">Membership Details</h2>
                </div>
              </div>
              
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="text-lg font-semibold capitalize">{user.membershipPlan} Member</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment</p>
                      <p className="text-lg font-semibold">
                        {user.payment ? formatCurrency(user.payment.amount) : 'ETB 0'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Started</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Due</p>
                    <p className="font-medium" suppressHydrationWarning>
                      {user.membership?.status === 'active'
                        ? (nextPaymentDue || '—')
                        : user.membership?.endDate
                          ? formatDate(user.membership.endDate)
                          : (nextPaymentDue || '—')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Woreda</p>
                      <p className="font-medium">{user.woreda || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-card">
              <div className="actions-header">
                <h2 className="actions-title">Quick Actions</h2>
                <div className="actions-grid">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="action-button"
                    >
                      <div className={`action-icon ${action.color}`}>
                        {action.icon}
                      </div>
                      <span className="action-label">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="side-column">
            {/* Profile Summary - all registration info visible after admin verification */}
            <div className="profile-card">
              <div className="profile-content">
                <div className="profile-header">
                  {user.profile?.photo ? (
                    <img
                      src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/uploads/${user.profile.photo}`}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="profile-avatar">
                      {user.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="profile-info">
                    <h3>{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="profile-role">{user.role} Member</p>
                  </div>
                </div>

                {/* Payment due notification */}
                {user.membership?.status === 'active' && nextPaymentDue && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 flex items-center gap-2" suppressHydrationWarning>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Your monthly payment is coming due on{' '}
                      <strong>{nextPaymentDue}</strong>
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Please ensure your payment is completed before this date.
                    </p>
                  </div>
                )}

                <div className="profile-details border-t pt-4 mt-4 space-y-2">
                  <div className="detail-row">
                    <span className="detail-label">Email Verified</span>
                    <span className={`status-badge ${user.emailVerified ? 'status-active' : 'status-pending'}`}>
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  {user.fatherName && (
                    <div className="detail-row">
                      <span className="detail-label">Father Name</span>
                      <span className="detail-value">{user.fatherName}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="detail-row">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{user.phone}</span>
                    </div>
                  )}
                  {user.woreda && (
                    <div className="detail-row">
                      <span className="detail-label">Woreda</span>
                      <span className="detail-value capitalize">{user.woreda.replace(/-/g, ' ')}</span>
                    </div>
                  )}
                  {user.maritalStatus && (
                    <div className="detail-row">
                      <span className="detail-label">Marital Status</span>
                      <span className="detail-value capitalize">{user.maritalStatus}</span>
                    </div>
                  )}
                  {user.userType && (
                    <div className="detail-row">
                      <span className="detail-label">Status</span>
                      <span className="detail-value capitalize">{user.userType}</span>
                    </div>
                  )}
                  {user.currentResident && (
                    <div className="detail-row">
                      <span className="detail-label">Current Resident</span>
                      <span className="detail-value">{user.currentResident}</span>
                    </div>
                  )}
                  {user.profession && (
                    <div className="detail-row">
                      <span className="detail-label">Profession</span>
                      <span className="detail-value capitalize">{user.profession.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Language</span>
                    <span className="detail-value">
                      {language === 'en' ? 'English' : language === 'am' ? 'Amharic' : 'Silte'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="logout-button mt-4"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-card">
              <div className="activity-content">
                <div className="activity-header">
                  <h2 className="card-title">Recent Activity</h2>
                  <button
                    onClick={() => router.push('/activity')}
                    className="view-button"
                  >
                    See All →
                  </button>
                </div>

                <div className="activity-list">
                  <ActivityFeed activities={recentActivities.slice(0, 5)} />
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="events-card">
                <div className="events-content">
                  <h2 className="events-title">Upcoming Events</h2>
                  
                  <div className="events-list">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event._id} className="event-item">
                        <div className="event-header">
                          <h3 className="event-name">{event.title}</h3>
                          <span className={`event-type ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                        </div>
                        <div className="event-details">
                          <span className="event-detail">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(event.date)}
                          </span>
                          <span className="event-detail">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {upcomingEvents.length > 3 && (
                    <button
                      onClick={() => router.push('/events')}
                      className="view-all-button"
                    >
                      View All Events →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}