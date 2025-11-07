import React from 'react';
import styles from './Pagination.module.css';

/**
 * Component phân trang tái sử dụng.
 * @param {object} props
 * @param {number} props.currentPage - Trang hiện tại
 * @param {number} props.totalPages - Tổng số trang
 * @param {function} props.onPageChange - Hàm callback khi chuyển trang
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Không hiển thị gì nếu chỉ có 1 trang
    if (totalPages <= 1) {
        return null;
    }

    // Tạo mảng số trang để hiển thị
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Điều chỉnh nếu gần cuối
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={styles.paginationContainer} data-aos="fade-up">
            {/* Nút Previous */}
            <button
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={handlePrevious}
                disabled={currentPage === 1}
            >
                <i className="bi bi-chevron-left"></i>
                <span>Trước</span>
            </button>
            
            {/* Danh sách số trang */}
            <div className={styles.pageNumbers}>
                {/* Hiển thị trang đầu tiên và dấu ... nếu cần */}
                {pageNumbers[0] > 1 && (
                    <>
                        <button
                            className={`${styles.pageButton} ${styles.pageNumber} ${1 === currentPage ? styles.active : ''}`}
                            onClick={() => handlePageClick(1)}
                        >
                            1
                        </button>
                        {pageNumbers[0] > 2 && (
                            <span className={styles.pageDots}>...</span>
                        )}
                    </>
                )}
                
                {/* Các trang số */}
                {pageNumbers.map(page => (
                    <button
                        key={page}
                        className={`${styles.pageButton} ${styles.pageNumber} ${page === currentPage ? styles.active : ''}`}
                        onClick={() => handlePageClick(page)}
                    >
                        {page}
                    </button>
                ))}
                
                {/* Hiển thị trang cuối và dấu ... nếu cần */}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                            <span className={styles.pageDots}>...</span>
                        )}
                        <button
                            className={`${styles.pageButton} ${styles.pageNumber} ${totalPages === currentPage ? styles.active : ''}`}
                            onClick={() => handlePageClick(totalPages)}
                        >
                            {totalPages}
                        </button>
                    </>
                )}
            </div>
            
            {/* Nút Next */}
            <button
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={handleNext}
                disabled={currentPage === totalPages}
            >
                <span>Sau</span>
                <i className="bi bi-chevron-right"></i>
            </button>

            {/* Thông tin trang */}
            <div className={styles.pageInfo}>
                <span className={styles.pageText}>
                    Trang <strong>{currentPage}</strong> / {totalPages}
                </span>
            </div>
        </div>
    );
};

export default Pagination;