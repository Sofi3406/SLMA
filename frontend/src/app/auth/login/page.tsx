'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, Quote, Users, Target, Heart, Star, MapPin, Navigation } from 'lucide-react';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unverified = searchParams.get('unverified') === '1';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Silte motivational messages
  const motivationalMessages = [
    {
      id: 1,
      icon: <Quote className="w-5 h-5" />,
      text: "እማናትን አክብሮ፣ ተከታይን አስተምሮ",
      translation: "Respect the elders, teach the followers",
      type: "wisdom"
    },
    {
      id: 2,
      icon: <Users className="w-5 h-5" />,
      text: "ሁሉም በአንድ ቤት የተገነባ፣ አንድም ሳይቀር",
      translation: "We are all built in one house, none excluded",
      type: "unity"
    },
    {
      id: 3,
      icon: <Target className="w-5 h-5" />,
      text: "Together we build, together we prosper",
      translation: "Our collective strength drives our success",
      type: "progress"
    },
    {
      id: 4,
      icon: <Heart className="w-5 h-5" />,
      text: "Our heritage is our foundation",
      translation: "Preserving culture for future generations",
      type: "heritage"
    },
    {
      id: 5,
      icon: <Star className="w-5 h-5" />,
      text: "ሰላም፣ ልማት፣ ኅብረት",
      translation: "Peace, Development, Unity",
      type: "motto"
    }
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Rotate messages every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 403 && data?.code === 'EMAIL_NOT_VERIFIED') {
        setError(data.message || 'Your email has not been verified yet. Please wait for admin verification before you can use the system.');
        return;
      }
      if (err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
        setError('Cannot connect to server. Please try again.');
      } else if (status === 401 || err.message?.includes('Invalid')) {
        setError('Invalid email or password.');
      } else {
        setError(data?.message || err.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="login-page-container">
      {/* Main Login Container (unchanged) */}
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-header-content">
              <div className="login-logo">
                <span className="login-logo-text">SL</span>
              </div>
              <h1 className="login-title">Silte Lmat Mehber</h1>
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

            {unverified && (
              <div className="login-error-message" style={{ backgroundColor: 'var(--warning-bg, #fef3c7)', color: 'var(--warning-text, #92400e)' }}>
                <AlertCircle className="login-error-icon" />
                <div className="login-error-content">
                  <strong>Email not verified.</strong> Your account must be verified by an admin before you can use the system. Please wait for verification or contact support.
                </div>
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
                    placeholder="sofiyasin190@gmail.com"
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

      {/* Motivational Messages Sidebar - Middle Section */}
      <div className="motivational-sidebar">
        <div className="motivational-header">
          <h3 className="motivational-title">
            <span className="motivational-title-icon">✨</span>
            Silte Wisdom
          </h3>
          <p className="motivational-subtitle">Inspiration from our community</p>
        </div>

        <div className="motivational-messages">
          {motivationalMessages.map((message, index) => (
            <div 
              key={message.id}
              className={`motivational-message ${index === currentMessageIndex ? 'active' : ''}`}
            >
              <div className="message-icon">
                {message.icon}
              </div>
              <div className="message-content">
                <p className="message-text">{message.text}</p>
                <p className="message-translation">{message.translation}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="motivational-dots">
          {motivationalMessages.map((_, index) => (
            <button
              key={index}
              className={`motivational-dot ${index === currentMessageIndex ? 'active' : ''}`}
              onClick={() => setCurrentMessageIndex(index)}
              aria-label={`View message ${index + 1}`}
            />
          ))}
        </div>

        <div className="motivational-community">
          <h4 className="community-title">Our Values</h4>
          <ul className="community-values">
            <li>Unity & Togetherness</li>
            <li>Cultural Preservation</li>
            <li>Mutual Support</li>
            <li>Progressive Development</li>
          </ul>
        </div>

        <div className="motivational-footer">
          <p className="motivational-footer-text">
            Join over 5,000+ Silte community members
          </p>
        </div>
      </div>

      {/* Google Map Section - Right Side */}
      <div className="map-sidebar">
        <div className="map-header">
          <div className="map-header-content">
            <MapPin className="map-header-icon" />
            <h3 className="map-title">Silte Zone - Worabe</h3>
            <p className="map-subtitle">Our Cultural Heartland</p>
          </div>
        </div>

        <div className="map-container">
          {/* Google Map Embed */}
          <div className="google-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31734.285996335896!2d38.19823967910157!3d8.013250299999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17f3657b5f2a0a45%3A0x46d06f07f9f9e8e9!2sWorabe%2C%20Ethiopia!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Worabe, Silte Zone Map"
            />
          </div>

          <div className="map-info">
            <div className="map-info-item">
              <div className="map-info-icon">📍</div>
              <div className="map-info-content">
                <p className="map-info-label">Location</p>
                <p className="map-info-value">Worabe, Silte Zone</p>
              </div>
            </div>

            <div className="map-info-item">
              <div className="map-info-icon">🏛️</div>
              <div className="map-info-content">
                <p className="map-info-label">Capital</p>
                <p className="map-info-value">Worabe City</p>
              </div>
            </div>

            <div className="map-info-item">
              <div className="map-info-icon">👥</div>
              <div className="map-info-content">
                <p className="map-info-label">Population</p>
                <p className="map-info-value">~900,000+</p>
              </div>
            </div>

            <div className="map-info-item">
              <div className="map-info-icon">🗺️</div>
              <div className="map-info-content">
                <p className="map-info-label">Area</p>
                <p className="map-info-value">2,654 km²</p>
              </div>
            </div>
          </div>

          <div className="map-actions">
            <a
              href="https://maps.app.goo.gl/8Kv2J3Z7yQ1aXq7q8"
              target="_blank"
              rel="noopener noreferrer"
              className="map-action-button"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </a>
            <a
              href="https://www.google.com/maps/dir//Worabe,+Ethiopia/@8.01325,38.1982397,14z/data=!4m9!4m8!1m0!1m5!1m1!1s0x17f3657b5f2a0a45:0x46d06f07f9f9e8e9!2m2!1d38.2166667!2d8.0166667!3e0?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="map-action-button secondary"
            >
              <span>Get Directions</span>
            </a>
          </div>

          <div className="map-description">
            <p>
              <strong>Worabe</strong> is the administrative capital of Silte Zone in the Southern Nations, 
              Nationalities, and Peoples' Region (SNNPR) of Ethiopia. Located approximately 172 kilometers 
              southwest of Addis Ababa, it serves as the cultural and economic center of the Silte people.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Main container with flex layout - now 3 columns */
        .login-page-container {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Original login container - unchanged positioning */
        .login-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          min-width: 0;
        }

        /* Original login card - unchanged */
        .login-card {
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* Motivational Sidebar - Middle Section */
        .motivational-sidebar {
          width: 380px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          color: #1e293b;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          position: relative;
          border-right: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
          min-width: 0;
        }

        /* Map Sidebar - Right Section */
        .map-sidebar {
          width: 420px;
          background: white;
          color: #1e293b;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #e2e8f0;
          min-width: 0;
        }

        .map-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .map-header-content {
          max-width: 100%;
          margin: 0 auto;
        }

        .map-header-icon {
          width: 40px;
          height: 40px;
          color: #60a5fa;
          margin: 0 auto 16px;
        }

        .map-title {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 8px;
          color: white;
        }

        .map-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .map-container {
          flex: 1;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
        }

        .google-map {
          width: 100%;
          height: 280px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .google-map iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .map-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 10px;
        }

        .map-info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .map-info-item:hover {
          background: #f1f5f9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .map-info-icon {
          font-size: 20px;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0ea5a4 0%, #0d9488 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .map-info-content {
          flex: 1;
        }

        .map-info-label {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 4px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .map-info-value {
          font-size: 14px;
          color: #0f172a;
          margin: 0;
          font-weight: 600;
        }

        .map-actions {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .map-action-button {
          flex: 1;
          padding: 12px 16px;
          background: linear-gradient(135deg, #0ea5a4 0%, #0d9488 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          text-decoration: none;
          text-align: center;
        }

        .map-action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(14, 165, 164, 0.3);
        }

        .map-action-button.secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .map-action-button.secondary:hover {
          background: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .map-description {
          margin-top: 20px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .map-description p {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .map-description strong {
          color: #0f172a;
        }

        /* Motivational Sidebar Styles (unchanged) */
        .motivational-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .motivational-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .motivational-title-icon {
          font-size: 20px;
        }

        .motivational-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .motivational-messages {
          flex: 1;
          position: relative;
          min-height: 300px;
        }

        .motivational-message {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease;
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .motivational-message.active {
          opacity: 1;
          transform: translateY(0);
        }

        .message-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #0ea5a4 0%, #0d9488 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: white;
        }

        .message-content {
          text-align: center;
        }

        .message-text {
          font-size: 18px;
          line-height: 1.6;
          margin: 0 0 12px;
          color: #0f172a;
          font-weight: 500;
        }

        .message-translation {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-style: italic;
        }

        .motivational-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin: 30px 0;
        }

        .motivational-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .motivational-dot.active {
          background: #0ea5a4;
          transform: scale(1.3);
        }

        .motivational-community {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          border: 1px solid #e2e8f0;
        }

        .community-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px;
          color: #0f172a;
          text-align: center;
        }

        .community-values {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 10px;
        }

        .community-values li {
          font-size: 14px;
          color: #475569;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
        }

        .community-values li:before {
          content: "•";
          color: #0ea5a4;
          font-weight: bold;
          margin-right: 10px;
        }

        .community-values li:last-child {
          border-bottom: none;
        }

        .motivational-footer {
          margin-top: auto;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .motivational-footer-text {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        /* Original login styles - kept exactly the same */
        .login-header {
          text-align: center;
          padding: 40px 40px 20px;
        }

        .login-header-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .login-logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .login-logo-text {
          font-size: 24px;
          font-weight: bold;
          color: white;
        }

        .login-title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 8px;
        }

        .login-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }

        .login-form-container {
          padding: 0 40px 20px;
        }

        .login-success-message {
          display: flex;
          align-items: center;
          background-color: #d1fae5;
          border: 1px solid #10b981;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }

        .login-error-message {
          display: flex;
          align-items: flex-start;
          background-color: #fef2f2;
          border: 1px solid #f87171;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .login-error-icon {
          width: 20px;
          height: 20px;
          color: #dc2626;
          margin-right: 12px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .login-error-content {
          flex: 1;
        }

        .login-error-title {
          font-weight: 600;
          color: #dc2626;
          margin: 0 0 4px;
          font-size: 14px;
        }

        .login-error-text {
          color: #7f1d1d;
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .login-form {
          margin-bottom: 32px;
        }

        .login-form-group {
          margin-bottom: 24px;
        }

        .login-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .login-input-container {
          position: relative;
        }

        .login-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .login-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          font-size: 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background-color: white;
          color: #111827;
          transition: all 0.2s;
        }

        .login-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .login-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .login-flex-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .login-forgot-link {
          font-size: 14px;
          color: #10b981;
          text-decoration: none;
          font-weight: 500;
        }

        .login-forgot-link:hover {
          text-decoration: underline;
        }

        .login-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-button-icon {
          width: 20px;
          height: 20px;
        }

        .login-button-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        .login-signup-text {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          margin-top: 24px;
        }

        .login-signup-link {
          color: #10b981;
          font-weight: 600;
          text-decoration: none;
        }

        .login-signup-link:hover {
          text-decoration: underline;
        }

        .login-footer {
          padding: 30px 40px 40px;
        }

        .login-footer-content {
          text-align: center;
          max-width: 400px;
          margin: 0 auto;
        }

        .login-footer-text {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 12px;
        }

        .login-footer-link {
          color: #10b981;
          text-decoration: none;
          font-weight: 500;
        }

        .login-footer-link:hover {
          text-decoration: underline;
        }

        .login-footer-copyright {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive design */
        @media (max-width: 1200px) {
          .login-page-container {
            flex-wrap: wrap;
          }
          
          .login-container {
            width: 100%;
            order: 1;
          }
          
          .motivational-sidebar {
            width: 50%;
            order: 2;
          }
          
          .map-sidebar {
            width: 50%;
            order: 3;
          }
        }

        @media (max-width: 768px) {
          .login-page-container {
            flex-direction: column;
          }
          
          .login-container,
          .motivational-sidebar,
          .map-sidebar {
            width: 100%;
            order: initial;
          }
          
          .motivational-sidebar,
          .map-sidebar {
            border-left: none;
            border-right: none;
            border-top: 1px solid #e2e8f0;
          }
          
          .login-container {
            padding: 20px;
          }
        }

        @media (max-width: 640px) {
          .login-card {
            max-width: 100%;
          }
          
          .login-header,
          .login-form-container,
          .login-footer {
            padding: 30px 20px;
          }
          
          .motivational-sidebar,
          .map-sidebar {
            padding: 30px 20px;
          }
          
          .map-info {
            grid-template-columns: 1fr;
          }
          
          .map-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}