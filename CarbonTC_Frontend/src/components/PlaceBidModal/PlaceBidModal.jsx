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
import { getUserIdFromToken } from '../../services/listingService';
import { toast } from 'react-toastify';

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
    auctionRealtimeData
}) => {

    const [localError, setLocalError] = useState('');
    const processedBidsRef = useRef(new Set());

    // 🆕 THÊM: Kiểm tra chủ sở hữu
    const currentUserId = getUserIdFromToken();
    const isOwner = listingData?.ownerId === currentUserId;
    
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

    // Chart options (giữ nguyên)
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
                    processedBidsRef.current.add(entry.id);
                    return entry;
                })
                .slice(0, 5);
            
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
                labels: chartLabels.slice(-10),
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

    // Xử lý realtime bid updates (giữ nguyên)
    useEffect(() => {
        const latestBid = debouncedLatestBid;
        if (latestBid) {
            const bidUniqueId = `bid_${latestBid.bidderId}_${latestBid.bidTime}_${latestBid.bidAmount}`;
            
            if (processedBidsRef.current.has(bidUniqueId)) {
                return;
            }

            processedBidsRef.current.add(bidUniqueId);

            const newHistoryEntry = createHistoryEntry(latestBid);
            setBidHistory(prev => {
                const isAlreadyInHistory = prev.some(item => 
                    item.id === newHistoryEntry.id || 
                    (item.name === newHistoryEntry.name && item.amount === newHistoryEntry.amount)
                );
                
                if (isAlreadyInHistory) {
                    return prev;
                }
                
                return [newHistoryEntry, ...prev.slice(0, 4)];
            });

            setChartData(prev => {
                const currentLabels = prev.labels || [];
                const currentData = prev.datasets?.[0]?.data || [];
                
                const isAlreadyInChart = currentLabels.some((label, index) => 
                    label === newHistoryEntry.time && currentData[index] === latestBid.bidAmount
                );
                
                if (isAlreadyInChart) {
                    return prev;
                }
                
                const newLabels = [...currentLabels.slice(-9), newHistoryEntry.time];
                const newData = [...currentData.slice(-9), latestBid.bidAmount];
                
                return {
                    ...prev,
                    labels: newLabels,
                    datasets: [{ ...prev.datasets[0], data: newData }]
                };
            });

            if (bidAmount && parseFloat(bidAmount) < minBidAmount) {
                setBidAmount(minBidAmount.toString());
                setBidError(`Giá đã tăng. Giá tối thiểu mới: ${minBidAmount.toLocaleString()} VNĐ`);
            }
        }
    }, [debouncedLatestBid, minBidAmount, bidAmount]);

    // Cleanup khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            processedBidsRef.current.clear();
        }
    }, [isOpen]);

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

    // 🆕 SỬA: Thêm toast thông báo khi chưa chấp nhận điều khoản
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isSubmitting || auctionIsFinished) return;
        console.log("🔄 handleSubmit called");
        // 🆕 KIỂM TRA CHỦ SỞ HỮU
        if (isOwner) {
            toast.warning('Bạn là chủ sở hữu, không thể đặt giá trên sản phẩm của mình!', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        // 🆕 THÊM TOAST CHO ĐIỀU KHOẢN
        if (!agreeAuctionTerms) {
            console.log("🎯 Showing terms toast");
            toast.error('Vui lòng đồng ý với điều khoản đấu giá trước khi đặt giá!', {
                position: "top-right",
                autoClose: 3000,
            });
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
                    {/* 🆕 SỬA: Tiêu đề khác cho chủ sở hữu */}
                    <h5 className={styles.modalTitle}>
                        {isOwner ? 'Theo dõi đấu giá của bạn' : 'Đặt giá cho phiên đấu giá'}
                    </h5>
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

                {/* 🆕 THÊM: Thông báo cho chủ sở hữu */}
                {isOwner && (
                    <div className={styles.ownerNotice}>
                        <div className={styles.ownerNoticeIcon}>
                            <i className="bi bi-person-check-fill"></i>
                        </div>
                        <div className={styles.ownerNoticeContent}>
                            <strong>Bạn là chủ sở hữu phiên đấu giá này</strong>
                            <p>Theo dõi diễn biến đấu giá và lịch sử trả giá của người tham gia.</p>
                        </div>
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
                                            <div className={styles.detailLabel}>Giá khởi điểm trọn gói</div>
                                            <div className={styles.detailValue}>
                                                {listingData?.minimumBid?.toLocaleString()} VNĐ
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

                            {/* 🆕 SỬA: Ẩn Bid Form nếu là chủ sở hữu */}
                            {!auctionIsFinished && !isOwner && (
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
                                </form>
                            )}

                            {/* 🆕 THÊM: Thông báo cho chủ sở hữu khi auction kết thúc */}
                            {auctionIsFinished && isOwner && winnerInfo && (
                                <div className={styles.ownerResult}>
                                    <div className={styles.ownerResultIcon}>
                                        <i className="bi bi-trophy-fill"></i>
                                    </div>
                                    <div className={styles.ownerResultContent}>
                                        <h6>Phiên đấu giá đã kết thúc!</h6>
                                        <p>
                                            Người thắng: <strong>...{winnerInfo.winningBidderId?.slice(-6)}</strong>
                                            <br />
                                            Giá thắng: <strong>{winnerInfo.winningBidAmount?.toLocaleString()} VNĐ</strong>
                                        </p>
                                    </div>
                                </div>
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
                                Đóng
                            </button>
                            {/* 🆕 SỬA: Ẩn nút đặt giá nếu là chủ sở hữu */}
                            {!auctionIsFinished && !isOwner && (
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