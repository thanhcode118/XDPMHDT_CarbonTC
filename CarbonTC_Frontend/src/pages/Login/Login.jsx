import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
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
    const response = await login(formData);

    if (response && response.success) {
      const user = response.data.user;
      // const userRole = (user.role || '').toLowerCase();
      console.log('📱 [Login.jsx] Login response:', response);
      const userRole = user.roleName || user.roleType || user.Role || user.RoleType;

      if (userRole === 'Admin') {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        const normalizedUser = {
          ...user,
          role: 'ADMIN'
        };

        const userJson = encodeURIComponent(JSON.stringify(normalizedUser));
        window.location.href = `/admin/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&user=${userJson}`;
        console.log('✅ [Login.jsx] Admin login - AuthContext will handle navigation');
        // navigate('/admin/dashboard');
        // return;
      } else {
        console.log('👤 [Login.jsx] Regular user - Navigate to /dashboard');
        navigate('/dashboard');
      }
    } else {
      setError(response?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      setTimeout(() => setError(''), 5000);
    }
  } catch (err) {
    setError(err.message || 'Email hoặc mật khẩu không đúng.');
    setTimeout(() => setError(''), 5000);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginWrapper}>
        {/* Header */}
        <div className={styles.loginHeader} data-aos="fade-down">
          <div className={styles.brandLogo}>
            <i className="bi bi-lightning-charge-fill"></i>
            <span>CarbonCredit</span>
          </div>
          <h1 className={styles.loginTitle}>Chào mừng trở lại!</h1>
          <p className={styles.loginSubtitle}>Đăng nhập để tiếp tục</p>
        </div>

        {/* Form Card */}
        <div className={styles.loginCard} data-aos="fade-up">
          <div className={styles.cardBody}>
            {/* Global Error */}
            {error && (
              <div className={styles.alertDanger} role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                  autoFocus
                  disabled={loading}
                />
                {errors.email && (
                  <div className={styles.invalidFeedback}>{errors.email}</div>
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
              </div>

              <div className={styles.formOptions}>
                <div className={styles.formCheck}>
                  <input
                    type="checkbox"
                    className={styles.formCheckInput}
                    id="rememberMe"
                    disabled={loading}
                  />
                  <label className={styles.formCheckLabel} htmlFor="rememberMe">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className={styles.forgotLink}
                >
                  Quên mật khẩu?
                </Link>
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
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Đăng nhập
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={styles.divider}>
              <span>Hoặc đăng nhập với</span>
            </div>

            {/* Social Login */}
            <div className={styles.socialLogin}>
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
            <div className={styles.loginFooter}>
              <p>
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className={styles.registerLink}
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
