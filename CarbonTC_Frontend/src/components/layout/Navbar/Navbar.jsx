import React, { useState, useEffect } from 'react';
import styles from './Navbar.module.css'; 
import { Link } from 'react-router-dom';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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
            <li className={`${styles.navItem} ${styles.dropdown}`}>
              <Link className={`${styles.navLink} ${styles.userDropdown} ${styles.dropdownToggle}`} 
                 to="#" 
                 id="userDropdown" 
                 role="button" 
                 data-bs-toggle="dropdown">
                <i className={`bi bi-person-circle ${styles.userIcon}`}></i>
                Đăng nhập
              </Link>
              <ul className={`${styles.dropdownMenu} dropdown-menu`}>
                <li><Link className={styles.dropdownItem} to="/dashboard">Chủ xe điện</Link></li>
                <li><Link className={styles.dropdownItem} to="login-buyer.html">Người mua tín chỉ</Link></li>
                <li><Link className={styles.dropdownItem} to="login-verifier.html">Tổ chức xác minh</Link></li>
                <li><Link className={styles.dropdownItem} to="login-admin.html">Quản trị viên</Link></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;