'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password');
      }

      const data = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      setSuccessMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);

    } catch (err: any) {
      console.error('Login error:', err);
      setLoading(false);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        setError('Cannot connect to server. Please try again.');
      } else if (err.message.includes('401') || err.message.includes('Invalid')) {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-header-content">
            <div className="login-logo">
              <span className="login-logo-text">SL</span>
            </div>
            <h1 className="login-title">Silte Ləmat Mehber</h1>
            <p className="login-subtitle">Welcome back to SLMA Community</p>
          </div>
        </div>

        {/* Form */}
        <div className="login-form-container">
          {successMessage && (
            <div className="login-success-message">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="login-error-message">
              <AlertCircle className="login-error-icon" />
              <div className="login-error-content">
                <p className="login-error-title">Login Error</p>
                <p className="login-error-text">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label htmlFor="email" className="login-label">
                Email Address
              </label>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="login-input"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-form-group">
              <div className="login-flex-row">
                <label htmlFor="password" className="login-label">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="login-forgot-link"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-input"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <>
                  <div className="login-button-spinner"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="login-button-icon" />
                  Sign In
                </>
              )}
            </button>

            <div className="login-signup-text">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"  
                className="login-signup-link"
              >
                Sign up now
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <div className="login-footer-content">
            <p className="login-footer-text">
              Need help? Contact support at{' '}
              <a 
                href="mailto:support@slma.org" 
                className="login-footer-link"
              >
                support@slma.org
              </a>
            </p>
            <p className="login-footer-copyright">
              &copy; {new Date().getFullYear()} Silte Lmat Mehber. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}