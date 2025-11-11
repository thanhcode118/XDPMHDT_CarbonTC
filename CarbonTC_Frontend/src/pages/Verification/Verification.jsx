import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import {
  getPendingRequests,
  getVerificationRequestById,
  reviewVerificationRequest,
  getCvaStandards,
  getRequestsByStatus
} from '../../services/verificationService';
import styles from './Verification.module.css';

const Verification = ({ showNotification: propShowNotification }) => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification: hookShowNotification } = useNotification();
  const showNotification = propShowNotification || hookShowNotification;
  const { user } = useAuth();
  
  // Determine user role
  const isCVA = user?.roleName === 'CVA' || user?.role === 'CVA';
  
  // Status filter tabs: 'pending', 'approved', 'rejected', 'all'
  const [activeStatusTab, setActiveStatusTab] = useState('pending');
  
  // CVA states
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [auditSummary, setAuditSummary] = useState('');
  const [isAuditSatisfactory, setIsAuditSatisfactory] = useState(true);
  const [reasonForRejection, setReasonForRejection] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [cvaStandards, setCvaStandards] = useState([]);
  const [selectedCvaStandardId, setSelectedCvaStandardId] = useState('');
  const [showCvaStandardDropdown, setShowCvaStandardDropdown] = useState(false);
  const selectWrapperRef = useRef(null);
  
  // Pagination for CVA
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    console.log('🔍 Verification page - User:', user);
    setLoading(false);
    // Load stats and requests immediately
    loadStats();
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Reload CVA data when page or status tab changes
  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeStatusTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCvaStandardDropdown && selectWrapperRef.current && !selectWrapperRef.current.contains(event.target)) {
        setShowCvaStandardDropdown(false);
      }
    };

    if (showCvaStandardDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCvaStandardDropdown]);

  // Load stats for all statuses
  const loadStats = async () => {
    try {
      // Load stats for pending, approved, rejected
      const [pendingResult, approvedResult, rejectedResult] = await Promise.all([
        getPendingRequests(1, 1).catch(() => ({ success: false, data: { totalCount: 0 } })),
        getRequestsByStatus(1, 1, 1).catch(() => ({ success: false, data: { totalCount: 0 } })),
        getRequestsByStatus(2, 1, 1).catch(() => ({ success: false, data: { totalCount: 0 } }))
      ]);

      setStats({
        pending: pendingResult.data?.totalCount || 0,
        approved: approvedResult.data?.totalCount || 0,
        rejected: rejectedResult.data?.totalCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // CVA: Load requests based on active status tab
  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      let result;
      
      if (activeStatusTab === 'pending') {
        console.log('🔄 Loading pending requests - Page:', currentPage, 'Size:', pageSize);
        result = await getPendingRequests(currentPage, pageSize);
      } else if (activeStatusTab === 'approved') {
        console.log('🔄 Loading approved requests - Page:', currentPage, 'Size:', pageSize);
        result = await getRequestsByStatus(1, currentPage, pageSize); // 1 = Approved
      } else if (activeStatusTab === 'rejected') {
        console.log('🔄 Loading rejected requests - Page:', currentPage, 'Size:', pageSize);
        result = await getRequestsByStatus(2, currentPage, pageSize); // 2 = Rejected
      } else {
        // 'all' - load all (we'll use pending endpoint as fallback, or implement getAll)
        result = await getPendingRequests(currentPage, pageSize);
      }
      
      console.log('📦 API Response:', result);
      
      if (result.success && result.data) {
        const pagedResult = result.data;
        const items = Array.isArray(pagedResult.items) ? pagedResult.items : [];
        const total = pagedResult.totalCount || 0;
        const pages = pagedResult.totalPages || 1;
        
        console.log('✅ Loaded requests:', {
          status: activeStatusTab,
          items: items.length,
          total: total,
          pages: pages,
          currentPage: currentPage
        });
        
        setRequests(items);
        setTotalPages(pages);
        setTotalCount(total);
      } else {
        console.warn('⚠️ API returned unsuccessful response:', result);
        setRequests([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('❌ Error loading requests:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        userMessage: error.userMessage
      });
      
      const errorMessage = error.userMessage || error.response?.data?.message || error.message || 'Không thể tải danh sách yêu cầu';
        showNotification(errorMessage, 'error');
      setRequests([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Helper function to normalize status
  const normalizeStatus = (status) => {
    if (typeof status === 'string') {
      return status.toLowerCase();
    } else if (typeof status === 'number') {
      return String(status).toLowerCase();
    } else if (status) {
      return String(status).toLowerCase();
    }
    return '';
  };

  // Helper function to check request status
  const isRequestPending = (status) => {
    const statusStr = normalizeStatus(status);
    return statusStr === 'pending' || statusStr === '0';
  };

  const isRequestApproved = (status) => {
    const statusStr = normalizeStatus(status);
    return statusStr === 'approved' || statusStr === '1';
  };

  const isRequestRejected = (status) => {
    const statusStr = normalizeStatus(status);
    return statusStr === 'rejected' || statusStr === '2';
  };

  // Helper function to get status display (similar to BatchDetailsModal)
  const getStatusDisplay = (status) => {
    const statusStr = normalizeStatus(status);
    
    switch (statusStr) {
      case 'pending':
      case '0':
        return { text: 'Đang chờ', color: '#ffc107', bg: 'rgba(255, 193, 7, 0.2)' };
      case 'approved':
      case '1':
        return { text: 'Đã duyệt', color: '#28a745', bg: 'rgba(40, 167, 69, 0.2)' };
      case 'rejected':
      case '2':
        return { text: 'Đã từ chối', color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.2)' };
      case 'inprogress':
      case 'in_progress':
      case '3':
        return { text: 'Đang xử lý', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' };
      default:
        return { text: status || 'N/A', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.2)' };
    }
  };

  // CVA: View request details
  const handleViewRequestDetails = async (requestId) => {
    try {
      console.log('🔍 Opening request details for:', requestId);
      // Reset form fields before loading new request
      setAuditSummary('');
      setIsAuditSatisfactory(true);
      setReviewNotes('');
      setReasonForRejection('');
      setSelectedCvaStandardId('');
      setShowCvaStandardDropdown(false);
      
      const result = await getVerificationRequestById(requestId);
      console.log('📋 Request details result:', result);
      console.log('📋 Request status type:', typeof result.data?.status, 'value:', result.data?.status);
      
      if (result.success && result.data) {
        setSelectedRequest(result.data);
        setShowRequestDetails(true);
        console.log('✅ Modal should be visible now');
        
        // Fetch CVA standards after successfully loading request details
        try {
          const standardsResult = await getCvaStandards(true);
          if (standardsResult.success && standardsResult.data) {
            const standardsData = Array.isArray(standardsResult.data) ? standardsResult.data : [];
            setCvaStandards(standardsData);
            console.log('✅ Loaded CVA standards:', standardsData.length);
          } else {
            console.warn('⚠️ Failed to fetch CVA standards:', standardsResult.message);
            setCvaStandards([]);
          }
        } catch (standardsError) {
          console.error('❌ Error fetching CVA standards:', standardsError);
          const errorMessage = standardsError.userMessage || standardsError.response?.data?.message || standardsError.message || 'Không thể tải danh sách tiêu chuẩn';
          showNotification(errorMessage, 'error');
          setCvaStandards([]);
        }
      } else {
        const errorMessage = result.message || 'Không thể tải chi tiết yêu cầu';
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching request details:', error);
      const errorMessage = error.userMessage || error.response?.data?.message || error.message || 'Không thể tải chi tiết yêu cầu';
      showNotification(errorMessage, 'error');
    }
  };

  // CVA: Review request (approve/reject)
  const handleReviewRequest = async (isApproved) => {
    console.log('🔄 Review request - isApproved:', isApproved);
    console.log('📋 Selected request:', selectedRequest);
    console.log('📝 Form data:', {
      auditSummary: auditSummary,
      selectedCvaStandardId: selectedCvaStandardId,
      reasonForRejection: reasonForRejection,
      isAuditSatisfactory: isAuditSatisfactory
    });
    
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

    // Validate CVA Standard ID when approving
    if (isApproved && !selectedCvaStandardId) {
      showNotification('Vui lòng chọn tiêu chuẩn xác minh', 'warning');
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
      const reviewData = {
        verificationRequestId: selectedRequest.id,
        isApproved: isApproved,
        auditSummary: auditSummary,
        isAuditSatisfactory: isAuditSatisfactory,
        notes: reviewNotes || undefined,
        reasonForRejection: !isApproved ? reasonForRejection : undefined,
        cvaStandardId: isApproved ? selectedCvaStandardId : undefined
      };
      
      console.log('📤 Sending review request:', reviewData);
      const result = await reviewVerificationRequest(reviewData);
      console.log('📥 Review response:', result);
      
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
        setSelectedCvaStandardId('');
        setShowCvaStandardDropdown(false);
        await loadRequests(); // Reload requests
        await loadStats(); // Reload stats
      } else {
        showNotification(result.message || 'Không thể xử lý yêu cầu', 'error');
      }
    } catch (error) {
      console.error('❌ Error reviewing request:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
        
        {/* Stats Cards for CVA */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(255, 193, 7, 0.2)' }}>
              <i className="bi bi-clock-history" style={{ color: '#ffc107' }}></i>
                  </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.pending}</div>
              <div className={styles.statLabel}>Chờ duyệt</div>
                </div>
              </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(40, 167, 69, 0.2)' }}>
              <i className="bi bi-check-circle" style={{ color: '#28a745' }}></i>
                </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.approved}</div>
              <div className={styles.statLabel}>Đã duyệt</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(255, 107, 107, 0.2)' }}>
              <i className="bi bi-x-circle" style={{ color: '#ff6b6b' }}></i>
        </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.rejected}</div>
              <div className={styles.statLabel}>Đã từ chối</div>
            </div>
          </div>
        </div>
        
        {/* Status Tabs */}
        <div className={styles.tabCard}>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${activeStatusTab === 'pending' ? styles.tabActive : ''}`}
              onClick={() => {
                setActiveStatusTab('pending');
                setCurrentPage(1);
              }}
            >
              <i className="bi bi-clock-history"></i>
              <span>Chờ duyệt</span>
              {stats.pending > 0 && (
                <span className={styles.tabBadge}>{stats.pending}</span>
              )}
            </button>
                <button
              className={`${styles.tabButton} ${activeStatusTab === 'approved' ? styles.tabActive : ''}`}
              onClick={() => {
                setActiveStatusTab('approved');
                setCurrentPage(1);
              }}
            >
              <i className="bi bi-check-circle"></i>
              <span>Đã duyệt</span>
              {stats.approved > 0 && (
                <span className={styles.tabBadge}>{stats.approved}</span>
                  )}
                </button>
                    <button 
              className={`${styles.tabButton} ${activeStatusTab === 'rejected' ? styles.tabActive : ''}`}
              onClick={() => {
                setActiveStatusTab('rejected');
                setCurrentPage(1);
              }}
            >
              <i className="bi bi-x-circle"></i>
              <span>Đã từ chối</span>
              {stats.rejected > 0 && (
                <span className={styles.tabBadge}>{stats.rejected}</span>
              )}
            </button>
                </div>
              </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <i className={`bi ${
                    activeStatusTab === 'pending' ? 'bi-clock-history' :
                    activeStatusTab === 'approved' ? 'bi-check-circle' :
                    'bi-x-circle'
                  }`}></i>
                <h3 className={styles.cardTitle}>
                    {activeStatusTab === 'pending' && 'Yêu cầu chờ duyệt'}
                    {activeStatusTab === 'approved' && 'Yêu cầu đã duyệt'}
                    {activeStatusTab === 'rejected' && 'Yêu cầu đã từ chối'}
                    {totalCount > 0 && <span className={styles.countBadge}>{totalCount}</span>}
                </h3>
                </div>
                <div className={styles.cardHeaderRight}>
                  <button 
                    className={`${styles.btnCustom} ${styles.btnIcon}`}
                    onClick={() => {
                      loadRequests();
                      loadStats();
                    }}
                    disabled={loadingRequests}
                    title="Làm mới danh sách yêu cầu"
                  >
                    <i className={`bi bi-arrow-clockwise ${loadingRequests ? styles.spinning : ''}`}></i>
                  </button>
                </div>
              </div>
              <div className={styles.cardBody}>
                {loadingRequests ? (
                  <div className={styles.loadingState}>
                    <i className="bi bi-arrow-repeat"></i>
                    <p>Đang tải danh sách yêu cầu...</p>
                  </div>
                ) : requests.length > 0 ? (
                  <>
                    <div className={styles.requestList}>
                      {requests.map((request) => (
                        <div key={request.id} className={styles.requestCard}>
                          <div className={styles.requestHeader}>
                            <div className={styles.requestId}>
                              <i className="bi bi-file-earmark-text"></i>
                              <span>Yêu cầu #{request.id}</span>
                            </div>
                            <span 
                              className={styles.requestStatus}
                              style={(() => {
                                const statusInfo = getStatusDisplay(request.status);
                                return {
                                  background: statusInfo.bg,
                                  color: statusInfo.color
                                };
                              })()}
                            >
                              {(() => {
                                const statusInfo = getStatusDisplay(request.status);
                                return statusInfo.text;
                              })()}
                            </span>
                          </div>
                          <div className={styles.requestBody}>
                            <div className={styles.requestMeta}>
                              <div className={styles.metaItem}>
                                <i className="bi bi-calendar"></i>
                              <span>
                                  {request.requestDate 
                                    ? new Date(request.requestDate).toLocaleDateString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })
                                    : 'N/A'}
                              </span>
                            </div>
                              <div className={styles.metaItem}>
                                <i className="bi bi-box-seam"></i>
                                <span>Batch: {request.journeyBatchId}</span>
                          </div>
                              <div className={styles.metaItem}>
                                <i className="bi bi-person"></i>
                                <span>Requestor: {request.requestorId || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className={styles.requestActions}>
                          <button
                              className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnView}`}
                            onClick={() => handleViewRequestDetails(request.id)}
                          >
                              <i className="bi bi-eye"></i>
                              <span>Xem chi tiết</span>
                          </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination - Redesigned */}
                    {totalPages > 1 && (
                      <div className={styles.pagination}>
                        <button
                          className={styles.pageButton}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <i className="bi bi-chevron-left"></i>
                          <span>Trước</span>
                        </button>
                        <div className={styles.pageInfo}>
                          <span className={styles.pageCurrent}>{currentPage}</span>
                          <span className={styles.pageSeparator}>/</span>
                          <span className={styles.pageTotal}>{totalPages}</span>
                        </div>
                        <button
                          className={styles.pageButton}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <span>Sau</span>
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                    <i className="bi bi-check-circle"></i>
                  </div>
                    <h4>
                      {activeStatusTab === 'pending' && 'Không có yêu cầu nào đang chờ duyệt'}
                      {activeStatusTab === 'approved' && 'Không có yêu cầu nào đã duyệt'}
                      {activeStatusTab === 'rejected' && 'Không có yêu cầu nào đã từ chối'}
                    </h4>
                    <div className={styles.infoBox}>
                      <i className="bi bi-info-circle"></i>
                      <span>
                        {activeStatusTab === 'pending' && 'Hiện tại không có yêu cầu xác minh nào đang chờ duyệt. Các yêu cầu mới sẽ xuất hiện ở đây khi được gửi lên.'}
                        {activeStatusTab === 'approved' && 'Chưa có yêu cầu nào được duyệt. Các yêu cầu đã duyệt sẽ hiển thị ở đây.'}
                        {activeStatusTab === 'rejected' && 'Chưa có yêu cầu nào bị từ chối. Các yêu cầu đã từ chối sẽ hiển thị ở đây.'}
                      </span>
              </div>
            </div>
        )}
              </div>
            </div>

        {/* Request Details Modal - Redesigned */}
        {showRequestDetails && selectedRequest && (
          <div 
            className={styles.modalOverlay}
            onClick={() => {
              setShowRequestDetails(false);
              setSelectedRequest(null);
              setReviewNotes('');
              setSelectedCvaStandardId('');
              setShowCvaStandardDropdown(false);
            }}
          >
            <div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderLeft}>
                  <i className="bi bi-file-earmark-text-fill"></i>
                <h3>Chi tiết yêu cầu xác minh</h3>
                </div>
                <button
                  className={styles.closeButton}
              onClick={() => {
                setShowRequestDetails(false);
                setSelectedRequest(null);
                setReviewNotes('');
                setAuditSummary('');
                setIsAuditSatisfactory(true);
                setReasonForRejection('');
                setSelectedCvaStandardId('');
                setShowCvaStandardDropdown(false);
              }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              
              <div className={styles.modalBody}>
                {/* Request Info Section */}
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>
                    <i className="bi bi-info-circle"></i>
                    Thông tin yêu cầu
                  </h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>ID yêu cầu</span>
                      <span className={styles.infoValue}>#{selectedRequest.id}</span>
                </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Batch ID</span>
                      <span className={styles.infoValue}>#{selectedRequest.journeyBatchId}</span>
                </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Trạng thái</span>
                    {(() => {
                        const statusInfo = getStatusDisplay(selectedRequest.status);
                        return (
                          <span 
                            className={styles.statusBadge}
                            style={{
                              background: statusInfo.bg,
                              color: statusInfo.color,
                              padding: '4px 12px',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              display: 'inline-block'
                            }}
                          >
                            {statusInfo.text}
                  </span>
                        );
                      })()}
                </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Ngày gửi</span>
                      <span className={styles.infoValue}>
                    {selectedRequest.requestDate 
                      ? new Date(selectedRequest.requestDate).toLocaleString('vi-VN')
                      : 'N/A'}
                  </span>
                </div>
                {selectedRequest.verificationDate && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Ngày xác minh</span>
                        <span className={styles.infoValue}>
                      {new Date(selectedRequest.verificationDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
                {selectedRequest.journeyBatch && (
                  <>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Số hành trình</span>
                          <span className={styles.infoValue}>
                            {selectedRequest.journeyBatch.journeys?.length || selectedRequest.journeyBatch.eVJourneys?.length || 0}
                          </span>
                    </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Tổng tín chỉ carbon</span>
                          <span className={styles.infoValue}>
                            {selectedRequest.journeyBatch.totalCarbonCredits || selectedRequest.journeyBatch.totalCO2Reduced || 0}
                          </span>
                    </div>
                        {selectedRequest.journeyBatch.createdAt && (
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Ngày tạo batch</span>
                            <span className={styles.infoValue}>
                              {new Date(selectedRequest.journeyBatch.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                  </>
                )}
                  </div>
                </div>

                {/* Batch Details Section - Similar to BatchDetailsModal */}
                {selectedRequest.journeyBatch && (selectedRequest.journeyBatch.journeys || selectedRequest.journeyBatch.eVJourneys) && (
                  <div className={styles.infoSection} style={{ marginTop: '30px' }}>
                    <h4 className={styles.sectionTitle}>
                      <i className="bi bi-list-ul"></i>
                      Chi tiết Batch
                    </h4>
                    <div className={styles.batchDetailsSection}>
                      <div className={styles.batchSummary}>
                        <div className={styles.summaryItem}>
                          <i className="bi bi-box-seam"></i>
                          <span>Batch ID: #{selectedRequest.journeyBatch.id?.substring(0, 8) || selectedRequest.journeyBatch.id}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <i className="bi bi-list-ol"></i>
                          <span>
                            Số hành trình: {(selectedRequest.journeyBatch.journeys || selectedRequest.journeyBatch.eVJourneys || []).length}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <i className="bi bi-award"></i>
                          <span>
                            Tổng tín chỉ: {selectedRequest.journeyBatch.totalCarbonCredits || selectedRequest.journeyBatch.totalCO2Reduced || 0}
                          </span>
                        </div>
                      </div>
                      
                      {(selectedRequest.journeyBatch.journeys || selectedRequest.journeyBatch.eVJourneys || []).length > 0 && (
                        <div className={styles.journeysList}>
                          <h5>
                            Danh sách hành trình ({(selectedRequest.journeyBatch.journeys || selectedRequest.journeyBatch.eVJourneys || []).length})
                          </h5>
                          <div className={styles.journeysContainer}>
                            {(selectedRequest.journeyBatch.journeys || selectedRequest.journeyBatch.eVJourneys || []).slice(0, 5).map((journey, index) => {
                              const startTime = journey.startTime ? new Date(journey.startTime) : null;
                              return (
                                <div key={journey.id || index} className={styles.journeyItem}>
                                  <div className={styles.journeyHeader}>
                                    <span className={styles.journeyNumber}>#{index + 1}</span>
                                    {startTime && (
                                      <span className={styles.journeyDate}>
                                        {startTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                      </span>
                                    )}
                                  </div>
                                  <div className={styles.journeyDetails}>
                                    <div className={styles.journeyDetailRow}>
                                      <i className="bi bi-geo-alt-fill"></i>
                                      <span>{journey.origin || 'N/A'}</span>
                                      <i className="bi bi-arrow-right"></i>
                                      <span>{journey.destination || 'N/A'}</span>
                                    </div>
                                    <div className={styles.journeyDetailRow}>
                                      <i className="bi bi-speedometer2"></i>
                                      <span>{journey.distanceKm || journey.distance || 0} km</span>
                                      <i className="bi bi-award"></i>
                                      <span>{journey.calculatedCarbonCredits?.toFixed(2) || journey.carbonCredits?.toFixed(2) || '0.00'} kg CO₂</span>
                                    </div>
                                    {journey.vehicleType && (
                                      <div className={styles.journeyDetailRow}>
                                        <i className="bi bi-car-front"></i>
                                        <span>{journey.vehicleType}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {(selectedRequest.journeyBatch.journeys || selectedRequest.journeyBatch.eVJourneys || []).length > 5 && (
                              <div className={styles.moreJourneys}>
                                <i className="bi bi-three-dots"></i>
                                <span>Và {(selectedRequest.journeyBatch.journeys || selectedRequest.journeyBatch.eVJourneys || []).length - 5} hành trình khác...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Review Form Section - Only show for Pending or Rejected requests */}
                {!isRequestApproved(selectedRequest.status) && (
                  <div className={styles.formSection}>
                    <h4 className={styles.sectionTitle}>
                      <i className="bi bi-clipboard-check"></i>
                      {isRequestRejected(selectedRequest.status) ? 'Duyệt lại yêu cầu' : 'Đánh giá và duyệt'}
                    </h4>
                    
                    <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                        <i className="bi bi-file-text"></i>
                        Tóm tắt Audit
                        <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={styles.formControl}
                        rows="4"
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
                      <div className={styles.charCount}>
                        <span className={auditSummary.length < 10 ? styles.charCountWarning : ''}>
                          {auditSummary.length}
                        </span>
                        <span>/500 ký tự</span>
                        {auditSummary.length < 10 && (
                          <span className={styles.charCountWarning}> (tối thiểu 10 ký tự)</span>
                        )}
                      </div>
                </div>

                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isAuditSatisfactory}
                      onChange={(e) => setIsAuditSatisfactory(e.target.checked)}
                          className={styles.checkbox}
                    />
                        <span className={styles.checkboxText}>
                          <i className="bi bi-check-circle"></i>
                          Kết quả audit đạt yêu cầu
                        </span>
                  </label>
                </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        <i className="bi bi-sticky"></i>
                        Ghi chú (tùy chọn)
                      </label>
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
                      <div className={styles.charCount}>
                        <span>{reviewNotes.length}</span>
                        <span>/1000 ký tự</span>
                      </div>
                </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        <i className="bi bi-award"></i>
                        Tiêu chuẩn xác minh (CVA Standard)
                        <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.selectWrapper} ref={selectWrapperRef}>
                        <div
                          className={styles.formControl}
                          onClick={() => setShowCvaStandardDropdown(!showCvaStandardDropdown)}
                        >
                          <span>
                            {selectedCvaStandardId
                              ? cvaStandards.find(s => s.id === selectedCvaStandardId)?.standardName || '-- Chọn tiêu chuẩn --'
                              : '-- Chọn tiêu chuẩn --'}
                          </span>
                          <i className={`bi bi-chevron-down ${showCvaStandardDropdown ? styles.rotateIcon : ''}`}></i>
                        </div>
                        {showCvaStandardDropdown && (
                          <div className={styles.selectDropdown}>
                            {cvaStandards.map((standard) => (
                              <div
                                key={standard.id}
                                className={`${styles.selectOption} ${selectedCvaStandardId === standard.id ? styles.selected : ''}`}
                                onClick={() => {
                                  setSelectedCvaStandardId(standard.id);
                                  setShowCvaStandardDropdown(false);
                                }}
                              >
                                {standard.standardName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {isRequestPending(selectedRequest.status) && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          <i className="bi bi-x-circle"></i>
                          Lý do từ chối (nếu từ chối)
                        </label>
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
                        <div className={styles.charCount}>
                          <span>{reasonForRejection.length}</span>
                          <span>/1000 ký tự</span>
                </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Approved Request Info Section - Show when request is already approved */}
                {isRequestApproved(selectedRequest.status) && (
                  <div className={styles.infoSection} style={{ marginTop: '30px' }}>
                    <h4 className={styles.sectionTitle}>
                      <i className="bi bi-check-circle"></i>
                      Thông tin duyệt
                    </h4>
                    <div className={styles.infoGrid}>
                      {selectedRequest.cvaStandard && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Tiêu chuẩn đã áp dụng</span>
                          <span className={styles.infoValue}>{selectedRequest.cvaStandard.standardName || 'N/A'}</span>
                        </div>
                      )}
                      {selectedRequest.notes && (
                        <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                          <span className={styles.infoLabel}>Ghi chú</span>
                          <span className={styles.infoValue}>{selectedRequest.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejected Request Info Section - Show when request is rejected */}
                {isRequestRejected(selectedRequest.status) && selectedRequest.notes && (
                  <div className={styles.infoSection} style={{ marginTop: '30px' }}>
                    <h4 className={styles.sectionTitle}>
                      <i className="bi bi-x-circle"></i>
                      Lý do từ chối
                    </h4>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                        <span className={styles.infoLabel}>Lý do</span>
                        <span className={styles.infoValue} style={{ color: '#ff6b6b' }}>{selectedRequest.notes}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.modalFooter}>
                <button
                  className={`${styles.btnCustom} ${styles.btnCancel}`}
              onClick={() => {
                setShowRequestDetails(false);
                setSelectedRequest(null);
                setReviewNotes('');
                setAuditSummary('');
                setIsAuditSatisfactory(true);
                setReasonForRejection('');
                setSelectedCvaStandardId('');
                setShowCvaStandardDropdown(false);
              }}
                  disabled={isReviewing}
                >
                  <i className="bi bi-x"></i>
                  <span>Đóng</span>
                </button>
                {/* Only show action buttons for Pending or Rejected requests */}
                {!isRequestApproved(selectedRequest.status) && (
                  <>
                    {isRequestPending(selectedRequest.status) && (
                <button
                        className={`${styles.btnCustom} ${styles.btnReject}`}
                  onClick={() => handleReviewRequest(false)}
                        disabled={isReviewing}
                >
                        <i className="bi bi-x-circle"></i>
                        <span>{isReviewing ? 'Đang xử lý...' : 'Từ chối'}</span>
                </button>
                    )}
                <button
                      className={`${styles.btnCustom} ${styles.btnApprove}`}
                  onClick={() => handleReviewRequest(true)}
                      disabled={isReviewing}
                >
                  {isReviewing ? (
                    <>
                          <span className="spinner-border spinner-border-sm"></span>
                          <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                          <i className="bi bi-check-circle"></i>
                          <span>{isRequestRejected(selectedRequest.status) ? 'Duyệt lại' : 'Duyệt'}</span>
                    </>
                  )}
                </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
