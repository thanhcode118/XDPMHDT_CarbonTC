import React from 'react';
import styles from './ReportTable.module.css';


const ExportOptions = ({ onExport }) => {
  return (
    <div className={styles.exportContainer}>
      <button 
        className={`${styles.exportButton} ${styles.btnOutlineCustom}`} // Sẽ cần thêm CSS
        onClick={() => onExport('csv')}
      >
        <i className="bi bi-file-earmark-spreadsheet me-1"></i> Xuất CSV
      </button>
      <button 
        className={`${styles.exportButton} ${styles.btnOutlineCustom}`} // Sẽ cần thêm CSS
        onClick={() => onExport('pdf')}
      >
        <i className="bi bi-file-earmark-pdf me-1"></i> Xuất PDF
      </button>
    </div>
  );
};


const ReportTable = ({ 
  data = [],
  onExport 
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Hoàn thành': 'success',
      'Đang xử lý': 'warning',
      'Đã hủy': 'danger'
    };

    return (
      <span className={`badge bg-${statusConfig[status] || 'secondary'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableResponsive}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Loại</th>
              <th>Số lượng tín chỉ</th>
              <th>Giá trị (VNĐ)</th>
              <th>CO₂ giảm (kg)</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.date}</td>
                <td>{row.type}</td>
                <td>{row.credits}</td>
                <td>{row.value.toLocaleString()}</td>
                <td>{row.co2Reduced}</td>
                <td>{getStatusBadge(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onExport && <ExportOptions onExport={onExport} />}
    </div>
  );
};

export default ReportTable;