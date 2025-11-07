import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './ConnectedAccountsTab.module.css';
import Button from '../../components/Button/Button';
import AlertBox from '../../components/AlertBox/AlertBox';
import CustomModal from '../../components/CustomModal/CustomModal';
import userService from '../../services/userService';

const ConnectedAccountsTab = ({ onAccountAction }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const accounts = [
    {
      id: 'google',
      name: 'Google',
      email: 'an.nguyen@gmail.com',
      connected: true,
      icon: 'bi-google',
      bgColor: styles.googleIcon
    },
    {
      id: 'facebook',
      name: 'Facebook',
      email: 'Chưa kết nối',
      connected: false,
      icon: 'bi-facebook',
      bgColor: styles.facebookIcon
    }
  ];

  const handleAccountAction = (account) => {
    const action = account.connected ? 'disconnect' : 'connect';
    onAccountAction(account.id, action);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setMessage(null);
    setLoading(true);

    try {
      const response = await userService.deleteAccount();

      // Nếu server trả success = false, hiển thị lỗi
      if (!response.success) {
        const errorDetails = response.errors?.map(e => e.message).join('; ') || '';
        setMessage({
          type: 'error',
          text: `${response.message}${errorDetails ? ' - ' + errorDetails : ''}`
        });
        return;
      }

      // Nếu thành công, logout và navigate
      await logout();
      navigate('/login');

    } catch (error) {
      // Lỗi network hoặc exception
      setMessage({
        type: 'error',
        text: error.message || 'Xóa tài khoản thất bại. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
      // Tự động ẩn thông báo sau 5s
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className={styles.tabContent} data-aos="fade-up">

      {/* Alert Message */}
      {message && <AlertBox message={message} />}

      {/* Linked Accounts */}
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Tài khoản liên kết</h4>
          <p className={styles.cardDescription}>
            Liên kết các tài khoản mạng xã hội của bạn để đăng nhập dễ dàng hơn
          </p>

          {accounts.map(account => (
            <div key={account.id} className={styles.connectedAccount}>
              <div className={`${styles.accountIcon} ${account.bgColor}`}>
                <i className={`bi ${account.icon}`}></i>
              </div>
              <div className={styles.accountInfo}>
                <div className={styles.accountName}>{account.name}</div>
                <div className={styles.accountEmail}>{account.email}</div>
              </div>
              <button
                className={`${styles.btnCustom} ${
                  account.connected ? styles.btnOutlineCustom : styles.btnPrimaryCustom
                } ${styles.btnSm}`}
                onClick={() => handleAccountAction(account)}
              >
                {account.connected ? 'Ngắt kết nối' : 'Kết nối'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className={styles.card} data-aos="fade-up" data-aos-delay="200">
        <div className={styles.cardBody}>
          <div className={styles.dangerZone}>
            <h4 className={styles.dangerZoneTitle}>Vùng nguy hiểm</h4>
            <p className={styles.dangerZoneDescription}>
              Các hành động này không thể hoàn tác. Hãy cẩn thận!
            </p>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={loading}
              className={`${styles.btnCustom} ${styles.btnDangerCustom} w-full`}
            >
              Xóa tài khoản
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      <CustomModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa Tài khoản Vĩnh Viễn"
        body="Bạn có chắc chắn muốn xóa tài khoản của mình? Hành động này không thể hoàn tác. TẤT CẢ DỮ LIỆU, lịch sử giao dịch và thông tin cá nhân của bạn sẽ bị xóa VĨNH VIỄN."
        confirmText="XÓA VĨNH VIỄN"
        danger={true}
      />
    </div>
  );
};

export default ConnectedAccountsTab;
