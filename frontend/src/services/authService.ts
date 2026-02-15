import api from './api';

export type MaritalStatus = 'single' | 'married';
export type UserType = 'student' | 'employee';
export type Profession =
  | 'medicine' | 'computer_science' | 'software_engineer' | 'biomedical_engineer'
  | 'civil' | 'mechanical' | 'pharmacist' | 'laboratory' | 'midwifery' | 'nursing'
  | 'health_officer' | 'other';

export interface RegisterData {
  name: string;
  fatherName: string;
  email: string;
  password: string;
  phone?: string;
  woreda?: string;
  zone?: string;
  language?: 'en' | 'am' | 'silt';
  maritalStatus: MaritalStatus;
  gender: 'male' | 'female';
  age: number;
  userType: UserType;
  currentResident?: string;
  profession: Profession;
  membershipPlan?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  fatherName?: string;
  email: string;
  role: 'member' | 'woreda_admin' | 'super_admin';
  membership: {
    membershipId: string;
    status: 'active' | 'expired' | 'pending' | 'cancelled';
    type?: 'general' | 'gold' | 'executive';
    startDate?: Date;
    endDate?: Date;
  };
  language: 'en' | 'am' | 'silt';
  emailVerified: boolean;
  maritalStatus?: MaritalStatus;
  gender?: 'male' | 'female';
  age?: number;
  userType?: UserType;
  currentResident?: string;
  profession?: Profession;
  profile?: { photo?: string; bio?: string; occupation?: string; location?: string };
}

// Helper functions with SSR safety
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};

export const authService = {
  // Register user (use FormData with userData + nationalId + profileImage + optional receipt)
  register: async (formData: FormData) => {
    const response = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (response.data.token) {
      safeLocalStorage.setItem('slma_token', response.data.token);
      safeLocalStorage.setItem('slma_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      safeLocalStorage.setItem('slma_token', response.data.token);
      safeLocalStorage.setItem('slma_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    safeLocalStorage.removeItem('slma_token');
    safeLocalStorage.removeItem('slma_user');
    window.location.href = '/';
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = safeLocalStorage.getItem('slma_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken: (): string | null => {
    return safeLocalStorage.getItem('slma_token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Update profile
  updateProfile: async (data: Partial<RegisterData> & { profile?: { bio?: string; occupation?: string; location?: string }; phone?: string; woreda?: string } | FormData) => {
    const response = await api.put('/auth/update-profile', data, data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' },
    } : undefined);
    if (response.data.user) {
      safeLocalStorage.setItem('slma_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Alias for getCurrentUser
  getUser: (): User | null => {
    return authService.getCurrentUser();
  },

  // Check if current user is admin (woreda_admin or super_admin)
  isAdmin: (): boolean => {
    const user = authService.getUser();
    if (!user) return false;
    return user.role === 'super_admin' || user.role === 'woreda_admin';
  },

  // Check if current user is super admin
  isSuperAdmin: (): boolean => {
    const user = authService.getUser();
    return !!user && user.role === 'super_admin';
  },
};