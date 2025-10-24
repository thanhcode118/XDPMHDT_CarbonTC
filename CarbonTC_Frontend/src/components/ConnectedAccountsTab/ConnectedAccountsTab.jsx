import React from 'react';
import styles from './ConnectedAccountsTab.module.css';

const ConnectedAccountsTab = ({ onAccountAction, onDeleteAccount }) => {
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

  return (
    <div className={styles.tabContent} data-aos="fade-up">
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
      
      <div className={styles.card} data-aos="fade-up" data-aos-delay="200">
        <div className={styles.cardBody}>
          <div className={styles.dangerZone}>
            <h4 className={styles.dangerZoneTitle}>Vùng nguy hiểm</h4>
            <p className={styles.dangerZoneDescription}>
              Các hành động này không thể hoàn tác. Hãy cẩn thận!
            </p>
            <button 
              className={`${styles.btnCustom} ${styles.btnDangerCustom}`}
              onClick={onDeleteAccount}
            >
              Xóa tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectedAccountsTab;