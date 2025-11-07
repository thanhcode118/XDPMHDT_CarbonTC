import React, { useState, useEffect } from 'react';
import styles from './Navbar.module.css'; 
import { Link } from 'react-router-dom';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClasses = `${styles.navbar} ${isScrolled ? styles.scrolled : ''}`;

  return (
    <nav className={navbarClasses}>
      <div className={styles.container}>
        <a className={styles.navbarBrand} href="#">
          <i className={`bi bi-lightning-charge-fill ${styles.navbarIcon}`}></i>
          CarbonCredit
        </a>
        <button className={styles.navbarToggler} type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className={styles.navbarTogglerIcon}></span>
        </button>
        <div className={`${styles.navbarCollapse} collapse`} id="navbarNav">
          <ul className={styles.navbarNav}>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="#home">Trang chủ</Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="#features">Tính năng</Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="#marketplace">Thị trường</Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="#about">Về chúng tôi</Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="#contact">Liên hệ</Link>
            </li>

            <li className={styles.navItem}>
              <Link className={`${styles.navLink} ${styles.userDropdown}`} to="/login">
                <i className={`bi bi-person-circle ${styles.userIcon}`}></i>
                Đăng nhập
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
