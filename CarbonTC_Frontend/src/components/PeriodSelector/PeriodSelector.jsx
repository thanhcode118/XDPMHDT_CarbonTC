import React from 'react';
import styles from './PeriodSelector.module.css';

const PeriodSelector = ({ 
  activePeriod = 'month',
  onPeriodChange 
}) => {
  const periods = [
    { id: 'week', label: 'Tuần' },
    { id: 'month', label: 'Tháng' },
    { id: 'quarter', label: 'Quý' },
    { id: 'year', label: 'Năm' }
  ];

  return (
    <div className={styles.periodSelector}>
      {periods.map(period => (
        <button
          key={period.id}
          className={`${styles.periodBtn} ${activePeriod === period.id ? styles.active : ''}`}
          onClick={() => onPeriodChange(period.id)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;