import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Gallery from '../models/Gallery.js';
import { protect as authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup (memory)
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

const ensureGalleryUploadsDir = () => {
  const dir = path.join(__dirname, '../../uploads/galleries');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const deleteLocalGalleryImage = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('/uploads/galleries/')) return;
  const filename = imageUrl.split('/uploads/galleries/')[1]?.split('?')[0];
  if (!filename) return;
  const filePath = path.join(__dirname, '../../uploads/galleries', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const uploadToCloudinary = async (buffer, originalName, req) => {
  if (!cloudinaryConfigured) {
    console.warn('⚠️ Cloudinary credentials not set — saving gallery image locally');
    const uploadDir = ensureGalleryUploadsDir();
    const ext = path.extname(originalName || '') || '.jpg';
    const filename = `gallery-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return { secure_url: `${getBaseUrl(req)}/uploads/galleries/${filename}`, public_id: null, localFilename: filename };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: 'silte-galleries', transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }] }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    }).end(buffer);
  });
};

// GET list
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Gallery.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Gallery.countDocuments(query);
    res.json({ success: true, data: items, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    console.error('Error fetching galleries', err);
    res.status(500).json({ success: false, message: 'Error fetching galleries' });
  }
});

// GET list for admin (including inactive)
router.get('/admin/all', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isActive, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Gallery.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Gallery.countDocuments(query);
    res.json({ success: true, data: items, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    console.error('Error fetching admin galleries', err);
    res.status(500).json({ success: false, message: 'Error fetching galleries' });
  }
});

// GET single for admin (including inactive)
router.get('/admin/:id', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching admin gallery item', err);
    res.status(500).json({ success: false, message: 'Error fetching gallery item' });
  }
});

// GET single
router.get('/:id', async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item || !item.isActive) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching gallery item', err);
    res.status(500).json({ success: false, message: 'Error fetching gallery item' });
  }
});

// POST create (admin)
router.post('/', authenticate, authorize('super_admin', 'woreda_admin'), upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, category } = req.body;
    let image = '';
    let imagePublicId = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req);
      image = result.secure_url;
      imagePublicId = result.public_id || '';
    }

    const item = new Gallery({ title, description, location, category, image, imagePublicId, createdBy: req.user.id });
    await item.save();
    res.status(201).json({ success: true, message: 'Gallery item created', data: item });
  } catch (err) {
    console.error('Error creating gallery', err);
    res.status(500).json({ success: false, message: 'Error creating gallery' });
  }
});

// PUT update (admin)
router.put('/:id', authenticate, authorize('super_admin', 'woreda_admin'), upload.single('image'), async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });

    // Only allow update by creator or admin
    if (item.createdBy && item.createdBy.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'woreda_admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    if (req.file) {
      try {
        if (item.imagePublicId && cloudinaryConfigured) await cloudinary.uploader.destroy(item.imagePublicId);
      } catch (e) { console.warn('Failed to delete old gallery image', e); }
      if (!item.imagePublicId) {
        deleteLocalGalleryImage(item.image);
      }
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req);
      req.body.image = result.secure_url;
      req.body.imagePublicId = result.public_id || '';
    }

    const allowed = ['title','description','location','category','image','imagePublicId','isActive'];
    allowed.forEach(k => { if (req.body[k] !== undefined) item[k] = req.body[k]; });

    await item.save();
    res.json({ success: true, message: 'Gallery item updated', data: item });
  } catch (err) {
    console.error('Error updating gallery', err);
    res.status(500).json({ success: false, message: 'Error updating gallery' });
  }
});

// DELETE (soft)
router.delete('/:id', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    item.isActive = false;
    await item.save();
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (err) {
    console.error('Error deleting gallery', err);
    res.status(500).json({ success: false, message: 'Error deleting gallery' });
  }
});

export default router;
