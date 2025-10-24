import React, { useState } from 'react';
import styles from './ProfileTab.module.css';

const ProfileTab = ({ onSave }) => {
  const [formData, setFormData] = useState({
    firstName: 'Nguyễn Văn',
    lastName: 'An',
    email: 'an.nguyen@example.com',
    phone: '0912345678',
    bio: 'Tôi là một người đam mê xe điện và mong muốn đóng góp vào việc giảm phát thải carbon.'
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      firstName: 'Nguyễn Văn',
      lastName: 'An',
      email: 'an.nguyen@example.com',
      phone: '0912345678',
      bio: 'Tôi là một người đam mê xe điện và mong muốn đóng góp vào việc giảm phát thải carbon.'
    });
  };

  return (
    <div className={styles.tabContent} data-aos="fade-up">
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.profilePictureContainer}>
            <img 
              src="https://picsum.photos/seed/user123/100/100.jpg" 
              alt="Profile" 
              className={styles.profilePicture}
            />
            <div className={styles.profilePictureInfo}>
              <h3 className={styles.profilePictureTitle}>Ảnh đại diện</h3>
              <p className={styles.profilePictureSubtitle}>JPG, GIF hoặc PNG. Tối đa 2MB</p>
              <button className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}>
                Thay đổi ảnh
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.formLabel}>Họ</label>
                <input 
                  type="text" 
                  className={styles.formControl}
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.formLabel}>Tên</label>
                <input 
                  type="text" 
                  className={styles.formControl}
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <input 
                  type="email" 
                  className={styles.formControl}
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.formLabel}>Số điện thoại</label>
                <input 
                  type="tel" 
                  className={styles.formControl}
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="bio" className={styles.formLabel}>Giới thiệu</label>
              <textarea 
                className={styles.formControl}
                id="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}>
                Lưu thay đổi
              </button>
              <button 
                type="button" 
                className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
                onClick={handleCancel}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;