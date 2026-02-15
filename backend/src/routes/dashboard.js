import express from 'express';
import { protect } from '../middlewares/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's events attended count
    const eventsAttended = await Event.countDocuments({
      attendees: userId,
      date: { $lt: new Date() }
    });

    // Get user's total donations
    const user = await User.findById(userId);
    const totalDonations = user?.payment?.status === 'verified' ? user.payment.amount : 0;

    // Get total members count
    const totalMembers = await User.countDocuments({ 
      role: 'member',
      'membership.status': 'active'
    });

    // Calculate community engagement score
    const userActivities = await Activity.countDocuments({ user: userId });
    const communityEngagement = Math.min(userActivities * 10, 100);

    res.json({
      success: true,
      totalMembers,
      eventsAttended,
      totalDonations,
      communityEngagement,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
}));

// @desc    Get user activities
// @route   GET /api/dashboard/activities
// @access  Private
router.get('/activities', protect, asyncHandler(async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type description createdAt metadata');

    res.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
}));

// @desc    Get user profile summary
// @route   GET /api/dashboard/profile-summary
// @access  Private
router.get('/profile-summary', protect, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email phone woreda role membershipPlan membership emailVerified language createdAt lastLogin profile')
      .populate('payment', 'status amount');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Profile summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile summary'
    });
  }
}));

export default router;