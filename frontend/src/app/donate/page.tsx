'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Heart, 
  Lock, 
  Shield, 
  CheckCircle,
  Globe,
  BookOpen,
  Users,
  Target,
  Upload,
  AlertCircle,
  Check,
  Gift,
  TrendingUp,
  Award,
  Star,
  ShieldCheck,
  Coins,
  Sparkles,
  Zap,
  Target as TargetIcon,
  Users as UsersIcon,
  HeartHandshake,
  BadgeCheck,
  FileText,
  Receipt
} from 'lucide-react';
import { authService } from '@/services/authService';
import api from '@/services/api';
import { fetchProjects } from '@/lib/projectsApi';

export default function DonatePage() {
  const donorInfoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one-time');
  const [selectedProject, setSelectedProject] = useState('General Fund');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cbe');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    comment: '',
    anonymous: false
  });
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [activeTab, setActiveTab] = useState('donate');
  const [adminDonations, setAdminDonations] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [verificationInputs, setVerificationInputs] = useState({});
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState('');

  // API Base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const donationMethods = [
    {
      id: 'cbe',
      name: 'CBE Bank Transfer',
      description: 'Transfer to Commercial Bank of Ethiopia account',
      icon: <Building className="w-6 h-6" />,
      details: 'Account: 1000212203746\nName: SOFIYA YASIN\nBank: Commercial Bank of Ethiopia',
      instructions: 'Visit any CBE branch or use CBE mobile banking',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      id: 'telebirr',
      name: 'TeleBirr',
      description: 'Quick payment using TeleBirr mobile money',
      icon: <Smartphone className="w-6 h-6" />,
      details: 'Phone: +251930670088\nName: SOFIYA YASIN',
      instructions: 'Send money via TeleBirr app',
      color: 'from-green-500 to-emerald-500',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500'
    },
    {
      id: 'bank-transfer',
      name: 'Other Bank Transfer',
      description: 'Transfer from any bank to our CBE account',
      icon: <CreditCard className="w-6 h-6" />,
      details: 'Account: 1000212203746\nName: SOFIYA YASIN\nBank: Commercial Bank of Ethiopia',
      instructions: 'Use your bank\'s mobile app or visit a branch',
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
    }
  ];

  const presetAmounts = [
    { amount: 100, label: 'ETB 100', popular: false },
    { amount: 500, label: 'ETB 500', popular: true },
    { amount: 1000, label: 'ETB 1,000', popular: false },
    { amount: 2500, label: 'ETB 2,500', popular: false },
    { amount: 5000, label: 'ETB 5,000', popular: false },
    { amount: 10000, label: 'ETB 10,000', popular: false }
  ];

  const projectCategoryStyles = {
    education: { label: 'Education', color: 'from-blue-500 to-indigo-500', icon: <BookOpen className="w-5 h-5" /> },
    culture: { label: 'Culture', color: 'from-purple-500 to-pink-500', icon: <Heart className="w-5 h-5" /> },
    health: { label: 'Health', color: 'from-rose-500 to-red-500', icon: <HeartHandshake className="w-5 h-5" /> },
    community: { label: 'Community', color: 'from-emerald-500 to-teal-500', icon: <UsersIcon className="w-5 h-5" /> },
    youth: { label: 'Youth', color: 'from-amber-500 to-orange-500', icon: <UsersIcon className="w-5 h-5" /> },
    heritage: { label: 'Heritage', color: 'from-indigo-500 to-violet-500', icon: <BookOpen className="w-5 h-5" /> }
  };

  const getProjectStyle = (category) => {
    if (!category) {
      return { label: 'Community', color: 'from-blue-500 to-indigo-500', icon: <Sparkles className="w-5 h-5" /> };
    }
    const key = category.toLowerCase();
    return projectCategoryStyles[key] || { label: category, color: 'from-blue-500 to-indigo-500', icon: <Sparkles className="w-5 h-5" /> };
  };

  const impactStats = [
    { 
      number: '2,500+', 
      label: 'Donors Supported', 
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-400 to-cyan-400'
    },
    { 
      number: 'ETB 5M+', 
      label: 'Funds Raised', 
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-emerald-400 to-teal-400'
    },
    { 
      number: '15', 
      label: 'Projects Funded', 
      icon: <TargetIcon className="w-6 h-6" />,
      color: 'from-purple-400 to-pink-400'
    },
    { 
      number: '12', 
      label: 'Woredas Impacted', 
      icon: <Globe className="w-6 h-6" />,
      color: 'from-amber-400 to-orange-400'
    }
  ];

  const securityFeatures = [
    {
      title: 'Bank-Level Security',
      description: '256-bit SSL encryption for all transactions',
      icon: <ShieldCheck className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Verified Platform',
      description: 'SLMA is a registered community organization',
      icon: <BadgeCheck className="w-6 h-6" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'Tax Receipts',
      description: 'Official receipts for all donations',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Transparent Tracking',
      description: 'See exactly where your donation goes',
      icon: <Receipt className="w-6 h-6" />,
      color: 'from-amber-400 to-orange-500'
    }
  ];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const scrollToDonorInfo = () => {
    if (donorInfoRef.current) {
      donorInfoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid file (JPEG, PNG, or PDF)');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setReceiptFile(file);
    }
  };

  const createDonation = async () => {
    const donationAmount = selectedAmount || customAmount;
    
    const donationData = {
      donor: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      },
      amount: Number(donationAmount),
      donationType: donationType,
      project: selectedProject,
      comment: formData.comment,
      paymentMethod: selectedPaymentMethod,
      isAnonymous: formData.anonymous,
      metadata: {
        address: formData.address
      }
    };

    try {
      const response = await fetch(`${API_URL}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create donation');
      }

      return result;
    } catch (error) {
      console.error('Donation creation error:', error);
      throw error;
    }
  };

  const uploadReceipt = async (donationId) => {
    if (!receiptFile) {
      throw new Error('Please select a receipt file');
    }

    const formData = new FormData();
    formData.append('receipt', receiptFile);

    try {
      const response = await fetch(`${API_URL}/donations/${donationId}/receipt`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload receipt');
      }

      return result;
    } catch (error) {
      console.error('Receipt upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    const donationAmount = selectedAmount || customAmount;
    if (!donationAmount || donationAmount <= 0) {
      alert('Please select or enter a donation amount');
      setLoading(false);
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Please fill in all required donor information');
      setLoading(false);
      return;
    }

    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      setLoading(false);
      return;
    }

    try {
      // Create donation
      const donationResult = await createDonation();
      
      setCurrentDonation(donationResult.donation);
      setShowPaymentInstructions(true);
      
      setSuccessMessage(`Donation created successfully! Check your email for payment instructions. Transaction ID: ${donationResult.donation.transactionId}`);
      
      // Reset form (except for payment instructions)
      setSelectedAmount(null);
      setCustomAmount('');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        comment: '',
        anonymous: false
      });
      setReceiptFile(null);
      
    } catch (error) {
      alert(`Donation failed: ${error.message}`);
      console.error('Donation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = async () => {
    if (!currentDonation) {
      alert('No donation found. Please create a donation first.');
      return;
    }

    if (!receiptFile) {
      alert('Please select a receipt file to upload');
      return;
    }

    setUploadLoading(true);

    try {
      const uploadResult = await uploadReceipt(currentDonation.id);
      
      alert('Receipt uploaded successfully! Our team will verify it within 24-48 hours.');
      
      // Reset state
      setCurrentDonation(null);
      setShowPaymentInstructions(false);
      setReceiptFile(null);
      setSuccessMessage('Thank you! Your receipt has been submitted for verification.');
      
    } catch (error) {
      alert(`Receipt upload failed: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const getPaymentInstructions = () => {
    const method = donationMethods.find(m => m.id === selectedPaymentMethod);
    const amount = selectedAmount || customAmount;
    
    switch(selectedPaymentMethod) {
      case 'cbe':
        return {
          title: 'CBE Bank Transfer Instructions',
          steps: [
            'Visit any Commercial Bank of Ethiopia branch',
            'Fill out deposit slip with the following details:',
            `Account Number: 1000212203746`,
            `Account Name: SOFIYA YASIN`,
            `Amount: ETB ${amount}`,
            'Use your phone number or name as reference',
            'Keep the deposit slip/receipt',
            'Upload the receipt below'
          ]
        };
        
      case 'telebirr':
        return {
          title: 'TeleBirr Payment Instructions',
          steps: [
            'Open your TeleBirr app',
            'Go to Send Money',
            `Enter phone number: +251930670088`,
            `Enter amount: ETB ${amount}`,
            'Add your name in the message/note field',
            'Complete the transaction',
            'Take a screenshot of the confirmation',
            'Upload the screenshot below'
          ]
        };
        
      case 'bank-transfer':
        return {
          title: 'Bank Transfer Instructions',
          steps: [
            'Use your bank\'s mobile app or visit a branch',
            `Transfer ETB ${amount} to:`,
            `Bank: Commercial Bank of Ethiopia`,
            `Account: 1000212203746`,
            `Name: SOFIYA YASIN`,
            'Add your name as reference',
            'Save the transaction receipt/screenshot',
            'Upload it below'
          ]
        };
        
      default:
        return {
          title: 'Payment Instructions',
          steps: ['Please complete your payment and upload the receipt']
        };
    }
  };

  // Check for existing donation in localStorage on component mount
  useEffect(() => {
    const savedDonation = localStorage.getItem('lastDonation');
    const savedTransactionId = localStorage.getItem('lastTransactionId');
    
    if (savedDonation && savedTransactionId) {
      setCurrentDonation(JSON.parse(savedDonation));
      setShowPaymentInstructions(true);
    }
  }, []);

  const loadAdminDonations = async () => {
    if (!authService.isAdmin()) return;
    try {
      setAdminLoading(true);
      setAdminError('');
      const res = await api.get('/donations', {
        params: { status: 'paid', limit: 50 }
      });
      setAdminDonations(res.data?.donations || []);
    } catch (err) {
      setAdminError('Failed to load donations');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDonations();
  }, []);

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        setFeaturedLoading(true);
        setFeaturedError('');
        const data = await fetchProjects({ limit: 4 });
        setFeaturedProjects(data?.data || []);
      } catch (error) {
        console.error('Error loading featured projects:', error);
        setFeaturedError('Failed to load projects. Please try again later.');
        setFeaturedProjects([]);
      } finally {
        setFeaturedLoading(false);
      }
    };

    loadFeaturedProjects();
  }, []);

  const handleVerificationInputChange = (donationId, field, value) => {
    setVerificationInputs(prev => ({
      ...prev,
      [donationId]: {
        referenceNumber: prev[donationId]?.referenceNumber || '',
        notes: prev[donationId]?.notes || '',
        [field]: value
      }
    }));
  };

  const handleVerifyDonation = async (donationId, status) => {
    try {
      const inputs = verificationInputs[donationId] || {};
      await api.put(`/donations/${donationId}/verify`, {
        status,
        referenceNumber: inputs.referenceNumber || undefined,
        verificationNotes: inputs.notes || undefined
      });
      setAdminDonations(prev => prev.filter(d => d._id !== donationId && d.id !== donationId));
    } catch (err) {
      setAdminError('Failed to verify donation');
    }
  };

  const getReceiptUrl = (donation) => {
    if (!donation?.receipt?.filename) return null;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    return `${baseUrl}/uploads/donation-receipts/${donation.receipt.filename}`;
  };

  return (
    <div className="donate-page min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/10 to-purple-50/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 animate-fade-in">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-green-800 font-medium">{successMessage}</p>
                  <p className="text-green-600 text-sm mt-1">You can close this message or continue browsing.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="text-center mb-16 relative">
          {/* Animated background elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-2xl opacity-50 -z-10"></div>
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-gradient-to-br from-purple-200 to-transparent rounded-full blur-2xl opacity-50 -z-10"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">Make a Difference Today</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Support <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Silte Heritage</span>
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Your donation helps preserve our rich culture, empower youth, and build a stronger community. 
            Every contribution, no matter the size, creates lasting impact.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700">100% Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald-700">Tax Deductible</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-purple-700">Real-time Impact</span>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="mb-16 animate-slide-up">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Community Impact <span className="text-purple-600">Dashboard</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Gradient background effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10 text-center">
                  <div className={`inline-flex p-3 bg-gradient-to-br ${stat.color} rounded-xl mb-4`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Tabs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Featured <span className="text-purple-600">Projects</span>
          </h2>
          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="h-28 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center text-gray-600 bg-white/70 border border-dashed border-gray-200 rounded-2xl py-10">
              {featuredError || 'No projects available right now. Please check back soon.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProjects.map((project) => {
                const style = getProjectStyle(project.category);
                const progressValue = Number.isFinite(project.progress) ? project.progress : 0;
                const supporters = project.participants || 0;
                return (
                  <div
                    key={project._id || project.id || project.title}
                    className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
                      selectedProject === project.title
                        ? 'border-purple-500 border-opacity-50 shadow-purple-100'
                        : 'border-transparent hover:border-purple-200'
                    }`}
                    onClick={() => setSelectedProject(project.title)}
                    onMouseEnter={() => setHoveredProject(project._id || project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <div className="relative -mx-6 -mt-6 mb-5">
                      <div
                        className="project-image-container rounded-2xl"
                        style={project.image ? { backgroundImage: `url(${project.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                      >
                        {!project.image && (
                          <div className={`h-full w-full bg-gradient-to-br ${style.color} flex items-center justify-center text-white`}>{style.icon}</div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="text-xs px-2 py-1 bg-white/90 text-gray-800 rounded-full font-medium">
                            {style.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium capitalize">
                        {project.status || 'active'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{progressValue}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${style.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${progressValue}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{project.location || 'Silte Zone'}</span>
                      <span>{project.timeline || 'Ongoing'}</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full"></div>
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full"></div>
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-500">{supporters} supporters</span>
                      </div>

                      {selectedProject === project.title && (
                        <div className="animate-pulse">
                          <Check className="w-5 h-5 text-purple-500" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Donation Form */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-6 md:p-8 mb-16 border border-gray-200 animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Make Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Donation</span>
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Donation Amount */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                Select Donation Amount
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                {presetAmounts.map((item) => (
                  <button
                    key={item.amount}
                    type="button"
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 group ${
                      selectedAmount === item.amount
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'
                    }`}
                    onClick={() => {
                      handleAmountSelect(item.amount);
                      scrollToDonorInfo();
                    }}
                  >
                    {item.popular && (
                      <div className="absolute -top-2 -right-2">
                        <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-xs text-white font-bold rounded-full">
                          POPULAR
                        </span>
                      </div>
                    )}
                    <div className={`font-bold text-lg ${
                      selectedAmount === item.amount ? 'text-purple-700' : 'text-gray-800'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs mt-1 ${
                      selectedAmount === item.amount ? 'text-purple-600' : 'text-gray-500'
                    }`}>
                      {item.amount >= 1000 ? 'Significant Impact' : 'Every Bit Helps'}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="relative group">
                <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-purple-400 group-hover:shadow-md">
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-bold border-r border-gray-200">
                    ETB
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Enter custom amount (min 10 ETB)"
                    className="flex-1 px-4 py-3 outline-none bg-transparent placeholder-gray-400"
                    min="10"
                  />
                  <div className="px-4 py-3 text-sm text-gray-500 hidden sm:block">
                    Or enter any amount
                  </div>
                </div>
                <div className="absolute -bottom-6 left-0 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter any amount you wish to donate
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4" ref={donorInfoRef}>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                Select Payment Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {donationMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 group ${
                      selectedPaymentMethod === method.id
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    <div className="relative">
                      <div className="flex items-center mb-3">
                        <div className={`p-2 ${method.iconBg} text-white rounded-lg mr-3`}>
                          {method.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{method.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                        {method.details}
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <div className="absolute top-2 right-2 animate-bounce">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Your Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="+251 ___ ___ ___"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Comment (Optional)
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Add a personal message or dedication with your donation..."
                  rows="3"
                />
              </div>
              
              <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  name="anonymous"
                  checked={formData.anonymous}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-700">
                  <span className="font-medium">Make this donation anonymous</span>
                  <span className="text-sm text-gray-500 block mt-1">Your name won't appear in public donor lists</span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl mb-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 text-purple-600 mt-1 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">
                    I consent to SLMA contacting me regarding my donation. I confirm this donation is made voluntarily.
                  </span>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {loading ? (
                  <span className="flex items-center relative z-10">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing Your Generosity...
                  </span>
                ) : (
                  <span className="flex items-center relative z-10">
                    <Heart className="w-5 h-5 mr-2 animate-pulse" />
                    Make Your Impact Now
                    <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                )}
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                100% Secure • Tax Deductible • Instant Email Confirmation
              </p>
            </div>
          </form>
        </div>

        {/* Security Features */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl p-8 mb-12 border border-blue-100">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Your Donation is <span className="text-blue-600">Secure</span> with Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="group text-center p-6">
                <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Contact */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-purple-700">Thank you for your generosity</span>
          </div>
          
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Your support makes our community stronger. Every donation, big or small, helps us preserve Silte heritage and build a better future together.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:donations@siltecommunity.org" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              donations@siltecommunity.org
            </a>
            <a 
              href="tel:+251930670088" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +251 93 067 0088
            </a>
          </div>
        </div>

        {/* Payment Instructions Modal */}
        {showPaymentInstructions && currentDonation && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Complete Your Donation
                    </h2>
                    <p className="text-gray-600">Follow these steps to finalize your contribution</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentInstructions(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Alert Banner */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">Important Notice</h3>
                      <p className="text-blue-700 text-sm">
                        Please complete the payment using the instructions below, then upload your receipt.
                        Your donation will be processed only after receipt verification by our team.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Donation Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Your Donation Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                      <p className="font-mono font-bold text-gray-900">{currentDonation.transactionId}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="text-2xl font-bold text-emerald-600">ETB {currentDonation.amount}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    {getPaymentInstructions().title}
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-6 rounded-xl border border-purple-100">
                    <ol className="space-y-3">
                      {getPaymentInstructions().steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Receipt Upload */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-500" />
                    Upload Payment Receipt
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-300 hover:border-purple-400 hover:bg-purple-50">
                    <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-4">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    {receiptFile ? (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Selected file:</p>
                        <p className="font-medium text-gray-900">{receiptFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(receiptFile.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                          onClick={() => setReceiptFile(null)}
                          className="text-sm text-red-600 hover:text-red-800 mt-2 inline-flex items-center gap-1"
                        >
                          ✕ Remove file
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-4">
                          Upload a clear photo or scan of your payment receipt
                        </p>
                        <label className="cursor-pointer inline-block">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <Upload className="w-4 h-4" />
                            Choose File
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Accepted formats: JPG, PNG, PDF (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowPaymentInstructions(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReceiptUpload}
                    disabled={uploadLoading || !receiptFile}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Submit Receipt
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {authService.isAdmin() && (
        <div className="mt-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Donation Receipt Verification</h2>
                <p className="text-sm text-gray-600">Review and verify uploaded donation receipts.</p>
              </div>
              <button
                onClick={loadAdminDonations}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>

            {adminError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {adminError}
              </div>
            )}

            {adminLoading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Loading donations...
              </div>
            ) : adminDonations.length === 0 ? (
              <div className="text-sm text-gray-600">No pending receipts found.</div>
            ) : (
              <div className="space-y-4">
                {adminDonations.map((donation) => {
                  const receiptUrl = getReceiptUrl(donation);
                  const donationId = donation._id || donation.id;
                  return (
                    <div key={donationId} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Transaction ID</div>
                          <div className="font-semibold text-gray-900">{donation.transactionId}</div>
                          <div className="text-sm text-gray-600">
                            {donation.donor?.fullName} • {donation.donor?.email} • {donation.donor?.phone}
                          </div>
                          <div className="text-sm text-gray-600">
                            Amount: ETB {donation.amount} • Method: {donation.paymentMethod}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          {receiptUrl ? (
                            <a
                              href={receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                            >
                              <FileText className="w-4 h-4" />
                              View Receipt
                            </a>
                          ) : (
                            <div className="text-sm text-gray-500">No receipt file</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Reference Number (optional)</label>
                          <input
                            type="text"
                            value={verificationInputs[donationId]?.referenceNumber || ''}
                            onChange={(e) => handleVerificationInputChange(donationId, 'referenceNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Bank/TeleBirr reference"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Verification Notes (optional)</label>
                          <input
                            type="text"
                            value={verificationInputs[donationId]?.notes || ''}
                            onChange={(e) => handleVerificationInputChange(donationId, 'notes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Notes for donor"
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleVerifyDonation(donationId, 'verified')}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerifyDonation(donationId, 'rejected')}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global CSS Styles */}
      <style jsx global>{`
        .donate-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        /* Custom scrollbar */
        .donate-page ::-webkit-scrollbar {
          width: 8px;
        }
        
        .donate-page ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .donate-page ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 4px;
        }
        
        .donate-page ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
        
        /* Line clamp utility */
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        
        /* Gradient text */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Glass effect */
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Hover lift effect */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        /* Custom focus styles */
        .custom-focus:focus {
          outline: none;
          ring: 2px;
          ring-offset: 2px;
          ring-color: #8b5cf6;
        }
        
        /* Smooth transitions */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
        }
        
        /* Card glow effect */
        .card-glow {
          box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.1), 0 10px 40px rgba(139, 92, 246, 0.1);
        }
        
        .card-glow:hover {
          box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.2), 0 20px 60px rgba(139, 92, 246, 0.2);
        }
        
        /* Shine effect for buttons */
        .shine-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.7s;
        }
        
        .shine-effect:hover::after {
          left: 100%;
        }
        
        /* Loading skeleton */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* Custom checkbox */
        .custom-checkbox:checked {
          background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
          background-size: 100% 100%;
          background-position: center;
          background-repeat: no-repeat;
        }
      `}</style>
    </div>
  );
}