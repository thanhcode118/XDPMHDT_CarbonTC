import React from 'react';
import styles from './ListingTable.module.css';

const ListingTable = ({ listings, onEdit, onCancel, onViewDetails }) => {
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Đang bán</span>;
      case 'pending':
        return <span className={`${styles.badge} ${styles.badgeWarning}`}>Đang chờ</span>;
      case 'sold':
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Đã bán</span>;
      case 'cancelled':
        return <span className={`${styles.badge} ${styles.badgeDanger}`}>Đã hủy</span>;
      default:
        return <span className={styles.badge}>{status}</span>;
    }
  };

  return (
    <div className={styles.card} data-aos="fade-up" data-aos-delay="100">
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Niêm yết của bạn</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.tableResponsive}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>Mã niêm yết</th>
                <th>Số lượng</th>
                {/* --- (THAY ĐỔI) --- */}
                <th>Giá (VNĐ)</th>
                <th>Trạng thái</th>
                <th>Thời gian</th> 
                {/* --- (HẾT THAY ĐỔI) --- */}
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Bạn chưa có niêm yết nào.</td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr key={listing.id}>
                    <td title={listing.id}>{listing.id.substring(0, 8)}...</td>
                    <td>{listing.quantity}</td>
                    
                    {/* --- (THAY ĐỔI) --- */}
                    {/* Hiển thị giá tùy theo loại */}
                    <td>
                      {listing.type === 2 // 2 = Auction
                        ? `${listing.minimumBid.toLocaleString()} (Khởi điểm)`
                        : `${listing.pricePerUnit.toLocaleString()} (Cố định)`
                      }
                    </td>
                    {/* --- (HẾT THAY ĐỔI) --- */}

                    <td>{getStatusBadge(listing.status)}</td>

                    {/* --- (THAY ĐỔI) --- */}
                    {/* Hiển thị ngày đăng VÀ ngày kết thúc (nếu có) */}
                    <td>
                      <div>
                        Đăng: {new Date(listing.createdAt).toLocaleString('vi-VN')}
                      </div>
                      
                      {/* Chỉ hiển thị nếu là đấu giá VÀ có ngày kết thúc */}
                      {listing.type === 2 && listing.auctionEndTime && (
                        <div style={{ color: '#4891b4ff', fontWeight: 'bold', marginTop: '4px' }}>
                          Kết thúc: {new Date(listing.auctionEndTime).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </td>
                    {/* --- (HẾT THAY ĐỔI) --- */}

                    <td>
                      <div className={styles.actionButtons}>
                        {listing.status === 'active' && ( 
                          <>
                            <button 
                              className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}
                              onClick={() => onEdit(listing.id)}
                            >
                              Chỉnh sửa
                            </button>
                            <button 
                              className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}
                              onClick={() => onCancel(listing.id)}
                            >
                              Hủy
                            </button>
                          </>
                        )}
                        {/* Các nút khác */}
                        {listing.status !== 'active' && (
                           <button 
                              className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}
                              onClick={() => onViewDetails(listing.id)}
                            >
                              Chi tiết
                            </button>
                         )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListingTable;