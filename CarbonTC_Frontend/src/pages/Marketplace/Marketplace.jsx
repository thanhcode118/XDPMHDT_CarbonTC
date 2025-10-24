import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import AISuggestion from '../../components/AISuggestion/AISuggestion';
import Tabs from '../../components/Tabs/Tabs';
import MarketplaceCard from '../../components/MarketplaceCard/MarketplaceCard';
import styles from './Marketplace.module.css';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [sidebarActive, setSidebarActive] = useState(false);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const marketplaceData = [
    {
      id: 1,
      type: 'fixed-price',
      typeText: 'Giá cố định',
      priceTrend: 'up',
      trendText: '2.5%',
      title: 'Tín chỉ carbon từ xe điện VinFast',
      quantity: 50,
      price: 14500,
      total: 725000,
      seller: 'Công ty ABC'
    },
    {
      id: 2,
      type: 'fixed-price',
      typeText: 'Giá cố định',
      priceTrend: 'down',
      trendText: '1.2%',
      title: 'Tín chỉ carbon từ xe điện Tesla',
      quantity: 30,
      price: 15200,
      total: 456000,
      seller: 'Công ty XYZ'
    },
    {
      id: 3,
      type: 'auction',
      typeText: 'Đấu giá',
      priceTrend: 'time',
      trendText: '2 ngày còn lại',
      title: 'Tín chỉ carbon từ xe điện Hyundai',
      quantity: 40,
      price: 14800,
      total: 592000,
      seller: 'Công ty DEF'
    }
  ];

  return (
    <div className={styles.app}>
      <button className={styles.mobileToggle} id="sidebarToggle" onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>
      
      <Sidebar 
        activePage="marketplace" 
        className={sidebarActive ? 'activemenu' : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Thị trường tín chỉ carbon" />
        
        <AISuggestion
          title="Gợi ý từ AI"
          content="Dựa trên dữ liệu thị trường hiện tại, giá tín chỉ carbon đang tăng 5% so với tuần trước. Chúng tôi đề xuất bạn niêm yết tín chỉ của mình với giá <strong>15.000 VNĐ/tín chỉ</strong> để tối đa hóa lợi nhuận."
          actionText="Niêm yết theo gợi ý"
          onAction={() => console.log('AI action clicked')}
        />
        
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'buy' && (
          <div className={styles.tabContent}>
            {/* Filter Section */}
            <div className={styles.filterSection} data-aos="fade-up" data-aos-delay="200">
              <h3 className={styles.filterTitle}>Bộ lọc tìm kiếm</h3>
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="quantity" className={styles.formLabel}>Số lượng tín chỉ</label>
                  <input type="number" className={styles.formControl} id="quantity" placeholder="Tối thiểu" />
                </div>
                <div className="col-md-3">
                  <label htmlFor="price" className={styles.formLabel}>Giá (VNĐ)</label>
                  <input type="number" className={styles.formControl} id="price" placeholder="Tối đa" />
                </div>
                <div className="col-md-3">
                  <label htmlFor="region" className={styles.formLabel}>Khu vực</label>
                  <select className={styles.formSelect} id="region">
                    <option selected>Tất cả</option>
                    <option value="1">Miền Bắc</option>
                    <option value="2">Miền Trung</option>
                    <option value="3">Miền Nam</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button className={`${styles.btnCustom} ${styles.btnPrimaryCustom} w-100`}>Tìm kiếm</button>
                </div>
              </div>
            </div>
            
            {/* Marketplace Cards */}
            <div className={styles.marketplaceGrid}>
              {marketplaceData.map((item) => (
                <MarketplaceCard key={item.id} {...item} />
              ))}
            </div>
          </div>
        )}
        
        {/* Các tab khác (sell, auction) có thể được thêm tương tự */}
      </div>
    </div>
  );
};

export default Marketplace;