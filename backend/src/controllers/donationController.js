import asyncHandler from '../utils/asyncHandler.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { sendDonationEmail, sendReceiptVerificationEmail } from '../services/emailService.js';

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Public
export const createDonation = asyncHandler(async (req, res) => {
  try {
    const {
      donor,
      amount,
      donationType,
      project,
      comment,
      paymentMethod,
      isAnonymous = false
    } = req.body;

    // Validate required fields
    if (!donor || !donor.fullName || !donor.email || !donor.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required donor information'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid donation amount'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please select a payment method'
      });
    }

    // Check if donor is a registered user
    let userId = null;
    const existingUser = await User.findOne({ email: donor.email.toLowerCase() });
    if (existingUser) {
      userId = existingUser._id;
    }

    // Create donation object
    const donationData = {
      donor: {
        userId,
        fullName: donor.fullName,
        email: donor.email.toLowerCase(),
        phone: donor.phone,
        isAnonymous
      },
      amount: Number(amount),
      donationType: donationType || 'one-time',
      project: project || 'General Fund',
      comment,
      paymentMethod,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      country: req.headers['cf-ipcountry'] || 'ET'
    };

    // Create donation
    const donation = new Donation(donationData);
    await donation.save();

    // Log activity for registered user donor
    try {
      if (userId) {
        await Activity.create({
          user: userId,
          type: 'donation',
          description: `Donation submitted: ETB ${donation.amount}`,
          metadata: { donationId: donation._id, amount: donation.amount, transactionId: donation.transactionId }
        });
      }
    } catch (actErr) {
      console.warn('Failed to create donation activity:', actErr.message);
    }

    // Prepare payment instructions
    const paymentInstructions = getPaymentInstructions(paymentMethod, amount);

    // Send payment instructions email
    try {
      await sendDonationEmail({
        to: donor.email,
        donorName: donor.fullName,
        amount,
        transactionId: donation.transactionId,
        paymentInstructions,
        donationType: donationType || 'one-time',
        project: project || 'General Fund'
      });
      
      console.log(`📧 Payment instructions sent to ${donor.email}`);
    } catch (emailError) {
      console.error('Failed to send payment instructions:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      donation: {
        id: donation._id,
        transactionId: donation.transactionId,
        amount: donation.amount,
        status: donation.paymentStatus,
        paymentInstructions,
        nextStep: 'Please complete payment and upload your receipt'
      }
    });

  } catch (error) {
    console.error('Donation creation error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate transaction detected'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating donation',
      error: error.message
    });
  }
});

// @desc    Upload payment receipt
// @route   POST /api/donations/:id/receipt
// @access  Public
export const uploadReceipt = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a receipt file'
      });
    }

    // Find donation
    const donation = await Donation.findById(id);
    if (!donation) {
      // Clean up uploaded file
      if (req.file.path) {
        const fs = await import('fs');
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Update donation with receipt info
    donation.receipt = {
      uploaded: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    };
    donation.paymentStatus = 'paid'; // Mark as paid when receipt is uploaded
    
    await donation.save();

    // Create activity for user when donation is verified/rejected
    try {
      if (donation.donor?.userId) {
        await Activity.create({
          user: donation.donor.userId,
          type: 'payment_verification',
          description: `Donation ${donation.paymentStatus}`,
          metadata: { donationId: donation._id, status: donation.paymentStatus, verifiedBy: donation.verifiedBy }
        });
      }
    } catch (actErr) {
      console.warn('Failed to create payment verification activity:', actErr.message);
    }

    // Notify admins about new receipt
    // (You can add admin notification logic here)

    res.json({
      success: true,
      message: 'Receipt uploaded successfully',
      donation: {
        id: donation._id,
        transactionId: donation.transactionId,
        status: donation.paymentStatus,
        receipt: {
          filename: donation.receipt.filename,
          uploadedAt: donation.receipt.uploadedAt
        },
        message: 'Your receipt is under review. You will be notified once verified.'
      }
    });

  } catch (error) {
    console.error('Receipt upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      const fs = await import('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading receipt',
      error: error.message
    });
  }
});

// @desc    Get donation by ID or transaction ID
// @route   GET /api/donations/:identifier
// @access  Public (or protected depending on your needs)
export const getDonation = asyncHandler(async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is a valid ObjectId or transaction ID
    const donation = await Donation.findOne({
      $or: [
        { _id: identifier },
        { transactionId: identifier }
      ]
    }).populate('donor.userId', 'name email phone woreda');
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Only show receipt path to admins or the donor
    const showReceiptDetails = req.user && (
      req.user.role === 'super_admin' || 
      req.user.role === 'woreda_admin' ||
      (donation.donor.userId && donation.donor.userId.toString() === req.user.id.toString())
    );

    const donationResponse = donation.toObject();
    
    if (!showReceiptDetails && donationResponse.receipt) {
      delete donationResponse.receipt.path;
    }

    res.json({
      success: true,
      donation: donationResponse
    });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation',
      error: error.message
    });
  }
});

// @desc    Get donations for the current user
// @route   GET /api/donations/my
// @access  Private
export const getMyDonations = asyncHandler(async (req, res) => {
  try {
    const donations = await Donation.find({ 'donor.userId': req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      donations
    });
  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message
    });
  }
});

// @desc    Get all donations (with filters)
// @route   GET /api/donations
// @access  Private (Admin only)
export const getAllDonations = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      project,
      woreda,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.paymentStatus = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (project) query.project = project;
    if (woreda) query.woreda = woreda;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { 'donor.fullName': { $regex: search, $options: 'i' } },
        { 'donor.email': { $regex: search, $options: 'i' } },
        { 'donor.phone': { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get donations with pagination
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('donor.userId', 'name email phone woreda')
      .populate('verifiedBy', 'name email');

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      donations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message
    });
  }
});

// @desc    Verify donation (Admin only)
// @route   PUT /api/donations/:id/verify
// @access  Private (Admin only)
export const verifyDonation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, referenceNumber, verificationNotes } = req.body;
    const adminId = req.user.id;

    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Update donation
    donation.paymentStatus = status;
    donation.verifiedBy = adminId;
    donation.verifiedAt = new Date();
    
    if (referenceNumber) donation.referenceNumber = referenceNumber;
    if (verificationNotes) donation.verificationNotes = verificationNotes;

    await donation.save();

    // Send verification email to donor
    try {
      await sendReceiptVerificationEmail({
        to: donation.donor.email,
        donorName: donation.donor.fullName,
        amount: donation.amount,
        status,
        transactionId: donation.transactionId,
        notes: verificationNotes
      });
      
      console.log(`📧 Verification email sent to ${donation.donor.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.json({
      success: true,
      message: `Donation ${status} successfully`,
      donation: {
        id: donation._id,
        transactionId: donation.transactionId,
        status: donation.paymentStatus,
        verifiedAt: donation.verifiedAt
      }
    });

  } catch (error) {
    console.error('Verify donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying donation',
      error: error.message
    });
  }
});

// @desc    Get donation statistics
// @route   GET /api/donations/stats
// @access  Private (Admin only)
export const getDonationStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          verifiedAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'verified'] }, '$amount', 0]
            }
          },
          verifiedCount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'verified'] }, 1, 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$amount', 0]
            }
          },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0]
            }
          },
          rejectedAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'rejected'] }, '$amount', 0]
            }
          },
          rejectedCount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'rejected'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          totalDonations: 1,
          verifiedAmount: 1,
          verifiedCount: 1,
          pendingAmount: 1,
          pendingCount: 1,
          rejectedAmount: 1,
          rejectedCount: 1,
          averageDonation: { $divide: ['$totalAmount', '$totalDonations'] }
        }
      }
    ]);

    // Get monthly statistics
    const monthlyStats = await Donation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get project-wise statistics
    const projectStats = await Donation.aggregate([
      {
        $group: {
          _id: '$project',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    // Get woreda-wise statistics
    const woredaStats = await Donation.aggregate([
      {
        $match: { woreda: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$woreda',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalAmount: 0,
        totalDonations: 0,
        verifiedAmount: 0,
        verifiedCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
        rejectedAmount: 0,
        rejectedCount: 0,
        averageDonation: 0
      },
      monthlyStats,
      projectStats,
      woredaStats
    });

  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation statistics',
      error: error.message
    });
  }
});

// Helper function to generate payment instructions
function getPaymentInstructions(method, amount) {
  const instructions = {
    method,
    amount,
    steps: [],
    details: {}
  };

  switch(method) {
    case 'cbe':
      instructions.steps = [
        'Visit any Commercial Bank of Ethiopia branch',
        'Fill out deposit slip with the following details:',
        `Account Number: 1000212203746`,
        `Account Name: SOFIYA YASIN`,
        `Amount: ETB ${amount}`,
        'Use your phone number or name as reference',
        'Keep the deposit slip/receipt',
        'Upload the receipt on our website'
      ];
      instructions.details = {
        accountNumber: '1000212203746',
        accountName: 'SOFIYA YASIN',
        bank: 'Commercial Bank of Ethiopia'
      };
      break;

    case 'telebirr':
      instructions.steps = [
        'Open your TeleBirr app',
        'Go to Send Money',
        `Enter phone number: +251930670088`,
        `Enter amount: ETB ${amount}`,
        'Add your name in the message/note field',
        'Complete the transaction',
        'Take a screenshot of the confirmation',
        'Upload the screenshot on our website'
      ];
      instructions.details = {
        phoneNumber: '+251930670088',
        name: 'SOFIYA YASIN'
      };
      break;

    case 'bank-transfer':
      instructions.steps = [
        'Use your bank\'s mobile app or visit a branch',
        `Transfer ETB ${amount} to:`,
        `Bank: Commercial Bank of Ethiopia`,
        `Account: 1000212203746`,
        `Name: SOFIYA YASIN`,
        'Add your name as reference',
        'Save the transaction receipt/screenshot',
        'Upload it on our website'
      ];
      instructions.details = {
        accountNumber: '1000212203746',
        accountName: 'SOFIYA YASIN',
        bank: 'Commercial Bank of Ethiopia'
      };
      break;

    case 'card':
      instructions.steps = [
        'You will be redirected to a secure payment page',
        'Enter your card details',
        `Amount: ETB ${amount}`,
        'Complete the payment',
        'You will receive an automatic receipt',
        'No need to upload anything manually'
      ];
      instructions.details = {
        processor: 'Stripe/Payment Gateway',
        currency: 'ETB'
      };
      break;

    default:
      instructions.steps = ['Please contact support for payment instructions'];
  }

  return instructions;
}