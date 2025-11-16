import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import UploadJourneyModal from '../../components/UploadJourneyModal/UploadJourneyModal';
import BatchDetailsModal from '../../components/BatchDetailsModal/BatchDetailsModal';
import TripDetailModal from '../../components/TripDetailModal/TripDetailModal';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import { uploadJourney, uploadJourneyFile, getMyJourneys, createBatch } from '../../services/tripService';
import { getMyBatches, submitVerificationRequest } from '../../services/verificationService';
import styles from './Trips.module.css';

const Trips = ({ showNotification: propShowNotification }) => {
  const location = useLocation();
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification: hookShowNotification } = useNotification();
  const showNotification = propShowNotification || hookShowNotification;
  
  const [batches, setBatches] = useState([]);
  const [allJourneys, setAllJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  // Check if we need to open journeys tab from navigation state
  const initialTab = location.state?.openJourneysTab ? 'journeys' : 'pending';
  const [activeTab, setActiveTab] = useState(initialTab); // 'pending', 'history', or 'journeys'
  const [journeySubTab, setJourneySubTab] = useState('pending'); // 'pending' or 'completed'
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Check if we need to open upload form from navigation state
  const shouldOpenUploadForm = location.state?.openUploadForm || false;
  const [showJsonUpload, setShowJsonUpload] = useState(shouldOpenUploadForm);
  const [submittingBatchId, setSubmittingBatchId] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [selectedJourneys, setSelectedJourneys] = useState([]);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [selectedJourneyId, setSelectedJourneyId] = useState(null);
  const [showJourneyDetails, setShowJourneyDetails] = useState(false);
  
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

  // Hàm format ngày thành dd/mm/yy
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2); // Lấy 2 số cuối của năm
    
    return `${day}/${month}/${year}`;
  };


  // Load batches on mount
  useEffect(() => {
    loadBatches();
  }, []);

  // Load journeys when journeys tab is active
  useEffect(() => {
    if (activeTab === 'journeys') {
      loadJourneys();
    }
  }, [activeTab]);

  // Clear location state after processing to prevent reopening on refresh
  useEffect(() => {
    if (location.state?.openJourneysTab || location.state?.openUploadForm) {
      // Replace current location to remove state from history
      window.history.replaceState({}, document.title);
    }
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const result = await getMyBatches();
      if (result.success && result.data) {
        const batchesData = Array.isArray(result.data) ? result.data : [];
        // Transform batches data
        const transformedBatches = batchesData.map(batch => {
          // Get journey count from journeys array
          const journeyCount = batch.journeys?.length || batch.journeys?.Count || 0;
          
          // Calculate total CO2 from journeys (sum of calculatedCarbonCredits or co2Reduced)
          const totalCO2 = batch.journeys?.reduce((sum, journey) => {
            return sum + (journey.calculatedCarbonCredits || journey.co2Reduced || journey.co2EstimateKg || 0);
          }, 0) || 0;
          
          // Tín chỉ Carbon tham chiếu theo Tổng CO₂ (bằng với Tổng CO₂)
          const carbonCredits = totalCO2;
          
          // Get creation date from CreationTime field (now provided by API)
          const createdDate = batch.creationTime 
            ? new Date(batch.creationTime) 
            : null;
          
          // Get submitted date from verification request (if exists)
          // This would need to come from VerificationRequests navigation property
          // For now, we'll check if status is not Pending, we can use LastModifiedAt as approximation
          const submittedDate = batch.verificationRequests?.[0]?.requestDate
            ? new Date(batch.verificationRequests[0].requestDate)
            : (batch.status && batch.status.toLowerCase() !== 'pending' && batch.lastModifiedAt)
            ? new Date(batch.lastModifiedAt)
            : null;
          
          return {
            ...batch,
            journeyCount: journeyCount,
            totalCO2Reduced: totalCO2, // Tổng CO2 từ tất cả journeys
            carbonCredits: carbonCredits, // Tín chỉ carbon đã phát hành
            _createdDateObj: createdDate,
            _submittedDateObj: submittedDate,
            createdDateFormatted: formatDate(createdDate),
            submittedDateFormatted: submittedDate ? formatDate(submittedDate) : null,
            status: batch.status || 'Pending'
          };
        }).sort((a, b) => {
          // Sort by created date descending (newest first)
          const timeA = a._createdDateObj ? a._createdDateObj.getTime() : 0;
          const timeB = b._createdDateObj ? b._createdDateObj.getTime() : 0;
          return timeB - timeA;
        });
        setBatches(transformedBatches);
        
        // Extract all journeys from all batches for the journeys tab
        const allJourneysList = [];
        transformedBatches.forEach(batch => {
          if (batch.journeys && Array.isArray(batch.journeys)) {
            batch.journeys.forEach(journey => {
              allJourneysList.push({
                ...journey,
                batchId: batch.id,
                batchStatus: batch.status
              });
            });
          }
        });
        
        // Transform and sort journeys
        const transformedJourneys = allJourneysList.map(trip => {
          const startTimeObj = trip.startTime ? new Date(trip.startTime) : null;
          const endTimeObj = trip.endTime ? new Date(trip.endTime) : null;
          
          return {
            ...trip,
            _startTimeObj: startTimeObj,
            _endTimeObj: endTimeObj,
            date: formatDate(startTimeObj),
            startTime: startTimeObj 
              ? startTimeObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : 'N/A',
            endTime: endTimeObj 
              ? endTimeObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : 'N/A',
            distance: trip.distanceKm || trip.distance || 0,
            credits: trip.calculatedCarbonCredits || trip.credits || 0,
            co2Reduced: trip.calculatedCarbonCredits || trip.co2Reduced || 0,
            startLocation: trip.origin || trip.startLocation || 'N/A',
            endLocation: trip.destination || trip.endLocation || 'N/A',
            status: trip.status || 'completed',
            vehicleType: trip.vehicleType || 'N/A'
          };
        }).sort((a, b) => {
          const timeA = a._startTimeObj ? a._startTimeObj.getTime() : 0;
          const timeB = b._startTimeObj ? b._startTimeObj.getTime() : 0;
          return timeB - timeA;
        });
        
        setAllJourneys(transformedJourneys);
      } else {
        const errorMessage = result.message || 'Không thể tải danh sách lô';
        showNotification(errorMessage, 'error');
        setBatches([]);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      const errorMessage = error.userMessage || error.message || 'Không thể tải danh sách lô';
      showNotification(errorMessage, 'error');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const loadJourneys = async () => {
    try {
      const result = await getMyJourneys();
      if (result.success && result.data) {
        const journeysData = Array.isArray(result.data) ? result.data : [];
        // Transform journeys data
        const transformedJourneys = journeysData.map(trip => {
          const startTimeObj = trip.startTime ? new Date(trip.startTime) : null;
          const endTimeObj = trip.endTime ? new Date(trip.endTime) : null;
          
          return {
            ...trip,
            _startTimeObj: startTimeObj,
            _endTimeObj: endTimeObj,
            date: formatDate(startTimeObj),
            startTime: startTimeObj 
              ? startTimeObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : 'N/A',
            endTime: endTimeObj 
              ? endTimeObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : 'N/A',
            distance: trip.distanceKm || trip.distance || 0,
            credits: trip.calculatedCarbonCredits || trip.credits || 0,
            co2Reduced: trip.calculatedCarbonCredits || trip.co2Reduced || 0,
            startLocation: trip.origin || trip.startLocation || 'N/A',
            endLocation: trip.destination || trip.endLocation || 'N/A',
            status: trip.status || 'completed',
            vehicleType: trip.vehicleType || 'N/A'
          };
        }).sort((a, b) => {
          const timeA = a._startTimeObj ? a._startTimeObj.getTime() : 0;
          const timeB = b._startTimeObj ? b._startTimeObj.getTime() : 0;
          return timeB - timeA;
        });
        
        setAllJourneys(transformedJourneys);
      } else {
        const errorMessage = result.message || 'Không thể tải danh sách hành trình';
        showNotification(errorMessage, 'error');
        setAllJourneys([]);
      }
    } catch (error) {
      console.error('Error loading journeys:', error);
      const errorMessage = error.userMessage || error.message || 'Không thể tải danh sách hành trình';
      showNotification(errorMessage, 'error');
      setAllJourneys([]);
    }
  };

  const handleViewBatchDetails = (batch) => {
    setSelectedBatch(batch);
    setShowBatchDetails(true);
  };

  const handleViewJourneyDetails = (journeyId) => {
    setSelectedJourneyId(journeyId);
    setShowJourneyDetails(true);
  };

  const handleToggleJourneySelection = (journeyId) => {
    setSelectedJourneys(prev => {
      if (prev.includes(journeyId)) {
        return prev.filter(id => id !== journeyId);
      } else {
        return [...prev, journeyId];
      }
    });
  };

  const handleCreateBatchFromJourneys = async () => {
    if (selectedJourneys.length === 0) {
      showNotification('Vui lòng chọn ít nhất một hành trình', 'warning');
      return;
    }

    try {
      setIsCreatingBatch(true);
      const result = await createBatch(selectedJourneys);
      
      if (result.success) {
        showNotification('Tạo lô hành trình thành công!', 'success');
        setSelectedJourneys([]);
        // Reload data
        await loadBatches();
        await loadJourneys();
        // Switch to pending tab to see the new batch
        setActiveTab('pending');
      } else {
        showNotification(result.message || 'Không thể tạo lô', 'error');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Không thể tạo lô',
        'error'
      );
    } finally {
      setIsCreatingBatch(false);
    }
  };

  // Filter journeys that can be selected for batch creation
  // Only journeys with Pending status or without a batchId can be selected
  const availableJourneysForBatch = allJourneys.filter(journey => {
    const status = journey.status?.toLowerCase() || '';
    // Allow selection if status is pending or journey doesn't have a batchId
    return status === 'pending' || !journey.journeyBatchId || journey.journeyBatchId === '00000000-0000-0000-0000-000000000000';
  });

  // Filter journeys by status
  const pendingJourneys = allJourneys.filter(journey => {
    const status = journey.status?.toLowerCase() || '';
    return status === 'pending';
  });

  const completedJourneys = allJourneys.filter(journey => {
    const status = journey.status?.toLowerCase() || '';
    return status === 'completed' || status === 'verified' || status === 'failed';
  });

  // Get the journeys to display based on the selected sub-tab
  const displayedJourneys = journeySubTab === 'pending' ? pendingJourneys : completedJourneys;

  // Filter batches by status
  const pendingBatches = batches.filter(batch => {
    const status = batch.status?.toLowerCase() || '';
    return status === 'pending';
  });

  const historyBatches = batches.filter(batch => {
    const status = batch.status?.toLowerCase() || '';
    return status !== 'pending';
  });

  const handleSubmitVerification = async (batchId) => {
    try {
      setSubmittingBatchId(batchId);
      const result = await submitVerificationRequest(batchId);
      
      if (result.success) {
        showNotification('Gửi yêu cầu xác minh thành công!', 'success');
        await loadBatches(); // Reload batches
        // Switch to history tab to see the updated batch
        setActiveTab('history');
      } else {
        showNotification(result.message || 'Không thể gửi yêu cầu xác minh', 'error');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi yêu cầu xác minh';
      showNotification(errorMessage, 'error');
    } finally {
      setSubmittingBatchId(null);
    }
  };

  const handleUploadFile = async (file) => {
    try {
      const result = await uploadJourneyFile(file);
      if (result.success) {
        showNotification('Tải lên file thành công!', 'success');
        // Reload both batches and journeys
        await loadBatches();
        await loadJourneys();
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
        // Reload both batches and journeys
        await loadBatches();
        await loadJourneys();
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

  // Helper function to get status display and color
  const getStatusDisplay = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending':
        return { text: 'Chờ Gửi', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' };
      case 'submittedforverification':
      case 'submitted':
        return { text: 'Đã Gửi Xác Minh', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' };
      case 'verified':
        return { text: 'Đã Xác Minh', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.2)' };
      case 'rejected':
        return { text: 'Đã Từ Chối', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' };
      case 'creditsissued':
        return { text: 'Đã Phát Hành Tín Chỉ', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
      default:
        return { text: status || 'Không xác định', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.2)' };
    }
  };

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.mainContent}>
          <div className={styles.loadingState}>
            <i className="bi bi-arrow-repeat"></i>
            <p>Đang tải dữ liệu lô hành trình...</p>
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
        <Topbar title="Hành Trình Của Tôi" />
        
        {/* Tabs Navigation */}
        <div className={styles.card} style={{ marginBottom: '20px' }}>
          <div className={styles.cardHeader}>
            <div className={styles.tabContainer}>
              <button
                className={`${styles.tabButton} ${activeTab === 'pending' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <i className="bi bi-inbox me-2"></i>Lô Chờ Gửi
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'history' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="bi bi-clock-history me-2"></i>Lịch Sử Lô
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'journeys' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('journeys')}
              >
                <i className="bi bi-map me-2"></i>Lịch Sử Hành Trình
              </button>
            </div>
            <button 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
              onClick={loadBatches}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>Làm mới
            </button>
          </div>
        </div>

        {/* Tab 1: Lô Chờ Gửi */}
        {activeTab === 'pending' && (
          <>
            {/* Pending Batches List */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Danh sách Lô Đang Chờ</h3>
                <span className={styles.badge} style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                  {pendingBatches.length} lô
                </span>
              </div>
              <div className={styles.cardBody}>
                {pendingBatches.length > 0 ? (
                  <div className={styles.batchTableContainer}>
                    <table className={styles.batchTable}>
                    <thead>
                      <tr>
                        <th>ID Lô</th>
                        <th>Tổng CO₂ (kg)</th>
                        <th>Tín chỉ Carbon</th>
                        <th>Số Hành Trình</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBatches.map((batch) => (
                        <tr key={batch.id}>
                          <td>
                            <span className={styles.batchId}>#{batch.id?.substring(0, 8) || 'N/A'}</span>
                          </td>
                          <td>
                            <span className={styles.co2Amount}>
                              {batch.totalCO2Reduced ? batch.totalCO2Reduced.toFixed(2) : '0.00'} kg
                            </span>
                          </td>
                          <td>
                            <span className={styles.co2Amount}>
                              {batch.carbonCredits ? batch.carbonCredits.toFixed(2) : '0.00'}
                            </span>
                          </td>
                          <td>
                            <span className={styles.journeyCount}>
                              <i className="bi bi-list-ol me-1"></i>
                              {batch.journeyCount || 0}
                            </span>
                          </td>
                          <td>
                            <span 
                              className={styles.statusBadge}
                              style={{
                                background: getStatusDisplay(batch.status).bg,
                                color: getStatusDisplay(batch.status).color
                              }}
                            >
                              {getStatusDisplay(batch.status).text}
                            </span>
                          </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                  className={`${styles.btnCustom}`}
                                  style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                                  onClick={() => handleViewBatchDetails(batch)}
                                >
                                  <i className="bi bi-eye me-2"></i>Chi Tiết
                                </button>
                                <button
                                  className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
                                  onClick={() => handleSubmitVerification(batch.id)}
                                  disabled={submittingBatchId === batch.id}
                                >
                                  {submittingBatchId === batch.id ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Đang gửi...
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-send me-2"></i>Gửi Xác Minh
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <i className="bi bi-inbox"></i>
                    <p>Chưa có lô nào đang chờ gửi. Hãy tải lên hành trình để tạo lô mới!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Lịch Sử Lô */}
        {activeTab === 'history' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Lịch Sử Lô</h3>
              <span className={styles.badge} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                {historyBatches.length} lô
              </span>
            </div>
            <div className={styles.cardBody}>
              {historyBatches.length > 0 ? (
                <div className={styles.batchTableContainer}>
                  <table className={styles.batchTable}>
                    <thead>
                      <tr>
                        <th>ID Lô</th>
                        <th>Tổng CO₂ (kg)</th>
                        <th>Tín chỉ Carbon</th>
                        <th>Số Hành Trình</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyBatches.map((batch) => (
                        <tr key={batch.id}>
                          <td>
                            <span className={styles.batchId}>#{batch.id?.substring(0, 8) || 'N/A'}</span>
                          </td>
                          <td>
                            <span className={styles.co2Amount}>
                              {batch.totalCO2Reduced ? batch.totalCO2Reduced.toFixed(2) : '0.00'} kg
                            </span>
                          </td>
                          <td>
                            <span className={styles.co2Amount}>
                              {batch.carbonCredits ? batch.carbonCredits.toFixed(2) : '0.00'}
                            </span>
                          </td>
                          <td>
                            <span className={styles.journeyCount}>
                              <i className="bi bi-list-ol me-1"></i>
                              {batch.journeyCount || 0}
                            </span>
                          </td>
                          <td>
                            <span 
                              className={styles.statusBadge}
                              style={{
                                background: getStatusDisplay(batch.status).bg,
                                color: getStatusDisplay(batch.status).color
                              }}
                            >
                              {getStatusDisplay(batch.status).text}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`${styles.btnCustom}`}
                              style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                              onClick={() => handleViewBatchDetails(batch)}
                            >
                              <i className="bi bi-eye me-2"></i>Chi Tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <i className="bi bi-clock-history"></i>
                  <p>Chưa có lịch sử lô nào. Các lô đã gửi xác minh sẽ hiển thị ở đây.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Lịch Sử Hành Trình */}
        {activeTab === 'journeys' && (
          <>
            {/* Upload Section */}
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
                    <i className="bi bi-code-square me-2"></i>Tải lên Hành Trình Đơn Lẻ
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
            {selectedJourneys.length > 0 && (
              <div className={styles.card} style={{ marginBottom: '20px' }}>
            <div className={styles.cardBody}>
              <div className={styles.createBatchTitle}>
                    Đã chọn {selectedJourneys.length} hành trình
              </div>
              <button 
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                    onClick={handleCreateBatchFromJourneys}
                disabled={isCreatingBatch}
              >
                {isCreatingBatch ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang tạo lô...
                  </>
                ) : (
                  <>
                        <i className="bi bi-box-seam me-2"></i>Tạo Lô Hành Trình
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
            <div className={styles.card}>
          <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Lịch Sử Hành Trình</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={styles.badge} style={{ background: 'rgba(102, 126, 234, 0.2)', color: '#667eea' }}>
                    {allJourneys.length} hành trình
                  </span>
                  {availableJourneysForBatch.length > 0 && (
                    <span className={styles.badge} style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                      {availableJourneysForBatch.length} có thể tạo lô
                    </span>
                  )}
            </div>
          </div>
          <div className={styles.cardBody}>
            {/* Sub-tabs for journeys */}
            <div className={styles.card} style={{ marginBottom: '20px', background: 'transparent', border: 'none' }}>
              <div className={styles.cardHeader} style={{ padding: '0 0 15px 0', background: 'transparent', border: 'none' }}>
                <div className={styles.tabContainer} style={{ gap: '8px' }}>
                  <button
                    className={`${styles.tabButton} ${journeySubTab === 'pending' ? styles.tabActive : ''}`}
                    onClick={() => setJourneySubTab('pending')}
                    style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                  >
                    <i className="bi bi-clock me-2"></i>Đang Chờ Tạo Lô
                    {pendingJourneys.length > 0 && (
                      <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'rgba(251, 191, 36, 0.2)', borderRadius: '10px', fontSize: '0.8rem' }}>
                        {pendingJourneys.length}
                      </span>
                    )}
                  </button>
                  <button
                    className={`${styles.tabButton} ${journeySubTab === 'completed' ? styles.tabActive : ''}`}
                    onClick={() => setJourneySubTab('completed')}
                    style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                  >
                    <i className="bi bi-check-circle me-2"></i>Đã Tạo Lô
                    {completedJourneys.length > 0 && (
                      <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'rgba(74, 222, 128, 0.2)', borderRadius: '10px', fontSize: '0.8rem' }}>
                        {completedJourneys.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
              {displayedJourneys.length > 0 ? (
                <div className={styles.timeline}>
                  {Object.entries(
                    displayedJourneys.reduce((acc, trip) => {
                      const dateKey = trip._startTimeObj 
                        ? formatDate(trip._startTimeObj)
                        : trip.date || 'Không xác định';
                      
                      if (!acc[dateKey]) {
                        acc[dateKey] = [];
                      }
                      acc[dateKey].push(trip);
                      return acc;
                    }, {})
                  ).map(([date, dateTrips], dateIndex) => (
                    <div key={date} className={styles.timelineGroup} data-aos="fade-up" data-aos-delay={dateIndex * 100}>
                      <div className={styles.timelineDate}>
                        <i className="bi bi-calendar-event me-2"></i>
                        {date}
                        <span className={styles.tripCount}>({dateTrips.length} hành trình)</span>
                      </div>
                      <div className={styles.timelineItems}>
                        {dateTrips.map((trip, tripIndex) => {
                          // Use id (from EvJourneyResponseDto) as the primary identifier
                          const tripId = trip.id || trip.journeyId;
                          // Use tripIndex as fallback only for React key, not for API calls
                          const tripKey = tripId || `trip-${tripIndex}`;
                          const status = trip.status?.toLowerCase() || '';
                          // Only show checkbox for pending journeys in the pending tab
                          const canSelect = journeySubTab === 'pending' && (status === 'pending' || !trip.journeyBatchId || trip.journeyBatchId === '00000000-0000-0000-0000-000000000000');
                          const isSelected = tripId && selectedJourneys.includes(tripId);
                          
                          return (
                            <div 
                              key={tripKey} 
                            className={styles.timelineItem}
                              style={isSelected ? { border: '2px solid var(--ev-owner-color)', borderRadius: '12px' } : {}}
                            >
                              {canSelect && tripId && (
                                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleJourneySelection(tripId)}
                                    style={{ 
                                      width: '20px', 
                                      height: '20px', 
                                      cursor: 'pointer',
                                      accentColor: 'var(--ev-owner-color)'
                                    }}
                                  />
                                </div>
                              )}
                            <div className={styles.timelineMarker}>
                              <i className="bi bi-circle-fill"></i>
                            </div>
                            <div className={styles.timelineContent}>
                              <div className={styles.timelineHeader}>
                                <div className={styles.timelineTime}>
                                  <i className="bi bi-clock me-1"></i>
                                  {trip.startTime} - {trip.endTime}
                                </div>
                                  <div className={`${styles.timelineStatus} ${styles[status] || styles.completed}`}>
                                  {(() => {
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
                              {tripId && (
                                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                                  <button
                                    className={`${styles.btnCustom}`}
                                    style={{ 
                                      background: 'rgba(102, 126, 234, 0.2)', 
                                      color: 'var(--ev-owner-color)',
                                      fontSize: '0.85rem',
                                      padding: '6px 12px'
                                    }}
                                    onClick={() => handleViewJourneyDetails(tripId)}
                                  >
                                    <i className="bi bi-eye me-1"></i>Xem Chi Tiết
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <i className={journeySubTab === 'pending' ? 'bi bi-clock' : 'bi bi-check-circle'}></i>
                  <p>
                    {journeySubTab === 'pending' 
                      ? 'Chưa có hành trình nào đang chờ. Hãy tải lên hành trình mới!' 
                      : 'Chưa có hành trình nào đã tạo lô.'}
                  </p>
                </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
      
      {/* Upload File Modal */}
      <UploadJourneyModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={async () => {
          await loadBatches();
          await loadJourneys();
        }}
      />

      {/* Batch Details Modal */}
      <BatchDetailsModal
        show={showBatchDetails}
        onClose={() => {
          setShowBatchDetails(false);
          setSelectedBatch(null);
        }}
        batch={selectedBatch}
      />

      {/* Journey Details Modal */}
      <TripDetailModal
        show={showJourneyDetails}
        onClose={() => {
          setShowJourneyDetails(false);
          setSelectedJourneyId(null);
        }}
        journeyId={selectedJourneyId}
      />
    </div>
  );
};

export default Trips;
