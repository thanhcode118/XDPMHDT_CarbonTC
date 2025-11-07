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
import { getTransactionChartData } from '../../services/listingService';

const Reports = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [chartPeriod, setChartPeriod] = useState(0); 
  
  const [carbonChartData, setCarbonChartData] = useState({ labels: [], datasets: [] });
  const [chartLoading, setChartLoading] = useState(true);

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

  const co2ChartMockData = {
  labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
  datasets: [
    {
      label: 'CO₂ giảm (kg)',
      data: [45, 65, 68, 80], // Data giả
      backgroundColor: 'rgba(79, 172, 254, 0.7)',
      borderColor: 'rgba(79, 172, 254, 1)',
      borderWidth: 1
    }
  ]
};


  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const fetchChart = async () => {
      setChartLoading(true);
      try {
        const response = await getTransactionChartData(chartPeriod);
        if (response.data && response.data.success) {
          setCarbonChartData(response.data.data); // API trả về chính xác format
        } else {
          console.error("Không thể tải dữ liệu biểu đồ");
          showNotification('Không thể tải dữ liệu biểu đồ', 'error');
        }
      } catch (err) {
        console.error("Lỗi khi tải biểu đồ:", err);
        showNotification(err.message || 'Lỗi tải biểu đồ', 'error');
      } finally {
        setChartLoading(false);
      }
    };
    fetchChart();
  }, [chartPeriod, showNotification]);


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
            {chartLoading ? (
              <p style={{ textAlign: 'center', padding: '50px' }}>Đang tải biểu đồ...</p>
            ) : (
              <WalletChart data={carbonChartData} />
            )}
          </div>
        </div>
        
        {/* CO2 Reduction Chart */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="600">
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Biểu đồ giảm phát thải CO₂</h3>
          </div>
          <div className={styles.cardBody}>
            <WalletChart data={co2ChartMockData} />
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