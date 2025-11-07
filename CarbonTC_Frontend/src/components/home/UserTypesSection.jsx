import React from 'react';
import styles from './CSS/UserTypesSection.module.css';

const UserTypesSection = () => {
    return (
        <div>
            <section className={styles.userTypesSection} id="user-types">
                <div className="container">
                    <h2 className={styles.sectionTitle} data-aos="fade-up">Bạn là ai?</h2>
                    <p className={styles.sectionSubtitle} data-aos="fade-up" data-aos-delay="100">Chọn vai trò phù hợp để trải nghiệm nền tảng của chúng tôi</p>
                    
                    <div className="row g-4">
                        <div className="col-md-3" data-aos="fade-up" data-aos-delay="200">
                            <div className={styles.userTypeCard}>
                                <div className={`${styles.userTypeIcon} ${styles.evOwnerIcon}`}>
                                    <i className="bi bi-ev-station-fill text-white"></i>
                                </div>
                                <h4 className={styles.userTypeTitle}>Chủ sở hữu xe điện</h4>
                                <p className={styles.userTypeDescription}>Kết nối xe điện, theo dõi tín chỉ carbon và kiếm tiền từ việc giảm phát thải</p>
                                {/* LỖI 3: Kết hợp 2 class module */}
                                <a href="login-ev-owner.html" className={`${styles.btnUserType} ${styles.btnEvOwner}`}>Đăng nhập</a>
                            </div>
                        </div>
                        <div className="col-md-3" data-aos="fade-up" data-aos-delay="300">
                            <div className={styles.userTypeCard}>
                                <div className={`${styles.userTypeIcon} ${styles.buyerIcon}`}>
                                    <i className="bi bi-cart-check-fill text-white"></i>
                                </div>
                                <h4 className={styles.userTypeTitle}>Người mua tín chỉ carbon</h4>
                                <p className={styles.userTypeDescription}>Mua tín chỉ carbon để bù đắp phát thải và thực hiện cam kết môi trường</p>
                                <a href="login-buyer.html" className={`${styles.btnUserType} ${styles.btnBuyer}`}>Đăng nhập</a>
                            </div>
                        </div>
                        <div className="col-md-3" data-aos="fade-up" data-aos-delay="400">
                            <div className={styles.userTypeCard}>
                                <div className={`${styles.userTypeIcon} ${styles.verifierIcon}`}>
                                    <i className="bi bi-patch-check-fill text-white"></i>
                                </div>
                                <h4 className={styles.userTypeTitle}>Tổ chức xác minh</h4>
                                <p className={styles.userTypeDescription}>Kiểm tra và xác minh dữ liệu phát thải, cấp tín chỉ carbon</p>
                                <a href="login-verifier.html" className={`${styles.btnUserType} ${styles.btnVerifier}`}>Đăng nhập</a>
                            </div>
                        </div>
                        <div className="col-md-3" data-aos="fade-up" data-aos-delay="500">
                            <div className={styles.userTypeCard}>
                                <div className={`${styles.userTypeIcon} ${styles.adminIcon}`}>
                                    <i className="bi bi-gear-fill text-white"></i>
                                </div>
                                <h4 className={styles.userTypeTitle}>Quản trị viên</h4>
                                <p className={styles.userTypeDescription}>Quản lý hệ thống, người dùng và giao dịch trên nền tảng</p>
                                <a href="login-admin.html" className={`${styles.btnUserType} ${styles.btnAdmin}`}>Đăng nhập</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default UserTypesSection;