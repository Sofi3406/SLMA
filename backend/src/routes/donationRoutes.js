import express from 'express';
import {
  createDonation,
  uploadReceipt,
  getDonation,
  getAllDonations,
  getMyDonations,
  verifyDonation,
  getDonationStats
} from '../controllers/donationController.js';
import { uploadReceipt as uploadMiddleware } from '../middlewares/upload.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/', createDonation);
router.post('/:id/receipt', uploadMiddleware, uploadReceipt);
// Protected user routes
router.get('/my', protect, getMyDonations);

// Public lookup
router.get('/:identifier', getDonation);

// Protected admin routes
router.get('/', protect, authorize('woreda_admin', 'super_admin'), getAllDonations);
router.put('/:id/verify', protect, authorize('woreda_admin', 'super_admin'), verifyDonation);
router.get('/stats/summary', protect, authorize('woreda_admin', 'super_admin'), getDonationStats);

export default router;