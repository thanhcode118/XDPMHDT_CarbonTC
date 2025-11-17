import React, { useEffect, useRef } from 'react';
import '@google/model-viewer';
import styles from './CSS/HeroSection.module.css'; 
import 'aos/dist/aos.css';
import logoModel from '../../assets/logoCb.glb';

const HeroSection = () => {
    const particlesContainerRef = useRef(null);

    useEffect(() => {
        
        function createParticles() {
            const particlesContainer = particlesContainerRef.current;
            if (!particlesContainer) return; // Dừng nếu ref chưa sẵn sàng

            const particlesCount = 50;
            
            for (let i = 0; i < particlesCount; i++) {
                const particle = document.createElement('div');
                
                particle.classList.add(styles.particle); 
                
                const size = Math.random() * 5 + 1;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                particle.style.left = `${posX}%`;
                particle.style.top = `${posY}%`;
                
                const opacity = Math.random() * 0.5 + 0.1;
                particle.style.opacity = opacity;
                
                const duration = Math.random() * 20 + 10;
                particle.style.animation = `float ${duration}s infinite ease-in-out`; 
                
                particlesContainer.appendChild(particle);
            }
        }

        createParticles();

        return () => {
            if (particlesContainerRef.current) {
                particlesContainerRef.current.innerHTML = '';
            }
        };

    }, []); // [] Chạy 1 lần khi component mount

    return (
        <>
            <section className={styles.heroSection} id="home">
                <div 
                    className={styles.heroParticles} 
                    id="heroParticles" 
                    ref={particlesContainerRef}
                ></div>
                
                <div className={`${styles.heroContent} container`}>
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            
                            <h1 className={styles.heroTitle} data-aos="fade-up">Nền tảng Giao dịch Tín chỉ Carbon cho Xe điện</h1>
                            <p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="100">Biến mỗi km di chuyển bằng xe điện thành giá trị bền vững</p>
                            <div className={styles.heroButtons} data-aos="fade-up" data-aos-delay="200">
                                
                                <a href="#user-types" className={`${styles.btnHero} ${styles.btnPrimaryGradient}`}>Bắt đầu ngay</a>
                                <a href="#features" className={`${styles.btnHero} ${styles.btnOutlineLight}`}>Tìm hiểu thêm</a>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className={styles.heroImage} data-aos="fade-left" data-aos-delay="300">
                                <model-viewer
                                    src={logoModel}
                                    alt="CarbonTC biểu tượng 3D"
                                    auto-rotate
                                    rotation-per-second="30deg"
                                    camera-controls
                                    disable-zoom
                                    shadow-intensity="0.8"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default HeroSection;