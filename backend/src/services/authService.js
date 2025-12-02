const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  // Add other user properties as needed
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      if (data.token) {
        localStorage.setItem('slma_token', data.token);
        localStorage.setItem('slma_user', JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      console.error('Auth service login error:', error);
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Auth service forgot password error:', error);
      throw error;
    }
  },

  async resetPassword(token: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reset password');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Auth service reset password error:', error);
      throw error;
    }
  },

  async verifyEmail(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email/${token}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Email verification failed');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Auth service verify email error:', error);
      throw error;
    }
  },

  // Helper methods
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('slma_token');
    }
    return null;
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('slma_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('slma_token');
      localStorage.removeItem('slma_user');
    }
  },
};