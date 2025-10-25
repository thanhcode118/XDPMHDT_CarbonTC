import React, { useState, useEffect } from 'react';
import styles from './ProfileTab.module.css';
import authService from '../../services/authService';
import userService from '../../services/userService';

const ProfileTab = ({ onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    avatar: ''
  });

  // 🟢 Load dữ liệu từ localStorage hoặc từ authService
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser
      ? JSON.parse(storedUser)
      : authService.getCurrentUser();

    if (currentUser) {
      const nameParts = currentUser.fullName
        ? currentUser.fullName.split(' ')
        : [];
      const firstName = nameParts.slice(0, -1).join(' ') || '';
      const lastName = nameParts.slice(-1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        bio: currentUser.bio || 'Chưa có mô tả cá nhân.',
        avatar:
          currentUser.avatar || 'https://picsum.photos/seed/user123/100/100.jpg'
      });
    }
  }, []);

  // 🟢 Cập nhật input state
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  // 🟢 Submit form cập nhật thông tin
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedUser = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`.trim()
    };

    try {
      const response = await userService.updateProfile(updatedUser);

      // 🟢 Chỉ lưu phần dữ liệu user
      if (response?.data) {
        const userData = response.data;
        localStorage.setItem('user', JSON.stringify(userData));

        // 🟢 Cập nhật lại form để hiển thị ngay
        const nameParts = userData.fullName
          ? userData.fullName.split(' ')
          : [];
        const firstName = nameParts.slice(0, -1).join(' ') || '';
        const lastName = nameParts.slice(-1).join(' ') || '';

        setFormData({
          firstName,
          lastName,
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          bio: userData.bio || 'Chưa có mô tả cá nhân.',
          avatar:
            userData.avatar ||
            'https://picsum.photos/seed/user123/100/100.jpg'
        });

        // 🟢 Callback cho component cha (nếu có)
        if (onSave) onSave(userData);

        alert('✅ Cập nhật thông tin thành công!');
      } else {
        throw new Error('Phản hồi không hợp lệ từ server');
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật:', error);
      alert(error.message || 'Cập nhật thất bại!');
    }
  };

  // 🟢 Hủy thay đổi, khôi phục dữ liệu gốc
  const handleCancel = () => {
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser
      ? JSON.parse(storedUser)
      : authService.getCurrentUser();

    if (currentUser) {
      const nameParts = currentUser.fullName
        ? currentUser.fullName.split(' ')
        : [];
      const firstName = nameParts.slice(0, -1).join(' ') || '';
      const lastName = nameParts.slice(-1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        bio: currentUser.bio || 'Chưa có mô tả cá nhân.',
        avatar:
          currentUser.avatar || 'https://picsum.photos/seed/user123/100/100.jpg'
      });
    }
  };

  return (
    <div className={styles.tabContent} data-aos="fade-up">
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.profilePictureContainer}>
            <img
              src={formData.avatar}
              alt="Profile"
              className={styles.profilePicture}
            />
            <div className={styles.profilePictureInfo}>
              <h3 className={styles.profilePictureTitle}>Ảnh đại diện</h3>
              <p className={styles.profilePictureSubtitle}>
                JPG, GIF hoặc PNG. Tối đa 2MB
              </p>
              <button
                type="button"
                className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}
              >
                Thay đổi ảnh
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.formLabel}>
                  Họ
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={styles.formControl}
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.formLabel}>
                  Tên
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={styles.formControl}
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className={styles.formControl}
                  value={formData.email}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phoneNumber" className={styles.formLabel}>
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className={styles.formControl}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bio" className={styles.formLabel}>
                Giới thiệu
              </label>
              <textarea
                id="bio"
                className={styles.formControl}
                rows="3"
                value={formData.bio}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
              >
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
