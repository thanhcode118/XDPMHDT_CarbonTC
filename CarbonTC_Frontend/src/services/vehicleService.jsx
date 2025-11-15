import apiClientTH from './apiClientTH';

/**
 * Service for managing Vehicles
 * All endpoints are from CarbonTC.CarbonLifecycle.Service
 */

/**
 * Get all vehicles for the current user with statistics
 * GET /api/EvJourneys/my-vehicles
 */
export const getMyVehicles = async () => {
  try {
    const response = await apiClientTH.get('/EvJourneys/my-vehicles');
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Vehicles retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    // Trả về error với message rõ ràng hơn
    return {
      success: false,
      data: null,
      message: error.userMessage || error.message || 'Không thể tải danh sách phương tiện'
    };
  }
};

/**
 * Get vehicle details by ID
 * Note: This endpoint might need to be implemented in the backend
 * For now, we'll use the vehicles from my-vehicles endpoint
 * @param {string} vehicleId - The vehicle ID
 */
export const getVehicleById = async (vehicleId) => {
  try {
    // If backend has a specific endpoint, use it
    // Otherwise, filter from my-vehicles
    const response = await apiClientTH.get('/EvJourneys/my-vehicles');
    const vehicles = response.data.data || response.data;
    const vehicle = Array.isArray(vehicles) 
      ? vehicles.find(v => v.id === vehicleId || v.vehicleId === vehicleId)
      : null;
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    return {
      success: true,
      data: vehicle,
      message: 'Vehicle retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw error;
  }
};

