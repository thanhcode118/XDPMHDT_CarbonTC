import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import VehicleCard from '../../components/VehicleCard/VehicleCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import AddVehicleModal from '../../components/AddVehicleModal/AddVehicleModal';
import { useSidebar } from '../../hooks/useSidebar';
import styles from './Vehicles.module.css';

const Vehicles = ({ showNotification }) => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const [vehicles, setVehicles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sample data - in real app, this would come from API
  const sampleVehicles = [
    {
      id: 1,
      name: 'VinFast VF 8',
      image: 'https://picsum.photos/seed/vinfast/600/400.jpg',
      status: 'statusConnected',
      color: 'Xám bạc',
      year: '2022',
      mileage: 15000,
      credits: 125,
      co2Reduced: 312,
      trips: 42,
      isConnected: true
    },
    {
      id: 2,
      name: 'Tesla Model 3',
      image: 'https://picsum.photos/seed/tesla/600/400.jpg',
      status: 'statusConnected',
      color: 'Đỏ',
      year: '2021',
      mileage: 25000,
      credits: 85,
      co2Reduced: 210,
      trips: 28,
      isConnected: true
    },
    {
      id: 3,
      name: 'Hyundai Ioniq 5',
      image: 'https://picsum.photos/seed/hyundai/600/400.jpg',
      status: 'statusDisconnected',
      color: 'Xanh dương',
      year: '2023',
      mileage: 5000,
      credits: 0,
      co2Reduced: 0,
      trips: 0,
      isConnected: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVehicles(sampleVehicles);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddVehicle = (vehicleData) => {
    const newVehicle = {
      id: vehicles.length + 1,
      name: `${vehicleData.brand} ${vehicleData.model}`,
      image: vehicleData.image ? URL.createObjectURL(vehicleData.image) : 'https://picsum.photos/seed/newcar/600/400.jpg',
      status: 'statusConnected',
      color: vehicleData.color,
      year: vehicleData.year,
      mileage: parseInt(vehicleData.mileage),
      credits: 0,
      co2Reduced: 0,
      trips: 0,
      isConnected: true
    };

    setVehicles(prev => [...prev, newVehicle]);
    showNotification('Thêm xe điện thành công!', 'success');
  };

  const handleViewDetails = (vehicleId) => {
    // Navigate to vehicle details page
    console.log('View details for vehicle:', vehicleId);
    showNotification('Chuyển đến trang chi tiết xe', 'info');
  };

  const handleSync = (vehicleId) => {
    // Sync vehicle data
    console.log('Sync vehicle:', vehicleId);
    showNotification('Đang đồng bộ dữ liệu xe...', 'info');
    
    // Simulate sync
    setTimeout(() => {
      showNotification('Đồng bộ dữ liệu thành công!', 'success');
    }, 2000);
  };

  const handleConnect = (vehicleId) => {
    // Connect vehicle
    console.log('Connect vehicle:', vehicleId);
    setVehicles(prev => 
      prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, isConnected: true, status: 'statusConnected' }
          : vehicle
      )
    );
    showNotification('Kết nối xe thành công!', 'success');
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
        
        {/* Add Vehicle Button */}
        <div className={styles.addButtonContainer} data-aos="fade-up">
          <button 
            className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>Thêm xe điện
          </button>
        </div>
        
        {/* Vehicles List */}
        {vehicles.length > 0 ? (
          <div className="row">
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="col-lg-6" data-aos="fade-up" data-aos-delay={(index + 1) * 100}>
                <VehicleCard
                  vehicle={vehicle}
                  onViewDetails={() => handleViewDetails(vehicle.id)}
                  onSync={() => handleSync(vehicle.id)}
                  onConnect={() => handleConnect(vehicle.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bi-ev-station"
            title="Chưa có xe điện nào"
            description="Bạn chưa thêm xe điện nào vào tài khoản của mình. Hãy thêm xe điện đầu tiên để bắt đầu kiếm tín chỉ carbon từ các chuyến đi của bạn."
            actionText="Thêm xe điện"
            onAction={() => setShowAddModal(true)}
          />
        )}
      </div>
      
      {/* Add Vehicle Modal */}
      <AddVehicleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddVehicle}
      />
    </div>
  );
};

export default Vehicles;