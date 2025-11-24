import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import AISuggestion from '../../components/AISuggestion/AISuggestion';
import StatCard from '../../components/StatCard/StatCard';
import styles from './Dashboard.module.css';

import WalletChart from '../../components/WalletChart/WalletChart';
import { getTransactionChartData, getSuggestedPrice, getUserIdFromToken, getMyTransactions } from '../../services/listingService'; 
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const navigate = useNavigate();

  const [chartPeriod, setChartPeriod] = useState(0); // 0 = Tuần (default)
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartLoading, setChartLoading] = useState(true);

  const [bannerSuggestedPrice, setBannerSuggestedPrice] = useState(null);
  const [isBannerSuggestionLoading, setIsBannerSuggestionLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const params = {
    pageNumber: 1,
    pageSize: 5,
    status: 2 
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  useEffect(() => {
    const fetchChart = async () => {
      setChartLoading(true);
      try {
        const response = await getTransactionChartData(chartPeriod);
        if (response.data && response.data.success) {
          setChartData(response.data.data); // API trả về chính xác format
        } else {
          console.error("Không thể tải dữ liệu biểu đồ");
        }
      } catch (err) {
        console.error("Lỗi khi tải biểu đồ:", err);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChart();
  }, [chartPeriod]);

  useEffect(() => {
    const fetchAiSuggestion = async () => {
        setIsBannerSuggestionLoading(true);
        try {
            const response = await getSuggestedPrice(); // Gọi API giá chung
            if (response.data && response.data.success) {
                setBannerSuggestedPrice(response.data.data);
            } 
        } catch (err) {
            console.error("Lỗi tải giá gợi ý AI:", err);
        } finally {
            setIsBannerSuggestionLoading(false);
        }
    };
    fetchAiSuggestion();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      setTransactionsLoading(true);
      const userId = getUserIdFromToken(); // Lấy ID user hiện tại
      setCurrentUserId(userId);

      try {
        const response = await getMyTransactions(params); // Gọi API
        if (response.data && response.data.success) {
          // Lấy mảng 'items' từ data
          setTransactions(response.data.data.items); 
        } else {
          console.error("Không thể tải giao dịch");
        }
      } catch (err) {
        console.error("Lỗi khi tải giao dịch:", err);
      } finally {
        setTransactionsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const mapTransactionStatus = (status) => {
    switch (status) {
      case 1: return { text: 'Đang xử lý', type: 'warning' };
      case 2: return { text: 'Hoàn thành', type: 'success' };
      case 3: return { text: 'Thất bại', type: 'danger' };
      case 4: return { text: 'Đã hoàn tiền', type: 'info' };
      case 5: return { text: 'Đang tranh chấp', type: 'danger' };
      default: return { text: 'Không rõ', type: 'secondary' };
    }
  };

  const statsData = [
    {
      type: '1',
      icon: 'bi-piggy-bank-fill',
      value: '125',
      label: 'Tín chỉ carbon',
      change: '12% so với tháng trước'
    },
    {
      type: '2',
      icon: 'bi-currency-dollar',
      value: '1.875.000',
      label: 'Doanh thu (VNĐ)',
      change: '8% so với tháng trước'
    },
    {
      type: '3',
      icon: 'bi-signpost-2-fill',
      value: '42',
      label: 'Hành trình',
      change: '5% so với tháng trước'
    },
    {
      type: '4',
      icon: 'bi-cloud-arrow-down-fill',
      value: '312 kg',
      label: 'CO₂ giảm phát thải',
      change: '15% so với tháng trước'
    }
  ];

  const recentTrips = [
    {
      route: 'Hà Nội → Hải Phòng',
      distance: '120 km',
      credits: '15 tín chỉ',
      date: 'Hôm nay'
    },
    {
      route: 'Hà Nội → Vĩnh Phúc',
      distance: '45 km',
      credits: '6 tín chỉ',
      date: 'Hôm qua'
    },
    {
      route: 'Hà Nội → Hòa Bình',
      distance: '75 km',
      credits: '9 tín chỉ',
      date: '3 ngày trước'
    }
  ];

  // const transactions = [
  //   {
  //     id: '#CC2023001',
  //     date: '15/05/2023',
  //     type: 'Bán',
  //     quantity: '20',
  //     price: '300.000',
  //     status: 'Hoàn thành',
  //     statusType: 'success'
  //   },
  //   {
  //     id: '#CC2023002',
  //     date: '10/05/2023',
  //     type: 'Bán',
  //     quantity: '15',
  //     price: '225.000',
  //     status: 'Hoàn thành',
  //     statusType: 'success'
  //   },
  //   {
  //     id: '#CC2023003',
  //     date: '05/05/2023',
  //     type: 'Đấu giá',
  //     quantity: '10',
  //     price: '180.000',
  //     status: 'Đang xử lý',
  //     statusType: 'warning'
  //   }
  // ];

  const getAiSuggestionContent = () => {
    if (isBannerSuggestionLoading) return "Đang tải gợi ý từ AI...";
    if (bannerSuggestedPrice) {
      const formattedPrice = Math.round(bannerSuggestedPrice).toLocaleString();
      return `Dựa trên dữ liệu thị trường hiện tại, chúng tôi đề xuất bạn niêm yết tín chỉ của mình với giá <strong>${formattedPrice} VNĐ/tín chỉ</strong> để tối đa hóa lợi nhuận.`;
    }
    return "Không có gợi ý nào từ AI.";
  };

  const handleApplySuggestion = useCallback(() => {
    // Chuyển người dùng đến trang Thị trường, (Marketplace.js sẽ xử lý việc chọn tab 'sell')
    navigate('/marketplace', { state: { defaultTab: 'sell' } });
  }, [navigate]);

  return (
    <div className={styles.app}>
      <button className={styles.mobileToggle} onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>
      
      <Sidebar  
        activePage="dashboard" 
        className={sidebarActive ? 'activemenu' : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Tổng quan" />
        
        <AISuggestion
          title="Gợi ý từ AI"
          content={getAiSuggestionContent()} 
          actionText="Niêm yết theo gợi ý" // <-- Đổi text
          onAction={handleApplySuggestion}  // <-- Dùng handler mới
        />
        
        {/* Stats Grid */}
        {/* <div className={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              type={stat.type}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              change={stat.change}
            />
          ))}
        </div> */}
        
        {/* Charts and Recent Activities */}
        <div className="row">
          <div className="col">
            <div className={styles.card} data-aos="fade-up" data-aos-delay="100">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Biểu đồ tín chỉ carbon</h3>
                <div className={styles.btnGroup} role="group">
                  <button 
                    type="button" 
                    className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${chartPeriod === 0 ? styles.active : ''}`}
                    onClick={() => setChartPeriod(0)}
                  >
                    Tuần
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${chartPeriod === 1 ? styles.active : ''}`}
                    onClick={() => setChartPeriod(1)}
                  >
                    Tháng
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${chartPeriod === 2 ? styles.active : ''}`}
                    onClick={() => setChartPeriod(2)}
                  >
                    Năm
                  </button>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.chartContainer}>
                  {chartLoading ? (
                    <p style={{ textAlign: 'center', padding: '50px' }}>Đang tải biểu đồ...</p>
                  ) : (
                    <WalletChart data={chartData} height="300px" />
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col-lg-4">
            <div className={styles.card} data-aos="fade-up" data-aos-delay="200">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Hành trình gần đây</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.listGroup}>
                  {recentTrips.map((trip, index) => (
                    <div key={index} className={styles.listGroupItem}>
                      <div className={styles.tripInfo}>
                        <div>
                          <h6 className={styles.tripRoute}>{trip.route}</h6>
                          <small className={styles.tripDetails}>{trip.distance} • {trip.credits}</small>
                        </div>
                        <small className={styles.tripDate}>{trip.date}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.textCenter}>
                  <button className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}>Xem tất cả</button>
                </div>
              </div>
            </div>
          </div> */}
        </div>
        
        {/* Transactions Table */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="300">
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Giao dịch gần đây</h3>
            <button 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
              onClick={() => navigate('/dashboard/transactions')} // Thêm điều hướng
            >
              Xem tất cả
            </button>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tableResponsive}>
              <table className={styles.customTable}>
                <thead>
                  <tr>
                    <th>Mã giao dịch</th>
                    <th>Ngày</th>
                    <th>Loại</th>
                    <th>Số lượng tín chỉ</th>
                    <th>Giá (VNĐ)</th>
                    <th>Trạng thái</th>
                    {/* <th>Thao tác</th> */}
                  </tr>
                </thead>
                <tbody>
                  {transactionsLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      Đang tải giao dịch...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 5).map((transaction) => { // Chỉ hiện 5 giao dịch gần nhất
                    const statusInfo = mapTransactionStatus(transaction.status);
                    const transactionType = transaction.buyerId === currentUserId ? 'Mua' : 'Bán';

                    return (
                      <tr key={transaction.id}>
                        {/* Cắt ngắn ID cho dễ nhìn */}
                        <td title={transaction.id}>
                          {transaction.id.split('-')[0]}...
                        </td>
                        <td>
                          {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td>
                          {/* Đánh dấu Mua/Bán */}
                          <span className={transactionType === 'Mua' ? styles.textSuccess : styles.textDanger}>
                            {transactionType}
                          </span>
                        </td>
                        <td>{transaction.quantity}</td>
                        <td>{transaction.totalAmount.toLocaleString('vi-VN')}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[`badge${statusInfo.type}`]}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        {/* <td>
                          <button className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}>
                            Chi tiết
                          </button>
                        </td> */}
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;