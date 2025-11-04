import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import WalletCard from '../../components/WalletCard/WalletCard';
import MoneyWalletCard from '../../components/WalletCard/MoneyWalletCard';
import StatCard from '../../components/StatCard/StatCard';
import WalletChart from '../../components/WalletChart/WalletChart';
import TransactionItem from '../../components/TransactionItem/TransactionItem';
import WithdrawModal from '../../components/WithdrawModal/WithdrawModal';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import styles from './Wallet.module.css';
import { 
  getMyCarbonWallet,
  createMyCarbonWallet,
  getMyEWalletTransactions,
  createMyEWallet,
  createDepositPayment,
  createWithdrawRequest,
  getMyEWallet
} from '../../utils/walletApi.jsx';

const Wallet = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMode, setWithdrawMode] = useState('money'); // 'money' | 'credit'
  const [loading, setLoading] = useState(true);
  const [carbonWallet, setCarbonWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [eWallet, setEWallet] = useState(null);

  // Sample data (giữ nguyên UI cho stat card)
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

  // chart transactions will still render from static chartData

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
    const loadData = async () => {
      try {
        // 1) Try GET both wallets in parallel
        const [ewRes, cwRes] = await Promise.allSettled([
          getMyEWallet(),
          getMyCarbonWallet()
        ]);

        // Handle fiat e-wallet
        if (ewRes.status === 'fulfilled' && ewRes.value?.success && ewRes.value?.data) {
          setEWallet(ewRes.value.data);
        } else {
          // If not found (404/400), create and set
          try {
            const created = await createMyEWallet('VND');
            if (created?.success && created?.data) {
              setEWallet(created.data);
              showNotification('Đã tạo ví tiền cho bạn', 'success');
            }
          } catch (_) { /* ignore */ }
        }

        // Handle carbon wallet
        if (cwRes.status === 'fulfilled' && cwRes.value?.success && cwRes.value?.data) {
          setCarbonWallet(cwRes.value.data);
        } else {
          try {
            const created = await createMyCarbonWallet();
            if (created?.success && created?.data) {
              setCarbonWallet(created.data);
              showNotification('Đã tạo ví carbon cho bạn', 'success');
            }
          } catch (_) { /* ignore */ }
        }

        // 2) Load e-wallet transactions (map to UI)
        const txRes = await getMyEWalletTransactions();
        if (txRes?.success && Array.isArray(txRes?.data)) {
          const mapped = txRes.data.slice(0, 10).map((t) => ({
            id: t.id,
            type: t.amount >= 0 ? 'income' : 'expense',
            title: t.description || (t.type || 'Giao dịch'),
            date: new Date(t.createdAt).toLocaleDateString('vi-VN'),
            amount: Math.abs(t.amount),
            icon: t.amount >= 0 ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'
          }));
          setTransactions(mapped);
        }
      } catch (e) {
        showNotification('Không thể tải dữ liệu ví. Vui lòng đăng nhập hoặc kiểm tra server.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showNotification]);

  const handleWithdraw = (mode) => {
    setWithdrawMode(mode);
    setShowWithdrawModal(true);
  };

  const handleDeposit = () => {
    const amountStr = prompt('Nhập số tiền cần nạp (VND), tối thiểu 10,000');
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (Number.isNaN(amount) || amount < 10000) {
      showNotification('Số tiền không hợp lệ (>= 10,000)', 'error');
      return;
    }
    createDepositPayment(amount)
      .then((res) => {
        if (res?.success) {
          showNotification(res?.message || 'Tạo yêu cầu nạp tiền thành công', 'success');
          // If data is a redirect URL (e.g., VNPay), open it
          if (typeof res?.data === 'string' && res.data.startsWith('http')) {
            window.location.href = res.data;
          }
        } else {
          showNotification(res?.message || 'Không thể tạo yêu cầu nạp tiền', 'error');
        }
      })
      .catch(() => showNotification('Lỗi kết nối khi tạo yêu cầu nạp tiền', 'error'));
  };

  const handleWithdrawConfirm = (withdrawData) => {
    // Only support bank at this stage, per API requirement
    if (withdrawData.method && withdrawData.method !== 'bank') {
      showNotification('Hiện chỉ hỗ trợ rút tiền qua ngân hàng', 'info');
      return;
    }

    // Map modal fields to API payload: amount in money, bank account/name
    const userId = localStorage.getItem('userId') || 'current-user';
    const amount = Number(withdrawData.amount);
    const bankAccountNumber = withdrawData.bankAccount;
    const bankName = withdrawData.bankName;

    if (!amount || amount < 10000) {
      showNotification('Số tiền rút tối thiểu 10,000 VND', 'error');
      return;
    }

    createWithdrawRequest({ userId, amount, bankAccountNumber, bankName })
      .then((res) => {
        if (res?.success) {
          showNotification('Gửi yêu cầu rút tiền thành công', 'success');
          setShowWithdrawModal(false);
        } else {
          showNotification(res?.message || 'Gửi yêu cầu rút tiền thất bại', 'error');
        }
      })
      .catch(() => showNotification('Lỗi kết nối khi gửi yêu cầu rút tiền', 'error'));
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
        
        {/* Fiat Wallet Card */}
        <MoneyWalletCard
          value={eWallet?.balance ?? 0}
          onWithdraw={() => handleWithdraw('money')}
          onDeposit={handleDeposit}
        />

        {/* Carbon Wallet Card */}
        <WalletCard
          balance={carbonWallet?.balance ?? 0}
          value={eWallet?.balance ?? ((carbonWallet?.balance ?? 0) * 15000)}
          onWithdraw={() => handleWithdraw('credit')}
          onDeposit={() => {}}
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
        availableBalance={withdrawMode === 'money' ? (eWallet?.balance ?? 0) : (carbonWallet?.balance ?? 0)}
        mode={withdrawMode}
      />
    </div>
  );
};

export default Wallet;