import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import StatCard from '../../components/StatCard/StatCard';
import PeriodSelector from '../../components/PeriodSelector/PeriodSelector';
import ReportTable from '../../components/ReportTable/ReportTable';
import GenerateReportModal from '../../components/GenerateReportModal/GenerateReportModal';
import WalletChart from '../../components/WalletChart/WalletChart';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import styles from './Reports.module.css';

const Reports = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [activePeriod, setActivePeriod] = useState('month');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sample data
  const reportStats = [
    {
      type: '1',
      icon: 'bi-piggy-bank-fill',
      value: '125',
      label: 'Tổng tín chỉ',
      change: '12% so với tháng trước',
      changeType: 'positive'
    },
    {
      type: '2',
      icon: 'bi-currency-dollar',
      value: '1.875.000',
      label: 'Tổng doanh thu (VNĐ)',
      change: '8% so với tháng trước',
      changeType: 'positive'
    },
    {
      type: '3',
      icon: 'bi-cloud-arrow-down-fill',
      value: '312 kg',
      label: 'Tổng CO₂ giảm (kg)',
      change: '15% so với tháng trước',
      changeType: 'positive'
    },
    {
      type: '4',
      icon: 'bi-signpost-2-fill',
      value: '42',
      label: 'Tổng hành trình',
      change: '5% so với tháng trước',
      changeType: 'positive'
    }
  ];

  const tableData = [
    { date: '15/05/2023', type: 'Bán', credits: 20, value: 300000, co2Reduced: 50, status: 'Hoàn thành' },
    { date: '14/05/2023', type: 'Bán', credits: 15, value: 225000, co2Reduced: 37.5, status: 'Hoàn thành' },
    { date: '12/05/2023', type: 'Kiếm được', credits: 9, value: 0, co2Reduced: 22.5, status: 'Hoàn thành' },
    { date: '10/05/2023', type: 'Kiếm được', credits: 6, value: 0, co2Reduced: 15, status: 'Hoàn thành' },
    { date: '08/05/2023', type: 'Bán', credits: 10, value: 150000, co2Reduced: 25, status: 'Đang xử lý' }
  ];

  const getChartData = (period) => {
    const dataConfig = {
      week: {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        data1: [3, 5, 2, 4, 6, 3, 5],
        data2: [2, 3, 1, 3, 4, 2, 3]
      },
      month: {
        labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
        data1: [15, 22, 18, 25],
        data2: [10, 15, 12, 20]
      },
      quarter: {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3'],
        data1: [45, 65, 68],
        data2: [32, 47, 52]
      },
      year: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data1: [178, 195, 210, 225],
        data2: [131, 145, 155, 165]
      }
    };

    const config = dataConfig[period] || dataConfig.month;

    return {
      carbonChart: {
        labels: config.labels,
        datasets: [
          {
            label: 'Tín chỉ kiếm được',
            data: config.data1,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Tín chỉ đã bán',
            data: config.data2,
            borderColor: '#f093fb',
            backgroundColor: 'rgba(240, 147, 251, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      co2Chart: {
        labels: config.labels,
        datasets: [
          {
            label: 'CO₂ giảm (kg)',
            data: config.data1.map(d => d * 2.5),
            backgroundColor: 'rgba(79, 172, 254, 0.7)',
            borderColor: 'rgba(79, 172, 254, 1)',
            borderWidth: 1
          }
        ]
      }
    };
  };

  const [chartData, setChartData] = useState(getChartData('month'));

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    setChartData(getChartData(activePeriod));
  }, [activePeriod]);

  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };

  const handleGenerateReport = (reportData) => {
    console.log('Generating report:', reportData);
    showNotification('Báo cáo đang được tạo. Bạn sẽ nhận được thông báo khi báo cáo sẵn sàng!', 'success');
  };

  const handleExport = (format) => {
    showNotification(`Đang xuất báo cáo định dạng ${format.toUpperCase()}...`, 'info');
    // Simulate export
    setTimeout(() => {
      showNotification(`Xuất báo cáo ${format.toUpperCase()} thành công!`, 'success');
    }, 2000);
  };

  const handleCloseModal = () => {
    setShowGenerateModal(false);
  };

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.mainContent}>
          <div className={styles.loadingState}>
            <i className="bi bi-arrow-repeat"></i>
            <p>Đang tải dữ liệu báo cáo...</p>
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
        activePage="reports" 
        onPageChange={() => {}} 
        className={sidebarActive ? 'activemenu' : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Báo cáo" />
        
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {reportStats.map((stat, index) => (
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
        
        {/* Carbon Credits Chart */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="500">
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Biểu đồ tín chỉ carbon</h3>
            <button 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
              onClick={() => setShowGenerateModal(true)}
            >
              <i className="bi bi-download me-1"></i>Tạo báo cáo
            </button>
          </div>
          <div className={styles.cardBody}>
            <PeriodSelector
              activePeriod={activePeriod}
              onPeriodChange={handlePeriodChange}
            />
            <WalletChart data={chartData.carbonChart} />
          </div>
        </div>
        
        {/* CO2 Reduction Chart */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="600">
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Biểu đồ giảm phát thải CO₂</h3>
          </div>
          <div className={styles.cardBody}>
            <WalletChart data={chartData.co2Chart} />
          </div>
        </div>
        
        {/* Transaction History Table */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="700">
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Lịch sử giao dịch</h3>
          </div>
          <div className={styles.cardBody}>
            <ReportTable
              data={tableData}
              onExport={handleExport}
            />
          </div>
        </div>
      </div>
      
      {/* Generate Report Modal */}
      <GenerateReportModal
        show={showGenerateModal}
        onClose={handleCloseModal}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
};

export default Reports;