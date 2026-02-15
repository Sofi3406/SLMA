import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Project from '../models/Project.js';
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

const ensureProjectUploadsDir = () => {
  const dir = path.join(__dirname, '../../uploads/project-images');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const deleteLocalProjectImage = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('/uploads/project-images/')) return;
  const filename = imageUrl.split('/uploads/project-images/')[1]?.split('?')[0];
  if (!filename) return;
  const filePath = path.join(__dirname, '../../uploads/project-images', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const uploadProjectImage = async (fileBuffer, originalName, req) => {
  if (!cloudinaryConfigured) {
    console.warn('⚠️ Cloudinary credentials not set — saving project image locally');
    const uploadDir = ensureProjectUploadsDir();
    const ext = path.extname(originalName || '') || '.jpg';
    const filename = `project-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, fileBuffer);
    return { secure_url: `${getBaseUrl(req)}/uploads/project-images/${filename}`, public_id: null, localFilename: filename };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'silte-projects',
        transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
      },
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
    const { page = 1, limit = 12, category, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { isActive: true };

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { impact: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Project.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Project.countDocuments(query);
    res.json({
      success: true,
      data: items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    console.error('Error fetching projects', err);
    res.status(500).json({ success: false, message: 'Error fetching projects' });
  }
});

// GET list for admin (including inactive)
router.get('/admin/all', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, isActive, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { impact: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Project.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Project.countDocuments(query);
    res.json({
      success: true,
      data: items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    console.error('Error fetching admin projects', err);
    res.status(500).json({ success: false, message: 'Error fetching projects' });
  }
});

// GET single for admin (including inactive)
router.get('/admin/:id', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const item = await Project.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching admin project', err);
    res.status(500).json({ success: false, message: 'Error fetching project' });
  }
});

// GET single (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await Project.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching project', err);
    res.status(500).json({ success: false, message: 'Error fetching project' });
  }
});

// POST create (admin)
router.post('/', authenticate, authorize('super_admin', 'woreda_admin'), upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      status,
      location,
      timeline,
      participants,
      progress,
      impact
    } = req.body;

    let image = '';
    let imagePublicId = '';

    if (req.file) {
      const result = await uploadProjectImage(req.file.buffer, req.file.originalname, req);
      image = result.secure_url;
      imagePublicId = result.public_id || '';
    }

    const item = new Project({
      title,
      description,
      category,
      status,
      location,
      timeline,
      participants: participants ? parseInt(participants) : 0,
      progress: progress ? parseInt(progress) : 0,
      impact,
      image,
      imagePublicId,
      createdBy: req.user.id
    });

    await item.save();
    res.status(201).json({ success: true, message: 'Project created', data: item });
  } catch (err) {
    console.error('Error creating project', err);
    res.status(500).json({ success: false, message: 'Error creating project' });
  }
});

// PUT update (admin)
router.put('/:id', authenticate, authorize('super_admin', 'woreda_admin'), upload.single('image'), async (req, res) => {
  try {
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Project not found' });

    if (item.createdBy && item.createdBy.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'woreda_admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    if (req.file) {
      if (item.imagePublicId && cloudinaryConfigured) {
        try { await cloudinary.uploader.destroy(item.imagePublicId); } catch (e) { console.warn('Failed to delete old project image', e); }
      } else {
        deleteLocalProjectImage(item.image);
      }

      const result = await uploadProjectImage(req.file.buffer, req.file.originalname, req);
      req.body.image = result.secure_url;
      req.body.imagePublicId = result.public_id || '';
    }

    const allowed = ['title','description','category','status','location','timeline','participants','progress','impact','image','imagePublicId','isActive'];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) item[k] = req.body[k];
    });

    if (item.participants !== undefined) item.participants = parseInt(item.participants) || 0;
    if (item.progress !== undefined) item.progress = parseInt(item.progress) || 0;

    await item.save();
    res.json({ success: true, message: 'Project updated', data: item });
  } catch (err) {
    console.error('Error updating project', err);
    res.status(500).json({ success: false, message: 'Error updating project' });
  }
});

// DELETE (soft)
router.delete('/:id', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Project not found' });
    item.isActive = false;
    await item.save();
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('Error deleting project', err);
    res.status(500).json({ success: false, message: 'Error deleting project' });
  }
});

export default router;
