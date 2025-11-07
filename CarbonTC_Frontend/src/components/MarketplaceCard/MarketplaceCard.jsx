import React from 'react';
import styles from './MarketplaceCard.module.css';

const MarketplaceCard = ({
  type,
  typeText,
  priceTrend,
  trendText,
  title,
  quantity,
  price,
  total,
  seller
}) => {
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
        <div className={`${styles.priceTrend} ${styles[priceTrend]}`}>
          {getTrendIcon()} {trendText}
        </div>
      </div>
      <h4 className={styles.marketplaceTitle}>{title}</h4>
      <div className={styles.marketplaceDetails}>
        <div className={styles.marketplaceDetailItem}>
          <div className={styles.marketplaceDetailValue}>{quantity}</div>
          <div className={styles.marketplaceDetailLabel}>Số lượng</div>
        </div>
        <div className={styles.marketplaceDetailItem}>
          <div className={styles.marketplaceDetailValue}>{price.toLocaleString()}</div>
          <div className={styles.marketplaceDetailLabel}>Giá/tín chỉ</div>
        </div>
        <div className={styles.marketplaceDetailItem}>
          <div className={styles.marketplaceDetailValue}>{total.toLocaleString()}</div>
          <div className={styles.marketplaceDetailLabel}>Tổng giá</div>
        </div>
      </div>
      <div className={styles.marketplaceFooter}>
        <div className={styles.marketplaceSeller}>
          <small>Người bán: {seller}</small>
        </div>
        <button className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}>
          {type === 'auction' ? 'Đặt giá' : 'Mua ngay'}
        </button>
      </div>
    </div>
  );
};

export default MarketplaceCard;