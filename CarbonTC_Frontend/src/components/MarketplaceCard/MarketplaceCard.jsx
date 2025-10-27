import React, { useState } from 'react';
import styles from './MarketplaceCard.module.css';
import { useCountdown } from '../../hooks/useCountdown'; 

import PlaceBidModal from '../../components/PlaceBidModal/PlaceBidModal';
import BuyNowModal from '../../components/BuyNowModal/BuyNowModal';

const MarketplaceCard = ({
  type,
  typeText,
  priceTrend,
  trendText, 
  title,
  quantity,
  price,
  priceLabel = "Giá/tín chỉ", 
  total,
  totalLabel = "Tổng giá", 
  seller,
  auctionEndTime 
}) => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);

   const handleBuySubmit = (buyData) => {
    console.log('Buy data:', buyData);
    // Gọi API mua ngay
    setShowBuyModal(false);
  };

  const handleBidSubmit = (bidData) => {
    console.log('Bid data:', bidData);
    // Gọi API đặt giá
    setShowBidModal(false);
  };


  const { days, hours, minutes, seconds, isOver } = useCountdown(auctionEndTime);

  const CountdownDisplay = () => {
    if (isOver) {
      return <span style={{ color: '#dc3545' }}>Đã kết thúc</span>;
    }
    
    return (
      <span style={{ minWidth: '80px', display: 'inline-block' }}>
        {days > 0 && `${days}d `}
        {hours > 0 && `${hours}h `}
        {minutes > 0 && `${minutes}m `}
        {seconds >= 0 && `${seconds}s`}
      </span>
    );
  };

  const getTrendIcon = () => {
    switch (priceTrend) {
      case 'up': return <i className="bi bi-arrow-up"></i>;
      case 'down': return <i className="bi bi-arrow-down"></i>;
      case 'time': return <i className="bi bi-clock"></i>;
      default: return null;
    }
  };

  return (
    <div className={styles.marketplaceCard} data-aos="fade-up" data-aos-delay="300">
      <div className={styles.marketplaceHeader}>
        <span className={`${styles.marketplaceType} ${styles[type]}`}>
          {typeText}
        </span>

        <div className={`${styles.priceTrend} ${styles[type === 'auction' ? 'time' : priceTrend]}`}>
          {getTrendIcon()} 
          {type === 'auction' ? <CountdownDisplay /> : (trendText || 'N/A')}
        </div>
      </div>
      <h4 className={styles.marketplaceTitle}>{title}</h4>
      <div className={styles.marketplaceDetails}>
        <div className={styles.marketplaceDetailItem}>
          <div className={styles.marketplaceDetailValue}>{quantity.toLocaleString()}</div>
          <div className={styles.marketplaceDetailLabel}>Số lượng</div>
        </div>
        <div className={styles.marketplaceDetailItem}>
          <div className={styles.marketplaceDetailValue}>{price.toLocaleString()}</div>
          <div className={styles.marketplaceDetailLabel}>{priceLabel}</div>
        </div>
        <div className={styles.marketplaceDetailItem}>
          <div className={styles.marketplaceDetailValue}>{total.toLocaleString()}</div>
          <div className={styles.marketplaceDetailLabel}>{totalLabel}</div>
        </div>
      </div>
      <div className={styles.marketplaceFooter}>
        <div className={styles.marketplaceSeller}>
          <small>Người bán: {seller}</small>
        </div>
        <button 
          className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
          onClick={() => type === 'auction' ? setShowBidModal(true) : setShowBuyModal(true)}
          disabled={type === 'auction' && isOver} 
        >
          {type === 'auction' ? 'Đặt giá' : 'Mua ngay'}
        </button>
      </div>

      {type === 'auction' ? (
        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          onSubmit={handleBidSubmit}
          listingData={{
            quantity: quantity,
            minimumBid: price,
            currentPrice: total,
            seller: seller,
            timeRemaining: '2 ngày 14 giờ'
          }}
        />
      ) : (
        <BuyNowModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          onSubmit={handleBuySubmit}
          listingData={{
            quantity: quantity,
            pricePerUnit: price,
            seller: seller
          }}
        />
      )}
    </div>
  );
};

export default MarketplaceCard;