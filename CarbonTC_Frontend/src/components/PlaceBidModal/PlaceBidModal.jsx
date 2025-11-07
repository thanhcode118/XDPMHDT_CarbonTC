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
import { useCountdown } from '../../hooks/useCountdown';
import { convertUTCToVnTime } from '../../utils/formatters';

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
    listingData,
    isLoading,    
    isSubmitting, 
    error,        
    auctionRealtimeData // <-- PROP MỚI: { latestBid: {...}, isEnded: false, winnerInfo: {...}, currentPrice: ... }
}) => {

    const [localError, setLocalError] = useState('');
    const processedBidsRef = useRef(new Set());

    const isEnded = auctionRealtimeData?.isEnded || false;
    const winnerInfo = auctionRealtimeData?.winnerInfo;

    const formatBidTime = (isoTime) => {
        if (!isoTime) return '';
        const vnTime = convertUTCToVnTime(isoTime);
        return vnTime.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const createHistoryEntry = (bid) => {
        const uniqueId = `bid_${bid.bidderId}_${bid.bidTime}_${bid.bidAmount}`;
        
        return {
            id: uniqueId,
            name: `User ...${bid.bidderId?.slice(-6) || 'unknown'}`,
            time: formatBidTime(bid.bidTime),
            amount: bid.bidAmount,
            avatar: `https://i.pravatar.cc/30?u=${bid.bidderId}`
        };
    };

    const [bidAmount, setBidAmount] = useState('');
    const [bidError, setBidError] = useState('');
    const [agreeAuctionTerms, setAgreeAuctionTerms] = useState(false);
    const [bidHistory, setBidHistory] = useState([]);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    const { days, hours, minutes, seconds, isOver: isCountdownOver } = useCountdown(listingData?.auctionEndTime || '');
    const auctionIsFinished = isEnded || isCountdownOver;

    const countdownRef = useRef(null);
    const chartRef = useRef(null);
    const stepBid = 1000;

    const realtimePrice = auctionRealtimeData?.currentPrice;
    const initialBids = listingData?.auctionBids || [];
    const highestInitialBid = initialBids.length > 0 
        ? Math.max(...initialBids.map(b => b.bidAmount))
        : 0;

    const basePrice = Math.max(listingData?.minimumBid || 0, highestInitialBid);
    const currentPrice = realtimePrice || basePrice;
    const minBidAmount = currentPrice + stepBid;

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

    const bidSuggestions = [
    { 
        amount: minBidAmount, 
        label: 'Tối thiểu' 
    },
    { 
        amount: minBidAmount + 1000, 
        label: 'Tăng 2K' 
    },
    { 
        amount: minBidAmount + 4000, 
        label: 'Tăng 5K' 
    },
    { 
        amount: minBidAmount + 9000, 
        label: 'Tăng 10K' 
    }
];

    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        
        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            
            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);
        
        return debouncedValue;
    };

    const debouncedLatestBid = useDebounce(auctionRealtimeData?.latestBid, 100);

    // Khởi tạo dữ liệu ban đầu khi mở modal
    useEffect(() => {
        if (isOpen && listingData) {
            // Reset processed bids khi mở modal mới
            processedBidsRef.current.clear();
            
            // Đặt giá đề xuất ban đầu là giá tối thiểu
            setBidAmount(minBidAmount.toString());
            setBidError('');
            setAgreeAuctionTerms(false);

            // Khởi tạo history từ API - đảm bảo không trùng lặp
            const formattedHistory = (listingData.auctionBids || [])
                .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
                .map((bid) => {
                    const entry = createHistoryEntry(bid);
                    // Đánh dấu các bid từ API đã được xử lý
                    processedBidsRef.current.add(entry.id);
                    return entry;
                })
                .slice(0, 5); // Chỉ lấy 5 bid gần nhất
            
            setBidHistory(formattedHistory);

            // Khởi tạo biểu đồ từ dữ liệu ban đầu
            const sortedBids = (listingData.auctionBids || [])
                .sort((a, b) => new Date(a.bidTime) - new Date(b.bidTime));

            const chartLabels = sortedBids.map(b => formatBidTime(b.bidTime));
            const chartBidData = sortedBids.map(b => b.bidAmount);

            if (listingData.minimumBid) {
                chartLabels.unshift(formatBidTime(listingData.createdAt));
                chartBidData.unshift(listingData.minimumBid);
            }

            setChartData({
                labels: chartLabels.slice(-10), // Giữ 10 điểm dữ liệu cuối
                datasets: [
                    {
                        label: 'Giá đấu giá',
                        data: chartBidData.slice(-10),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#667eea',
                    }
                ]
            });
        }
    }, [isOpen, listingData, minBidAmount]);

    // Xử lý realtime bid updates cho cả Bid History và Price Chart
    useEffect(() => {
        const latestBid = debouncedLatestBid;
        if (latestBid) {
            // Tạo unique ID cho bid
            const bidUniqueId = `bid_${latestBid.bidderId}_${latestBid.bidTime}_${latestBid.bidAmount}`;
            
            // Kiểm tra xem bid này đã được xử lý chưa
            if (processedBidsRef.current.has(bidUniqueId)) {
                console.log(`🔄 Bid ${bidUniqueId} đã được xử lý, bỏ qua`);
                return;
            }

            // Đánh dấu bid này đã xử lý
            processedBidsRef.current.add(bidUniqueId);
            console.log(`✅ Xử lý bid mới: ${bidUniqueId}`);

            // 1. Cập nhật Lịch sử Bid - CHỈ THÊM NẾU CHƯA CÓ
            const newHistoryEntry = createHistoryEntry(latestBid);
            setBidHistory(prev => {
                // Kiểm tra xem bid này đã có trong history chưa
                const isAlreadyInHistory = prev.some(item => 
                    item.id === newHistoryEntry.id || 
                    (item.name === newHistoryEntry.name && item.amount === newHistoryEntry.amount)
                );
                
                if (isAlreadyInHistory) {
                    console.log(`⚠️ Bid đã có trong history, không thêm lại`);
                    return prev;
                }
                
                // Thêm bid mới và giới hạn 5 bid gần nhất
                return [newHistoryEntry, ...prev.slice(0, 4)];
            });

            // 2. Cập nhật Biểu đồ - CHỈ THÊM NẾU CHƯA CÓ
            setChartData(prev => {
                const currentLabels = prev.labels || [];
                const currentData = prev.datasets?.[0]?.data || [];
                
                // Kiểm tra xem bid này đã có trong biểu đồ chưa
                const isAlreadyInChart = currentLabels.some((label, index) => 
                    label === newHistoryEntry.time && currentData[index] === latestBid.bidAmount
                );
                
                if (isAlreadyInChart) {
                    console.log(`⚠️ Bid đã có trong biểu đồ, không thêm lại`);
                    return prev;
                }
                
                // Thêm điểm dữ liệu mới và giới hạn 10 điểm gần nhất
                const newLabels = [...currentLabels.slice(-9), newHistoryEntry.time];
                const newData = [...currentData.slice(-9), latestBid.bidAmount];
                
                return {
                    ...prev,
                    labels: newLabels,
                    datasets: [{ ...prev.datasets[0], data: newData }]
                };
            });

            // 3. Cập nhật form nếu giá hiện tại vượt giá đang nhập
            if (bidAmount && parseFloat(bidAmount) < minBidAmount) {
                setBidAmount(minBidAmount.toString());
                setBidError(`Giá đã tăng. Giá tối thiểu mới: ${minBidAmount.toLocaleString()} VNĐ`);
            }
        }
    }, [debouncedLatestBid, minBidAmount, bidAmount]);

    // Cleanup khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            // Reset processed bids khi modal đóng
            processedBidsRef.current.clear();
        }
    }, [isOpen]);

    // Các useEffect khác giữ nguyên
    useEffect(() => {
        if (isOpen) {
            setLocalError('');
            countdownRef.current = setInterval(() => {
                // Countdown logic
            }, 1000);

            return () => {
                if (countdownRef.current) {
                    clearInterval(countdownRef.current);
                }
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (error) {
            setLocalError(error);
        }
    }, [error]);

    const handleBidAmountChange = (e) => {
        const value = e.target.value;
        setBidAmount(value);
        validateBid(value);
    };

    const validateBid = (value) => {
        const numValue = parseFloat(value);
        if (!value) {
            setBidError('Vui lòng nhập giá.');
            return false;
        } else if (isNaN(numValue)) {
            setBidError('Chỉ được nhập số.');
            return false;
        } else if (numValue < minBidAmount) {
            setBidError(`Giá đặt phải >= ${minBidAmount.toLocaleString()} VNĐ.`);
            return false;
        }
        setBidError(''); 
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isSubmitting || auctionIsFinished) return;

        if (!agreeAuctionTerms) {
            setBidError('Vui lòng đồng ý với điều khoản đấu giá.');
            return;
        }
        
        if (validateBid(bidAmount)) {
            onSubmit({ bidAmount: parseFloat(bidAmount) });
        }
    };

    const setBidAmountSuggestion = (amount) => {
        if (amount >= minBidAmount) {
            setBidAmount(amount.toString());
            setBidError('');
        } else {
            setBidError(`Giá gợi ý (${amount.toLocaleString()}) thấp hơn giá tối thiểu.`);
        }
    };

    if (!isOpen) return null;

    

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h5 className={styles.modalTitle}>Đặt giá cho phiên đấu giá</h5>
                    <button 
                        type="button" 
                        className={styles.btnClose} 
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                {isLoading && <p>Đang tải chi tiết phiên đấu giá...</p>}

                {error && !isSubmitting && (
                    <div className={styles.errorAlert}>
                        Lỗi: {error}
                    </div>
                )}

                {localError && (
                    <div className={`${styles.errorAlert} ${styles.ownerBidError}`}>
                        <div className={styles.errorIcon}>
                            <i className="bi bi-exclamation-triangle-fill"></i>
                        </div>
                        <div className={styles.errorContent}>
                            <strong>Không thể đặt giá</strong>
                            <p>{localError}</p>
                            {localError.includes('own listing') && (
                                <small className={styles.errorHint}>
                                    Bạn là chủ sở hữu của sản phẩm này và không thể tham gia đấu giá.
                                </small>
                            )}
                        </div>
                    </div>
                )}

                {!isLoading && listingData && (
                    <>
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
                                    <span className={`${styles.summaryStatus} ${auctionIsFinished ? styles.statusEnded : styles.statusAuction}`}>
                                        {auctionIsFinished ? 'Đã kết thúc' : 'Đang diễn ra'}
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
                                                {!auctionIsFinished ? `${days} ngày ${hours} giờ ${minutes} phút` : 'Đã kết thúc'}
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
                                        <div className={styles.detailValue}>
                                            {listingData?.seller || `...${listingData?.ownerId?.slice(-8)}`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price Chart */}
                            <div className={styles.priceChart}>
                                <Line ref={chartRef} data={chartData} options={chartOptions} />
                            </div>
                            
                            {/* Countdown Timer */}
                            {!auctionIsFinished ? (
                                <div className={styles.countdownTimer}>
                                    <div className={styles.countdownItem}>
                                        <div className={styles.countdownValue}>{days}</div>
                                        <div className={styles.countdownLabel}>Ngày</div>
                                    </div>
                                    <div className={styles.countdownItem}>
                                        <div className={styles.countdownValue}>{hours}</div>
                                        <div className={styles.countdownLabel}>Giờ</div>
                                    </div>
                                    <div className={styles.countdownItem}>
                                        <div className={styles.countdownValue}>{minutes}</div>
                                        <div className={styles.countdownLabel}>Phút</div>
                                    </div>
                                    <div className={styles.countdownItem}>
                                        <div className={styles.countdownValue}>{seconds}</div>
                                        <div className={styles.countdownLabel}>Giây</div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.auctionEndedMessage}>
                                    {/* Confetti decorations */}
                                    <span className={styles.confetti} style={{left: '10%', animationDelay: '0s'}}></span>
                                    <span className={styles.confetti} style={{left: '30%', animationDelay: '0.5s'}}></span>
                                    <span className={styles.confetti} style={{left: '50%', animationDelay: '1s'}}></span>
                                    <span className={styles.confetti} style={{left: '70%', animationDelay: '1.5s'}}></span>
                                    <span className={styles.confetti} style={{left: '90%', animationDelay: '2s'}}></span>
                                    
                                    Phiên đấu giá đã kết thúc!
                                    {winnerInfo && (
                                        <span> Người thắng: ...{winnerInfo.winningBidderId?.slice(-6)} với giá {winnerInfo.winningBidAmount?.toLocaleString()} VNĐ</span>
                                    )}
                                </div>
                            )}

                            {/* Current Bid */}
                            <div className={styles.currentBid}>
                                <div className={styles.currentBidLabel}>Giá hiện tại</div>
                                <div className={styles.currentBidValue}>
                                    {currentPrice.toLocaleString()} VNĐ
                                </div>
                            </div>

                            {/* Bid Form */}
                            {!auctionIsFinished && (
                                <form id="placeBidForm" onSubmit={handleSubmit}>
                                    <div className={styles.bidInputGroup}>
                                        <input
                                            type="number"
                                            className={`${styles.formControl} ${styles.bidInput} ${bidError ? styles.isInvalid : ''}`}
                                            id="bidAmount"
                                            name="bidAmount"
                                            value={bidAmount}
                                            onChange={handleBidAmountChange}
                                            min={minBidAmount}
                                            placeholder="Nhập giá của bạn"
                                            step={stepBid}
                                            required
                                            disabled={isSubmitting}
                                        />
                                        <span className={styles.bidInputAddon}>VNĐ/tín chỉ</span>
                                    </div>
                                    {bidError ? (
                                        <small className={styles.textDanger}>{bidError}</small>
                                    ) : (
                                        <small className={styles.textSecondary}>
                                            Giá tối thiểu: {minBidAmount.toLocaleString()} VNĐ/tín chỉ
                                        </small>
                                    )}
                                    
                                    <div className={styles.formGroup} style={{marginTop: '15px'}}>
                                        <div className={styles.formCheck}>
                                            <input
                                                className={styles.formCheckInput}
                                                type="checkbox"
                                                id="agreeAuctionTerms"
                                                name="agreeAuctionTerms"
                                                checked={agreeAuctionTerms}
                                                onChange={(e) => setAgreeAuctionTerms(e.target.checked)}
                                                required
                                                disabled={isSubmitting}
                                            />
                                            <label className={styles.formCheckLabel} htmlFor="agreeAuctionTerms">
                                                Tôi đồng ý với các điều khoản và điều kiện của phiên đấu giá
                                            </label>
                                        </div>
                                    </div>

                                    {/* Bid Suggestions */}
                                    {!auctionIsFinished && (
                                        <div className={styles.bidSuggestions}>
                                            <h6 className={styles.suggestionTitle}>
                                                <i className="bi bi-lightbulb"></i>
                                                Mức giá đề xuất
                                            </h6>
                                            <div className={styles.suggestionGrid}>
                                                {bidSuggestions.map((suggestion, index) => (
                                                    <div 
                                                        key={index}
                                                        className={`${styles.suggestionCard} ${
                                                            bidAmount === suggestion.amount.toString() ? styles.suggestionCardActive : ''
                                                        }`}
                                                        onClick={() => setBidAmountSuggestion(suggestion.amount)}
                                                    >
                                                        <div className={styles.suggestionHeader}>
                                                            <span className={styles.suggestionLabel}>{suggestion.label}</span>
                                                        </div>
                                                        <div className={styles.suggestionAmount}>
                                                            {suggestion.amount.toLocaleString()} VNĐ
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                
                        {/* Bid History */}
                        <div className={styles.bidHistory}>
                            <h6 className={styles.bidHistoryTitle}>Lịch sử trả giá</h6>
                            {bidHistory.length === 0 ? (
                                <p className={styles.noBids}>{(listingData?.auctionBids || []).length > 0 ? 'Đang tải lịch sử...' : 'Chưa có lượt trả giá nào.'}</p>
                            ) : (
                                bidHistory.map((bid, index) => (
                                    <div key={`${bid.id}_${index}_${bid.amount}`} className={`${styles.bidItem} ${index === 0 ? styles.highlight : ''} m-3`}>
                                        <div className={styles.bidUser}>
                                            <img src={bid.avatar} alt="Bidder" className={styles.bidAvatar} />
                                            <div>
                                                <div className={styles.bidName}>{bid.name}</div>
                                                <div className={styles.bidTime}>{bid.time}</div>
                                            </div>
                                        </div>
                                        <div className={styles.bidAmount}>{bid.amount.toLocaleString()} VNĐ</div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className={styles.modalFooter}>
                            <button 
                                type="button" 
                                className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            {!auctionIsFinished && (
                                <button 
                                    type="submit" 
                                    form="placeBidForm"
                                    className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                                    disabled={!!bidError || !agreeAuctionTerms || isSubmitting}
                                >
                                    {isSubmitting ? 'Đang đặt giá...' : 'Đặt giá'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlaceBidModal;