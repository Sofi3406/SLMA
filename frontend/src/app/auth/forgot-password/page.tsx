'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { authService } from '@/services/authService';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

 // In your forgot password page, update handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (!email.trim()) {
    setError('Please enter your email address');
    setLoading(false);
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    setError('Please enter a valid email address');
    setLoading(false);
    return;
  }

  try {
    // Use the authService
    await authService.forgotPassword(email);
    setSuccess(true);
    setSubmittedEmail(email);
  } catch (err: any) {
    setError(err.message || 'Failed to send reset email. Please try again.');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Header */}
        <div className="forgot-password-header">
          <Link href="/" className="forgot-password-logo-link">
            <div className="forgot-password-logo">
              <span className="forgot-password-logo-text">SL</span>
            </div>
            <div className="forgot-password-organization">
              <h1 className="forgot-password-org-title">Silte Ləmat Mehber</h1>
              <p className="forgot-password-subtitle">{t('hero.subtitle')}</p>
            </div>
          </Link>
          
          <h2 className="forgot-password-heading">
            Reset Your Password
          </h2>
          <p className="forgot-password-description">
            Enter your email to receive reset instructions
          </p>
        </div>

        {/* Form Card */}
        <div className="forgot-password-card">
          {error && (
            <div className="error-alert">
              <div className="error-alert-content">
                <AlertCircle className="error-alert-icon" />
                <p className="error-alert-text">{error}</p>
              </div>
            </div>
          )}

          {success ? (
            /* Success Message */
            <div className="success-section">
              <div className="success-icon-container">
                <div className="success-icon-circle">
                  <CheckCircle className="success-icon" />
                </div>
              </div>
              
              <h3 className="success-title">
                Check Your Email
              </h3>
              
              <p className="success-message">
                We've sent password reset instructions to:
                <br />
                <span className="success-email">{submittedEmail}</span>
              </p>
              
              <div className="next-steps">
                <div className="step-box step-box-blue">
                  <h4 className="step-title step-title-blue">What to do next:</h4>
                  <ul className="step-list step-list-blue">
                    <li>• Check your inbox for our email</li>
                    <li>• Click the reset link in the email</li>
                    <li>• Create a new password</li>
                    <li>• Sign in with your new password</li>
                  </ul>
                </div>
                
                <div className="step-box step-box-yellow">
                  <h4 className="step-title step-title-yellow">Didn't receive the email?</h4>
                  <ul className="step-list step-list-yellow">
                    <li>• Check your spam/junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• Wait a few minutes and try again</li>
                  </ul>
                </div>
              </div>
              
              <div className="success-actions">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="button-outline"
                >
                  Try another email
                </button>

                <Link
                  href="/auth/login"
                  className="button-primary"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            /* Reset Form */
            <form onSubmit={handleSubmit} className="reset-form">
              <div className="email-group">
                <label className="email-label">
                  Email Address
                </label>
                <div className="email-input-wrapper">
                  <Mail className="email-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="email-input"
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                <p className="email-hint">
                  Enter the email address you used to register your account.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button-forgot"
              >
                {loading ? (
                  <>
                    <div className="forgot-spinner"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </button>

              <div className="back-to-login">
                <Link
                  href="/auth/login"
                  className="back-link"
                >
                  <ArrowLeft className="back-link-icon" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Support Info */}
        <div className="support-info">
          <p className="support-text">
            Still having trouble? Contact our support team at{' '}
            <a href="mailto:support@slma.org" className="support-link">
              support@slma.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}