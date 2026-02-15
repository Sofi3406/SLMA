import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CoFounder from '../models/CoFounder.js';
import { protect as authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME
);

const ensureCoFounderUploadsDir = () => {
  const dir = path.join(__dirname, '../../uploads/cofounders');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const deleteLocalImage = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('/uploads/cofounders/')) return;
  const filename = imageUrl.split('/uploads/cofounders/')[1]?.split('?')[0];
  if (!filename) return;
  const filePath = path.join(__dirname, '../../uploads/cofounders', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const uploadImage = async (fileBuffer, originalName, req) => {
  if (!cloudinaryConfigured) {
    console.warn('⚠️ Cloudinary credentials not set — saving co-founder image locally');
    const uploadDir = ensureCoFounderUploadsDir();
    const ext = path.extname(originalName || '') || '.jpg';
    const filename = `cofounder-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, fileBuffer);
    return { secure_url: `${getBaseUrl(req)}/uploads/cofounders/${filename}`, public_id: null, localFilename: filename };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'slma-cofounders', transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
};

// GET list (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { expertise: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await CoFounder.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await CoFounder.countDocuments(query);
    res.json({
      success: true,
      data: items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    console.error('Error fetching co-founders', err);
    res.status(500).json({ success: false, message: 'Error fetching co-founders' });
  }
});

// GET list for admin (including inactive)
router.get('/admin/all', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { expertise: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await CoFounder.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await CoFounder.countDocuments(query);
    res.json({
      success: true,
      data: items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    console.error('Error fetching admin co-founders', err);
    res.status(500).json({ success: false, message: 'Error fetching co-founders' });
  }
});

// GET single for admin
router.get('/admin/:id', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const item = await CoFounder.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Co-founder not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching admin co-founder', err);
    res.status(500).json({ success: false, message: 'Error fetching co-founder' });
  }
});

// GET single (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await CoFounder.findById(req.params.id);
    if (!item || !item.isActive) return res.status(404).json({ success: false, message: 'Co-founder not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching co-founder', err);
    res.status(500).json({ success: false, message: 'Error fetching co-founder' });
  }
});

// POST create (admin)
router.post('/', authenticate, authorize('super_admin', 'woreda_admin'), upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      role,
      expertise,
      currentActivity,
      background,
      slmaContribution,
      funFact,
      availability
    } = req.body;

    let image = '';
    let imagePublicId = '';

    if (req.file) {
      const result = await uploadImage(req.file.buffer, req.file.originalname, req);
      image = result.secure_url;
      imagePublicId = result.public_id || '';
    }

    const item = new CoFounder({
      name,
      role,
      expertise,
      currentActivity,
      background,
      slmaContribution,
      funFact,
      availability,
      image,
      imagePublicId,
      createdBy: req.user.id
    });

    await item.save();
    res.status(201).json({ success: true, message: 'Co-founder created', data: item });
  } catch (err) {
    console.error('Error creating co-founder', err);
    res.status(500).json({ success: false, message: 'Error creating co-founder' });
  }
});

// PUT update (admin)
router.put('/:id', authenticate, authorize('super_admin', 'woreda_admin'), upload.single('image'), async (req, res) => {
  try {
    const item = await CoFounder.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Co-founder not found' });

    if (req.file) {
      if (item.imagePublicId && cloudinaryConfigured) {
        try { await cloudinary.uploader.destroy(item.imagePublicId); } catch (e) { console.warn('Failed to delete old co-founder image', e); }
      } else {
        deleteLocalImage(item.image);
      }

      const result = await uploadImage(req.file.buffer, req.file.originalname, req);
      req.body.image = result.secure_url;
      req.body.imagePublicId = result.public_id || '';
    }

    const allowed = ['name','role','expertise','currentActivity','background','slmaContribution','funFact','availability','image','imagePublicId','isActive'];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) item[k] = req.body[k];
    });

    await item.save();
    res.json({ success: true, message: 'Co-founder updated', data: item });
  } catch (err) {
    console.error('Error updating co-founder', err);
    res.status(500).json({ success: false, message: 'Error updating co-founder' });
  }
});

// DELETE (soft)
router.delete('/:id', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const item = await CoFounder.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Co-founder not found' });
    item.isActive = false;
    await item.save();
    res.json({ success: true, message: 'Co-founder deleted' });
  } catch (err) {
    console.error('Error deleting co-founder', err);
    res.status(500).json({ success: false, message: 'Error deleting co-founder' });
  }
});

export default router;
