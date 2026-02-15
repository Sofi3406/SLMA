import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { protect, authorize } from '../middlewares/auth.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// Protect all admin user management routes and allow only super_admin
router.use(protect);
router.use(authorize('super_admin'));

// GET /api/admin/users - list users with pagination and optional search
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 200);
  const search = req.query.search;
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password'),
    User.countDocuments(query)
  ]);

  res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

// GET /api/admin/users/:id - get single user full details (for admin to view before/after verify)
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
}));

// POST /api/admin/users - create new user (admin can create any role)
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = 'member', woreda = 'worabe', membershipPlan = 'active' } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: 'User with this email already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email: email.toLowerCase(),
    password: hashed,
    phone,
    role,
    woreda,
    membershipPlan,
    emailVerified: true
  });

  await user.save();

  // Audit: create activity for admin creation
  try {
    await Activity.create({
      user: req.user.id,
      type: 'admin_action',
      description: `Created user ${user.email}`,
      metadata: { action: 'create_user', targetUser: user._id, targetEmail: user.email }
    });
  } catch (err) {
    console.warn('Failed to log admin activity:', err.message);
  }

  res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}));

// PUT /api/admin/users/:id/role - change user role
router.put('/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  const allowed = ['member', 'woreda_admin', 'super_admin'];
  if (!allowed.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const previous = user.role;
  user.role = role;
  await user.save();

  try {
    await Activity.create({
      user: req.user.id,
      type: 'admin_action',
      description: `Changed role of ${user.email} from ${previous} to ${role}`,
      metadata: { action: 'change_role', targetUser: user._id, previousRole: previous, newRole: role }
    });
  } catch (err) {
    console.warn('Failed to log admin activity:', err.message);
  }

  res.json({ success: true, message: 'Role updated', user: { id: user._id, role: user.role } });
}));

// PUT /api/admin/users/:id/verify - verify user email (allow system access)
router.put('/:id/verify', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.emailVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  try {
    await Activity.create({
      user: req.user.id,
      type: 'admin_action',
      description: `Verified email for user ${user.email}`,
      metadata: { action: 'verify_email', targetUser: user._id, targetEmail: user.email }
    });
  } catch (err) {
    console.warn('Failed to log admin activity:', err.message);
  }

  res.json({ success: true, message: 'User email verified. They can now access the system.', user: { id: user._id, emailVerified: true } });
}));

// PUT /api/admin/users/:id/status - activate/deactivate user
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const previous = user.isActive;
  user.isActive = !!isActive;
  await user.save();

  try {
    await Activity.create({
      user: req.user.id,
      type: 'admin_action',
      description: `${user.isActive ? 'Activated' : 'Deactivated'} user ${user.email}`,
      metadata: { action: user.isActive ? 'activate_user' : 'deactivate_user', targetUser: user._id }
    });
  } catch (err) {
    console.warn('Failed to log admin activity:', err.message);
  }

  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
}));

// DELETE /api/admin/users/:id - remove user (hard delete)
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  await User.deleteOne({ _id: user._id });

  try {
    await Activity.create({
      user: req.user.id,
      type: 'admin_action',
      description: `Deleted user ${user.email}`,
      metadata: { action: 'delete_user', targetUser: user._id, targetEmail: user.email }
    });
  } catch (err) {
    console.warn('Failed to log admin activity:', err.message);
  }

  res.json({ success: true, message: 'User deleted' });
}));

export default router;