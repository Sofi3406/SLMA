import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { protect, authorize } from '../middlewares/auth.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// GET /api/activities - get paginated activities for current user
router.get('/', protect, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const type = req.query.type;

  const query = { user: req.user.id };
  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('type description createdAt metadata'),
    Activity.countDocuments(query)
  ]);

  res.json({
    success: true,
    activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// GET /api/activities/all - admin: get all activities (filterable)
router.get('/all', protect, authorize('super_admin', 'woreda_admin'), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const type = req.query.type;
  const userId = req.query.userId;

  const query = {};
  if (type) query.type = type;
  if (userId) query.user = userId;

  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .select('user type description createdAt metadata'),
    Activity.countDocuments(query)
  ]);

  res.json({
    success: true,
    activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

export default router;
