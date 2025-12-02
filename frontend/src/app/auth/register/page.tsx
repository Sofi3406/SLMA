'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Woredas data
const woredas = [
  { id: '', name: 'Select your woreda' },
  { id: 'worabe', name: 'Worabe' },
  { id: 'hulbarag', name: 'Hulbarag' },
  { id: 'sankura', name: 'Sankura' },
  { id: 'alicho', name: 'Alicho' },
  { id: 'silti', name: 'Silti' },
  { id: 'dalocha', name: 'Dalocha' },
  { id: 'lanforo', name: 'Lanforo' },
  { id: 'east-azernet-berbere', name: 'East Azernet Berbere' },
  { id: 'west-azernet-berbere', name: 'West Azernet Berbere' },
];

const RegistrationForm = () => {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    woreda: '',
    language: language,
    agreeToTerms: false,
  });

  // Update language when context changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, language: language }));
  }, [language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.woreda) {
      newErrors.woreda = 'Please select your woreda';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { confirmPassword, agreeToTerms, ...registrationData } = formData;
      
      const API_URL = 'http://localhost:5000';
      const endpoint = `${API_URL}/api/auth/register`;
      
      console.log('Sending request to:', endpoint);
      console.log('Request data:', registrationData);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      // Get response as text first
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Raw response (first 500 chars):', responseText.substring(0, 500));
      
      let data;
      
      // Handle empty response
      if (!responseText.trim()) {
        console.error('Response is empty');
        if (response.ok) {
          // If response is empty but status is OK, assume success
          data = { success: true, message: 'Registration successful' };
        } else {
          throw new Error('Server returned empty response');
        }
      } else {
        // Try to parse JSON
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          
          // Check what we actually got
          if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
            throw new Error('Server returned HTML instead of JSON. Check backend configuration.');
          } else if (responseText.includes('Cannot POST') || responseText.includes('404')) {
            throw new Error(`Endpoint not found: ${endpoint}`);
          } else {
            throw new Error(`Invalid server response: ${responseText.substring(0, 100)}`);
          }
        }
      }
      
      console.log('Parsed data:', data);
      
      if (!response.ok) {
        // Handle backend validation errors
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.message) {
          setSubmitError(data.message);
        } else {
          setSubmitError(`Registration failed (Status: ${response.status})`);
        }
        return;
      }
      
      // SUCCESS! 🎉
      console.log('Registration successful:', data);
      
      setSuccessMessage(
        data.message || 
        'Registration successful! Please check your email for verification.'
      );
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        woreda: '',
        language: language,
        agreeToTerms: false,
      });
      
      setErrors({});
      
      // Store token and user data if provided
      if (data.token) {
        localStorage.setItem('slma_token', data.token);
        localStorage.setItem('slma_user', JSON.stringify(data.user));
        console.log('User data stored in localStorage');
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error types
      if (error.message.includes('Failed to fetch')) {
        setSubmitError(
          'Cannot connect to server. Please check:\n' +
          '1. Backend server is running on http://localhost:5000\n' +
          '2. No firewall blocking the connection\n' +
          '3. Run: node server.js in your backend folder'
        );
      } else if (error.message.includes('CORS')) {
        setSubmitError(
          'CORS error. Add this to your backend server.js:\n' +
          'const cors = require("cors");\n' +
          'app.use(cors({ origin: "http://localhost:3000" }));'
        );
      } else if (error.message.includes('HTML')) {
        setSubmitError(
          'Backend is returning HTML error page.\n' +
          'Check backend console for errors.\n' +
          'Make sure your Express app has proper error handling.'
        );
      } else if (error.message.includes('Endpoint not found')) {
        setSubmitError(
          `API endpoint not found.\n` +
          `Make sure your backend has route: POST /api/auth/register\n` +
          `Current URL: http://localhost:5000/api/auth/register`
        );
      } else {
        setSubmitError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form" noValidate>
      {/* Success message */}
      {successMessage && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <p className="success-title">Registration Successful!</p>
            <p className="success-text">{successMessage}</p>
            <div className="success-actions">
              <button
                type="button"
                className="success-button primary"
                onClick={() => router.push('/auth/login')}
              >
                Go to Login
              </button>
              <button
                type="button"
                className="success-button secondary"
                onClick={() => window.location.reload()}
              >
                Register Another Account
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Form error summary */}
      {submitError && (
        <div className="error-summary">
          <p className="error-summary-title">Registration Error</p>
          <p className="error-summary-text">{submitError}</p>
          <div className="debug-help">
            <p className="debug-title">Troubleshooting:</p>
            <ol className="debug-steps">
              <li>Open browser console (F12) and check for errors</li>
              <li>Verify backend is running: <code>node server.js</code></li>
              <li>
                Test with curl:
                <pre>
                  {`curl -X POST http://localhost:5000/api/auth/register \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Test","email":"test@test.com","password":"Password123","phone":"+251911223344","woreda":"worabe","language":"en"}'`}
                </pre>
              </li>
            </ol>
          </div>
        </div>
      )}
      
      {/* Show form only if no success message */}
      {!successMessage && (
        <>
          {/* Name field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter your full name"
              disabled={isLoading}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="error-message" role="alert">
                {errors.name}
              </span>
            )}
          </div>
          
          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              placeholder="Enter your email"
              disabled={isLoading}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>
          
          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password *
            </label>
            <div className="password-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${errors.password ? 'input-error' : ''}`}
                placeholder="Create a strong password"
                disabled={isLoading}
                aria-describedby={errors.password ? 'password-error' : 'password-help'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password ? (
              <span id="password-error" className="error-message" role="alert">
                {errors.password}
              </span>
            ) : (
              <small id="password-help" className="help-text">
                Minimum 8 characters with uppercase, lowercase, and numbers
              </small>
            )}
          </div>
          
          {/* Confirm Password field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password *
            </label>
            <div className="password-field-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm your password"
                disabled={isLoading}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span id="confirmPassword-error" className="error-message" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>
          
          {/* Phone field */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`input-field ${errors.phone ? 'input-error' : ''}`}
              placeholder="+251 93 067 0088"
              disabled={isLoading}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <span id="phone-error" className="error-message" role="alert">
                {errors.phone}
              </span>
            )}
          </div>
          
          {/* Woreda select field */}
          <div className="form-group">
            <label htmlFor="woreda" className="form-label">
              Woreda *
            </label>
            <div className="woreda-select-container">
              <select
                id="woreda"
                name="woreda"
                value={formData.woreda}
                onChange={handleChange}
                className={`input-field select-field ${errors.woreda ? 'input-error' : ''}`}
                disabled={isLoading}
                aria-describedby={errors.woreda ? 'woreda-error' : undefined}
              >
                {woredas.map(woreda => (
                  <option 
                    key={woreda.id} 
                    value={woreda.id}
                    className="select-option"
                    disabled={woreda.id === ''}
                  >
                    {woreda.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="woreda-select-icon" size={16} />
            </div>
            {errors.woreda && (
              <span id="woreda-error" className="error-message" role="alert">
                {errors.woreda}
              </span>
            )}
          </div>
          
          {/* Terms and conditions checkbox */}
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={`checkbox-input ${errors.agreeToTerms ? 'checkbox-error' : ''}`}
                disabled={isLoading}
                aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
              />
              <label htmlFor="agreeToTerms" className="checkbox-label">
                I agree to the{' '}
                <a href="/terms" className="checkbox-link" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="checkbox-link" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeToTerms && (
              <span id="terms-error" className="error-message" role="alert">
                {errors.agreeToTerms}
              </span>
            )}
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            className={`submit-button ${isLoading ? 'button-loading' : ''}`}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="button-spinner"></span>
                Processing...
              </>
            ) : (
              'Register Now'
            )}
          </button>
          
          {/* Additional info */}
          <div className="form-footer">
            <p className="form-footer-text">
              Already have an account?{' '}
              <Link href="/auth/login" className="form-footer-link">
                Sign in here
              </Link>
            </p>
            <p className="form-footer-note">
              * Required fields
            </p>
          </div>
        </>
      )}
    </form>
  );
};

export default RegistrationForm;