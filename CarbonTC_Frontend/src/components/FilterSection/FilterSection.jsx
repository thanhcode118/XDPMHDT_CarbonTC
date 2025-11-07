import React from 'react';
import styles from './FilterSection.module.css';

const FilterSection = ({ title, children, onSubmit }) => {
  return (
    <div className={styles.filterSection} data-aos="fade-up">
      <h3 className={styles.filterTitle}>{title}</h3>
      {children}
    </div>
  );
};

export default FilterSection;