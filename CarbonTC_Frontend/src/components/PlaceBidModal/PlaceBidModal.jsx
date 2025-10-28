import React, { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from './MarketplaceModal.module.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PlaceBidModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    listingData 
}) => {
    const [formData, setFormData] = useState({
        bidAmount: '',
        bidQuantity: 1,
        maxBidAmount: '',
        agreeAuctionTerms: false
    });

    const [bidHistory, setBidHistory] = useState([
        {
            id: 1,
            name: 'Trần Thị Bình',
            time: '5 phút trước',
            amount: 15500,
            avatar: 'https://picsum.photos/seed/bidder1/30/30.jpg'
        },
        {
            id: 2,
            name: 'Hoàng Văn Nam',
            time: '12 phút trước',
            amount: 15200,
            avatar: 'https://picsum.photos/seed/bidder2/30/30.jpg'
        },
        {
            id: 3,
            name: 'Lê Thị Lan',
            time: '25 phút trước',
            amount: 15000,
            avatar: 'https://picsum.photos/seed/bidder3/30/30.jpg'
        }
    ]);

    const [countdown, setCountdown] = useState({ days: 2, hours: 14, minutes: 32, seconds: 45 });
    const [currentPrice, setCurrentPrice] = useState(15500);
    const [chartData, setChartData] = useState({
        labels: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'],
        datasets: [
            {
                label: 'Giá đấu giá',
                data: [14800, 14900, 15000, 15000, 15200, 15000, 15500, 15500],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }
        ]
    });

    const countdownRef = useRef(null);
    const chartRef = useRef(null);

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(24, 24, 24, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#b8bcc8',
                borderColor: 'rgba(102, 126, 234, 0.5)',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        return `Giá: ${context.parsed.y.toLocaleString('vi-VN')} VNĐ`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#b8bcc8',
                    callback: function(value) {
                        return value.toLocaleString('vi-VN') + ' VNĐ';
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#b8bcc8'
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        animations: {
            tension: {
                duration: 1000,
                easing: 'linear'
            }
        }
    };

    useEffect(() => {
        if (listingData && isOpen) {
            const minBid = (listingData.currentPrice || listingData.minimumBid) + 1;
            setFormData(prev => ({
                ...prev,
                bidAmount: minBid.toString(),
                bidQuantity: 1,
                maxBidAmount: '',
                agreeAuctionTerms: false
            }));
            setCurrentPrice(listingData.currentPrice || listingData.minimumBid || 15500);
        }
    }, [listingData, isOpen]);

    useEffect(() => {
        if (isOpen) {
            // Start countdown timer
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    const { days, hours, minutes, seconds } = prev;
                    
                    if (seconds > 0) {
                        return { ...prev, seconds: seconds - 1 };
                    } else if (minutes > 0) {
                        return { ...prev, minutes: minutes - 1, seconds: 59 };
                    } else if (hours > 0) {
                        return { ...prev, hours: hours - 1, minutes: 59, seconds: 59 };
                    } else if (days > 0) {
                        return { ...prev, days: days - 1, hours: 23, minutes: 59, seconds: 59 };
                    } else {
                        clearInterval(countdownRef.current);
                        return prev;
                    }
                });
            }, 1000);

            // Simulate new bids
            const bidInterval = setInterval(() => {
                simulateNewBid();
            }, 15000);

            return () => {
                clearInterval(countdownRef.current);
                clearInterval(bidInterval);
            };
        }
    }, [isOpen]);

    const simulateNewBid = () => {
        const names = ['Nguyễn Văn Hùng', 'Phạm Thị Mai', 'Trần Minh Quân', 'Lê Hoàng Nam'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomAmount = currentPrice + Math.floor(Math.random() * 500) + 100;
        
        const newBid = {
            id: Date.now(),
            name: randomName,
            time: 'Vừa xong',
            amount: randomAmount,
            avatar: `https://picsum.photos/seed/${randomName.replace(/\s/g, '')}/30/30.jpg`
        };

        setBidHistory(prev => [newBid, ...prev]);
        setCurrentPrice(randomAmount);

        // Update chart data
        setChartData(prev => {
            const now = new Date();
            const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            const newLabels = [...prev.labels.slice(1), timeLabel];
            const newData = [...prev.datasets[0].data.slice(1), randomAmount];
            
            return {
                labels: newLabels,
                datasets: [
                    {
                        ...prev.datasets[0],
                        data: newData
                    }
                ]
            };
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.agreeAuctionTerms) {
            alert('Vui lòng đồng ý với điều khoản đấu giá');
            return;
        }

        const bidData = {
            bidAmount: Number(formData.bidAmount),
            bidQuantity: Number(formData.bidQuantity),
            maxBidAmount: formData.maxBidAmount ? Number(formData.maxBidAmount) : null
        };

        onSubmit(bidData);
    };

    const setBidAmount = (amount) => {
        setFormData(prev => ({ ...prev, bidAmount: amount.toString() }));
    };

    const bidSuggestions = [
        { amount: 16000, label: 'Giá đề xuất cho người mới' },
        { amount: 17500, label: 'Giá cạnh tranh' }
    ];

    if (!isOpen) return null;

    const minBid = (listingData?.currentPrice || listingData?.minimumBid || 0) + 1;
    const maxQuantity = listingData?.quantity || 1;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h5 className={styles.modalTitle}>Đặt giá cho phiên đấu giá</h5>
                    <button 
                        type="button" 
                        className={styles.btnClose} 
                        onClick={onClose}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                </div>
                
                <div className={styles.modalBody}>
                    {/* Live Auction Indicator */}
                    <div className={styles.liveIndicator}>
                        <div className={styles.liveDot}></div>
                        <div className={styles.liveText}>Đang diễn ra trực tiếp</div>
                    </div>
                    
                    {/* Auction Information */}
                    <div className={styles.transactionSummary}>
                        <div className={styles.summaryHeader}>
                            <h6 className={styles.summaryTitle}>Thông tin phiên đấu giá</h6>
                            <span className={`${styles.summaryStatus} ${styles.statusAuction}`}>
                                Đang diễn ra
                            </span>
                        </div>
                        <div className={styles.summaryDetails}>
                            <div className={styles.summaryDetail}>
                                <div className={`${styles.detailIcon} ${styles.detailIcon1}`}>
                                    <i className="bi bi-lightning-charge-fill"></i>
                                </div>
                                <div className={styles.detailInfo}>
                                    <div className={styles.detailLabel}>Số lượng tín chỉ</div>
                                    <div className={styles.detailValue}>
                                        {listingData?.quantity?.toLocaleString()} tín chỉ
                                    </div>
                                </div>
                            </div>
                            <div className={styles.summaryDetail}>
                                <div className={`${styles.detailIcon} ${styles.detailIcon2}`}>
                                    <i className="bi bi-tag-fill"></i>
                                </div>
                                <div className={styles.detailInfo}>
                                    <div className={styles.detailLabel}>Giá khởi điểm</div>
                                    <div className={styles.detailValue}>
                                        {listingData?.minimumBid?.toLocaleString()} VNĐ/tín chỉ
                                    </div>
                                </div>
                            </div>
                            <div className={styles.summaryDetail}>
                                <div className={`${styles.detailIcon} ${styles.detailIcon3}`}>
                                    <i className="bi bi-clock-fill"></i>
                                </div>
                                <div className={styles.detailInfo}>
                                    <div className={styles.detailLabel}>Thời gian còn lại</div>
                                    <div className={styles.detailValue}>
                                        {listingData?.timeRemaining || '2 ngày 14 giờ'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.summaryDetail}>
                            <div className={`${styles.detailIcon} ${styles.detailIcon1}`}>
                                <i className="bi bi-person-fill"></i>
                            </div>
                            <div className={styles.detailInfo}>
                                <div className={styles.detailLabel}>Người bán</div>
                                <div className={styles.detailValue}>{listingData?.seller}</div>
                            </div>
                        </div>
                    </div>

                    {/* Price Chart */}
                    <div className={styles.priceChart}>
                        <Line 
                            ref={chartRef}
                            data={chartData} 
                            options={chartOptions}
                        />
                    </div>
                    
                    {/* Countdown Timer */}
                    <div className={styles.countdownTimer}>
                        <div className={styles.countdownItem}>
                            <div className={styles.countdownValue}>{countdown.days}</div>
                            <div className={styles.countdownLabel}>Ngày</div>
                        </div>
                        <div className={styles.countdownItem}>
                            <div className={styles.countdownValue}>{countdown.hours}</div>
                            <div className={styles.countdownLabel}>Giờ</div>
                        </div>
                        <div className={styles.countdownItem}>
                            <div className={styles.countdownValue}>{countdown.minutes}</div>
                            <div className={styles.countdownLabel}>Phút</div>
                        </div>
                        <div className={styles.countdownItem}>
                            <div className={styles.countdownValue}>{countdown.seconds}</div>
                            <div className={styles.countdownLabel}>Giây</div>
                        </div>
                    </div>

                    {/* Current Bid */}
                    <div className={styles.currentBid}>
                        <div className={styles.currentBidLabel}>Giá hiện tại</div>
                        <div className={styles.currentBidValue}>
                            {currentPrice.toLocaleString()} VNĐ
                        </div>
                    </div>

                    {/* Bid Form */}
                    <form id="placeBidForm" onSubmit={handleSubmit}>
                        <div className={styles.bidInputGroup}>
                            <input
                                type="number"
                                className={`${styles.formControl} ${styles.bidInput}`}
                                id="bidAmount"
                                name="bidAmount"
                                value={formData.bidAmount}
                                onChange={handleChange}
                                min={minBid}
                                placeholder="Nhập giá của bạn"
                                required
                            />
                            <span className={styles.bidInputAddon}>VNĐ/tín chỉ</span>
                        </div>
                        <small className={styles.textSecondary}>
                            Giá tối thiểu: {minBid.toLocaleString()} VNĐ/tín chỉ
                        </small>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="bidQuantity" className={styles.formLabel}>
                                Số lượng tín chỉ muốn mua
                            </label>
                            <input
                                type="number"
                                className={styles.formControl}
                                id="bidQuantity"
                                name="bidQuantity"
                                value={formData.bidQuantity}
                                onChange={handleChange}
                                min="1"
                                max={maxQuantity}
                                required
                            />
                            <small className={styles.textSecondary}>
                                Số lượng tối đa: {maxQuantity.toLocaleString()} tín chỉ
                            </small>
                        </div>
                        
                        {/* Auto Bid Section */}
                        <div className={styles.autoBidSection}>
                            <div className={styles.autoBidTitle}>
                                <i className="bi bi-robot"></i>
                                <span>Đặt giá tự động</span>
                                <span className={styles.autoBidStatus}>Đã bật</span>
                            </div>
                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    className={styles.formControl}
                                    id="maxBidAmount"
                                    name="maxBidAmount"
                                    value={formData.maxBidAmount}
                                    onChange={handleChange}
                                    placeholder="Giá tối đa bạn sẵn sàng trả"
                                />
                                <span className={styles.inputGroupText}>VNĐ/tín chỉ</span>
                            </div>
                            <small className={styles.textSecondary}>
                                Hệ thống sẽ tự động đặt giá thay bạn khi có người khác trả giá cao hơn, 
                                cho đến khi đạt mức giá tối đa này.
                            </small>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <div className={styles.formCheck}>
                                <input
                                    className={styles.formCheckInput}
                                    type="checkbox"
                                    id="agreeAuctionTerms"
                                    name="agreeAuctionTerms"
                                    checked={formData.agreeAuctionTerms}
                                    onChange={handleChange}
                                    required
                                />
                                <label className={styles.formCheckLabel} htmlFor="agreeAuctionTerms">
                                    Tôi đồng ý với các điều khoản và điều kiện của phiên đấu giá
                                </label>
                            </div>
                        </div>
                    </form>

                    {/* Bid Suggestions */}
                    <div className={styles.bidSuggestions}>
                        <h6>Gợi ý đặt giá:</h6>
                        {bidSuggestions.map((suggestion, index) => (
                            <div 
                                key={index}
                                className={styles.bidSuggestion}
                                onClick={() => setBidAmount(suggestion.amount)}
                            >
                                <span className={styles.bidSuggestionAmount}>
                                    {suggestion.amount.toLocaleString()} VNĐ
                                </span>
                                <span className={styles.bidSuggestionLabel}>{suggestion.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Bid History */}
                <div className={styles.bidHistory}>
                    <h6 className={styles.bidHistoryTitle}>Lịch sử trả giá</h6>
                    {bidHistory.map((bid, index) => (
                        <div 
                            key={bid.id}
                            className={`${styles.bidItem} ${index === 0 ? styles.highlight : ''}`}
                        >
                            <div className={styles.bidUser}>
                                <img src={bid.avatar} alt="Bidder" className={styles.bidAvatar} />
                                <div>
                                    <div className={styles.bidName}>{bid.name}</div>
                                    <div className={styles.bidTime}>{bid.time}</div>
                                </div>
                            </div>
                            <div className={styles.bidAmount}>{bid.amount.toLocaleString()} VNĐ</div>
                        </div>
                    ))}
                </div>
                
                <div className={styles.modalFooter}>
                    <button 
                        type="button" 
                        className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                        onClick={handleSubmit}
                    >
                        Đặt giá
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceBidModal;