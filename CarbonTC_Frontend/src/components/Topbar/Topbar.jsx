import React from 'react';
import styles from './Topbar.module.css';

const Topbar = ({ title }) => {
  return (
    <div className={styles.topbar}>
      <h1 className={styles.topbarTitle}>{title}</h1>
      <div className={styles.topbarActions}>
        <div className={styles.notificationBtn}>
          <i className="bi bi-bell"></i>
          <span className={styles.notificationBadge}>3</span>
        </div>
        <div className={styles.userProfile}>
          <img src="https://picsum.photos/seed/user123/35/35.jpg" alt="User Avatar" className={styles.userAvatar} />
          <span>Nguyễn Văn An</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;