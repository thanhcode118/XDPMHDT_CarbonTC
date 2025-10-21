import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import WalletCard from '../../components/WalletCard/WalletCard';
import StatCard from '../../components/StatCard/StatCard';
import WalletChart from '../../components/WalletChart/WalletChart';
import TransactionItem from '../../components/TransactionItem/TransactionItem';
import WithdrawModal from '../../components/WithdrawModal/WithdrawModal';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import styles from './Wallet.module.css';

const Wallet = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sample data
  const walletStats = [
    {
      type: '1',
      icon: 'bi-arrow-up-circle-fill',
      value: '85',
      label: 'Tín chỉ kiếm được',
      change: '12% so với tháng trước',
      changeType: 'positive'
    },
    {
      type: '2',
      icon: 'bi-arrow-down-circle-fill',
      value: '40',
      label: 'Tín chỉ đã bán',
      change: '8% so với tháng trước',
      changeType: 'positive'
    },
    {
      type: '3',
      icon: 'bi-graph-up-arrow',
      value: '15.000',
      label: 'Giá trung bình/tín chỉ',
      change: '5% so với tháng trước',
      changeType: 'positive'
    },
    {
      type: '4',
      icon: 'bi-calendar-check',
      value: '12',
      label: 'Giao dịch thành công',
      change: '15% so với tháng trước',
      changeType: 'positive'
    }
  ];

  const transactions = [
    {
      id: 1,
      type: 'income',
      title: 'Nhận tín chỉ từ hành trình',
      date: '15/05/2023',
      amount: 15,
      icon: 'bi-arrow-down-circle'
    },
    {
      id: 2,
      type: 'expense',
      title: 'Bán tín chỉ',
      date: '14/05/2023',
      amount: 20,
      icon: 'bi-arrow-up-circle'
    },
    {
      id: 3,
      type: 'income',
      title: 'Nhận tín chỉ từ hành trình',
      date: '12/05/2023',
      amount: 9,
      icon: 'bi-arrow-down-circle'
    },
    {
      id: 4,
      type: 'income',
      title: 'Nhận tín chỉ từ hành trình',
      date: '10/05/2023',
      amount: 6,
      icon: 'bi-arrow-down-circle'
    }
  ];

  const chartData = {
    labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
    datasets: [
      {
        label: 'Tín chỉ kiếm được',
        data: [12, 19, 8, 15, 22, 18, 25],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Tín chỉ đã bán',
        data: [5, 10, 3, 8, 12, 7, 15],
        borderColor: '#f093fb',
        backgroundColor: 'rgba(240, 147, 251, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const handleDeposit = () => {
    showNotification('Tính năng nạp thêm sẽ sớm có sẵn!', 'info');
  };

  const handleWithdrawConfirm = (withdrawData) => {
    console.log('Withdraw data:', withdrawData);
    showNotification('Yêu cầu rút tiền đã được gửi thành công!', 'success');
  };

  const handleCloseWithdrawModal = () => {
    setShowWithdrawModal(false);
  };

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.mainContent}>
          <div className={styles.loadingState}>
            <i className="bi bi-arrow-repeat"></i>
            <p>Đang tải dữ liệu ví...</p>
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
        activePage="wallet" 
        onPageChange={() => {}} 
        className={sidebarActive ? styles.active : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Ví carbon" />
        
        {/* Wallet Card */}
        <WalletCard
          balance={125}
          value={1875000}
          onWithdraw={handleWithdraw}
          onDeposit={handleDeposit}
        />
        
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {walletStats.map((stat, index) => (
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
        
        {/* Chart and Transactions */}
        <div className="row">
          <div className="col-lg-8">
            <div className={styles.card} data-aos="fade-up" data-aos-delay="100">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Biểu đồ tín chỉ</h3>
                <div className={styles.btnGroup} role="group">
                  <button type="button" className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.active}`}>Tuần</button>
                  <button type="button" className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}>Tháng</button>
                  <button type="button" className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}>Năm</button>
                </div>
              </div>
              <div className={styles.cardBody}>
                <WalletChart data={chartData} />
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className={styles.card} data-aos="fade-up" data-aos-delay="200">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Giao dịch gần đây</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.transactionList}>
                  {transactions.map(transaction => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </div>
                <div className={styles.textCenter}>
                  <button className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}>
                    Xem tất cả
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Withdraw Modal */}
      <WithdrawModal
        show={showWithdrawModal}
        onClose={handleCloseWithdrawModal}
        onConfirm={handleWithdrawConfirm}
        availableBalance={125}
      />
    </div>
  );
};

export default Wallet;