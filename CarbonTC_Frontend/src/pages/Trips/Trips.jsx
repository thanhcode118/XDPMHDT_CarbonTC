import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import TripCard from '../../components/TripCard/TripCard';
import UploadJourneyModal from '../../components/UploadJourneyModal/UploadJourneyModal';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import { getMyJourneys, uploadJourney, uploadJourneyFile, createBatch } from '../../services/tripService';
import styles from './Trips.module.css';

const Trips = ({ showNotification: propShowNotification }) => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification: hookShowNotification } = useNotification();
  const showNotification = propShowNotification || hookShowNotification;
  
  const [trips, setTrips] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showJsonUpload, setShowJsonUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'batch'
  
  // JSON upload form state
  const [jsonFormData, setJsonFormData] = useState({
    distanceKm: '',
    startTime: '',
    endTime: '',
    vehicleModel: '',
    origin: '',
    destination: ''
  });
  const [jsonError, setJsonError] = useState('');

  // Load trips on mount
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const result = await getMyJourneys();
      if (result.success && result.data) {
        const tripsData = Array.isArray(result.data) ? result.data : [];
        // Transform and sort trips by date (newest first)
        const transformedTrips = tripsData.map(trip => {
          // Parse original startTime and endTime (could be string or Date)
          const startTimeObj = trip.startTime ? new Date(trip.startTime) : null;
          const endTimeObj = trip.endTime ? new Date(trip.endTime) : null;
          
          return {
            ...trip,
            // Store original date objects for sorting
            _startTimeObj: startTimeObj,
            _endTimeObj: endTimeObj,
            // Formatted date and times
            date: startTimeObj 
              ? startTimeObj.toLocaleDateString('vi-VN')
              : trip.date || 'N/A',
            startTime: startTimeObj 
              ? startTimeObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : trip.startTime || 'N/A',
            endTime: endTimeObj 
              ? endTimeObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : trip.endTime || 'N/A',
            distance: trip.distanceKm || trip.distance || 0,
            credits: trip.calculatedCarbonCredits || trip.credits || 0,
            co2Reduced: trip.calculatedCarbonCredits || trip.co2Reduced || 0,
            startLocation: trip.origin || trip.startLocation || 'N/A',
            endLocation: trip.destination || trip.endLocation || 'N/A',
            status: trip.status || 'completed', // Backend should always send status
            vehicleType: trip.vehicleType || 'N/A'
          };
        }).sort((a, b) => {
          // Sort by startTime descending (newest first)
          const timeA = a._startTimeObj ? a._startTimeObj.getTime() : 0;
          const timeB = b._startTimeObj ? b._startTimeObj.getTime() : 0;
          return timeB - timeA;
        });
        setTrips(transformedTrips);
      } else {
        // Hiển thị thông báo lỗi nếu có
        const errorMessage = result.message || 'Không thể tải danh sách hành trình';
        showNotification(errorMessage, 'error');
        setTrips([]);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      const errorMessage = error.userMessage || error.message || 'Không thể tải danh sách hành trình';
      showNotification(errorMessage, 'error');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter trips: only show trips with Pending status that can be batched
  // According to backend, only journeys with Pending status can be batched
  // Journeys are automatically assigned to a batch when uploaded, so we need to check status
  const availableTripsForBatch = trips.filter(trip => {
    const status = trip.status?.toLowerCase() || '';
    // Show journeys with Pending status (these can be selected to create a new batch)
    // Also show journeys without a batchId (though this shouldn't happen in normal flow)
    return status === 'pending' || !trip.journeyBatchId || trip.journeyBatchId === '00000000-0000-0000-0000-000000000000' || trip.journeyBatchId === null;
  });

  // Group trips by date for history timeline
  const tripsByDate = trips.reduce((acc, trip) => {
    const dateKey = trip._startTimeObj 
      ? trip._startTimeObj.toLocaleDateString('vi-VN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : trip.date || 'Không xác định';
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(trip);
    return acc;
  }, {});

  const handleToggleTripSelection = (tripId) => {
    setSelectedTrips(prev => {
      if (prev.includes(tripId)) {
        return prev.filter(id => id !== tripId);
      } else {
        return [...prev, tripId];
      }
    });
  };

  const handleCreateBatch = async () => {
    if (selectedTrips.length === 0) {
      showNotification('Vui lòng chọn ít nhất một hành trình', 'warning');
      return;
    }

    try {
      setIsCreatingBatch(true);
      const result = await createBatch(selectedTrips);
      
      if (result.success) {
        showNotification('Tạo batch thành công!', 'success');
        setSelectedTrips([]);
        // Reload trips to reflect changes (trips will be removed from available list)
        await loadTrips();
        // Switch to history tab to see the updated timeline
        setActiveTab('history');
      } else {
        showNotification(result.message || 'Không thể tạo batch', 'error');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Không thể tạo batch',
        'error'
      );
    } finally {
      setIsCreatingBatch(false);
    }
  };

  const handleUploadFile = async (file) => {
    try {
      const result = await uploadJourneyFile(file);
      if (result.success) {
        showNotification('Tải lên file thành công!', 'success');
        await loadTrips(); // Reload trips
      } else {
        showNotification(result.message || 'Tải lên file thất bại', 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Không thể tải lên file',
        'error'
      );
    }
  };

  const handleJsonFormChange = (field, value) => {
    setJsonFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setJsonError('');
  };

  const handleUploadJson = async () => {
    // Validate required fields
    if (!jsonFormData.distanceKm || !jsonFormData.startTime || !jsonFormData.endTime || !jsonFormData.vehicleModel) {
      setJsonError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    // Validate distanceKm is a number
    const distanceKm = parseFloat(jsonFormData.distanceKm);
    if (isNaN(distanceKm) || distanceKm <= 0) {
      setJsonError('Quãng đường phải là số dương');
      return;
    }

    // Validate dates
    const startTime = new Date(jsonFormData.startTime);
    const endTime = new Date(jsonFormData.endTime);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      setJsonError('Thời gian không hợp lệ');
      return;
    }
    if (endTime <= startTime) {
      setJsonError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    try {
      // Build JSON object from form data
      const journeyData = {
        distanceKm: distanceKm,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        vehicleModel: jsonFormData.vehicleModel.trim()
      };

      // Add optional fields if provided
      if (jsonFormData.origin && jsonFormData.origin.trim()) {
        journeyData.origin = jsonFormData.origin.trim();
      }
      if (jsonFormData.destination && jsonFormData.destination.trim()) {
        journeyData.destination = jsonFormData.destination.trim();
      }

      setJsonError('');
      
      const result = await uploadJourney(journeyData);
      if (result.success) {
        showNotification('Tải lên hành trình thành công!', 'success');
        // Reset form
        setJsonFormData({
          distanceKm: '',
          startTime: '',
          endTime: '',
          vehicleModel: '',
          origin: '',
          destination: ''
        });
        setShowJsonUpload(false);
        await loadTrips(); // Reload trips
      } else {
        showNotification(result.message || 'Tải lên hành trình thất bại', 'error');
      }
    } catch (error) {
      console.error('Error uploading JSON:', error);
      setJsonError(error.response?.data?.message || error.message || 'Không thể tải lên hành trình');
      showNotification(
        error.response?.data?.message || error.message || 'Không thể tải lên hành trình',
        'error'
      );
    }
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
        className={sidebarActive ? 'activemenu' : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Hành trình" />
        
        {/* Action Buttons */}
        <div className={styles.card} style={{ marginBottom: '20px' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Tải lên hành trình</h3>
          </div>
          <div className={styles.cardBody}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                onClick={() => setShowUploadModal(true)}
              >
                <i className="bi bi-upload me-2"></i>Tải lên File (CSV/JSON)
              </button>
              <button 
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                onClick={() => setShowJsonUpload(!showJsonUpload)}
              >
                <i className="bi bi-code-square me-2"></i>Tải lên JSON
              </button>
            </div>
            
            {/* JSON Upload Form */}
            {showJsonUpload && (
              <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <label className={styles.formLabel} style={{ marginBottom: '15px', display: 'block' }}>Thông tin hành trình:</label>
                <div style={{ marginBottom: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#4ade80' }}>●</span> Bắt buộc
                  <span style={{ marginLeft: '15px', color: '#fbbf24' }}>●</span> Tùy chọn
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
                  {/* Distance Km - Required */}
                  <div>
                    <label className={styles.formLabel} style={{ marginBottom: '5px', display: 'block' }}>
                      Quãng đường (km) <span style={{ color: '#4ade80' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className={styles.formControl}
                      value={jsonFormData.distanceKm}
                      onChange={(e) => handleJsonFormChange('distanceKm', e.target.value)}
                      placeholder="25.5"
                      step="0.1"
                      min="0"
                      required
                    />
                  </div>

                  {/* Vehicle Model - Required */}
                  <div>
                    <label className={styles.formLabel} style={{ marginBottom: '5px', display: 'block' }}>
                      Loại xe <span style={{ color: '#4ade80' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formControl}
                      value={jsonFormData.vehicleModel}
                      onChange={(e) => handleJsonFormChange('vehicleModel', e.target.value)}
                      placeholder="Vinfast-VFe34"
                      required
                    />
                  </div>

                  {/* Start Time - Required */}
                  <div>
                    <label className={styles.formLabel} style={{ marginBottom: '5px', display: 'block' }}>
                      Thời gian bắt đầu <span style={{ color: '#4ade80' }}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className={styles.formControl}
                      value={jsonFormData.startTime}
                      onChange={(e) => handleJsonFormChange('startTime', e.target.value)}
                      required
                    />
                  </div>

                  {/* End Time - Required */}
                  <div>
                    <label className={styles.formLabel} style={{ marginBottom: '5px', display: 'block' }}>
                      Thời gian kết thúc <span style={{ color: '#4ade80' }}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className={styles.formControl}
                      value={jsonFormData.endTime}
                      onChange={(e) => handleJsonFormChange('endTime', e.target.value)}
                      required
                    />
                  </div>

                  {/* Origin - Optional */}
                  <div>
                    <label className={styles.formLabel} style={{ marginBottom: '5px', display: 'block' }}>
                      Điểm xuất phát <span style={{ color: '#fbbf24' }}>(tùy chọn)</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formControl}
                      value={jsonFormData.origin}
                      onChange={(e) => handleJsonFormChange('origin', e.target.value)}
                      placeholder="Hà Nội"
                    />
                  </div>

                  {/* Destination - Optional */}
                  <div>
                    <label className={styles.formLabel} style={{ marginBottom: '5px', display: 'block' }}>
                      Điểm đến <span style={{ color: '#fbbf24' }}>(tùy chọn)</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formControl}
                      value={jsonFormData.destination}
                      onChange={(e) => handleJsonFormChange('destination', e.target.value)}
                      placeholder="Hải Phòng"
                    />
                  </div>
                </div>

                {jsonError && (
                  <div style={{ color: '#ff6b6b', marginBottom: '10px', fontSize: '0.875rem', padding: '8px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '4px' }}>
                    {jsonError}
                  </div>
                )}

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button 
                    className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                    onClick={handleUploadJson}
                  >
                    <i className="bi bi-upload me-2"></i>Tải lên
                  </button>
                  <button 
                    className={`${styles.btnCustom}`}
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                    onClick={() => {
                      setShowJsonUpload(false);
                      setJsonFormData({
                        distanceKm: '',
                        startTime: '',
                        endTime: '',
                        vehicleModel: '',
                        origin: '',
                        destination: ''
                      });
                      setJsonError('');
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Batch Creation Section */}
        {selectedTrips.length > 0 && (
          <div className={`${styles.card} ${styles.createBatchSection}`} style={{ marginBottom: '20px' }}>
            <div className={styles.cardBody}>
              <div className={styles.createBatchTitle}>
                Đã chọn {selectedTrips.length} hành trình
              </div>
              <button 
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                onClick={handleCreateBatch}
                disabled={isCreatingBatch}
              >
                {isCreatingBatch ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tạo batch...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-seam me-2"></i>Tạo Batch
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Tabs for History and Batch Selection */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="500">
          <div className={styles.cardHeader}>
            <div className={styles.tabContainer}>
              <button
                className={`${styles.tabButton} ${activeTab === 'history' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="bi bi-clock-history me-2"></i>Lịch sử hành trình
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'batch' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('batch')}
              >
                <i className="bi bi-box-seam me-2"></i>Danh sách hành trình (Chọn để tạo batch)
              </button>
            </div>
            <button 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
              onClick={loadTrips}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>Làm mới
            </button>
          </div>
          <div className={styles.cardBody}>
            {activeTab === 'history' ? (
              /* Lịch sử hành trình */
              trips.length > 0 ? (
                <div className={styles.timeline}>
                  {Object.entries(tripsByDate).map(([date, dateTrips], dateIndex) => (
                    <div key={date} className={styles.timelineGroup} data-aos="fade-up" data-aos-delay={dateIndex * 100}>
                      <div className={styles.timelineDate}>
                        <i className="bi bi-calendar-event me-2"></i>
                        {date}
                        <span className={styles.tripCount}>({dateTrips.length} hành trình)</span>
                      </div>
                      <div className={styles.timelineItems}>
                        {dateTrips.map((trip, tripIndex) => (
                          <div 
                            key={trip.id || trip.journeyId || tripIndex} 
                            className={styles.timelineItem}
                          >
                            <div className={styles.timelineMarker}>
                              <i className="bi bi-circle-fill"></i>
                            </div>
                            <div className={styles.timelineContent}>
                              <div className={styles.timelineHeader}>
                                <div className={styles.timelineTime}>
                                  <i className="bi bi-clock me-1"></i>
                                  {trip.startTime} - {trip.endTime}
                                </div>
                                <div className={`${styles.timelineStatus} ${styles[trip.status?.toLowerCase()] || styles.completed}`}>
                                  {(() => {
                                    const status = trip.status?.toLowerCase() || 'completed';
                                    switch(status) {
                                      case 'completed':
                                        return 'Đã hoàn thành';
                                      case 'pending':
                                        return 'Đang chờ';
                                      case 'verified':
                                        return 'Đã xác minh';
                                      case 'failed':
                                        return 'Thất bại';
                                      default:
                                        return trip.status || 'Đã hoàn thành';
                                    }
                                  })()}
                                </div>
                              </div>
                              <div className={styles.timelineRoute}>
                                <div className={styles.timelineLocation}>
                                  <i className="bi bi-geo-alt-fill me-2"></i>
                                  <span className={styles.locationName}>{trip.startLocation || trip.origin || 'N/A'}</span>
                                </div>
                                <div className={styles.timelineArrow}>
                                  <i className="bi bi-arrow-right"></i>
                                </div>
                                <div className={styles.timelineLocation}>
                                  <i className="bi bi-geo-alt-fill me-2"></i>
                                  <span className={styles.locationName}>{trip.endLocation || trip.destination || 'N/A'}</span>
                                </div>
                              </div>
                              <div className={styles.timelineStats}>
                                <div className={styles.timelineStat}>
                                  <i className="bi bi-speedometer2 me-1"></i>
                                  <span>{trip.distance || trip.distanceKm || 0} km</span>
                                </div>
                                <div className={styles.timelineStat}>
                                  <i className="bi bi-award me-1"></i>
                                  <span>{trip.credits || trip.calculatedCarbonCredits || 0} tín chỉ</span>
                                </div>
                                <div className={styles.timelineStat}>
                                  <i className="bi bi-car-front me-1"></i>
                                  <span>{trip.vehicleType || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <i className="bi bi-clock-history"></i>
                  <p>Chưa có lịch sử hành trình nào. Hãy tải lên hành trình đầu tiên của bạn!</p>
                </div>
              )
            ) : (
              /* Danh sách hành trình để chọn tạo batch */
              availableTripsForBatch.length > 0 ? (
                <div className={styles.tripList}>
                  {availableTripsForBatch.map((trip) => (
                    <div key={trip.id || trip.journeyId} style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <input
                          type="checkbox"
                          checked={selectedTrips.includes(trip.id || trip.journeyId)}
                          onChange={() => handleToggleTripSelection(trip.id || trip.journeyId)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          Chọn để tạo batch
                        </span>
                      </div>
                      <TripCard
                        trip={trip}
                        onViewDetails={() => {}}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <i className="bi bi-box-seam"></i>
                  <p>Không còn hành trình nào có thể chọn để tạo batch. Tất cả hành trình đã được thêm vào batch hoặc chưa có hành trình nào.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Upload File Modal */}
      <UploadJourneyModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={loadTrips}
      />
    </div>
  );
};

export default Trips;
