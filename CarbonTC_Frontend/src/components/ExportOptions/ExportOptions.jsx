import React from 'react';
import styles from './ExportOptions.module.css';

const ExportOptions = ({ 
  onExport 
}) => {
  const exportFormats = [
    { format: 'pdf', label: 'Xuất PDF', icon: 'bi-file-earmark-pdf' },
    { format: 'excel', label: 'Xuất Excel', icon: 'bi-file-earmark-excel' },
    { format: 'csv', label: 'Xuất CSV', icon: 'bi-file-earmark-text' }
  ];

  return (
    <div className={styles.exportOptions}>
      {exportFormats.map(item => (
        <button
          key={item.format}
          className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
          onClick={() => onExport(item.format)}
        >
          <i className={`bi ${item.icon} me-1`}></i>
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ExportOptions;