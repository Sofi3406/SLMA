'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { Lock, CheckCircle, AlertCircle, Key } from 'lucide-react';

interface PageParams {
  token: string;
}

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = (params as any).token;
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    // In a real app, you might verify the token with the backend
    // For now, we'll assume it's valid if it exists
    if (token) {
      setValidToken(true);
    }
    setVerifying(false);
  }, [token]);

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const validateForm = () => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
    if (!isPasswordStrong) {
      setError('Password does not meet strength requirements');
      return false;
    }

    return true;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!validateForm()) return;

  setLoading(true);

  try {
    // Use the authService
    await authService.resetPassword(token, formData.password);
    setSuccess(true);
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/auth/login');
    }, 3000);
  } catch (err: any) {
    setError(err.message || 'Failed to reset password. The link may have expired.');
  } finally {
    setLoading(false);
  }
};
  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="requirement-item">
      {met ? (
        <CheckCircle className="requirement-icon valid" />
      ) : (
        <div className="requirement-icon invalid"></div>
      )}
      <span className={`requirement-text ${met ? 'valid' : 'invalid'}`}>
        {text}
      </span>
    </div>
  );

  if (verifying) {
    return (
      <div className="reset-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="reset-password-page">
        <div className="invalid-token-container">
          <div className="invalid-token-icon">
            <AlertCircle />
          </div>
          <h1 className="invalid-token-title">Invalid Reset Link</h1>
          <p className="invalid-token-message">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="reset-button-primary"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        {/* Header */}
        <div className="reset-password-header">
          <Link href="/" className="reset-password-logo-link">
            <div className="reset-password-logo">
              <span className="reset-password-logo-text">SL</span>
            </div>
            <div className="reset-password-organization">
              <h1 className="reset-password-org-title">Silte Ləmat Mehber</h1>
              <p className="reset-password-subtitle">Preserving heritage, building community</p>
            </div>
          </Link>
          
          <h2 className="reset-password-heading">
            Set New Password
          </h2>
          <p className="reset-password-description">
            Create a new strong password for your account
          </p>
        </div>

        {/* Form Card */}
        <div className="reset-password-card">
          {success ? (
            /* Success Message */
            <div className="success-container">
              <div className="success-icon-container">
                <div className="success-icon-circle">
                  <CheckCircle className="success-icon" />
                </div>
              </div>
              
              <h3 className="success-title">
                Password Reset Successful!
              </h3>
              
              <p className="success-message">
                Your password has been updated successfully. You will be redirected to login shortly.
              </p>
              
              <div className="progress-container">
                <div className="progress-bar"></div>
              </div>
              
              <Link
                href="/auth/login"
                className="reset-button-primary"
              >
                Go to Login Now
              </Link>
            </div>
          ) : (
            /* Reset Form */
            <>
              {error && (
                <div className="reset-error">
                  <div className="reset-error-content">
                    <AlertCircle className="reset-error-icon" />
                    <p className="reset-error-text">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="reset-password-form">
                {/* New Password */}
                <div className="password-group">
                  <label className="password-label">
                    New Password
                  </label>
                  <div className="password-input-wrapper">
                    <Key className="password-input-icon" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="password-input"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  
                  {/* Password Strength */}
                  <div className="password-strength">
                    <PasswordRequirement
                      met={passwordStrength.length}
                      text="At least 8 characters"
                    />
                    <PasswordRequirement
                      met={passwordStrength.uppercase}
                      text="At least one uppercase letter"
                    />
                    <PasswordRequirement
                      met={passwordStrength.lowercase}
                      text="At least one lowercase letter"
                    />
                    <PasswordRequirement
                      met={passwordStrength.number}
                      text="At least one number"
                    />
                    <PasswordRequirement
                      met={passwordStrength.special}
                      text="At least one special character"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="password-group">
                  <label className="password-label">
                    Confirm New Password
                  </label>
                  <div className="password-input-wrapper">
                    <Lock className="password-input-icon" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="password-input"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button-reset"
                >
                  {loading ? (
                    <>
                      <div className="reset-spinner"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Key className="button-icon" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>

                {/* Security Note */}
                <div className="security-tips">
                  <h4 className="security-tips-title">Security Tips:</h4>
                  <ul className="security-tips-list">
                    <li>• Use a unique password not used elsewhere</li>
                    <li>• Avoid personal information in passwords</li>
                    <li>• Consider using a password manager</li>
                    <li>• Change passwords periodically</li>
                  </ul>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}