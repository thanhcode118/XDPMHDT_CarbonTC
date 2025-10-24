import React, { useEffect, useRef } from 'react';
import styles from './CSS/StatsSection.module.css';

const StatsSection = () => {

    const statsSectionRef = useRef(null);

    useEffect(() => {
        if (!statsSectionRef.current) {
            return;
        }

        const counters = statsSectionRef.current.querySelectorAll(`.${styles.statNumber}`);
        const speed = 200;

        counters.forEach(counter => {
            const animate = () => {
                const value = +counter.getAttribute('data-count');
                const data = +counter.innerText;
                const time = value / speed;

                if (data < value) {
                    counter.innerText = Math.ceil(data + time);
                    setTimeout(animate, 1);
                } else {
                    counter.innerText = value;
                }
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animate();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
        
    }, []); // [] Chạy 1 lần

    return (
        <div>
            <section className={styles.statsSection} ref={statsSectionRef}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-3 col-6">
                            <div className={styles.statItem} data-aos="fade-up" data-aos-delay="100">
                                <div className={styles.statNumber} data-count="12500">1000+</div>
                                <div className={styles.statLabel}>Chủ xe điện</div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className={styles.statItem} data-aos="fade-up" data-aos-delay="200">
                                <div className={styles.statNumber} data-count="8500">5000+</div>
                                <div className={styles.statLabel}>Tín chỉ đã giao dịch</div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className={styles.statItem} data-aos="fade-up" data-aos-delay="300">
                                <div className={styles.statNumber} data-count="3200">30</div>
                                <div className={styles.statLabel}>Tấn CO₂ giảm phát thải</div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className={styles.statItem} data-aos="fade-up" data-aos-delay="400">
                                <div className={styles.statNumber} data-count="98">98</div>
                                <div className={styles.statLabel}>% Tỷ lệ hài lòng</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default StatsSection;