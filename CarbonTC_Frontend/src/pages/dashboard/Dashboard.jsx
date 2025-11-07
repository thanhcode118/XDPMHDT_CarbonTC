import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import AISuggestion from '../../components/AISuggestion/AISuggestion';
import StatCard from '../../components/StatCard/StatCard';
import styles from './Dashboard.module.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dữ liệu và tùy chọn cho biểu đồ
const chartData = {
  labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
  datasets: [
    {
      label: 'Tín chỉ kiếm được',
      data: [12, 19, 8, 15, 22, 18, 25],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Tín chỉ đã bán',
      data: [5, 10, 3, 8, 12, 7, 15],
      borderColor: '#f093fb',
      backgroundColor: 'rgba(240, 147, 251, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#b8bcc8',
        font: { family: 'Inter' },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#b8bcc8' },
    },
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#b8bcc8' },
    },
  },
};


const Dashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(false);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
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

  const transactions = [
    {
      id: '#CC2023001',
      date: '15/05/2023',
      type: 'Bán',
      quantity: '20',
      price: '300.000',
      status: 'Hoàn thành',
      statusType: 'success'
    },
    {
      id: '#CC2023002',
      date: '10/05/2023',
      type: 'Bán',
      quantity: '15',
      price: '225.000',
      status: 'Hoàn thành',
      statusType: 'success'
    },
    {
      id: '#CC2023003',
      date: '05/05/2023',
      type: 'Đấu giá',
      quantity: '10',
      price: '180.000',
      status: 'Đang xử lý',
      statusType: 'warning'
    }
  ];

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
          content="Dựa trên dữ liệu thị trường hiện tại, giá tín chỉ carbon đang tăng 5% so với tuần trước. Chúng tôi đề xuất bạn niêm yết tín chỉ của mình với giá <strong>15.000 VNĐ/tín chỉ</strong> để tối đa hóa lợi nhuận."
          actionText="Áp dụng gợi ý"
          onAction={() => console.log('AI action clicked')}
        />
        
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
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
        </div>
        
        {/* Charts and Recent Activities */}
        <div className="row">
          <div className="col-lg-8">
            <div className={styles.card} data-aos="fade-up" data-aos-delay="100">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Biểu đồ tín chỉ carbon</h3>
                <div className={styles.btnGroup} role="group">
                  <button type="button" className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.active}`}>Tuần</button>
                  <button type="button" className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}>Tháng</button>
                  <button type="button" className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}>Năm</button>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.chartContainer}>
                  <Line options={chartOptions} data={chartData} />
                  <canvas id="carbonChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
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
          </div>
        </div>
        
        {/* Transactions Table */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="300">
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Giao dịch gần đây</h3>
            <button className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}>Xem tất cả</button>
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
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{transaction.id}</td>
                      <td>{transaction.date}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.quantity}</td>
                      <td>{transaction.price}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[`badge${transaction.statusType}`]}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td>
                        <button className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}>
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
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