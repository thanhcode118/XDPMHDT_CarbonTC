import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import TripStatCard from '../../components/TripStatCard/TripStatCard';
import TripMap from '../../components/TripMap/TripMap';
import FilterSection from '../../components/FilterSectionCar/FilterSection';
import TripCard from '../../components/TripCard/TripCard';
import TripDetailModal from '../../components/TripDetailModal/TripDetailModal';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import styles from './Trips.module.css';

const Trips = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sample data
  const sampleTrips = [
    {
      id: 1,
      date: '15/05/2023',
      status: 'completed',
      startLocation: 'Hà Nội',
      endLocation: 'Hải Phòng',
      startTime: '08:30',
      endTime: '11:45',
      distance: 120,
      duration: '3h 15m',
      credits: 15,
      co2Reduced: 37.5,
      vehicle: 'VinFast VF 8',
      averageSpeed: '36.9 km/h',
      energyConsumption: '18.5 kWh'
    },
    {
      id: 2,
      date: '14/05/2023',
      status: 'completed',
      startLocation: 'Hà Nội',
      endLocation: 'Vĩnh Phúc',
      startTime: '14:20',
      endTime: '15:30',
      distance: 45,
      duration: '1h 10m',
      credits: 6,
      co2Reduced: 15,
      vehicle: 'Tesla Model 3',
      averageSpeed: '38.6 km/h',
      energyConsumption: '7.2 kWh'
    },
    {
      id: 3,
      date: '12/05/2023',
      status: 'completed',
      startLocation: 'Hà Nội',
      endLocation: 'Hòa Bình',
      startTime: '09:00',
      endTime: '11:00',
      distance: 75,
      duration: '2h',
      credits: 9,
      co2Reduced: 22.5,
      vehicle: 'VinFast VF 8',
      averageSpeed: '37.5 km/h',
      energyConsumption: '11.8 kWh'
    }
  ];

  const sampleVehicles = [
    { id: 1, name: 'VinFast VF 8' },
    { id: 2, name: 'Tesla Model 3' },
    { id: 3, name: 'Hyundai Ioniq 5' }
  ];

  const tripStats = [
    {
      icon: 'bi-signpost-2-fill',
      value: '42',
      label: 'Tổng số hành trình',
      gradient: '1',
      delay: 100
    },
    {
      icon: 'bi-geo-alt-fill',
      value: '2.450 km',
      label: 'Tổng quãng đường',
      gradient: '2',
      delay: 200
    },
    {
      icon: 'bi-lightning-charge-fill',
      value: '125',
      label: 'Tín chỉ kiếm được',
      gradient: '3',
      delay: 300
    },
    {
      icon: 'bi-cloud-arrow-down-fill',
      value: '312 kg',
      label: 'CO₂ giảm phát thải',
      gradient: '4',
      delay: 400
    }
  ];

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setTrips(sampleTrips);
      setFilteredTrips(sampleTrips);
      setVehicles(sampleVehicles);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilter = (filters) => {
    let filtered = [...trips];
    
    if (filters.vehicle) {
      filtered = filtered.filter(trip => 
        trip.vehicle === vehicles.find(v => v.id.toString() === filters.vehicle)?.name
      );
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.date.split('/').reverse().join('-'));
        const filterDate = new Date(filters.dateFrom);
        return tripDate >= filterDate;
      });
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.date.split('/').reverse().join('-'));
        const filterDate = new Date(filters.dateTo);
        return tripDate <= filterDate;
      });
    }
    
    setFilteredTrips(filtered);
  };

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setShowDetailModal(true);
  };

  const handleExportReport = () => {
    showNotification('Đang xuất báo cáo...', 'info');
    // Simulate export
    setTimeout(() => {
      showNotification('Xuất báo cáo thành công!', 'success');
    }, 2000);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedTrip(null);
  };

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.mainContent}>
          <div className={styles.loadingState}>
            <i className="bi bi-arrow-repeat"></i>
            <p>Đang tải dữ liệu hành trình...</p>
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
        activePage="trips" 
        onPageChange={() => {}} 
        className={sidebarActive ? styles.active : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Hành trình" />
        
        {/* Trip Stats */}
        <div className={styles.tripStats}>
          {tripStats.map((stat, index) => (
            <TripStatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              gradient={stat.gradient}
              delay={stat.delay}
            />
          ))}
        </div>
        
        {/* Map */}
        <TripMap 
          data-aos="fade-up" 
          data-aos-delay="500"
        />
        
        {/* Filter Section */}
        <FilterSection
          onFilter={handleFilter}
          vehicles={vehicles}
        />
        
        {/* Trip List */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="700">
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Lịch sử hành trình</h3>
            <button 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
              onClick={handleExportReport}
            >
              Xuất báo cáo
            </button>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tripList}>
              {filteredTrips.length > 0 ? (
                filteredTrips.map((trip, index) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onViewDetails={() => handleViewDetails(trip)}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <i className="bi bi-map"></i>
                  <p>Không tìm thấy hành trình nào phù hợp với bộ lọc</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Trip Detail Modal */}
      <TripDetailModal
        show={showDetailModal}
        onClose={handleCloseModal}
        trip={selectedTrip}
        onExportReport={handleExportReport}
      />
    </div>
  );
};

export default Trips;