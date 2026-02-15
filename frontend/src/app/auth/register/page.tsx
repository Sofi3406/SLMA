'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, Upload, FileText, X, Banknote, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Woredas data
const woredas = [
  { id: '', name: 'Select your woreda' },
  { id: 'worabe-city-administration', name: 'Worabe city administration' },
  { id: 'alem-gebeya-city-administration', name: 'Alem Gebeya city administration' },
  { id: 'qbet-city-administration', name: 'Qbet city administration' },
  { id: 'tora-city-administration', name: 'Tora city administration' },
  { id: 'dalocha-city-administration', name: 'Dalocha city administration' },
  { id: 'silti-woreda', name: 'Silti woreda' },
  { id: 'misraq-silti-woreda', name: 'Misraq Silti woreda' },
  { id: 'lanfro-woreda', name: 'Lanfro woreda' },
  { id: 'mitto-woreda', name: 'Mitto woreda' },
  { id: 'dalocha-woreda', name: 'Dalocha woreda' },
  { id: 'sankura-woreda', name: 'Sankura woreda' },
  { id: 'wulbarag-woreda', name: 'Wulbarag woreda' },
  { id: 'mirab-azernet-berbere-woreda', name: 'Mirab Azernet Berbere woreda' },
  { id: 'misraq-azernet-berbere-woreda', name: 'Misraq Azernet Berbere woreda' },
  { id: 'alicho-woriro-woreda', name: 'Alicho Woriro woreda' },
];

// Membership plans
const membershipPlans = [
  { id: 'basic', name: 'Basic Member', price: 0, description: 'Free membership' },
  { id: 'active', name: 'Active Member', price: 500, description: 'ETB 500/year' },
  { id: 'premium', name: 'Premium Member', price: 1200, description: 'ETB 1,200/year' },
];

// Marital status & user type
const maritalOptions = [
  { id: '', name: 'Select status' },
  { id: 'single', name: 'Single' },
  { id: 'married', name: 'Married' },
];
const userTypeOptions = [
  { id: '', name: 'Select type' },
  { id: 'student', name: 'Student' },
  { id: 'employee', name: 'Employee' },
];
const genderOptions = [
  { id: '', name: 'Select gender' },
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
];
// Professions
const professions = [
  { id: '', name: 'Select profession' },
  { id: 'medicine', name: 'Medicine' },
  { id: 'computer_science', name: 'Computer Science' },
  { id: 'software_engineer', name: 'Software Engineer' },
  { id: 'biomedical_engineer', name: 'Biomedical Engineer' },
  { id: 'civil', name: 'Civil Engineering' },
  { id: 'mechanical', name: 'Mechanical Engineering' },
  { id: 'pharmacist', name: 'Pharmacist' },
  { id: 'laboratory', name: 'Laboratory' },
  { id: 'midwifery', name: 'Midwifery' },
  { id: 'nursing', name: 'Nursing' },
  { id: 'health_officer', name: 'Health Officer' },
  { id: 'other', name: 'Other' },
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    woreda: '',
    membershipPlan: 'active',
    language: language,
    maritalStatus: '',
    gender: '',
    age: '',
    userType: '',
    currentResident: '',
    profession: '',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const nationalIdInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

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

  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validFileTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, receipt: 'Please upload JPG, PNG, or PDF file' }));
      return;
    }
    if (file.size > maxFileSize) {
      setErrors(prev => ({ ...prev, receipt: 'File size must be less than 5MB' }));
      return;
    }
    setReceiptFile(file);
    setErrors(prev => ({ ...prev, receipt: '' }));
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else setReceiptPreview(null);
  };

  const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validFileTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, nationalId: 'Please upload JPG, PNG, or PDF' }));
      return;
    }
    if (file.size > maxFileSize) {
      setErrors(prev => ({ ...prev, nationalId: 'File size must be less than 5MB' }));
      return;
    }
    setNationalIdFile(file);
    setErrors(prev => ({ ...prev, nationalId: '' }));
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setNationalIdPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else setNationalIdPreview(null);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profileImage: 'Please upload an image (JPG, PNG)' }));
      return;
    }
    if (file.size > maxFileSize) {
      setErrors(prev => ({ ...prev, profileImage: 'File size must be less than 5MB' }));
      return;
    }
    setProfileImageFile(file);
    setErrors(prev => ({ ...prev, profileImage: '' }));
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const removeNationalId = () => {
    setNationalIdFile(null);
    setNationalIdPreview(null);
    if (nationalIdInputRef.current) nationalIdInputRef.current.value = '';
  };
  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
    if (profileImageInputRef.current) profileImageInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.fatherName?.trim()) {
      newErrors.fatherName = 'Father name is required';
    } else if (formData.fatherName.trim().length < 2) {
      newErrors.fatherName = 'Father name must be at least 2 characters';
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
    
    if (!formData.maritalStatus) {
      newErrors.maritalStatus = 'Please select marital status (Single or Married)';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (!/^[0-9]+$/.test(String(formData.age))) {
      newErrors.age = 'Age must be a number';
    } else if (Number(formData.age) < 18 || Number(formData.age) > 120) {
      newErrors.age = 'Age must be between 18 and 120';
    }
    
    if (!formData.userType) {
      newErrors.userType = 'Please select Student or Employee';
    }
    
    if (!formData.profession) {
      newErrors.profession = 'Please select your profession';
    }
    
    if (!nationalIdFile) {
      newErrors.nationalId = 'National ID document is required';
    }
    
    if (!profileImageFile) {
      newErrors.profileImage = 'Profile image is required';
    }
    
    const selectedPlan = membershipPlans.find(p => p.id === formData.membershipPlan);
    if (selectedPlan && selectedPlan.price > 0 && !receiptFile) {
      newErrors.receipt = 'Payment receipt is required for paid membership';
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
    setUploadProgress(0);
    
    try {
      const { confirmPassword, ...rest } = formData;
      const registrationData = {
        ...rest,
        fatherName: formData.fatherName,
        maritalStatus: formData.maritalStatus,
        gender: formData.gender,
        age: Number(formData.age),
        userType: formData.userType,
        currentResident: formData.currentResident || undefined,
        profession: formData.profession,
      };
      
      const formDataToSend = new FormData();
      formDataToSend.append('userData', JSON.stringify(registrationData));
      
      if (nationalIdFile) formDataToSend.append('nationalId', nationalIdFile);
      if (profileImageFile) formDataToSend.append('profileImage', profileImageFile);
      if (receiptFile) formDataToSend.append('receipt', receiptFile);
      
      const API_URL = 'http://localhost:5000';
      const endpoint = `${API_URL}/api/auth/register`;
      
      console.log('Sending registration request...');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend,
      });
      
      // Get response as text first
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Raw response:', responseText.substring(0, 500));
      
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
        'Registration successful! Your account will be active after an admin verifies your email. You cannot use the system until then.'
      );
      
      // Clear form
      setFormData({
        name: '',
        fatherName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        woreda: '',
        membershipPlan: 'active',
        language: language,
        maritalStatus: '',
        gender: '',
        age: '',
        userType: '',
        currentResident: '',
        profession: '',
      });
      setReceiptFile(null);
      setReceiptPreview(null);
      setNationalIdFile(null);
      setNationalIdPreview(null);
      setProfileImageFile(null);
      setProfileImagePreview(null);
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
      setUploadProgress(0);
    }
  };

  return (
    <div className="registration-container">
      {/* Payment Information Banner */}
      <div className="payment-banner">
        <div className="payment-banner-content">
          <Banknote className="payment-banner-icon" />
          <div>
            <h3 className="payment-banner-title">Payment Information</h3>
            <p className="payment-banner-text">
              For Active (ETB 500) or Premium (ETB 1,200) membership, pay to:
            </p>
            <div className="payment-details">
              <div className="payment-detail">
                <strong>CBE Account:</strong> 1000212203746
              </div>
              <div className="payment-detail">
                <strong>Account Name:</strong> Sofiya Yasin
              </div>
              <div className="payment-detail">
                <strong>Telebirr:</strong> +251930670088
              </div>
            </div>
            <p className="payment-instruction">
              Upload your payment receipt after completing the payment.
            </p>
          </div>
        </div>
      </div>

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
                    {`curl -X POST http://localhost:5000/api/auth/register \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Test","email":"test@test.com","password":"Password123","phone":"+251911223344","woreda":"worabe","membershipPlan":"active","language":"en"}'`}
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

            {/* Father name */}
            <div className="form-group">
              <label htmlFor="fatherName" className="form-label">
                Father Name *
              </label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className={`input-field ${errors.fatherName ? 'input-error' : ''}`}
                placeholder="Enter your father's name"
                disabled={isLoading}
              />
              {errors.fatherName && (
                <span className="error-message" role="alert">{errors.fatherName}</span>
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

            {/* Marital status */}
            <div className="form-group">
              <label htmlFor="maritalStatus" className="form-label">
                Marital Status *
              </label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className={`input-field select-field ${errors.maritalStatus ? 'input-error' : ''}`}
                disabled={isLoading}
              >
                {maritalOptions.map((o) => (
                  <option key={o.id} value={o.id} disabled={!o.id}>{o.name}</option>
                ))}
              </select>
              {errors.maritalStatus && (
                <span className="error-message" role="alert">{errors.maritalStatus}</span>
              )}
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender" className="form-label">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`input-field select-field ${errors.gender ? 'input-error' : ''}`}
                disabled={isLoading}
              >
                {genderOptions.map((o) => (
                  <option key={o.id} value={o.id} disabled={!o.id}>{o.name}</option>
                ))}
              </select>
              {errors.gender && (
                <span className="error-message" role="alert">{errors.gender}</span>
              )}
            </div>

            {/* Age */}
            <div className="form-group">
              <label htmlFor="age" className="form-label">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`input-field ${errors.age ? 'input-error' : ''}`}
                placeholder="Enter your age"
                min={18}
                max={120}
                disabled={isLoading}
              />
              {errors.age && (
                <span className="error-message" role="alert">{errors.age}</span>
              )}
            </div>

            {/* User type (student / employee) */}
            <div className="form-group">
              <label htmlFor="userType" className="form-label">
                Status (Student or Employee) *
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className={`input-field select-field ${errors.userType ? 'input-error' : ''}`}
                disabled={isLoading}
              >
                {userTypeOptions.map((o) => (
                  <option key={o.id} value={o.id} disabled={!o.id}>{o.name}</option>
                ))}
              </select>
              {errors.userType && (
                <span className="error-message" role="alert">{errors.userType}</span>
              )}
            </div>

            {/* Current resident */}
            <div className="form-group">
              <label htmlFor="currentResident" className="form-label">
                Current Resident
              </label>
              <input
                type="text"
                id="currentResident"
                name="currentResident"
                value={formData.currentResident}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. city or address"
                disabled={isLoading}
              />
            </div>

            {/* Profession */}
            <div className="form-group">
              <label htmlFor="profession" className="form-label">
                Profession *
              </label>
              <select
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className={`input-field select-field ${errors.profession ? 'input-error' : ''}`}
                disabled={isLoading}
              >
                {professions.map((p) => (
                  <option key={p.id} value={p.id} disabled={!p.id}>{p.name}</option>
                ))}
              </select>
              {errors.profession && (
                <span className="error-message" role="alert">{errors.profession}</span>
              )}
            </div>

            {/* National ID upload */}
            <div className="form-group">
              <label className="form-label">Upload National ID *</label>
              <div className="receipt-upload-container">
                <input
                  type="file"
                  ref={nationalIdInputRef}
                  onChange={handleNationalIdChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="receipt-input"
                  disabled={isLoading}
                />
                {!nationalIdFile ? (
                  <div className="receipt-upload-area" onClick={() => nationalIdInputRef.current?.click()}>
                    <Upload className="receipt-upload-icon" />
                    <div className="receipt-upload-text">
                      <div className="receipt-upload-title">Upload National ID</div>
                      <div className="receipt-upload-subtitle">JPG, PNG or PDF (Max 5MB)</div>
                    </div>
                  </div>
                ) : (
                  <div className="receipt-file-info">
                    <div className="receipt-file-preview">
                      {nationalIdPreview ? (
                        <img src={nationalIdPreview} alt="National ID" className="receipt-preview-image" />
                      ) : (
                        <FileText className="receipt-file-icon" />
                      )}
                    </div>
                    <div className="receipt-file-details">
                      <div className="receipt-file-name">{nationalIdFile.name}</div>
                    </div>
                    <button type="button" onClick={removeNationalId} className="receipt-remove-button" disabled={isLoading}>
                      <X className="receipt-remove-icon" />
                    </button>
                  </div>
                )}
                {errors.nationalId && (
                  <span className="error-message" role="alert">{errors.nationalId}</span>
                )}
              </div>
            </div>

            {/* Profile image upload */}
            <div className="form-group">
              <label className="form-label">Upload Profile Image *</label>
              <div className="receipt-upload-container">
                <input
                  type="file"
                  ref={profileImageInputRef}
                  onChange={handleProfileImageChange}
                  accept=".jpg,.jpeg,.png"
                  className="receipt-input"
                  disabled={isLoading}
                />
                {!profileImageFile ? (
                  <div className="receipt-upload-area" onClick={() => profileImageInputRef.current?.click()}>
                    <Upload className="receipt-upload-icon" />
                    <div className="receipt-upload-text">
                      <div className="receipt-upload-title">Upload Profile Image</div>
                      <div className="receipt-upload-subtitle">JPG or PNG (Max 5MB)</div>
                    </div>
                  </div>
                ) : (
                  <div className="receipt-file-info">
                    <div className="receipt-file-preview">
                      {profileImagePreview && (
                        <img src={profileImagePreview} alt="Profile" className="receipt-preview-image" />
                      )}
                    </div>
                    <div className="receipt-file-details">
                      <div className="receipt-file-name">{profileImageFile.name}</div>
                    </div>
                    <button type="button" onClick={removeProfileImage} className="receipt-remove-button" disabled={isLoading}>
                      <X className="receipt-remove-icon" />
                    </button>
                  </div>
                )}
                {errors.profileImage && (
                  <span className="error-message" role="alert">{errors.profileImage}</span>
                )}
              </div>
            </div>
            
            {/* Membership Plan Selection */}
            <div className="form-group">
              <label className="form-label">
                Membership Plan *
              </label>
              <div className="membership-plans">
                {membershipPlans.map((plan) => (
                  <label key={plan.id} className="membership-plan">
                    <input
                      type="radio"
                      name="membershipPlan"
                      value={plan.id}
                      checked={formData.membershipPlan === plan.id}
                      onChange={handleChange}
                      className="membership-plan-input"
                      disabled={isLoading}
                    />
                    <div className="membership-plan-content">
                      <div className="membership-plan-header">
                        <span className="membership-plan-name">{plan.name}</span>
                        <span className={`membership-plan-price ${plan.price === 0 ? 'free' : 'paid'}`}>
                          {plan.price === 0 ? 'FREE' : `ETB ${plan.price}`}
                        </span>
                      </div>
                      <div className="membership-plan-description">
                        {plan.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Payment Receipt Upload */}
            {formData.membershipPlan !== 'basic' && (
              <div className="form-group">
                <label className="form-label">
                  Payment Receipt *
                </label>
                <div className="receipt-upload-container">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="receipt-input"
                    disabled={isLoading}
                  />
                  
                  {!receiptFile ? (
                    <div 
                      className="receipt-upload-area"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="receipt-upload-icon" />
                      <div className="receipt-upload-text">
                        <div className="receipt-upload-title">Upload Payment Receipt</div>
                        <div className="receipt-upload-subtitle">
                          Click to upload JPG, PNG or PDF (Max 5MB)
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="receipt-file-info">
                      <div className="receipt-file-preview">
                        {receiptPreview ? (
                          <img 
                            src={receiptPreview} 
                            alt="Receipt preview" 
                            className="receipt-preview-image"
                          />
                        ) : (
                          <FileText className="receipt-file-icon" />
                        )}
                      </div>
                      <div className="receipt-file-details">
                        <div className="receipt-file-name">{receiptFile.name}</div>
                        <div className="receipt-file-size">
                          {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="receipt-remove-button"
                        disabled={isLoading}
                      >
                        <X className="receipt-remove-icon" />
                      </button>
                    </div>
                  )}
                  
                  {errors.receipt && (
                    <span className="error-message" role="alert">
                      {errors.receipt}
                    </span>
                  )}
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="upload-progress">
                      <div className="upload-progress-bar">
                        <div 
                          className="upload-progress-fill"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="upload-progress-text">
                        Uploading... {uploadProgress}%
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Payment Instructions */}
                <div className="payment-instructions">
                  <p className="payment-instructions-title">
                    💡 Make sure your receipt shows:
                  </p>
                  <ul className="payment-instructions-list">
                    <li>Transaction ID/Reference</li>
                    <li>Amount paid: ETB {membershipPlans.find(p => p.id === formData.membershipPlan)?.price}</li>
                    <li>Date and time</li>
                    <li>Account: 1000212203746</li>
                  </ul>
                </div>
              </div>
            )}
            
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
             
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default RegistrationForm;