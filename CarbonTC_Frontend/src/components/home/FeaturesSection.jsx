import React from 'react';
import styles from './CSS/FeaturesSection.module.css';

const FeaturesSection = () => {
    return (
        <div>
            <section className={styles.featuresSection} id="features">
                <div className="container">

                    <h2 className={styles.sectionTitle} data-aos="fade-up">Tính năng nổi bật</h2>
                    <p className={styles.sectionSubtitle} data-aos="fade-up" data-aos-delay="100">Khám phá những tính năng ưu việt của nền tảng chúng tôi</p>
                    
                    <div className="row g-4">
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                            <div className={styles.featureCard}>
                                {/* LỖI 3: Kết hợp 2 class module */}
                                <div className={`${styles.featureIcon} ${styles.featureIcon1}`}>
                                    <i className="bi bi-lightning-charge-fill text-white"></i>
                                </div>
                                <h4 className={styles.featureTitle}>Kết nối xe điện</h4>
                                <p className={styles.featureDescription}>Đồng bộ dữ liệu hành trình từ xe điện một cách tự động và an toàn</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                            <div className={styles.featureCard}>
                                <div className={`${styles.featureIcon} ${styles.featureIcon2}`}>
                                    <i className="bi bi-calculator-fill text-white"></i>
                                </div>
                                <h4 className={styles.featureTitle}>Tính toán chính xác</h4>
                                <p className={styles.featureDescription}>Hệ thống tính toán lượng CO₂ giảm phát thải và quy đổi sang tín chỉ carbon</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
                            <div className={styles.featureCard}>
                                <div className={`${styles.featureIcon} ${styles.featureIcon3}`}>
                                    <i className="bi bi-wallet2-fill text-white"></i>
                                </div>
                                <h4 className={styles.featureTitle}>Ví carbon</h4>
                                <p className={styles.featureDescription}>Quản lý và theo dõi số dư tín chỉ carbon của bạn một cách dễ dàng</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
                            <div className={styles.featureCard}>
                                <div className={`${styles.featureIcon} ${styles.featureIcon4}`}>
                                    <i className="bi bi-shop-fill text-white"></i>
                                </div>
                                <h4 className={styles.featureTitle}>Thị trường mở</h4>
                                <p className={styles.featureDescription}>Niêm yết và giao dịch tín chỉ carbon với giá cố định hoặc qua đấu giá</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="600">
                            <div className={styles.featureCard}>
                                <div className={`${styles.featureIcon} ${styles.featureIcon5}`}>
                                    <i className="bi bi-robot-fill text-white"></i>
                                </div>
                                <h4 className={styles.featureTitle}>AI gợi ý giá</h4>
                                <p className={styles.featureDescription}>Hệ thống AI thông minh gợi ý giá bán tối ưu dựa trên dữ liệu thị trường</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="700">
                            <div className={styles.featureCard}>
                                <div className={`${styles.featureIcon} ${styles.featureIcon6}`}>
                                    <i className="bi bi-graph-up-arrow text-white"></i>
                                </div>
                                <h4 className={styles.featureTitle}>Báo cáo chi tiết</h4>
                                <p className={styles.featureDescription}>Xem báo cáo chi tiết về lượng CO₂ giảm và doanh thu từ tín chỉ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default FeaturesSection;