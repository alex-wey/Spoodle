/**
 * Cal.com API Integration Utility
 * Documentation: https://cal.com/docs/api-reference
 */

const CALCOM_API_BASE_URL = 'https://api.cal.com';
const CALCOM_API_KEY = process.env.CALCOM_API_KEY;

if (!CALCOM_API_KEY) {
  console.warn('⚠️ CALCOM_API_KEY not set in environment variables');
}

interface CalcomRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  params?: Record<string, string | number | boolean>;
}

/**
 * Make authenticated request to Cal.com API
 */
async function calcomRequest<T>(
  endpoint: string,
  options: CalcomRequestOptions = {}
): Promise<T> {
  if (!CALCOM_API_KEY) {
    throw new Error('CALCOM_API_KEY is not configured');
  }

  const { method = 'GET', body, params } = options;
  const url = new URL(`${CALCOM_API_BASE_URL}${endpoint}`);

  // Add query parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${CALCOM_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cal.com API error (${response.status}): ${errorText || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get current user's information
 */
export async function getCurrentUser() {
  return calcomRequest('/v2/me');
}

/**
 * Get list of event types
 */
export async function getEventTypes(params?: {
  userId?: number;
  teamId?: number;
  page?: number;
  perPage?: number;
}) {
  return calcomRequest('/v2/event-types', { params: params || {} });
}

/**
 * Get a specific event type by ID
 */
export async function getEventType(eventTypeId: number) {
  return calcomRequest(`/v2/event-types/${eventTypeId}`);
}

/**
 * Update an event type
 */
export async function updateEventType(
  eventTypeId: number,
  data: {
    title?: string;
    slug?: string;
    length?: number;
    description?: string;
    hidden?: boolean;
    bookingFields?: Array<{
      type: string;
      label: string;
      identifier: string;
      required?: boolean;
      hidden?: boolean;
      placeholder?: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  }
) {
  return calcomRequest(`/v2/event-types/${eventTypeId}`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * Add hidden fields to an event type for storing metadata
 * This adds petId, petOwnerId, clinicId, and staffId as hidden fields
 * that will be included in booking metadata
 */
export async function addHiddenFieldsToEventType(eventTypeId: number) {
  try {
    // Get current event type configuration
    const eventTypeResponse = await getEventType(eventTypeId) as any;
    
    // Extract event type from nested response structure
    const eventType = eventTypeResponse?.data?.eventType || 
                      eventTypeResponse?.data || 
                      eventTypeResponse?.eventType || 
                      eventTypeResponse;
    
    // Define the hidden fields we need
    // Note: Cal.com API requires 'name' property (not just identifier)
    const requiredHiddenFields = [
      {
        name: 'petId',
        type: 'text',
        label: 'Pet ID',
        identifier: 'petId',
        required: false,
        hidden: true,
        editable: 'system-but-optional',
        sources: [{ id: 'default', type: 'default', label: 'Default' }],
      },
      {
        name: 'petOwnerId',
        type: 'text',
        label: 'Pet Owner ID',
        identifier: 'petOwnerId',
        required: false,
        hidden: true,
        editable: 'system-but-optional',
        sources: [{ id: 'default', type: 'default', label: 'Default' }],
      },
      {
        name: 'clinicId',
        type: 'text',
        label: 'Clinic ID',
        identifier: 'clinicId',
        required: false,
        hidden: true,
        editable: 'system-but-optional',
        sources: [{ id: 'default', type: 'default', label: 'Default' }],
      },
      {
        name: 'staffId',
        type: 'text',
        label: 'Staff ID',
        identifier: 'staffId',
        required: false,
        hidden: true,
        editable: 'system-but-optional',
        sources: [{ id: 'default', type: 'default', label: 'Default' }],
      },
    ];

    // Get existing bookingFields or initialize empty array
    // Deep clone to preserve all nested structures (like optionsInputs)
    const existingBookingFields = JSON.parse(JSON.stringify(eventType?.bookingFields || []));
    
    // Normalize existing fields to ensure they match Cal.com API requirements
    // Fix optionsInputs: Cal.com API validation requires it to be an array or omitted
    const normalizedExistingFields = existingBookingFields.map((field: any) => {
      const normalizedField = { ...field };
      
      // Handle optionsInputs field - Cal.com API validation is strict
      // If field has getOptionsAt, optionsInputs might be redundant or need special handling
      if (normalizedField.optionsInputs !== undefined) {
        const optionsInputs = normalizedField.optionsInputs;
        
        // If it's an empty object {}, remove it (API validation fails with "must be an array")
        if (typeof optionsInputs === 'object' && 
            !Array.isArray(optionsInputs) && 
            Object.keys(optionsInputs).length === 0) {
          delete normalizedField.optionsInputs;
        }
        // If field has getOptionsAt, we might be able to safely omit optionsInputs
        // since options come from that source instead
        else if (normalizedField.getOptionsAt && typeof optionsInputs === 'object' && !Array.isArray(optionsInputs)) {
          // For fields with getOptionsAt, optionsInputs might not be needed in update
          delete normalizedField.optionsInputs;
        }
      }
      
      return normalizedField;
    });
    
    // Check which fields already exist (by name or identifier)
    const existingIdentifiers = new Set(
      normalizedExistingFields.map((field: any) => field.name || field.identifier || field.slug)
    );
    
    // Add only fields that don't already exist
    const fieldsToAdd = requiredHiddenFields.filter(
      (field) => !existingIdentifiers.has(field.name) && !existingIdentifiers.has(field.identifier)
    );
    
    if (fieldsToAdd.length === 0) {
      return {
        success: true,
        message: 'All required hidden fields already exist',
        eventType,
      };
    }
    
    // Merge existing fields with new hidden fields
    // Use normalized fields to avoid API validation errors
    const updatedBookingFields = [...normalizedExistingFields, ...fieldsToAdd];
    
    // Update the event type
    const updatedEventType = await updateEventType(eventTypeId, {
      bookingFields: updatedBookingFields,
    });
    
    return {
      success: true,
      message: `Added ${fieldsToAdd.length} hidden field(s) to event type`,
      addedFields: fieldsToAdd.map((f) => f.identifier),
      eventType: updatedEventType,
    };
  } catch (error: any) {
    throw new Error(
      `Failed to add hidden fields to event type ${eventTypeId}: ${error.message}`
    );
  }
}

/**
 * Get list of bookings
 */
export async function getBookings(params?: {
  userId?: number;
  teamId?: number;
  eventTypeId?: number;
  status?: 'upcoming' | 'recurring' | 'past' | 'cancelled' | 'unconfirmed';
  page?: number;
  perPage?: number;
}) {
  return calcomRequest('/v2/bookings', { params: params || {} });
}

/**
 * Get a specific booking by ID
 */
export async function getBooking(bookingId: number) {
  return calcomRequest(`/v2/bookings/${bookingId}`);
}

/**
 * Create a booking
 */
export async function createBooking(data: {
  eventTypeId: number;
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  responses: {
    name: string;
    email: string;
    notes?: string;
    [key: string]: any; // Additional custom fields
  };
  timeZone?: string;
  language?: string;
  metadata?: Record<string, any>;
}) {
  return calcomRequest('/v2/bookings', {
    method: 'POST',
    body: data,
  });
}

/**
 * Update a booking
 */
export async function updateBooking(
  bookingId: number,
  data: {
    start?: string;
    end?: string;
    status?: 'accepted' | 'rejected' | 'cancelled';
    notes?: string;
    [key: string]: any;
  }
) {
  return calcomRequest(`/v2/bookings/${bookingId}`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: number, reason?: string) {
  return calcomRequest(`/v2/bookings/${bookingId}`, {
    method: 'DELETE',
    body: reason ? { cancellationReason: reason } : undefined,
  });
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(
  bookingId: number,
  data: {
    start: string; // ISO 8601 datetime
    end: string; // ISO 8601 datetime
    rescheduleReason?: string;
  }
) {
  return calcomRequest(`/v2/bookings/${bookingId}/reschedule`, {
    method: 'POST',
    body: data,
  });
}

/**
 * Get availability/slots for an event type
 */
export async function getAvailability(params: {
  eventTypeId: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  timeZone?: string;
}) {
  return calcomRequest('/v2/slots/available', { params });
}

/**
 * Extract booking ID from Cal.com response
 */
export function extractBookingId(resource: any): number | null {
  if (typeof resource === 'number') return resource;
  if (resource?.id) return resource.id;
  if (resource?.booking?.id) return resource.booking.id;
  if (resource?.data?.id) return resource.data.id;
  return null;
}
