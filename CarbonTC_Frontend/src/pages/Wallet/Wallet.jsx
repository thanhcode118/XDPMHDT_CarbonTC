import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import WalletCard from '../../components/WalletCard/WalletCard';
import MoneyWalletCard from '../../components/WalletCard/MoneyWalletCard';
import StatCard from '../../components/StatCard/StatCard';
import WalletChart from '../../components/WalletChart/WalletChart';
import TransactionItem from '../../components/TransactionItem/TransactionItem';
import WithdrawModal from '../../components/WithdrawModal/WithdrawModal';
import DepositModal from '../../components/DepositModal/DepositModal';
import TokenTestHelper from '../../components/TokenTestHelper/TokenTestHelper';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import { getWalletSummary , getTransactionChartData} from '../../services/listingService';
import styles from './Wallet.module.css';
import { 
  getMyCarbonWallet,
  createMyCarbonWallet,
  getMyEWalletTransactions,
  createMyEWallet,
  createDepositPayment,
  createWithdrawRequest,
  getMyEWallet
} from '../../services/walletService.jsx';

const statusLabelMap = {
  PENDING: 'Chờ thanh toán',
  PROCESSING: 'Đang xử lý',
  SUCCESS: 'Hoàn tất',
  COMPLETED: 'Hoàn tất',
  FAILED: 'Thất bại',
  CANCELED: 'Đã hủy',
  ERROR: 'Lỗi'
};

const typeLabelMap = {
  SALE: 'Thanh toán tín chỉ',
  GIFT: 'Nhận tín chỉ',
  ADJUSTMENT: 'Điều chỉnh hệ thống',
  REFUND: 'Hoàn trả tín chỉ',
  ISSUE: 'Phát hành tín chỉ',
  DEPOSIT: 'Nạp tiền',
  WITHDRAW: 'Rút tiền'
};

const formatCurrency = (value) => {
  const parsed = Number(value) || 0;
  return `${Math.abs(parsed).toLocaleString('vi-VN')} VNĐ`;
};

const Wallet = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMode, setWithdrawMode] = useState('money'); // 'money' | 'credit'
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [carbonWallet, setCarbonWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [eWallet, setEWallet] = useState(null);
  const [actionLoading, setActionLoading] = useState({ withdraw: false, deposit: false });
  const [withdrawError, setWithdrawError] = useState('');
  const [depositStatus, setDepositStatus] = useState({
    state: 'idle',
    message: '',
    paymentUrl: ''
  });
  const [txStatusFilter, setTxStatusFilter] = useState('all');
  const [txTypeFilter, setTxTypeFilter] = useState('all');

  const [statsData, setStatsData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [chartPeriod, setChartPeriod] = useState(0); 
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartLoading, setChartLoading] = useState(true);

  // chart transactions will still render from static chartData

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

  const fetchEWallet = useCallback(async (options = { showToast: true }) => {
    const showToast = options?.showToast ?? true;
    try {
      const response = await getMyEWallet();
      if (response?.success && response?.data) {
        setEWallet(response.data);
        return response.data;
      }
      throw response;
    } catch (error) {
      const message = (error?.message || '').toLowerCase();
      if (error?.status === 404 || message.includes('chưa') || message.includes('không tìm thấy')) {
        try {
          const created = await createMyEWallet('VND');
          if (created?.success && created?.data) {
            setEWallet(created.data);
            if (showToast) {
              showNotification('Đã tạo ví tiền cho bạn', 'success');
            }
            return created.data;
          }
          throw created;
        } catch (createErr) {
          if (showToast) {
            showNotification(createErr?.message || 'Không thể tạo ví tiền', 'error');
          }
          throw createErr;
        }
      } else {
        if (showToast) {
          showNotification(error?.message || 'Không thể tải ví tiền', 'error');
        }
        throw error;
      }
    }
  }, [showNotification]);

  const fetchCarbonWallet = useCallback(async (options = { showToast: true }) => {
    const showToast = options?.showToast ?? true;
    try {
      const response = await getMyCarbonWallet();
      if (response?.success && response?.data) {
        setCarbonWallet(response.data);
        return response.data;
      }
      throw response;
    } catch (error) {
      if (error?.status === 404) {
        try {
          const created = await createMyCarbonWallet();
          if (created?.success && created?.data) {
            setCarbonWallet(created.data);
            if (showToast) {
              showNotification('Đã tạo ví carbon cho bạn', 'success');
            }
            return created.data;
          }
          throw created;
        } catch (createErr) {
          if (showToast) {
            showNotification(createErr?.message || 'Không thể tạo ví carbon', 'error');
          }
          throw createErr;
        }
      } else {
        if (showToast) {
          showNotification(error?.message || 'Không thể tải ví carbon', 'error');
        }
        throw error;
      }
    }
  }, [showNotification]);

  const fetchTransactions = useCallback(async (options = { showToast: true }) => {
    const showToast = options?.showToast ?? true;
    try {
      const txRes = await getMyEWalletTransactions();
      if (txRes?.success && Array.isArray(txRes?.data)) {
        const mapped = txRes.data.slice(0, 20).map((t, index) => {
          const statusKey = (t.status || '').toUpperCase();
          const typeKey = (t.type || '').toUpperCase();
          const amountNumber = Number(t.amount ?? 0);
          let variant = 'deposit';

          if (['FAILED', 'FAIL', 'CANCELED', 'CANCELLED', 'ERROR'].includes(statusKey)) {
            variant = 'failed';
          } else if (['PENDING', 'PROCESSING'].includes(statusKey)) {
            variant = 'pending';
          } else if (typeKey === 'WITHDRAW' || amountNumber < 0) {
            variant = 'withdraw';
          }

          const prefix = variant === 'deposit' ? '+' : variant === 'withdraw' ? '-' : '';
          const statusText = statusLabelMap[statusKey] ||
            (variant === 'deposit'
              ? 'Nạp tiền'
              : variant === 'withdraw'
                ? 'Rút tiền'
                : 'Đang cập nhật');

          return {
            id: t.id ?? `tx-${index}-${t.createdAt ?? Date.now()}`,
            title: typeLabelMap[typeKey] || 'Giao dịch ví',
            description: t.description || '',
            date: t.createdAt
              ? new Date(t.createdAt).toLocaleString('vi-VN', {
                  hour12: false,
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '',
            statusText,
            rawStatus: statusKey,
            rawType: typeKey,
            variant,
            amountDisplay: {
              prefix,
              value: formatCurrency(amountNumber),
              strike: variant === 'failed'
            }
          };
        });
        setTransactions(mapped);
      } else {
        throw txRes;
      }
    } catch (error) {
      if (showToast) {
        showNotification(error?.message || 'Không thể tải lịch sử giao dịch', 'error');
      }
      throw error;
    }
  }, [showNotification]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.allSettled([
        fetchEWallet(),
        fetchCarbonWallet(),
        fetchTransactions()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchEWallet, fetchCarbonWallet, fetchTransactions]);

  const handleWithdraw = (mode) => {
    setWithdrawError('');
    setWithdrawMode(mode);
    setShowWithdrawModal(true);
  };

  const openDepositModal = () => {
    setDepositStatus({ state: 'idle', message: '', paymentUrl: '' });
    setShowDepositModal(true);
  };

  const handleDepositSubmit = async (amount) => {
    setActionLoading((prev) => ({ ...prev, deposit: true }));
    try {
      const res = await createDepositPayment(amount);
      if (res?.success) {
        const paymentUrl = typeof res?.data === 'string'
          ? res.data
          : (res?.data?.redirectUrl || '');
        const message = res?.message || 'Tạo yêu cầu nạp tiền thành công';
        setDepositStatus({
          state: 'success',
          message,
          paymentUrl
        });
        showNotification(message, 'success');
      } else {
        throw res;
      }
    } catch (error) {
      const message = error?.message || 'Không thể tạo yêu cầu nạp tiền';
      setDepositStatus({
        state: 'error',
        message,
        paymentUrl: ''
      });
      showNotification(message, 'error');
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, deposit: false }));
    }
  };

  const handleWithdrawConfirm = async (withdrawData) => {
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

    setActionLoading((prev) => ({ ...prev, withdraw: true }));
    setWithdrawError('');

    try {
      const res = await createWithdrawRequest({ userId, amount, bankAccountNumber, bankName });
      if (res?.success) {
        showNotification(res?.message || 'Gửi yêu cầu rút tiền thành công', 'success');
        setShowWithdrawModal(false);
        await Promise.allSettled([
          fetchEWallet({ showToast: false }),
          fetchTransactions({ showToast: false })
        ]);
      } else {
        throw res;
      }
    } catch (error) {
      const message = error?.message || 'Gửi yêu cầu rút tiền thất bại';
      setWithdrawError(message);
      showNotification(message, 'error');
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, withdraw: false }));
    }
  };

  const handleCloseWithdrawModal = () => {
    setWithdrawError('');
    setShowWithdrawModal(false);
  };

  const handleCloseDepositModal = () => {
    setDepositStatus({ state: 'idle', message: '', paymentUrl: '' });
    setShowDepositModal(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const statusMatch = txStatusFilter === 'all' || tx.rawStatus === txStatusFilter;
      const typeMatch = txTypeFilter === 'all' || tx.rawType === txTypeFilter;
      return statusMatch && typeMatch;
    });
  }, [transactions, txStatusFilter, txTypeFilter]);

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
          onDeposit={openDepositModal}
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
        
        {/* Chart */}
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

        {/* Recent Transactions */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="200">
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Giao dịch gần đây</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.transactionFilters}>
              <select value={txTypeFilter} onChange={(e) => setTxTypeFilter(e.target.value)}>
                <option value="all">Tất cả loại giao dịch</option>
                <option value="DEPOSIT">Nạp tiền</option>
                <option value="WITHDRAW">Rút tiền</option>
              </select>
              <select value={txStatusFilter} onChange={(e) => setTxStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="SUCCESS">Hoàn tất</option>
                <option value="PENDING">Chờ thanh toán</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="FAILED">Thất bại</option>
              </select>
            </div>
            {filteredTransactions.length ? (
              <div className={styles.transactionTableWrapper}>
                <table className={styles.transactionTable}>
                  <thead>
                    <tr>
                      <th>Nội dung</th>
                      <th>Trạng thái</th>
                      <th>Số tiền</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.transactionEmpty}>Không có giao dịch phù hợp với bộ lọc.</p>
            )}
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
        submitting={actionLoading.withdraw}
        serverError={withdrawError}
      />

      <DepositModal
        show={showDepositModal}
        onClose={handleCloseDepositModal}
        onSubmit={handleDepositSubmit}
        submitting={actionLoading.deposit}
        status={depositStatus}
        minAmount={10000}
      />
      
      {/* Token Test Helper - Chỉ hiển thị trong dev mode */}
      <TokenTestHelper />
    </div>
  );
};

export default Wallet;