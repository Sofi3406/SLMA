import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { protect, authorize } from '../middlewares/auth.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Donation from '../models/Donation.js';
import { sendUserVerificationEmail, sendAdminPaymentVerificationEmail } from '../services/emailService.js';

const router = express.Router();


// Protect all admin routes
router.use(protect);
router.use(authorize('super_admin', 'woreda_admin'));

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin only)
router.get('/dashboard/stats', asyncHandler(async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const adminRole = req.user.role;
    const adminWoreda = req.user.woreda;

    // Build query based on admin role
    let userQuery = {};
    let eventQuery = {};
    let donationQuery = { paymentStatus: 'paid' };
    
    if (adminRole === 'woreda_admin') {
      // Woreda admins can only see their woreda's data
      userQuery.woreda = adminWoreda;
      eventQuery.woreda = adminWoreda;
      donationQuery.woreda = adminWoreda;
    }
    // Super admins can see all data (no query restrictions)

    // Get user statistics
    const [
      totalUsers,
      activeMembers,
      pendingVerifications,
      pendingPayments,
      verifiedPayments,
      totalEvents,
      pendingDonationReceipts,
      rejectedDonationReceipts
    ] = await Promise.all([
      // Total users
      User.countDocuments(userQuery),
      
      // Active members (membership status is active)
      User.countDocuments({
        ...userQuery,
        'membership.status': 'active',
        isActive: true
      }),
      
      // Pending user verifications (email not verified or membership pending)
      User.countDocuments({
        ...userQuery,
        $or: [
          { emailVerified: false },
          { 'membership.status': 'pending_verification' }
        ]
      }),
      
      // Pending payments (payment status is pending)
      User.countDocuments({
        ...userQuery,
        'payment.status': 'pending',
        'payment.amount': { $gt: 0 }
      }),
      
      // Verified payments
      User.countDocuments({
        ...userQuery,
        'payment.status': 'verified'
      }),
      
      // Total events
      Event.countDocuments(eventQuery),

      // Pending donation receipts (uploaded, awaiting verification)
      Donation.countDocuments(donationQuery),

      // Rejected donation receipts
      Donation.countDocuments({
        ...donationQuery,
        paymentStatus: 'rejected'
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeMembers,
        pendingVerifications,
        pendingPayments,
        verifiedPayments,
        totalEvents,
        pendingDonationReceipts,
        rejectedDonationReceipts
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
}));

// @desc    Get users with pending payments
// @route   GET /api/admin/payments/pending
// @access  Private (Admin only)
router.get('/payments/pending', asyncHandler(async (req, res) => {
  try {
    const adminRole = req.user.role;
    const adminWoreda = req.user.woreda;
    
    let query = {
      'payment.status': 'pending',
      'payment.amount': { $gt: 0 }
    };

    if (adminRole === 'woreda_admin') {
      query.woreda = adminWoreda;
    }

    const users = await User.find(query)
      .select('name email phone woreda payment membership createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending payments'
    });
  }
}));

// @desc    Get all payments (with filters)
// @route   GET /api/admin/payments
// @access  Private (Admin only)
router.get('/payments', asyncHandler(async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const adminRole = req.user.role;
    const adminWoreda = req.user.woreda;
    
    let query = {
      'payment.amount': { $gt: 0 }
    };

    if (status) {
      query['payment.status'] = status;
    }

    if (adminRole === 'woreda_admin') {
      query.woreda = adminWoreda;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email phone woreda payment membership createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
}));

// @desc    Verify user payment
// @route   PUT /api/admin/payments/:userId/verify
// @access  Private (Admin only)
router.put('/payments/:userId/verify', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user.id;

    console.log('🧾 Admin payment verify request:', { userId, status, adminId });

    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "verified" or "rejected"'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has payment
    if (!user.payment || user.payment.amount === 0) {
      return res.status(400).json({
        success: false,
        message: 'User has no payment to verify'
      });
    }

    // Ensure subdocuments exist
    user.payment = user.payment || {};
    user.membership = user.membership || {};

    // Update payment status
    user.payment.status = status;
    user.payment.verifiedBy = adminId;
    user.payment.verifiedAt = new Date();
    if (notes) {
      user.payment.notes = notes;
    }
    user.markModified('payment');

    // If verified, activate membership
    if (status === 'verified') {
      user.membership.status = 'active';
      user.membership.startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      user.membership.endDate = endDate;
      user.emailVerified = true;
      user.markModified('membership');
    }

    await user.save({ validateBeforeSave: false });

    // Send payment verification email to user (non-blocking)
    Promise.resolve()
      .then(() =>
        sendAdminPaymentVerificationEmail(
          user.email,
          user.name,
          status,
          user.payment.amount,
          user.membership?.membershipId || `SLMA-${user._id.toString().slice(-6)}`,
          notes
        )
      )
      .then(() => {
        console.log(`✅ Payment verification email sent to ${user.email}`);
      })
      .catch((emailError) => {
        console.warn('⚠️ Failed to send payment verification email:', emailError.message);
      });

    res.json({
      success: true,
      message: `Payment ${status} successfully`,
      data: {
        userId: user._id,
        paymentStatus: user.payment.status,
        membershipStatus: user.membership?.status,
        verifiedAt: user.payment.verifiedAt
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
}));

// @desc    Verify user account
// @route   PUT /api/admin/users/:userId/verify
// @access  Private (Admin only)
router.put('/users/:userId/verify', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user email and activate account
    user.emailVerified = true;
    user.isActive = true;
    
    // If payment is already verified, activate membership
    if (user.payment?.status === 'verified') {
      user.membership.status = 'active';
      user.membership.startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      user.membership.endDate = endDate;
    } else if (user.membership.status === 'pending_verification') {
      user.membership.status = 'pending_payment';
    }

    await user.save();

    // Send verification email to user
    try {
      await sendUserVerificationEmail(
        user.email,
        user.name,
        user.membership?.membershipId || `SLMA-${user._id.toString().slice(-6)}`
      );
      console.log(`✅ User verification email sent to ${user.email}`);
    } catch (emailError) {
      console.warn('⚠️ Failed to send user verification email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'User verified successfully',
      data: {
        userId: user._id,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        membershipStatus: user.membership.status
      }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user',
      error: error.message
    });
  }
}));

export default router;
