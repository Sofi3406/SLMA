import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js'; 
import { protect as authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// GET all events with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      status,
      organizer,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'date',
      order = 'asc'
    } = req.query;

    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (organizer && mongoose.Types.ObjectId.isValid(organizer)) {
      query.organizer = organizer;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute query
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .populate('attendees', 'name email')
      .sort(sortOptions)
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
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
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

// POST create new event (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      type,
      maxAttendees,
      image,
      registrationDeadline
    } = req.body;

    // Validate required fields
    if (!title || !description || !date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date, and location are required'
      });
    }

    const event = new Event({
      title,
      description,
      date: new Date(date),
      location,
      type: type || 'cultural',
      organizer: req.user.id, // Assuming user ID from auth middleware
      maxAttendees: maxAttendees || 0,
      image,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      status: 'upcoming'
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email');

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
      error: error.message
    });
  }
});

// PUT update event (protected - organizer only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Update allowed fields
    const updates = {};
    const allowedUpdates = [
      'title', 'description', 'date', 'location', 'type',
      'maxAttendees', 'image', 'registrationDeadline', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Special handling for dates
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.registrationDeadline) {
      updates.registrationDeadline = new Date(updates.registrationDeadline);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email')
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
      error: error.message
    });
  }
});

// DELETE event (protected - organizer or admin)
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
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
});

// POST register for event (protected)
router.post('/:id/register', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
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

    if (!event) {
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

    const events = await Event.find({ organizer: organizerId })
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
      date: { $gte: new Date() }
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

export default router;