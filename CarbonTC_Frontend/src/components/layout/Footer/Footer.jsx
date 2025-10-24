import React from 'react';
import styles from './Footer.module.css'; // ✅ dùng styles thay vì import thẳng file CSS

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row">
          {/* Cột 1 */}
          <div className="col-lg-4 mb-4">
            <div className={styles.footerBrand}>
              <i className="bi bi-lightning-charge-fill"></i>
              CarbonCredit
            </div>
            <p className={styles.footerDescription}>
              Nền tảng giao dịch tín chỉ carbon hàng đầu cho chủ sở hữu xe điện
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}><i className="bi bi-facebook"></i></a>
              <a href="#" className={styles.socialLink}><i className="bi bi-twitter"></i></a>
              <a href="#" className={styles.socialLink}><i className="bi bi-linkedin"></i></a>
              <a href="#" className={styles.socialLink}><i className="bi bi-instagram"></i></a>
            </div>
          </div>

          {/* Cột 2 */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className={styles.footerTitle}>Liên kết nhanh</h5>
            <ul className={styles.footerLinks}>
              <li><a href="#home">Trang chủ</a></li>
              <li><a href="#features">Tính năng</a></li>
              <li><a href="#marketplace">Thị trường</a></li>
              <li><a href="#about">Về chúng tôi</a></li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className={styles.footerTitle}>Hỗ trợ</h5>
            <ul className={styles.footerLinks}>
              <li><a href="#">Trợ giúp</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Liên hệ</a></li>
              <li><a href="#">Điều khoản</a></li>
            </ul>
          </div>

          {/* Cột 4 */}
          <div className="col-lg-4 mb-4">
            <h5 className={styles.footerTitle}>Đăng ký nhận tin</h5>
            <p className={styles.footerDescription}>
              Nhận thông tin cập nhật mới nhất về tín chỉ carbon
            </p>
            <form className={styles.newsletterForm}>
              <input
                type="email"
                className={styles.newsletterInput}
                placeholder="Email của bạn"
              />
              <button type="submit" className={styles.newsletterButton}>
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; 2025 CarbonCredit. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
