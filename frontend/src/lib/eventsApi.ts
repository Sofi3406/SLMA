// lib/eventsApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  events?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  date: string;
  endDate?: string;
  location: string;
  address?: string;
  type: 'cultural' | 'networking' | 'educational' | 'social' | 'religious';
  category: 'cultural' | 'educational' | 'community' | 'sports' | 'youth' | 'religious';
  organizer: {
    _id: string;
    name: string;
    email: string;
    woreda?: string;
    role?: string;
    profile?: {
      photo?: string;
    };
  };
  attendees: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  maxAttendees: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image: string;
  imagePublicId?: string;
  time?: string;
  isIslamicEvent?: boolean;
  prayerTiming?: string;
  suitableFor?: string[];
  registrationRequired?: boolean;
  registrationUrl?: string;
  isVirtual?: boolean;
  googleMeetingLink?: string;
  registrationDeadline?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  attendeesCount?: number;
}

interface EventFilters {
  category?: string;
  type?: string;
  status?: string;
  isIslamicEvent?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  upcomingOnly?: boolean;
}

// Get all events with filters
export async function getEvents(filters: EventFilters = {}): Promise<ApiResponse<Event[]>> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  const url = `${API_BASE_URL}/events${params.toString() ? `?${params.toString()}` : ''}`;
  
  try {
    const response = await fetch(url, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      success: false,
      message: 'Failed to fetch events',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get event by ID
export async function getEventById(id: string): Promise<ApiResponse<Event>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch event',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get featured events
export async function getFeaturedEvents(): Promise<ApiResponse<Event[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/featured/events`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch featured events',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get Islamic events
export async function getIslamicEvents(): Promise<ApiResponse<Event[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/category/islamic`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch Islamic events',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Create new event (with image upload)
export async function createEvent(
  eventData: FormData, 
  token: string
): Promise<ApiResponse<Event>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: eventData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create event');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create event',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Update event
export async function updateEvent(
  id: string, 
  eventData: FormData, 
  token: string
): Promise<ApiResponse<Event>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: eventData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update event');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update event',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Delete event
export async function deleteEvent(
  id: string, 
  token: string
): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete event');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to delete event',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Register for event
export async function registerForEvent(
  eventId: string, 
  token: string
): Promise<ApiResponse<Event>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register for event');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to register for event',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Unregister from event
export async function unregisterFromEvent(
  eventId: string, 
  token: string
): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/unregister`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unregister from event');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to unregister from event',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get event statistics
export async function getEventStatistics(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/statistics/summary`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get calendar events
export async function getCalendarEvents(year: number, month: number): Promise<ApiResponse<Event[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/calendar/${year}/${month}`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch calendar events',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}