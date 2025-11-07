import React from 'react';
import styles from './FormSection.module.css';

const FormSection = ({ title, children }) => {
  return (
    <div className={styles.formSection} data-aos="fade-up">
      <h3 className={styles.formTitle}>{title}</h3>
      {children}
    </div>
  );
};

export default FormSection;