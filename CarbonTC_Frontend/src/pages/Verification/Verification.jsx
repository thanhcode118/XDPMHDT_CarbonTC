import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import JourneyBatchCard from '../../components/JourneyBatchCard/JourneyBatchCard';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import {
  getMyBatches,
  submitVerificationRequest,
  getPendingRequests,
  getVerificationRequestById,
  reviewVerificationRequest
} from '../../services/verificationService';
import styles from './Verification.module.css';

const Verification = ({ showNotification: propShowNotification }) => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification: hookShowNotification } = useNotification();
  const showNotification = propShowNotification || hookShowNotification;
  const { user } = useAuth();
  
  // Determine user role
  const isEVOwner = user?.roleName === 'EVOwner' || user?.role === 'EVOwner';
  const isCVA = user?.roleName === 'CVA' || user?.role === 'CVA';
  const userRole = user?.roleName || user?.role || 'Unknown';
  const userRoleDisplay = isEVOwner ? 'Chủ xe điện (EVOwner)' : isCVA ? 'CVA' : userRole;
  
  // Tab state - default to EVOwner tab if user is EVOwner, else CVA tab (or evowner as default)
  const [activeTab, setActiveTab] = useState(() => {
    // Determine default tab based on user role
    if (isEVOwner) return 'evowner';
    if (isCVA) return 'cva';
    return 'evowner'; // Default to EVOwner tab for read-only users
  });
  
  // EV Owner states
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  
  // CVA states
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [auditSummary, setAuditSummary] = useState('');
  const [isAuditSatisfactory, setIsAuditSatisfactory] = useState(true);
  const [reasonForRejection, setReasonForRejection] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  
  // Pagination for CVA
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  const [loading, setLoading] = useState(true);

  // Initial load - set loading to false and set default tab
  useEffect(() => {
    console.log('🔍 Verification page - User role check:', {
      user: user,
      roleName: user?.roleName,
      role: user?.role,
      isEVOwner: isEVOwner,
      isCVA: isCVA,
      activeTab: activeTab
    });
    
    // Set default tab based on user role if not already set
    if (user) {
      if (isEVOwner && activeTab !== 'evowner') {
        setActiveTab('evowner');
      } else if (isCVA && !isEVOwner && activeTab !== 'cva') {
        setActiveTab('cva');
      }
    }
    
    setLoading(false);
  }, [user, isEVOwner, isCVA, activeTab]);
  
  // Track if we should skip the currentPage effect (to avoid double load on tab switch)
  const skipPageLoadRef = React.useRef(false);
  
  // Load data when tab changes
  useEffect(() => {
    // Load data based on active tab
    if (activeTab === 'evowner') {
      // Load batches if user is EVOwner
      if (isEVOwner) {
        console.log('✅ Loading EVOwner data...');
        loadBatches();
      } else {
        // For non-EVOwner users, set empty batches (read-only view)
        setBatches([]);
        setLoadingBatches(false);
      }
    } else if (activeTab === 'cva') {
      // Reset to page 1 when switching to CVA tab
      skipPageLoadRef.current = true;
      setCurrentPage(1);
      
      // Load requests if user is CVA
      if (isCVA) {
        console.log('✅ Loading CVA data...');
        loadPendingRequests();
      } else {
        // For non-CVA users, set empty requests (read-only view)
        setPendingRequests([]);
        setLoadingRequests(false);
        setTotalPages(1);
        setTotalCount(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  // Reload CVA data when page changes (only if user is CVA and on CVA tab)
  useEffect(() => {
    // Skip if this is from a tab switch (to avoid double load)
    if (skipPageLoadRef.current) {
      skipPageLoadRef.current = false;
      return;
    }
    
    // Only reload if we're on CVA tab and user is CVA
    if (activeTab === 'cva' && isCVA) {
      loadPendingRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // EV Owner: Load batches
  const loadBatches = async () => {
    try {
      setLoadingBatches(true);
      console.log('🔄 Loading batches for user:', user);
      console.log('🔄 User role check - isEVOwner:', isEVOwner, 'isCVA:', isCVA);
      
      const result = await getMyBatches();
      console.log('📦 API Response:', result);
      
      if (result.success && result.data) {
        const batchesData = Array.isArray(result.data) ? result.data : [];
        console.log('✅ Loaded batches:', batchesData.length, 'batches');
        console.log('📋 Batches data:', batchesData);
        setBatches(batchesData);
        
        if (batchesData.length === 0) {
          console.warn('⚠️ No batches found. User may need to create batches from Trips page.');
        }
      } else {
        console.warn('⚠️ API returned unsuccessful response:', result);
        setBatches([]);
      }
    } catch (error) {
      console.error('❌ Error loading batches:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        userMessage: error.userMessage
      });
      // Only show notification if user has permission (to avoid annoying unauthorized users)
      if (isEVOwner) {
        const errorMessage = error.userMessage || error.response?.data?.message || error.message || 'Không thể tải danh sách batch';
        showNotification(errorMessage, 'error');
      }
      setBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  // EV Owner: Submit verification request
  const handleSubmitVerification = async () => {
    if (!selectedBatchId) {
      showNotification('Vui lòng chọn một batch', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await submitVerificationRequest(selectedBatchId);
      
      if (result.success) {
        showNotification('Gửi yêu cầu xác minh thành công!', 'success');
        setSelectedBatchId('');
        await loadBatches(); // Reload batches
      } else {
        showNotification(result.message || 'Không thể gửi yêu cầu', 'error');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Không thể gửi yêu cầu',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // CVA: Load pending requests
  const loadPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      const result = await getPendingRequests(currentPage, pageSize);
      if (result.success && result.data) {
        const pagedResult = result.data;
        setPendingRequests(Array.isArray(pagedResult.items) ? pagedResult.items : []);
        setTotalPages(pagedResult.totalPages || 1);
        setTotalCount(pagedResult.totalCount || 0);
      } else {
        setPendingRequests([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
      // Only show notification if user has permission
      if (isCVA) {
        const errorMessage = error.userMessage || error.response?.data?.message || error.message || 'Không thể tải danh sách yêu cầu';
        showNotification(errorMessage, 'error');
      }
      setPendingRequests([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoadingRequests(false);
    }
  };

  // CVA: View request details
  const handleViewRequestDetails = async (requestId) => {
    try {
      // Reset form fields before loading new request
      setAuditSummary('');
      setIsAuditSatisfactory(true);
      setReviewNotes('');
      setReasonForRejection('');
      
      const result = await getVerificationRequestById(requestId);
      if (result.success && result.data) {
        setSelectedRequest(result.data);
        setShowRequestDetails(true);
      } else {
        const errorMessage = result.message || 'Không thể tải chi tiết yêu cầu';
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      const errorMessage = error.userMessage || error.response?.data?.message || error.message || 'Không thể tải chi tiết yêu cầu';
      showNotification(errorMessage, 'error');
    }
  };

  // CVA: Review request (approve/reject)
  const handleReviewRequest = async (isApproved) => {
    if (!selectedRequest) {
      showNotification('Không có yêu cầu được chọn', 'warning');
      return;
    }

    // Validate required fields
    if (!auditSummary || auditSummary.trim().length < 10) {
      showNotification('Vui lòng nhập tóm tắt audit (ít nhất 10 ký tự)', 'warning');
      return;
    }

    if (auditSummary.length > 500) {
      showNotification('Tóm tắt audit không được vượt quá 500 ký tự', 'warning');
      return;
    }

    if (!isApproved && (!reasonForRejection || reasonForRejection.trim().length === 0)) {
      showNotification('Vui lòng nhập lý do từ chối', 'warning');
      return;
    }

    if (reasonForRejection && reasonForRejection.length > 1000) {
      showNotification('Lý do từ chối không được vượt quá 1000 ký tự', 'warning');
      return;
    }

    if (reviewNotes && reviewNotes.length > 1000) {
      showNotification('Ghi chú không được vượt quá 1000 ký tự', 'warning');
      return;
    }

    try {
      setIsReviewing(true);
      const result = await reviewVerificationRequest({
        verificationRequestId: selectedRequest.id,
        isApproved: isApproved,
        auditSummary: auditSummary,
        isAuditSatisfactory: isAuditSatisfactory,
        notes: reviewNotes || undefined,
        reasonForRejection: !isApproved ? reasonForRejection : undefined
      });
      
      if (result.success) {
        showNotification(
          isApproved ? 'Duyệt yêu cầu thành công!' : 'Từ chối yêu cầu thành công!',
          'success'
        );
        setShowRequestDetails(false);
        setSelectedRequest(null);
        setReviewNotes('');
        setAuditSummary('');
        setIsAuditSatisfactory(true);
        setReasonForRejection('');
        await loadPendingRequests(); // Reload requests
      } else {
        showNotification(result.message || 'Không thể xử lý yêu cầu', 'error');
      }
    } catch (error) {
      console.error('Error reviewing request:', error);
      const errorMessage = error.userMessage || error.response?.data?.message || error.message || 'Không thể xử lý yêu cầu';
      showNotification(errorMessage, 'error');
    } finally {
      setIsReviewing(false);
    }
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
        activePage="verification" 
        onPageChange={() => {}} 
        className={sidebarActive ? 'activemenu' : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Xác minh" />
        
        {/* Role Display Card */}
        <div className={styles.card} style={{ marginBottom: '20px' }}>
          <div className={styles.cardBody} style={{ padding: '15px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="bi bi-person-badge" style={{ fontSize: '1.5rem', color: 'var(--ev-owner-color)' }}></i>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Vai trò hiện tại:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {userRoleDisplay}
                  </div>
                </div>
              </div>
              {(!isEVOwner && !isCVA) && (
                <div style={{ 
                  padding: '8px 12px', 
                  background: 'rgba(255, 193, 7, 0.1)', 
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#ffc107'
                }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Chế độ xem chỉ đọc
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className={styles.card} style={{ marginBottom: '20px' }}>
          <div className={styles.cardHeader}>
            <div className={styles.tabContainer}>
              <button
                className={`${styles.tabButton} ${activeTab === 'evowner' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('evowner')}
              >
                <i className="bi bi-car-front me-2"></i>Chủ xe điện (EVOwner)
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'cva' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('cva')}
              >
                <i className="bi bi-shield-check me-2"></i>CVA (Duyệt yêu cầu)
              </button>
            </div>
          </div>
        </div>
        
        {/* EV Owner Tab Content */}
        {activeTab === 'evowner' && (
          <>
            <div className={styles.card} style={{ marginBottom: '20px' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Gửi yêu cầu xác minh</h3>
                {!isEVOwner && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <i className="bi bi-info-circle me-1"></i>Chỉ đọc
                  </span>
                )}
              </div>
              <div className={styles.cardBody}>
                <div style={{ marginBottom: '15px' }}>
                  <label className={styles.formLabel}>Chọn Batch:</label>
                  <select
                    className={styles.formControl}
                    value={selectedBatchId}
                    onChange={(e) => {
                      if (isEVOwner) {
                        setSelectedBatchId(e.target.value);
                      }
                    }}
                    disabled={!isEVOwner}
                  >
                    <option value="">-- Chọn batch --</option>
                    {loadingBatches ? (
                      <option value="" disabled>Đang tải...</option>
                    ) : batches.length > 0 ? (
                      batches
                        .filter(batch => {
                          // Only show batches with status "Pending" (can be submitted for verification)
                          const status = batch.status?.toLowerCase() || '';
                          return status === 'pending';
                        })
                        .map(batch => (
                          <option key={batch.id} value={batch.id}>
                            Batch #{batch.id} - {batch.journeys?.length || 0} hành trình
                          </option>
                        ))
                    ) : (
                      <option value="" disabled>Không có batch nào</option>
                    )}
                  </select>
                </div>
                <button
                  className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                  onClick={handleSubmitVerification}
                  disabled={!isEVOwner || !selectedBatchId || isSubmitting}
                  title={!isEVOwner ? 'Chỉ có Chủ xe điện (EVOwner) mới có thể gửi yêu cầu xác minh' : ''}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>Gửi yêu cầu xác minh
                    </>
                  )}
                </button>
                {!isEVOwner && (
                  <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    <i className="bi bi-lock me-1"></i>
                    Bạn cần có quyền Chủ xe điện (EVOwner) để sử dụng chức năng này.
                  </p>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Danh sách Batch {isEVOwner ? 'của tôi' : ''}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {!isEVOwner && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <i className="bi bi-info-circle me-1"></i>Chỉ đọc
                    </span>
                  )}
                  {(isEVOwner || batches.length > 0) && (
                    <button 
                      className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
                      onClick={loadBatches}
                      disabled={loadingBatches}
                      title="Làm mới danh sách batch"
                    >
                      <i className={`bi bi-arrow-clockwise me-2 ${loadingBatches ? styles.spinning : ''}`}></i>
                      {loadingBatches ? 'Đang tải...' : 'Làm mới'}
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.cardBody}>
                {loadingBatches ? (
                  <div className={styles.loadingState}>
                    <i className="bi bi-arrow-repeat"></i>
                    <p>Đang tải danh sách batch...</p>
                  </div>
                ) : batches.length > 0 ? (
                  <div className="row">
                    {batches.map((batch) => (
                      <div key={batch.id} className="col-lg-6" style={{ marginBottom: '15px' }}>
                        <JourneyBatchCard
                          batch={{
                            id: batch.id,
                            uploadDate: batch.createdAt 
                              ? new Date(batch.createdAt).toLocaleDateString('vi-VN') 
                              : (batch.journeys && batch.journeys.length > 0 && batch.journeys[0]?.startTime
                                  ? new Date(batch.journeys[0].startTime).toLocaleDateString('vi-VN')
                                  : 'N/A'),
                            tripCount: batch.journeys?.length || 0,
                            status: (() => {
                              const status = batch.status?.toLowerCase() || '';
                              switch(status) {
                                case 'pending':
                                  return 'Đang chờ';
                                case 'submittedforverification':
                                  return 'Đã gửi xác minh';
                                case 'verified':
                                  return 'Đã xác minh';
                                case 'rejected':
                                  return 'Đã từ chối';
                                case 'creditsissued':
                                  return 'Đã phát hành tín chỉ';
                                default:
                                  return batch.status || 'Không xác định';
                              }
                            })()
                          }}
                          onViewDetails={(id) => {
                            console.log('View batch details:', id);
                            showNotification('Chi tiết batch đang được phát triển', 'info');
                          }}
                          onDelete={(id) => {
                            console.log('Delete batch:', id);
                            showNotification('Tính năng xóa đang được phát triển', 'info');
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <i className="bi bi-inbox"></i>
                    <p>
                      {isEVOwner 
                        ? 'Chưa có batch nào. Hãy tạo batch từ trang Hành trình (Trips)!' 
                        : 'Không có batch nào để hiển thị.'}
                    </p>
                    {isEVOwner && (
                      <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <i className="bi bi-info-circle me-1"></i>
                        Bạn cần tạo batch từ các hành trình (journeys) có trạng thái "Pending" trong trang Hành trình.
                      </p>
                    )}
                    {!isEVOwner && (
                      <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <i className="bi bi-info-circle me-1"></i>
                        Bạn đang xem ở chế độ chỉ đọc. Chỉ có Chủ xe điện (EVOwner) mới có thể xem batch của họ.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* CVA Tab Content */}
        {activeTab === 'cva' && (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  Yêu cầu chờ duyệt {totalCount > 0 && `(${totalCount})`}
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {!isCVA && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <i className="bi bi-info-circle me-1"></i>Chỉ đọc
                    </span>
                  )}
                  <button 
                    className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
                    onClick={loadPendingRequests}
                    disabled={loadingRequests}
                    title="Làm mới danh sách yêu cầu"
                  >
                    <i className={`bi bi-arrow-clockwise me-2 ${loadingRequests ? styles.spinning : ''}`}></i>
                    {loadingRequests ? 'Đang tải...' : 'Làm mới'}
                  </button>
                </div>
              </div>
              <div className={styles.cardBody}>
                {loadingRequests ? (
                  <div className={styles.loadingState}>
                    <i className="bi bi-arrow-repeat"></i>
                    <p>Đang tải danh sách yêu cầu...</p>
                  </div>
                ) : pendingRequests.length > 0 ? (
                  <>
                    <div className={styles.requestList}>
                      {pendingRequests.map((request) => (
                        <div key={request.id} className={styles.requestItem}>
                          <div className={styles.requestInfo}>
                            <div className={styles.requestId}>
                              Yêu cầu #{request.id}
                            </div>
                            <div className={styles.requestMeta}>
                              <span>
                                <i className="bi bi-calendar me-1"></i>
                                {request.requestDate ? new Date(request.requestDate).toLocaleDateString('vi-VN') : 'N/A'}
                              </span>
                              <span>
                                <i className="bi bi-box-seam me-1"></i>
                                Batch: {request.journeyBatchId}
                              </span>
                              <span>
                                <i className="bi bi-person me-1"></i>
                                Requestor: {request.requestorId || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <button
                            className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
                            onClick={() => handleViewRequestDetails(request.id)}
                            disabled={!isCVA}
                            title={!isCVA ? 'Chỉ có CVA mới có thể xem chi tiết và duyệt yêu cầu' : ''}
                          >
                            <i className="bi bi-eye me-2"></i>Xem chi tiết
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className={styles.pagination}>
                        <button
                          className={styles.pageButton}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1 || !isCVA}
                        >
                          <i className="bi bi-chevron-left"></i> Trước
                        </button>
                        <span className={styles.pageInfo}>
                          Trang {currentPage} / {totalPages}
                        </span>
                        <button
                          className={styles.pageButton}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages || !isCVA}
                        >
                          Sau <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <i className="bi bi-check-circle"></i>
                    <p>Không có yêu cầu nào đang chờ duyệt</p>
                    {!isCVA && (
                      <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <i className="bi bi-info-circle me-1"></i>
                        Bạn đang xem ở chế độ chỉ đọc. Chỉ có CVA mới có thể duyệt yêu cầu xác minh.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}


        {/* Request Details Modal (CVA) - Only show if user is CVA */}
        {showRequestDetails && selectedRequest && isCVA && (
          <div 
            className={styles.modalOverlay}
            onClick={() => {
              setShowRequestDetails(false);
              setSelectedRequest(null);
              setReviewNotes('');
            }}
          >
            <div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Chi tiết yêu cầu xác minh</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => {
                    setShowRequestDetails(false);
                    setSelectedRequest(null);
                    setReviewNotes('');
                    setAuditSummary('');
                    setIsAuditSatisfactory(true);
                    setReasonForRejection('');
                  }}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.detailItem}>
                  <strong>ID yêu cầu:</strong>
                  <span>{selectedRequest.id}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Batch ID:</strong>
                  <span>{selectedRequest.journeyBatchId}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Trạng thái:</strong>
                  <span>
                    {(() => {
                      const status = selectedRequest.status?.toLowerCase() || '';
                      switch(status) {
                        case 'pending':
                          return 'Đang chờ';
                        case 'approved':
                          return 'Đã duyệt';
                        case 'rejected':
                          return 'Đã từ chối';
                        case 'inprogress':
                          return 'Đang xử lý';
                        default:
                          return selectedRequest.status || 'N/A';
                      }
                    })()}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Ngày gửi:</strong>
                  <span>
                    {selectedRequest.requestDate 
                      ? new Date(selectedRequest.requestDate).toLocaleString('vi-VN')
                      : 'N/A'}
                  </span>
                </div>
                {selectedRequest.verificationDate && (
                  <div className={styles.detailItem}>
                    <strong>Ngày xác minh:</strong>
                    <span>
                      {new Date(selectedRequest.verificationDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
                {selectedRequest.journeyBatch && (
                  <>
                    <div className={styles.detailItem}>
                      <strong>Số hành trình:</strong>
                      <span>{selectedRequest.journeyBatch.journeys?.length || 0}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Tổng tín chỉ carbon:</strong>
                      <span>{selectedRequest.journeyBatch.totalCarbonCredits || 0} kg CO2e</span>
                    </div>
                  </>
                )}
                
                <div style={{ marginTop: '20px' }}>
                  <label className={styles.formLabel}>
                    Tóm tắt Audit <span style={{ color: '#ff6b6b' }}>*</span>
                  </label>
                  <textarea
                    className={styles.formControl}
                    rows="3"
                    value={auditSummary}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setAuditSummary(value);
                      }
                    }}
                    placeholder="Nhập tóm tắt audit (ít nhất 10 ký tự, tối đa 500 ký tự)..."
                    required
                    maxLength={500}
                  />
                  <small style={{ 
                    color: auditSummary.length < 10 ? '#ff6b6b' : 'var(--text-secondary)', 
                    fontSize: '0.8rem' 
                  }}>
                    {auditSummary.length}/500 ký tự {auditSummary.length < 10 ? '(tối thiểu 10 ký tự)' : ''}
                  </small>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={isAuditSatisfactory}
                      onChange={(e) => setIsAuditSatisfactory(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Kết quả audit đạt yêu cầu</span>
                  </label>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label className={styles.formLabel}>Ghi chú (tùy chọn):</label>
                  <textarea
                    className={styles.formControl}
                    rows="3"
                    value={reviewNotes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 1000) {
                        setReviewNotes(value);
                      }
                    }}
                    placeholder="Nhập ghi chú bổ sung..."
                    maxLength={1000}
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {reviewNotes.length}/1000 ký tự
                  </small>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label className={styles.formLabel}>Lý do từ chối (nếu từ chối):</label>
                  <textarea
                    className={styles.formControl}
                    rows="3"
                    value={reasonForRejection}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 1000) {
                        setReasonForRejection(value);
                      }
                    }}
                    placeholder="Nhập lý do từ chối (nếu từ chối yêu cầu)..."
                    maxLength={1000}
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {reasonForRejection.length}/1000 ký tự
                  </small>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button
                  className={`${styles.btnCustom}`}
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                  onClick={() => {
                    setShowRequestDetails(false);
                    setSelectedRequest(null);
                    setReviewNotes('');
                    setAuditSummary('');
                    setIsAuditSatisfactory(true);
                    setReasonForRejection('');
                  }}
                  disabled={isReviewing}
                >
                  Hủy
                </button>
                <button
                  className={`${styles.btnCustom}`}
                  style={{ background: '#ff6b6b', color: 'white' }}
                  onClick={() => handleReviewRequest(false)}
                  disabled={!isCVA || isReviewing}
                  title={!isCVA ? 'Chỉ có CVA mới có thể duyệt/từ chối yêu cầu' : ''}
                >
                  {isReviewing ? 'Đang xử lý...' : 'Từ chối'}
                </button>
                <button
                  className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                  onClick={() => handleReviewRequest(true)}
                  disabled={!isCVA || isReviewing}
                  title={!isCVA ? 'Chỉ có CVA mới có thể duyệt/từ chối yêu cầu' : ''}
                >
                  {isReviewing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>Duyệt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;

