import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  zone?: string;
  language?: 'en' | 'am' | 'silt';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'zone_admin' | 'super_admin';
  membership: {
    membershipId: string;
    status: 'active' | 'expired' | 'pending' | 'cancelled';
    type?: 'general' | 'gold' | 'executive';
    startDate?: Date;
    endDate?: Date;
  };
  language: 'en' | 'am' | 'silt';
  emailVerified: boolean;
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
  // Register user
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
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
  updateProfile: async (data: Partial<RegisterData>) => {
    const response = await api.put('/auth/update-profile', data);
    if (response.data.user) {
      safeLocalStorage.setItem('slma_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Alias for getCurrentUser
  getUser: (): User | null => {
    return authService.getCurrentUser();
  },
};