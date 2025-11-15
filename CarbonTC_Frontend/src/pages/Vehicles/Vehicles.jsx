import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import VehicleCard from '../../components/VehicleCard/VehicleCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import { getMyVehicles, getVehicleById } from '../../services/vehicleService';
import styles from './Vehicles.module.css';

// Helper function to get vehicle image based on vehicle type
const getVehicleImage = (vehicleType) => {
  if (!vehicleType) return 'https://images.unsplash.com/photo-1593941707882-a5bac6861d6c?w=600&h=400&fit=crop&auto=format';
  
  // Normalize vehicle type for image search
  const normalizedType = vehicleType.toLowerCase();
  
  // Map specific vehicle types to their images
  const imageMap = {
    // Vinfast
    'vinfast-vfe34': 'https://photo2.tinhte.vn/data/attachment-files/2021/03/5405185_vinfast_VF_e34_tinhte2.jpg',
    'vinfast': 'https://photo2.tinhte.vn/data/attachment-files/2021/03/5405185_vinfast_VF_e34_tinhte2.jpg',
    'vfe34': 'https://photo2.tinhte.vn/data/attachment-files/2021/03/5405185_vinfast_VF_e34_tinhte2.jpg',
    'vfe': 'https://photo2.tinhte.vn/data/attachment-files/2021/03/5405185_vinfast_VF_e34_tinhte2.jpg',
    
    // Hyundai
    'hyundai-kona': 'https://s1.cdn.autoevolution.com/images-webp/news/us-spec-hyundai-kona-n-hot-suv-shows-its-aggressive-face-for-the-first-time-157422-7.jpg.webp',
    'hyundai': 'https://s1.cdn.autoevolution.com/images-webp/news/us-spec-hyundai-kona-n-hot-suv-shows-its-aggressive-face-for-the-first-time-157422-7.jpg.webp',
    'kona': 'https://s1.cdn.autoevolution.com/images-webp/news/us-spec-hyundai-kona-n-hot-suv-shows-its-aggressive-face-for-the-first-time-157422-7.jpg.webp',
    
    // Mercedes
    'mercedes-eqc': 'https://cdn.motor1.com/images/mgl/LKoQM/s3/mercedes-eqc-konkurrenten.webp',
    'mercedes': 'https://cdn.motor1.com/images/mgl/LKoQM/s3/mercedes-eqc-konkurrenten.webp',
    'eqc': 'https://cdn.motor1.com/images/mgl/LKoQM/s3/mercedes-eqc-konkurrenten.webp',
    
    // Kia
    'kia-ev6': 'https://www.dsf.my/wp-content/uploads/2022/08/Kia-EV6-GT-4-600x451.jpeg?v=1661320855',
    'kia': 'https://www.dsf.my/wp-content/uploads/2022/08/Kia-EV6-GT-4-600x451.jpeg?v=1661320855',
    'ev6': 'https://www.dsf.my/wp-content/uploads/2022/08/Kia-EV6-GT-4-600x451.jpeg?v=1661320855',
    
    // Tesla
    'tesla-modely': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop&auto=format',
    'tesla-model3': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop&auto=format',
    'tesla-models': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop&auto=format',
    'tesla': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop&auto=format',
    'model': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop&auto=format',
    
    // Porsche
    'porsche-taycan': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop&auto=format',
    'porsche': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop&auto=format',
    'taycan': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop&auto=format',
    
    // BMW
    'bmw-ix': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop&auto=format',
    'bmw': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop&auto=format',
    'ix': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop&auto=format',
    
    // Audi
    'audi-etron': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop&auto=format',
    'audi': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop&auto=format',
    'etron': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop&auto=format',
    
    // Nissan
    'nissan-leaf': 'https://www.dutchmillernissanofwytheville.com/static/dealer-22686/2024-nissan-leaf-cruising.png',
    'nissan': 'https://www.dutchmillernissanofwytheville.com/static/dealer-22686/2024-nissan-leaf-cruising.png',
    'leaf': 'https://www.dutchmillernissanofwytheville.com/static/dealer-22686/2024-nissan-leaf-cruising.png',
    
    // BYD
    'byd-atto3': 'https://cdn.motor1.com/images/mgl/7ZLbZV/s3/byd-atto-3-austrlia.webp',
    'byd-atto': 'https://cdn.motor1.com/images/mgl/7ZLbZV/s3/byd-atto-3-austrlia.webp',
    'byd': 'https://cdn.motor1.com/images/mgl/7ZLbZV/s3/byd-atto-3-austrlia.webp',
    'atto3': 'https://cdn.motor1.com/images/mgl/7ZLbZV/s3/byd-atto-3-austrlia.webp',
    'atto': 'https://cdn.motor1.com/images/mgl/7ZLbZV/s3/byd-atto-3-austrlia.webp',
  };
  
  // First check for exact match (case-insensitive)
  const exactMatch = Object.keys(imageMap).find(key => 
    normalizedType === key.toLowerCase()
  );
  if (exactMatch) {
    return imageMap[exactMatch];
  }
  
  // Then check if vehicle type contains any mapped keyword
  for (const [key, url] of Object.entries(imageMap)) {
    if (normalizedType.includes(key.toLowerCase())) {
      return url;
    }
  }
  
  // Default: Fallback to a generic EV image
  return 'https://images.unsplash.com/photo-1593941707882-a5bac6861d6c?w=600&h=400&fit=crop&auto=format&q=80';
};

const Vehicles = ({ showNotification: propShowNotification }) => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification: hookShowNotification } = useNotification();
  const showNotification = propShowNotification || hookShowNotification;
  
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const result = await getMyVehicles();
      if (result.success && result.data) {
        const vehiclesData = Array.isArray(result.data) ? result.data : [];
        // Transform API data to match VehicleCard component expectations
        // API returns: vehicleType, totalJourneys, totalDistanceKm, totalCarbonCredits, firstJourneyDate, lastJourneyDate
        const transformedVehicles = vehiclesData.map((vehicle, index) => {
          // Use vehicleType as the unique identifier and name
          const vehicleType = vehicle.vehicleType || `Vehicle ${index + 1}`;
          // Get appropriate image based on vehicle type
          const imageUrl = vehicle.image || getVehicleImage(vehicleType);
          
          return {
            id: vehicleType, // Use vehicleType as ID since API doesn't provide separate ID
            vehicleId: vehicleType,
            name: vehicleType, // Display vehicleType as the name
            image: imageUrl,
            mileage: vehicle.totalDistanceKm || 0, // Map from API field
            credits: vehicle.totalCarbonCredits || 0, // Map from API field
            co2Reduced: vehicle.totalCo2Reduced || vehicle.totalCarbonCredits || 0, // Use credits as CO2 reduced if not available
            trips: vehicle.totalJourneys || 0, // Map from API field
            // Include all original data for details view
            ...vehicle
          };
        });
        setVehicles(transformedVehicles);
      } else {
        // Hiển thị thông báo lỗi nếu có
        const errorMessage = result.message || 'Không thể tải danh sách phương tiện';
        showNotification(errorMessage, 'error');
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      const errorMessage = error.userMessage || error.message || 'Không thể tải danh sách phương tiện';
      showNotification(errorMessage, 'error');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (vehicleId) => {
    try {
      // Since API doesn't have a get-by-id endpoint, find from current vehicles list
      const vehicle = vehicles.find(v => 
        v.id === vehicleId || 
        v.vehicleId === vehicleId || 
        v.vehicleType === vehicleId
      );
      
      if (vehicle) {
        setSelectedVehicle(vehicle);
        setShowDetails(true);
      } else {
        // Fallback: try API call
        const result = await getVehicleById(vehicleId);
        if (result.success && result.data) {
          setSelectedVehicle(result.data);
          setShowDetails(true);
        } else {
          showNotification('Không thể tải thông tin chi tiết xe', 'error');
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      showNotification('Không thể tải thông tin chi tiết xe', 'error');
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedVehicle(null);
  };


  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.mainContent}>
          <div className={styles.loadingState}>
            <i className="bi bi-arrow-repeat"></i>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <button className={styles.mobileToggle} onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>
      
      <Sidebar 
        activePage="vehicles" 
        onPageChange={() => {}} 
        className={sidebarActive ? "activemenu" : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Xe điện của tôi" />
        
        {/* Vehicles List */}
        {vehicles.length > 0 ? (
          <div className={styles.vehiclesGrid}>
            {vehicles.map((vehicle, index) => {
              // Use vehicleType as unique key (it's the identifier from API)
              const vehicleId = vehicle.id || vehicle.vehicleId || vehicle.vehicleType || `vehicle-${index}`;
              const uniqueKey = `vehicle-${vehicleId}-${index}`;
              return (
                <div key={uniqueKey} data-aos="fade-up" data-aos-delay={(index + 1) * 100}>
                  <VehicleCard
                    vehicle={vehicle}
                    onViewDetails={() => handleViewDetails(vehicle.id || vehicle.vehicleId || vehicle.vehicleType)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="bi-ev-station"
            title="Chưa có xe điện nào"
            description="Bạn chưa có xe điện nào trong hệ thống. Hãy thêm xe điện để bắt đầu theo dõi hành trình và kiếm tín chỉ carbon."
          />
        )}
      </div>
      
      {/* Vehicle Details Modal */}
      {showDetails && selectedVehicle && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={handleCloseDetails}
        >
          <div 
            style={{
              background: 'rgba(15, 15, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  margin: 0, 
                  color: 'var(--text-primary)', 
                  fontSize: '2rem',
                  fontWeight: '700',
                  marginBottom: '5px',
                  background: 'var(--primary-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {selectedVehicle.vehicleType || selectedVehicle.vehicleName || selectedVehicle.name || 'N/A'}
                </h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chi tiết xe</p>
              </div>
              <button 
                onClick={handleCloseDetails}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            {/* Vehicle Image */}
            {selectedVehicle.image && (
              <div style={{ 
                width: '100%', 
                height: '250px', 
                borderRadius: '12px', 
                overflow: 'hidden',
                marginBottom: '25px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <img 
                  src={selectedVehicle.image} 
                  alt={selectedVehicle.vehicleType || selectedVehicle.vehicleName || selectedVehicle.name || 'Vehicle'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                />
              </div>
            )}
            
            <div style={{ display: 'grid', gap: '15px' }}>
              
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Tổng quãng đường:</strong>
                <p style={{ margin: '5px 0', color: 'var(--text-primary)' }}>
                  {(selectedVehicle.totalDistanceKm || selectedVehicle.totalMileage || selectedVehicle.mileage || 0).toLocaleString('vi-VN')} km
                </p>
              </div>
              
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Tổng tín chỉ:</strong>
                <p style={{ margin: '5px 0', color: 'var(--text-primary)' }}>
                  {(selectedVehicle.totalCarbonCredits || selectedVehicle.totalCredits || selectedVehicle.credits || 0).toLocaleString('vi-VN')}
                </p>
              </div>
              
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>CO₂ giảm phát thải:</strong>
                <p style={{ margin: '5px 0', color: 'var(--text-primary)' }}>
                  {(selectedVehicle.totalCo2Reduced || selectedVehicle.co2Reduced || selectedVehicle.totalCarbonCredits || 0).toLocaleString('vi-VN')} kg
                </p>
              </div>
              
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Tổng số hành trình:</strong>
                <p style={{ margin: '5px 0', color: 'var(--text-primary)' }}>
                  {selectedVehicle.totalJourneys || selectedVehicle.trips || 0}
                </p>
              </div>
              
              {selectedVehicle.firstJourneyDate && (
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Hành trình đầu tiên:</strong>
                  <p style={{ margin: '5px 0', color: 'var(--text-primary)' }}>
                    {new Date(selectedVehicle.firstJourneyDate).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
              
              {selectedVehicle.lastJourneyDate && (
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Hành trình cuối cùng:</strong>
                  <p style={{ margin: '5px 0', color: 'var(--text-primary)' }}>
                    {new Date(selectedVehicle.lastJourneyDate).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                onClick={handleCloseDetails}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
