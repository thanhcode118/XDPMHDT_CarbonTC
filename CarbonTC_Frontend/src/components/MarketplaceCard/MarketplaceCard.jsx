import React from 'react';
import styles from './MarketplaceCard.module.css';
import { useCountdown } from '../../hooks/useCountdown'; 
import { 
  getUserIdFromToken
} from '../../services/listingService';

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
  auctionEndTime,
  rawData,
  onBuyClick, 
  onBidClick  
}) => {

  const currentUserId = getUserIdFromToken();
  const isOwner = rawData?.ownerId === currentUserId;
  const isAuction = type === 'auction';

  const { days, hours, minutes, seconds, isOver } = useCountdown(auctionEndTime);

  const CountdownDisplay = () => {
    if (isOver) {
      return <span style={{ color: '#dc3545' }}>Đã kết thúc</span>;
    }
    
    return (
      <span className='ms-2' style={{ minWidth: '80px', display: 'inline-block' }}>
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

  // 🆕 TỐI ƯU: Dùng icon và text ngắn gọn
  const getButtonConfig = () => {
    if (isAuction) {
      if (isOver) {
        return { 
          text: 'Kết thúc', 
          icon: 'bi-clock-history',
          disabled: true, 
          action: null 
        };
      }
      if (isOwner) {
        return { 
          text: 'Xem', // 🆕 CHỈ "Xem" thay vì "Xem đấu giá"
          icon: 'bi-eye',
          disabled: false, 
          action: onBidClick 
        };
      }
      return { 
        text: 'Đặt giá', 
        icon: 'bi-hammer',
        disabled: false, 
        action: onBidClick 
      };
    }
    return { 
      text: 'Mua ngay', 
      icon: 'bi-cart',
      disabled: false, 
      action: onBuyClick 
    };
  };

  const buttonConfig = getButtonConfig();

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
          {isOwner && (
            <span className={styles.ownerBadge} title="Sản phẩm của bạn">
              <i className="bi bi-person-check"></i>
            </span>
          )}
        </div>
        
        {/* 🆕 TỐI ƯU: Nút nhỏ gọn với icon + text ngắn */}
        <button 
          className={`${styles.btnCustom} ${
            isOwner && isAuction ? styles.btnViewAuction : 
            isAuction ? styles.btnBid : styles.btnBuy
          }`}
          onClick={buttonConfig.action}
          disabled={buttonConfig.disabled}
          title={isOwner && isAuction ? "Xem diễn biến đấu giá" : ""}
        >
          <i className={`bi ${buttonConfig.icon}`}></i>
          <span>{buttonConfig.text}</span>
        </button>
      </div>
    </div>
  );
};

export default MarketplaceCard;