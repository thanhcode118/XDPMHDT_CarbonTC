import apiClientTH from './apiClientTH';

/**
 * Service for managing EV Journeys (Trips)
 * All endpoints are from CarbonTC.CarbonLifecycle.Service
 */

/**
 * Get all journeys for the current user
 * GET /api/EvJourneys/my-journeys
 */
export const getMyJourneys = async () => {
  try {
    const response = await apiClientTH.get('/EvJourneys/my-journeys');
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Journeys retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching journeys:', error);
    // Trả về error với message rõ ràng hơn
    return {
      success: false,
      data: null,
      message: error.userMessage || error.message || 'Không thể tải danh sách hành trình'
    };
  }
};

/**
 * Upload a single journey via JSON
 * POST /api/EvJourneys/upload
 * @param {Object} journeyData - The journey data to upload
 */
export const uploadJourney = async (journeyData) => {
  try {
    const response = await apiClientTH.post('/EvJourneys/upload', journeyData);
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Journey uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading journey:', error);
    throw error;
  }
};

/**
 * Upload multiple journeys via CSV/JSON file
 * POST /api/EvJourneys/upload-file
 * @param {File} file - The CSV or JSON file to upload
 */
export const uploadJourneyFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClientTH.post('/EvJourneys/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'File uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Create a batch from multiple journey IDs
 * POST /api/EvJourneys/batch
 * @param {Array<string>} journeyIds - Array of journey IDs to include in the batch
 * @param {string} name - Optional name for the batch (defaults to auto-generated name)
 */
export const createBatch = async (journeyIds, name = null) => {
  try {
    // Generate default name if not provided
    const batchName = name || `Batch ${new Date().toLocaleString('vi-VN')}`;
    
    // Validate journeyIds
    if (!journeyIds || !Array.isArray(journeyIds) || journeyIds.length === 0) {
      throw new Error('Journey IDs must be a non-empty array');
    }
    
    const requestBody = {
      name: batchName,
      journeyIds: journeyIds
    };
    
    console.log('Creating batch with data:', requestBody);
    
    const response = await apiClientTH.post('/EvJourneys/batch', requestBody);
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Batch created successfully'
    };
  } catch (error) {
    console.error('Error creating batch:', error);
    // Log more details about the error
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get journey details by ID
 * GET /api/EvJourneys/journey/{journeyId}
 * @param {string} journeyId - The journey ID
 */
export const getJourneyById = async (journeyId) => {
  try {
    const response = await apiClientTH.get(`/EvJourneys/journey/${journeyId}`);
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Journey retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching journey:', error);
    throw error;
  }
};

