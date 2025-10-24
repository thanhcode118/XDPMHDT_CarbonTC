import React, { useState } from 'react';
import styles from './AccountTab.module.css';

const AccountTab = ({ onChangePassword }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState('');

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [id]: value
    }));

    if (id === 'newPassword') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) {
      setPasswordStrength('weak');
    } else if (strength <= 4) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }
    onChangePassword(passwordData);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordStrength('');
  };

  return (
    <div className={styles.tabContent} data-aos="fade-up">
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Đổi mật khẩu</h4>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.formLabel}>
                Mật khẩu hiện tại
              </label>
              <input 
                type="password" 
                className={styles.formControl}
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.formLabel}>
                Mật khẩu mới
              </label>
              <input 
                type="password" 
                className={styles.formControl}
                id="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <div className={styles.passwordStrength}>
                <div 
                  className={`${styles.passwordStrengthBar} ${
                    passwordStrength ? styles[`strength${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`] : ''
                  }`}
                ></div>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                Xác nhận mật khẩu mới
              </label>
              <input 
                type="password" 
                className={styles.formControl}
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <button type="submit" className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}>
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
      
      <div className={styles.card} data-aos="fade-up" data-aos-delay="200">
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Xác thực hai yếu tố</h4>
          <div className={styles.twoFactorContainer}>
            <div className={styles.twoFactorIcon}>
              <i className="bi bi-shield-check"></i>
            </div>
            <div className={styles.twoFactorInfo}>
              <h5>Bảo vệ tài khoản của bạn</h5>
              <p className={styles.twoFactorDescription}>
                Thêm một lớp bảo mật bổ sung cho tài khoản của bạn
              </p>
            </div>
          </div>
          <button className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}>
            Bật xác thực hai yếu tố
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;