import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import StatCard from '../../components/StatCard/StatCard';
import TransactionFilter from '../../components/TransactionFilter/TransactionFilter';
import TransactionItem from '../../components/TransactionItemTrading/TransactionItem';
import TransactionDetailModal from '../../components/TransactionDetailModal/TransactionDetailModal';
import Pagination from '../../components/Pagination/Pagination';
import PDFViewerModal from '../../components/PDFViewerModal/PDFViewerModal';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import { getCertificate } from '../../services/transactionService';
import styles from './Transactions.module.css';

import { getSalesTransactions, getPurchasesTransactions, getTransactionSummary, exportTransactionStatement } from '../../services/listingService'

const mapApiStatusToFe = (statusEnum) => {
  switch (statusEnum) {
    case 1: return 'pending';
    case 2: return 'completed';
    case 3: return 'cancelled';
    case 4: return 'failed';
    default: return 'unknown';
  }
};

const Transactions = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [statsData, setStatsData] = useState(null); 
  const [statsLoading, setStatsLoading] = useState(true);

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const [activeTab, setActiveTab] = useState('sales'); // 'sales' hoặc 'purchases'
  const [queryParams, setQueryParams] = useState({ // State cho bộ lọc
    pageNumber: 1,
    pageSize: 10,
    status: null,
    startDate: null,
    endDate: null,
    minAmount: null,
    maxAmount: null,
    sortBy: 'CreatedAt',
    sortDescending: true
  });
  const [paginationData, setPaginationData] = useState(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const mapStatsData = () => {
    if (!statsData) {
        // Trả về mảng rỗng hoặc skeleton UI khi đang tải
        return [];
    }

    // Helper để xác định loại thay đổi
    const getChangeType = (change) => change > 0 ? 'positive' : (change < 0 ? 'negative' : 'neutral');

    return [
        {
            type: '1',
            icon: 'bi-arrow-left-right-fill',
            value: statsData.totalTransactions.toLocaleString(),
            label: 'Tổng giao dịch',
            change: `${statsData.totalTransactionsChange}%`,
            changeType: getChangeType(statsData.totalTransactionsChange)
        },
        {
            type: '2',
            icon: 'bi-check-circle-fill',
            value: statsData.successfulTransactions.toLocaleString(),
            label: 'Giao dịch thành công',
            change: `${statsData.successfulTransactionsChange}%`,
            changeType: getChangeType(statsData.successfulTransactionsChange)
        },
        {
            type: '3',
            icon: 'bi-clock-fill',
            value: statsData.pendingTransactions.toLocaleString(),
            label: 'Đang xử lý',
            change: `${statsData.pendingTransactionsChange}%`,
            changeType: getChangeType(statsData.pendingTransactionsChange)
        },
        {
            type: '4',
            icon: 'bi-currency-dollar',
            value: statsData.totalRevenue.toLocaleString(),
            label: 'Tổng doanh thu (VNĐ)',
            change: `${statsData.totalRevenueChange}%`,
            changeType: getChangeType(statsData.totalRevenueChange)
        }
    ];
  };

  const mappedStats = mapStatsData();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        let response;
        const cleanParams = {};
        for (const key in queryParams) {
          if (queryParams[key] !== null && queryParams[key] !== '') {
            cleanParams[key] = queryParams[key];
          }
        }

        if (activeTab === 'sales') {
          response = await getSalesTransactions(cleanParams);
        } else {
          response = await getPurchasesTransactions(cleanParams);
        }

        if (response.data && response.data.success) {
          setTransactions(response.data.data.items);
          setPaginationData({
             totalCount: response.data.data.totalCount,
             pageNumber: response.data.data.pageNumber,
             pageSize: response.data.data.pageSize,
             totalPages: response.data.data.totalPages,
          });
        } else {
          showNotification('Không thể tải lịch sử giao dịch', 'error');
        }
      } catch (err) {
        showNotification(err.message || 'Lỗi kết nối server', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();  
  }, [activeTab, queryParams, showNotification]);

  useEffect(() => {
    const fetchSummary = async () => {
        setStatsLoading(true);
        try {
            const response = await getTransactionSummary();
            if (response.data && response.data.success) {
                setStatsData(response.data.data);
            } else {
                showNotification('Không thể tải thống kê', 'error');
            }
        } catch (err) {
            showNotification(err.message || 'Lỗi tải thống kê', 'error');
        } finally {
            setStatsLoading(false);
        }
    };
    fetchSummary();
  }, [showNotification]);

  const handleFilter = (filtersFromChild) => {
    setQueryParams(prev => ({ ...prev, ...filtersFromChild, pageNumber: 1 }));
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  const handlePageChange = (newPage) => {
        setQueryParams(prev => ({
            ...prev,
            pageNumber: newPage
        }));
    };

  const handleViewDetails = (transaction) => {
    const pricePerUnit = transaction.quantity > 0 ? (transaction.totalAmount / transaction.quantity) : 0;
    const feePercentage = transaction.totalAmount > 0 ? (transaction.platformFee / transaction.totalAmount * 100).toFixed(1) : 0;

    const mappedTransaction = {
      id: transaction.id,
      type: activeTab === 'sales' ? 'sell' : 'buy',
      status: mapApiStatusToFe(transaction.status), 
      quantity: transaction.quantity,
      price: pricePerUnit,
      totalValue: transaction.totalAmount,
      fee: { amount: transaction.platformFee, percentage: feePercentage },
      date: new Date(transaction.createdAt).toLocaleDateString('vi-VN'),
      seller: {
        name: `Người bán: ...${transaction.sellerId.slice(-6)}`,
        role: 'Người bán',
        avatar: `https://i.pravatar.cc/30?u=${transaction.sellerId}`
      },
      buyer: {
        name: `Người mua: ...${transaction.buyerId.slice(-6)}`,
        role: 'Người mua',
        avatar: `https://i.pravatar.cc/30?u=${transaction.buyerId}`
      }
    };
    setSelectedTransaction(mappedTransaction);
    setShowDetailModal(true);
  };

  const handleCancel = (transactionId) => {
    // TODO: Gọi API hủy giao dịch ở đây
    // Ví dụ: 
    // try {
    //   await cancelTransaction(transactionId);
    //   showNotification('Đã hủy giao dịch thành công!', 'success');
    //   // Gọi lại API để refresh list
    //   setQueryParams(prev => ({ ...prev })); // Trigger useEffect
    // } catch(err) {
    //   showNotification('Hủy thất bại!', 'error');
    // }
    console.log("Yêu cầu hủy API cho:", transactionId);
    showNotification('Chức năng hủy đang được phát triển', 'info');
  };

  const handleExportStatement = async (rangeType) => {
    try {
        // Gọi hàm service thay vì axios.get trực tiếp
        const response = await exportTransactionStatement(rangeType);

        // Tạo đường dẫn tải về từ blob data
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Đặt tên file
        const fileName = `SaoKe_${rangeType}_${new Date().toISOString().slice(0,10)}.xlsx`;
        link.setAttribute('download', fileName);
        
        document.body.appendChild(link);
        link.click();
        
        // Dọn dẹp
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // toast.success("Tải xuống thành công!");
    } catch (error) {
        console.error("Lỗi xuất file:", error);
        // toast.error("Có lỗi xảy ra khi xuất file.");
    }
  };

  const handleDownloadCertificate = async () => {
    if (!selectedTransaction) return;

    setIsDownloading(true);
    showNotification('Đang chuẩn bị chứng nhận...', 'info');

    try {
      const transactionId = selectedTransaction.id; 
      const response = await getCertificate(transactionId);

      if (response.data && response.data.success) {
        const certificateUrl = response.data.data.certificate_url;
        
        // Lưu URL và hiển thị modal
        setPdfUrl(certificateUrl);
        setShowPdfModal(true);
        showNotification('Đã tải chứng nhận thành công!', 'success');
        
      } else {
        showNotification(response.data.message || 'Không thể lấy chứng nhận.', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Lỗi kết nối máy chủ chứng nhận.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedTransaction(null);
  };

  if (loading && transactions.length === 0) { 
    return (
      <div className={styles.app}>
        <div className={styles.mainContent}>
          <div className={styles.loadingState}>
            <i className="bi bi-arrow-repeat"></i>
            <p>Đang tải dữ liệu giao dịch...</p>
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
        activePage="transactions" 
        onPageChange={() => {}} 
        className={sidebarActive ? 'activemenu' : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Giao dịch" />
        
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {statsLoading ? (
            <p>Đang tải thống kê...</p> 
          ) : (
            mappedStats.map((stat, index) => (
              <StatCard
                key={index}
                {...stat} 
                delay={(index + 1) * 100}
              />
            ))
          )}
        </div>

          
        <div className={`${styles.card}`} data-aos="fade-up" data-aos-delay="100">
          <div className={styles.tabsWrapper}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'sales' ? styles.active : ''}`}
              onClick={() => handleTabChange('sales')}
              disabled={isTransitioning}
            >
              Giao dịch Bán
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'purchases' ? styles.active : ''}`}
              onClick={() => handleTabChange('purchases')}
              disabled={isTransitioning}
            >
              Giao dịch Mua
            </button>
          </div>
        </div>
        
        
        {/* Filter Section */}
        <div className='mt-3'>
          <TransactionFilter
            onFilter={handleFilter}
            onExport={handleExportStatement}
            activeTab={activeTab}
          />

        </div>
        
        {/* Transaction List */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="600">
          <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Lịch sử giao dịch</h3>
          <div className={styles.transactionCount}>
            {paginationData?.totalCount || 0} giao dịch
          </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.transactionList}>
              {loading && <p>Đang tải...</p>} 
              {!loading && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    transactionType={activeTab} 
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancel}
                  />
            ))
            ) : (
            !loading && ( 
              <div className={styles.emptyState}>
                <i className="bi bi-arrow-left-right"></i>
                <p>Không tìm thấy giao dịch nào</p>
              </div>
            )
          )}  
            </div>
              <Pagination
                currentPage={paginationData.pageNumber}
                totalPages={paginationData.totalPages}
                onPageChange={handlePageChange}
              />
          </div>
        </div>
      </div>
      
      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        show={showDetailModal}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
        onDownloadCertificate={handleDownloadCertificate}
        isDownloading={isDownloading}
      />

      <PDFViewerModal
        show={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        pdfUrl={pdfUrl}
        title="Chứng nhận giao dịch"
      />
    </div>
  );
};

export default Transactions;