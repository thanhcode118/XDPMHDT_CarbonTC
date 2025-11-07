import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Register.module.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error khi user nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await register(formData);
      
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi trong quá trình đăng ký');
      
      // Xử lý validation errors từ API
      if (err.errors && Array.isArray(err.errors)) {
        const apiErrors = {};
        err.errors.forEach(error => {
          apiErrors[error.field.toLowerCase()] = error.message;
        });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerWrapper}>
        {/* Header */}
        <div className={styles.registerHeader} data-aos="fade-down">
          <div className={styles.brandLogo}>
            <i className="bi bi-lightning-charge-fill"></i>
            <span>CarbonCredit</span>
          </div>
          <h1 className={styles.registerTitle}>Tạo tài khoản mới</h1>
          <p className={styles.registerSubtitle}>Tham gia cộng đồng xe điện xanh</p>
        </div>

        {/* Form Card */}
        <div className={styles.registerCard} data-aos="fade-up">
          <div className={styles.cardBody}>
            {/* Global Error */}
            {error && (
              <div className={styles.alertDanger} role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Full Name Input */}
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  <i className="bi bi-person me-2"></i>
                  Họ và tên
                </label>
                <input
                  type="text"
                  className={`${styles.formControl} ${errors.fullName ? styles.isInvalid : ''}`}
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn An"
                  autoFocus
                  disabled={loading}
                />
                {errors.fullName && (
                  <div className={styles.invalidFeedback}>{errors.fullName}</div>
                )}
              </div>

              {/* Email Input */}
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  <i className="bi bi-envelope me-2"></i>
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  className={`${styles.formControl} ${errors.email ? styles.isInvalid : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <div className={styles.invalidFeedback}>{errors.email}</div>
                )}
              </div>

              {/* Phone Number Input */}
              <div className={styles.formGroup}>
                <label htmlFor="phoneNumber" className={styles.formLabel}>
                  <i className="bi bi-telephone me-2"></i>
                  Số điện thoại <span className={styles.optional}>(Tùy chọn)</span>
                </label>
                <input
                  type="tel"
                  className={`${styles.formControl} ${errors.phoneNumber ? styles.isInvalid : ''}`}
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+84912345678"
                  disabled={loading}
                />
                {errors.phoneNumber && (
                  <div className={styles.invalidFeedback}>{errors.phoneNumber}</div>
                )}
              </div>

              {/* Password Input */}
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  <i className="bi bi-lock me-2"></i>
                  Mật khẩu
                </label>
                <input
                  type="password"
                  className={`${styles.formControl} ${errors.password ? styles.isInvalid : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <div className={styles.invalidFeedback}>{errors.password}</div>
                )}
                <div className={styles.passwordHint}>
                  <i className="bi bi-info-circle me-1"></i>
                  Mật khẩu phải có ít nhất 6 ký tự
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  <i className="bi bi-lock-fill me-2"></i>
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  className={`${styles.formControl} ${errors.confirmPassword ? styles.isInvalid : ''}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <div className={styles.invalidFeedback}>{errors.confirmPassword}</div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className={styles.formCheck}>
                <input
                  type="checkbox"
                  className={styles.formCheckInput}
                  id="agreeTerms"
                  required
                  disabled={loading}
                />
                <label className={styles.formCheckLabel} htmlFor="agreeTerms">
                  Tôi đồng ý với{' '}
                  <Link to="/terms" className={styles.termsLink}>
                    Điều khoản dịch vụ
                  </Link>
                  {' '}và{' '}
                  <Link to="/privacy" className={styles.termsLink}>
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={`${styles.spinner} me-2`}></span>
                    Đang tạo tài khoản...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>
                    Tạo tài khoản
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={styles.divider}>
              <span>Hoặc đăng ký với</span>
            </div>

            {/* Social Register */}
            <div className={styles.socialRegister}>
              <button className={`${styles.btnSocial} ${styles.btnGoogle}`}>
                <i className="bi bi-google"></i>
                Google
              </button>
              <button className={`${styles.btnSocial} ${styles.btnFacebook}`}>
                <i className="bi bi-facebook"></i>
                Facebook
              </button>
            </div>

            {/* Footer */}
            <div className={styles.registerFooter}>
              <p>
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className={styles.loginLink}
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className={styles.additionalInfo} data-aos="fade-up" data-aos-delay="200">
          <div className={styles.featureItem}>
            <i className="bi bi-shield-check"></i>
            <span>An toàn & Bảo mật</span>
          </div>
          <div className={styles.featureItem}>
            <i className="bi bi-lightning-charge"></i>
            <span>Nhanh chóng & Dễ dàng</span>
          </div>
          <div className={styles.featureItem}>
            <i className="bi bi-gift"></i>
            <span>Ưu đãi cho thành viên mới</span>
          </div>
        </div>
      </div>
    </div>
  );
}