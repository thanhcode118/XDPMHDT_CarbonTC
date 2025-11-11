import apiClientTH from './apiClientTH';

/**
 * Service for managing Verification Requests
 * All endpoints are from CarbonTC.CarbonLifecycle.Service
 */

/**
 * Get all journey batches for the current user (EV Owner)
 * GET /api/JourneyBatches/mybatches
 */
export const getMyBatches = async () => {
  try {
    const response = await apiClientTH.get('/JourneyBatches/mybatches');
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Batches retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error;
  }
};

/**
 * Submit a batch for verification (EV Owner)
 * POST /api/VerificationRequests/submit
 * @param {string} journeyBatchId - The journey batch ID to submit (Guid as string)
 */
export const submitVerificationRequest = async (journeyBatchId) => {
  try {
    // Backend expects { JourneyBatchId: Guid }
    const response = await apiClientTH.post('/VerificationRequests/submit', {
      journeyBatchId: journeyBatchId
    });
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Verification request submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting verification request:', error);
    throw error;
  }
};

/**
 * Get pending verification requests for CVA (with pagination)
 * GET /api/VerificationRequests/pending?PageNumber=1&PageSize=10
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 10)
 */
export const getPendingRequests = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await apiClientTH.get('/VerificationRequests/pending', {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize
      }
    });
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pending requests retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw error;
  }
};

/**
 * Get verification request details by ID (CVA)
 * GET /api/VerificationRequests/{id}
 * @param {string} id - The verification request ID
 */
export const getVerificationRequestById = async (id) => {
  try {
    const response = await apiClientTH.get(`/VerificationRequests/${id}`);
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Verification request retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching verification request:', error);
    throw error;
  }
};

/**
 * Get all CVA standards
 * GET /api/cva-standards?isActive=true
 * @param {boolean} isActive - Filter by active status (optional)
 */
export const getCvaStandards = async (isActive = true) => {
  try {
    const response = await apiClientTH.get('/cva-standards', {
      params: {
        isActive: isActive
      }
    });
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'CVA standards retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching CVA standards:', error);
    throw error;
  }
};

/**
 * Get verification requests by status (with pagination)
 * GET /api/VerificationRequests/by-status?status=1&PageNumber=1&PageSize=10
 * @param {number} status - Status (0=Pending, 1=Approved, 2=Rejected, 3=InProgress)
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 10)
 */
export const getRequestsByStatus = async (status, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await apiClientTH.get('/VerificationRequests/by-status', {
      params: {
        status: status,
        PageNumber: pageNumber,
        PageSize: pageSize
      }
    });
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Verification requests retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching verification requests by status:', error);
    throw error;
  }
};

/**
 * Review (approve/reject) a verification request (CVA)
 * POST /api/VerificationRequests/review
 * @param {Object} reviewData - Review data containing:
 *   - verificationRequestId: Guid (required)
 *   - isApproved: boolean (required)
 *   - auditSummary: string (required, 10-500 chars)
 *   - isAuditSatisfactory: boolean (required)
 *   - auditIssues: string[] (optional)
 *   - notes: string (optional, max 1000 chars)
 *   - reasonForRejection: string (optional, max 1000 chars, required if isApproved = false)
 *   - cvaStandardId: Guid (optional, required if isApproved = true)
 */
export const reviewVerificationRequest = async (reviewData) => {
  try {
    // Build the request payload according to VerificationRequestReviewDto
    const payload = {
      verificationRequestId: reviewData.verificationRequestId,
      isApproved: reviewData.isApproved,
      auditSummary: reviewData.auditSummary || '',
      isAuditSatisfactory: reviewData.isAuditSatisfactory !== undefined ? reviewData.isAuditSatisfactory : true,
      auditIssues: reviewData.auditIssues || null,
      notes: reviewData.notes || null,
      reasonForRejection: reviewData.reasonForRejection || null,
      cvaStandardId: reviewData.cvaStandardId || null
    };

    const response = await apiClientTH.post('/VerificationRequests/review', payload);
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Verification request reviewed successfully'
    };
  } catch (error) {
    console.error('Error reviewing verification request:', error);
    throw error;
  }
};

