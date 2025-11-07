import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import userService from '../../services/userService';
import styles from './AccountTab.module.css';

const AccountTab = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [id]: value
    }));
    if (id === 'newPassword') calculatePasswordStrength(value);
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return setPasswordStrength('');
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const validateForm = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới và xác nhận không khớp!');
      return false;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      alert('Mật khẩu mới phải khác mật khẩu hiện tại!');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Đổi mật khẩu thành công! Bạn sẽ được đăng xuất sau 3 giây...'
        });

        setTimeout(async () => {
          await logout();
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength('');
    }
  };

  return (
    <div className={styles.tabContent} data-aos="fade-up">
      {/* Hiển thị thông báo */}
{message.text && (
  <div
    className={`${styles.alertBox} ${
      message.type === 'success' ? styles.alertSuccess : styles.alertError
    }`}
    data-aos="fade-down"
  >
    <div className={styles.alertIcon}>
      {message.type === 'success' ? (
        <i className="bi bi-check-circle-fill"></i>
      ) : (
        <i className="bi bi-exclamation-triangle-fill"></i>
      )}
    </div>
    <div className={styles.alertContent}>
      <strong>
        {message.type === 'success' ? 'Thành công!' : 'Thất bại!'}
      </strong>
      <p>{message.text}</p>
    </div>
  </div>
)}


      {/* Form đổi mật khẩu */}
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
                    passwordStrength
                      ? styles[
                          `strength${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`
                        ]
                      : ''
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

            <button
              type="submit"
              disabled={loading}
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
            >
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>

      {/* Thẻ xác thực hai yếu tố */}
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
