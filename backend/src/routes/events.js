import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Activity from '../models/Activity.js';
import { protect as authenticate, authorize } from '../middlewares/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Configure Cloudinary
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

const ensureEventUploadsDir = () => {
  const dir = path.join(__dirname, '../../uploads/event-images');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const deleteLocalEventImage = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('/uploads/event-images/')) return;
  const filename = imageUrl.split('/uploads/event-images/')[1]?.split('?')[0];
  if (!filename) return;
  const filePath = path.join(__dirname, '../../uploads/event-images', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to upload image to Cloudinary or local storage
const uploadEventImage = async (fileBuffer, originalName, req) => {
  if (!cloudinaryConfigured) {
    console.warn('⚠️ Cloudinary credentials not set — saving event image locally');
    const uploadDir = ensureEventUploadsDir();
    const ext = path.extname(originalName || '') || '.jpg';
    const filename = `event-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, fileBuffer);
    return { secure_url: `${getBaseUrl(req)}/uploads/event-images/${filename}`, public_id: null, localFilename: filename };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'silte-events',
        transformation: [
          { width: 800, height: 450, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
};

// ============================
// PUBLIC ROUTES
// ============================

// GET all events with enhanced filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      status,
      organizer,
      startDate,
      endDate,
      isIslamicEvent,
      page = 1,
      limit = 12,
      sortBy = 'date',
      order = 'asc',
      search,
      upcomingOnly = false
    } = req.query;

    const query = { isActive: true };

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (organizer && mongoose.Types.ObjectId.isValid(organizer)) {
      query.organizer = organizer;
    }
    if (isIslamicEvent !== undefined) {
      query.isIslamicEvent = isIslamicEvent === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Upcoming events only
    if (upcomingOnly === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'upcoming';
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute query with lean for better performance
    const events = await Event.find(query)
      .populate('organizer', 'name email profile.photo')
      .populate('attendees', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Event.countDocuments(query);

    // Format events for frontend
    const formattedEvents = events.map(event => ({
      ...event,
      attendeesCount: event.attendees ? event.attendees.length : 0,
      isFull: event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees,
      isRegistrationOpen: () => {
        if (event.status !== 'upcoming') return false;
        if (event.registrationDeadline && new Date() > event.registrationDeadline) return false;
        if (event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees) return false;
        return true;
      }
    }));

    res.json({
      success: true,
      data: formattedEvents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profile.photo')
      .populate('attendees', 'name email');

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
});

// GET featured events (for homepage/carousel)
router.get('/featured/events', async (req, res) => {
  try {
    const events = await Event.find({
      isActive: true,
      status: 'upcoming',
      date: { $gte: new Date() }
    })
    .sort({ date: 1, createdAt: -1 })
    .limit(6)
    .select('title shortDescription date time location category image isIslamicEvent')
    .populate('organizer', 'name');

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured events'
    });
  }
});

// GET Silte/Islamic events
router.get('/category/islamic', async (req, res) => {
  try {
    const events = await Event.find({
      isActive: true,
      isIslamicEvent: true,
      status: 'upcoming',
      date: { $gte: new Date() }
    })
    .populate('organizer', 'name email profile.photo')
    .sort({ date: 1 })
    .limit(20);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching Islamic events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching Islamic events'
    });
  }
});

// GET events by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      isActive: true,
      category: category,
      date: { $gte: new Date() }
    };

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching category events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category events'
    });
  }
});

// GET event statistics
router.get('/statistics/summary', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ isActive: true });
    const upcomingEvents = await Event.countDocuments({
      isActive: true,
      status: 'upcoming',
      date: { $gte: new Date() }
    });
    const islamicEvents = await Event.countDocuments({
      isActive: true,
      isIslamicEvent: true,
      status: 'upcoming'
    });

    // Events by category
    const eventsByCategory = await Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Events by month for current year
    const currentYear = new Date().getFullYear();
    const eventsByMonth = await Event.aggregate([
      {
        $match: {
          isActive: true,
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        islamicEvents,
        eventsByCategory,
        eventsByMonth
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// GET calendar events for specific month/year
router.get('/calendar/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const events = await Event.find({
      isActive: true,
      date: { $gte: startDate, $lte: endDate }
    })
    .select('title date endDate time location category status isIslamicEvent')
    .sort({ date: 1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar events'
    });
  }
});

// GET events by organizer
router.get('/organizer/:organizerId', async (req, res) => {
  try {
    const { organizerId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organizer ID'
      });
    }

    const events = await Event.find({ 
      organizer: organizerId,
      isActive: true 
    })
      .populate('organizer', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizer events',
      error: error.message
    });
  }
});

// GET upcoming events
router.get('/upcoming/events', async (req, res) => {
  try {
    const events = await Event.find({
      status: 'upcoming',
      date: { $gte: new Date() },
      isActive: true
    })
    .populate('organizer', 'name email')
    .sort({ date: 1 })
    .limit(10);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming events',
      error: error.message
    });
  }
});

// ============================
// PROTECTED ROUTES (Authenticated Users)
// ============================

// POST create new event with image upload
router.post('/', 
  authenticate,
  upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('category').isIn(['cultural', 'educational', 'community', 'sports', 'youth', 'religious'])
      .withMessage('Invalid category'),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        title,
        description,
        date,
        endDate,
        location,
        address,
        type,
        category,
        maxAttendees,
        time,
        isIslamicEvent,
        prayerTiming,
        suitableFor,
        registrationRequired,
        registrationUrl,
        registrationDeadline,
        isVirtual,
        googleMeetingLink
      } = req.body;

      let imageUrl = '';
      let imagePublicId = '';

      // Handle image upload
      if (req.file) {
        try {
          const uploadResult = await uploadEventImage(req.file.buffer, req.file.originalname, req);
          imageUrl = uploadResult.secure_url;
          imagePublicId = uploadResult.public_id;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image'
          });
        }
      } else {
        // Set default image based on category/Islamic status
        const defaultImages = {
          cultural: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?q=80&w=800&auto=format&fit=crop',
          religious: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop',
          educational: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop',
          sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
          community: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=800&auto=format&fit=crop',
          youth: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop'
        };
        
        imageUrl = defaultImages[category] || defaultImages.cultural;
      }

      // Parse suitableFor if it's a string
      let suitableForArray = ['families'];
      if (suitableFor) {
        if (typeof suitableFor === 'string') {
          suitableForArray = suitableFor.split(',').map(item => item.trim());
        } else if (Array.isArray(suitableFor)) {
          suitableForArray = suitableFor;
        }
      }

      const event = new Event({
        title,
        description,
        shortDescription: description.length > 150 
          ? description.substring(0, 147) + '...' 
          : description,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        location,
        address: address || location,
        type: type || 'cultural',
        category: category || 'cultural',
        organizer: req.user.id,
        maxAttendees: maxAttendees || 0,
        image: imageUrl,
        imagePublicId,
        time: time || '10:00 AM',
        isIslamicEvent: isIslamicEvent === 'true' || isIslamicEvent === true,
        prayerTiming,
        suitableFor: suitableForArray,
        registrationRequired: registrationRequired === 'true' || registrationRequired === true,
        registrationUrl,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        isVirtual: isVirtual === 'true' || isVirtual === true,
        googleMeetingLink: googleMeetingLink || undefined,
        status: 'upcoming'
      });

      await event.save();

      const populatedEvent = await Event.findById(event._id)
        .populate('organizer', 'name email profile.photo');

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: populatedEvent
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating event',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// PUT update event with image upload
router.put('/:id', 
  authenticate,
  upload.single('image'),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Check if user is the organizer or admin
      if (event.organizer.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'woreda_admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this event'
        });
      }

      // Handle image update if new image provided
      if (req.file) {
        // Delete old image from Cloudinary or local storage
        if (event.imagePublicId && cloudinaryConfigured) {
          try {
            await cloudinary.uploader.destroy(event.imagePublicId);
          } catch (cloudinaryError) {
            console.warn('Failed to delete old image:', cloudinaryError);
          }
        } else {
          deleteLocalEventImage(event.image);
        }

        // Upload new image
        try {
          const uploadResult = await uploadEventImage(req.file.buffer, req.file.originalname, req);
          req.body.image = uploadResult.secure_url;
          req.body.imagePublicId = uploadResult.public_id;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload new image'
          });
        }
      }

      // Parse suitableFor if it's a string
      if (req.body.suitableFor && typeof req.body.suitableFor === 'string') {
        req.body.suitableFor = req.body.suitableFor.split(',').map(item => item.trim());
      }

      // Update allowed fields
      const updates = {};
      const allowedUpdates = [
        'title', 'description', 'shortDescription', 'date', 'endDate',
        'location', 'address', 'type', 'category', 'maxAttendees',
        'image', 'imagePublicId', 'time', 'isIslamicEvent', 'prayerTiming',
        'suitableFor', 'registrationRequired', 'registrationUrl',
        'registrationDeadline', 'status', 'adminNotes', 'isVirtual', 'googleMeetingLink'
      ];

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      // Special handling for dates
      if (updates.date) updates.date = new Date(updates.date);
      if (updates.endDate) updates.endDate = new Date(updates.endDate);
      if (updates.registrationDeadline) {
        updates.registrationDeadline = new Date(updates.registrationDeadline);
      }

      // Convert boolean strings to booleans
      if (updates.isIslamicEvent !== undefined) {
        updates.isIslamicEvent = updates.isIslamicEvent === 'true' || updates.isIslamicEvent === true;
      }
      if (updates.registrationRequired !== undefined) {
        updates.registrationRequired = updates.registrationRequired === 'true' || updates.registrationRequired === true;
      }
      if (updates.isVirtual !== undefined) {
        updates.isVirtual = updates.isVirtual === 'true' || updates.isVirtual === true;
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).populate('organizer', 'name email profile.photo')
       .populate('attendees', 'name email');

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating event',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// DELETE event (soft delete - set isActive to false)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'woreda_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Soft delete by setting isActive to false
    event.isActive = false;
    event.updatedAt = new Date();
    await event.save();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event'
    });
  }
});

// POST register for event (protected)
router.post('/:id/register', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is still open for registration
    if (event.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Event is not open for registration'
      });
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if user is already registered
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
    }

    // Check if event has max attendees limit
    if (event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event has reached maximum attendees'
      });
    }

    // Add user to attendees
    event.attendees.push(req.user.id);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email')
      .populate('attendees', 'name email');

    // Log activity for event registration
    try {
      await Activity.create({
        user: req.user.id,
        type: 'event_registration',
        description: `Registered for event: ${event.title || event.name || event._id}`,
        metadata: { eventId: event._id, eventTitle: event.title || event.name }
      });
    } catch (actErr) {
      console.warn('Failed to create event registration activity:', actErr.message);
    }

    res.json({
      success: true,
      message: 'Successfully registered for the event',
      data: populatedEvent
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message
    });
  }
});

// DELETE unregister from event (protected)
router.delete('/:id/unregister', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is registered
    if (!event.attendees.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

    // Remove user from attendees
    event.attendees = event.attendees.filter(
      attendeeId => attendeeId.toString() !== req.user.id
    );
    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from the event'
    });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({
      success: false,
      message: 'Error unregistering from event',
      error: error.message
    });
  }
});

// ============================
// ADMIN SPECIFIC ROUTES
// ============================

// GET all events for admin dashboard (including inactive)
router.get('/admin/all', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      isActive = true,
      woreda
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    
    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Filter by woreda if user is woreda_admin
    if (req.user.role === 'woreda_admin' && woreda) {
      // First get all users from this woreda
      const User = mongoose.model('User');
      const woredaUsers = await User.find({ woreda: woreda }).select('_id');
      const userIds = woredaUsers.map(user => user._id);
      query.organizer = { $in: userIds };
    }

    const events = await Event.find(query)
      .populate({
        path: 'organizer',
        select: 'name email woreda role',
        match: req.user.role === 'woreda_admin' ? { woreda: req.user.woreda } : {}
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out events without organizer (for woreda_admin)
    const filteredEvents = req.user.role === 'woreda_admin' 
      ? events.filter(event => event.organizer)
      : events;

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: filteredEvents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin events'
    });
  }
});

// GET admin dashboard statistics
router.get('/admin/dashboard-stats', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const User = mongoose.model('User');
    let query = { isActive: true };
    
    // For woreda_admin, only count events from their woreda
    if (req.user.role === 'woreda_admin') {
      const woredaUsers = await User.find({ woreda: req.user.woreda }).select('_id');
      const userIds = woredaUsers.map(user => user._id);
      query.organizer = { $in: userIds };
    }

    // Total events
    const totalEvents = await Event.countDocuments(query);
    
    // Upcoming events
    const upcomingEvents = await Event.countDocuments({
      ...query,
      status: 'upcoming',
      date: { $gte: new Date() }
    });
    
    // Events by category
    const eventsByCategory = await Event.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Events by status
    const eventsByStatus = await Event.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Recent events (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentEvents = await Event.countDocuments({
      ...query,
      createdAt: { $gte: oneWeekAgo }
    });

    res.json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        eventsByCategory,
        eventsByStatus,
        recentEvents
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// POST admin bulk actions
router.post('/admin/bulk-actions', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { action, eventIds } = req.body;

    if (!action || !eventIds || !Array.isArray(eventIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and eventIds array are required'
      });
    }

    let result;
    switch (action) {
      case 'activate':
        result = await Event.updateMany(
          { _id: { $in: eventIds } },
          { $set: { isActive: true, updatedAt: new Date() } }
        );
        break;
      case 'deactivate':
        result = await Event.updateMany(
          { _id: { $in: eventIds } },
          { $set: { isActive: false, updatedAt: new Date() } }
        );
        break;
      case 'delete':
        // Hard delete - remove images from Cloudinary first
        const events = await Event.find({ _id: { $in: eventIds } });
        for (const event of events) {
          if (event.imagePublicId) {
            try {
              await cloudinary.uploader.destroy(event.imagePublicId);
            } catch (cloudinaryError) {
              console.warn('Failed to delete image:', cloudinaryError);
            }
          }
        }
        result = await Event.deleteMany({ _id: { $in: eventIds } });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    res.json({
      success: true,
      message: `Successfully performed ${action} on ${result.modifiedCount || result.deletedCount} events`
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk action'
    });
  }
});

// GET events count by month for chart
router.get('/admin/events-by-month', authenticate, authorize('super_admin', 'woreda_admin'), async (req, res) => {
  try {
    const User = mongoose.model('User');
    let matchQuery = { isActive: true };
    
    // For woreda_admin, only count events from their woreda
    if (req.user.role === 'woreda_admin') {
      const woredaUsers = await User.find({ woreda: req.user.woreda }).select('_id');
      const userIds = woredaUsers.map(user => user._id);
      matchQuery.organizer = { $in: userIds };
    }

    const eventsByMonth = await Event.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 },
          categories: {
            $push: '$category'
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format for chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = monthNames.map((month, index) => {
      const monthData = eventsByMonth.find(item => item._id === index + 1);
      return {
        month,
        count: monthData ? monthData.count : 0
      };
    });

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching events by month:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events by month'
    });
  }
});

export default router;