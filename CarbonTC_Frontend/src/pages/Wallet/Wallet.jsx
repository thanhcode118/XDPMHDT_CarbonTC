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
import { getWalletSummary , getTransactionChartData} from '../../services/listingService';
import styles from './Wallet.module.css';

const Wallet = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [statsData, setStatsData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [chartPeriod, setChartPeriod] = useState(0); 
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartLoading, setChartLoading] = useState(true);

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

  // const chartData = {
  //   labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
  //   datasets: [
  //     {
  //       label: 'Tín chỉ kiếm được',
  //       data: [12, 19, 8, 15, 22, 18, 25],
  //       borderColor: '#667eea',
  //       backgroundColor: 'rgba(102, 126, 234, 0.1)',
  //       tension: 0.4,
  //       fill: true
  //     },
  //     {
  //       label: 'Tín chỉ đã bán',
  //       data: [5, 10, 3, 8, 12, 7, 15],
  //       borderColor: '#f093fb',
  //       backgroundColor: 'rgba(240, 147, 251, 0.1)',
  //       tension: 0.4,
  //       fill: true
  //     }
  //   ]
  // };

  useEffect(() => {
    const fetchWalletData = async () => {
      setStatsLoading(true);
      setLoading(true); // Bắt đầu loading chung
      
      try {
        // Gọi API
        const summaryResponse = await getWalletSummary();
        
        if (summaryResponse.data && summaryResponse.data.success) {
          const data = summaryResponse.data.data;
          
          // Helper map data API -> data cho StatCard
          const getChangeType = (change) => 
              change > 0 ? 'positive' : (change < 0 ? 'negative' : 'neutral');
          
          // Map dữ liệu API trả về sang định dạng StatCard
          const mappedStats = [
            {
              type: '1',
              icon: 'bi-search', // Tin đã đăng
              value: data.listingsFound.toLocaleString(),
              label: 'Tin đã đăng',
              change: `${data.listingsFoundChangePercent}%`,
              changeType: getChangeType(data.listingsFoundChangePercent)
            },
            {
              type: '2',
              icon: 'bi-check-circle-fill', // Tin đã bán
              value: data.listingsSold.toLocaleString(),
              label: 'Tin đã bán',
              change: `${data.listingsSoldChangePercent}%`,
              changeType: getChangeType(data.listingsSoldChangePercent)
            },
            {
              type: '3',
              icon: 'bi-graph-up-arrow', // Giá trung bình
              value: data.averagePrice.toLocaleString(),
              label: 'Giá bán TB (VNĐ)',
              change: `${data.averagePriceChangePercent}%`,
              changeType: getChangeType(data.averagePriceChangePercent)
            },
            {
              type: '4',
              icon: 'bi-arrow-left-right', // Giao dịch thành công
              value: data.successfulTransactions.toLocaleString(),
              label: 'Giao dịch thành công',
              change: `${data.successfulTransactionsChangePercent}%`,
              changeType: getChangeType(data.successfulTransactionsChangePercent)
            }
          ];
          setStatsData(mappedStats);
        } else {
          showNotification('Không thể tải thống kê ví', 'error');
        }
      } catch (err) {
         showNotification(err.message || 'Lỗi tải thống kê ví', 'error');
      } finally {
        setStatsLoading(false);
        setLoading(false); // Tắt loading chung
      }
    };

    fetchWalletData();
  }, [showNotification]);

  useEffect(() => {
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const response = await getTransactionChartData(chartPeriod);
        if (response.data && response.data.success) {
          setChartData(response.data.data); // API trả về chính xác format
        } else {
          showNotification('Không thể tải dữ liệu biểu đồ', 'error');
        }
      } catch (err) {
        showNotification(err.message || 'Lỗi tải biểu đồ', 'error');
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, [chartPeriod, showNotification]);

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
        className={sidebarActive ? 'activemenu' : ''}
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
          {statsLoading ? (
            // Hiển thị skeleton/loading cho stats (nếu muốn)
            <p>Đang tải thống kê...</p> 
          ) : (
            statsData.map((stat, index) => (
              <StatCard
                key={index}
                {...stat} // Truyền props
                delay={(index + 1) * 100}
              />
            ))
          )}
        </div>
        
        {/* Chart and Transactions */}
        <div className="row">
          <div className="col-lg-8">
            <div className={styles.card} data-aos="fade-up" data-aos-delay="100">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Biểu đồ tín chỉ</h3>
                <div className={styles.btnGroup} role="group">
                  <button 
                    type="button" 
                    className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${chartPeriod === 0 ? styles.active : ''}`}
                    onClick={() => setChartPeriod(0)} // <-- 0 = Tuần
                  >
                    Tuần
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${chartPeriod === 1 ? styles.active : ''}`}
                    onClick={() => setChartPeriod(1)} // <-- 1 = Tháng
                  >
                    Tháng
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${chartPeriod === 2 ? styles.active : ''}`}
                    onClick={() => setChartPeriod(2)} // <-- 2 = Năm
                  >
                    Năm
                  </button>
                </div>
              </div>
              <div className={styles.cardBody}>
                {chartLoading ? (
                    <p>Đang tải biểu đồ...</p>
                ) : (
                    <WalletChart data={chartData} />
                )}
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