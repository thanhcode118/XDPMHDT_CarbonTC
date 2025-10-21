import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import StatCard from '../../components/StatCard/StatCard';
import TransactionFilter from '../../components/TransactionFilter/TransactionFilter';
import TransactionItem from '../../components/TransactionItemTrading/TransactionItem';
import TransactionDetailModal from '../../components/TransactionDetailModal/TransactionDetailModal';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import styles from './Transactions.module.css';

const Transactions = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sample data
  const transactionStats = [
    {
      type: '1',
      icon: 'bi-arrow-left-right-fill',
      value: '24',
      label: 'Tổng giao dịch',
      change: '12% so với tháng trước',
      changeType: 'positive'
    },
    {
      type: '2',
      icon: 'bi-check-circle-fill',
      value: '18',
      label: 'Giao dịch thành công',
      change: '8% so với tháng trước',
      changeType: 'positive'
    },
    {
      type: '3',
      icon: 'bi-clock-fill',
      value: '4',
      label: 'Đang xử lý',
      change: '2% so với tháng trước',
      changeType: 'negative'
    },
    {
      type: '4',
      icon: 'bi-currency-dollar',
      value: '1.875.000',
      label: 'Tổng doanh thu (VNĐ)',
      change: '15% so với tháng trước',
      changeType: 'positive'
    }
  ];

  const sampleTransactions = [
    {
      id: 'CC2023001',
      type: 'sell',
      status: 'completed',
      quantity: 20,
      price: 15000,
      totalValue: 300000,
      fee: { amount: 15000, percentage: 5 },
      date: '15/05/2023',
      seller: {
        name: 'Nguyễn Văn An',
        role: 'Chủ xe điện',
        avatar: 'https://picsum.photos/seed/user123/30/30.jpg'
      },
      buyer: {
        name: 'Trần Thị Bình',
        role: 'Người mua tín chỉ',
        avatar: 'https://picsum.photos/seed/buyer456/30/30.jpg'
      }
    },
    {
      id: 'CC2023002',
      type: 'sell',
      status: 'completed',
      quantity: 15,
      price: 15000,
      totalValue: 225000,
      fee: { amount: 11250, percentage: 5 },
      date: '14/05/2023',
      seller: {
        name: 'Nguyễn Văn An',
        role: 'Chủ xe điện',
        avatar: 'https://picsum.photos/seed/user123/30/30.jpg'
      },
      buyer: {
        name: 'Hoàng Văn Nam',
        role: 'Người mua tín chỉ',
        avatar: 'https://picsum.photos/seed/buyer789/30/30.jpg'
      }
    },
    {
      id: 'CC2023003',
      type: 'sell',
      status: 'pending',
      quantity: 10,
      price: 18000,
      totalValue: 180000,
      fee: { amount: 9000, percentage: 5 },
      date: '12/05/2023',
      seller: {
        name: 'Nguyễn Văn An',
        role: 'Chủ xe điện',
        avatar: 'https://picsum.photos/seed/user123/30/30.jpg'
      },
      buyer: {
        name: 'Lê Thị Lan',
        role: 'Người mua tín chỉ',
        avatar: 'https://picsum.photos/seed/buyer321/30/30.jpg'
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTransactions(sampleTransactions);
      setFilteredTransactions(sampleTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilter = (filters) => {
    let filtered = [...transactions];
    
    if (filters.type) {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }
    
    if (filters.status) {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date.split('/').reverse().join('-'));
        const filterDate = new Date(filters.dateFrom);
        return transactionDate >= filterDate;
      });
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date.split('/').reverse().join('-'));
        const filterDate = new Date(filters.dateTo);
        return transactionDate <= filterDate;
      });
    }
    
    setFilteredTransactions(filtered);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleCancel = (transactionId) => {
    // Update transaction status to cancelled
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: 'cancelled' }
          : transaction
      )
    );
    setFilteredTransactions(prev => 
      prev.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: 'cancelled' }
          : transaction
      )
    );
    showNotification('Đã hủy giao dịch thành công!', 'success');
  };

  const handleExport = () => {
    showNotification('Đang xuất báo cáo giao dịch...', 'info');
    // Simulate export
    setTimeout(() => {
      showNotification('Xuất báo cáo thành công!', 'success');
    }, 2000);
  };

  const handleDownloadCertificate = () => {
    showNotification('Đang tải chứng nhận giao dịch...', 'info');
    // Simulate download
    setTimeout(() => {
      showNotification('Tải chứng nhận thành công!', 'success');
    }, 2000);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedTransaction(null);
  };

  if (loading) {
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
          {transactionStats.map((stat, index) => (
            <StatCard
              key={index}
              type={stat.type}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              change={stat.change}
              changeType={stat.changeType}
              delay={(index + 1) * 100}
            />
          ))}
        </div>
        
        {/* Filter Section */}
        <TransactionFilter
          onFilter={handleFilter}
          onExport={handleExport}
        />
        
        {/* Transaction List */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="600">
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Lịch sử giao dịch</h3>
            <div className={styles.transactionCount}>
              {filteredTransactions.length} giao dịch
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.transactionList}>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancel}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <i className="bi bi-arrow-left-right"></i>
                  <p>Không tìm thấy giao dịch nào phù hợp với bộ lọc</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        show={showDetailModal}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
        onDownloadCertificate={handleDownloadCertificate}
      />
    </div>
  );
};

export default Transactions;