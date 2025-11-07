import React from 'react';
import styles from './CSS/CtaSection.module.css';

const CtaSection = () => {
    return (
        <div>
            <section className={styles.ctaSection}>
                <div className={styles.ctaBg}>
                    <img src="https://picsum.photos/seed/cta/1920/600.jpg" alt="CTA Background" className="img-fluid" />
                </div>
                <div className="container">
                    <h2 className={styles.ctaTitle} data-aos="fade-up">Sẵn sàng tham gia cách mạng xanh?</h2>
                    <p className={styles.ctaSubtitle} data-aos="fade-up" data-aos-delay="100">Đăng ký ngay hôm nay để bắt đầu hành trình giảm phát thải carbon của bạn</p>
                    <button className={styles.btnCta} data-aos="fade-up" data-aos-delay="200">Đăng ký ngay</button>
                </div>
            </section>
        </div>
    );
}

export default CtaSection;