import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import TripStatCard from '../../components/TripStatCard/TripStatCard';
import TripMap from '../../components/TripMap/TripMap';
// Bỏ import FilterSectionCar nếu không dùng nữa
// import FilterSectionCar from '../../components/FilterSectionCar/FilterSection';
import TripCard from '../../components/TripCard/TripCard';
import TripDetailModal from '../../components/TripDetailModal/TripDetailModal';
import TripsTabs from '../../components/TripsTabs/TripsTabs';
import UploadJourneyModal from '../../components/UploadJourneyModal/UploadJourneyModal';
import JourneyBatchCard from '../../components/JourneyBatchCard/JourneyBatchCard';
import Button from '../../components/Button/Button';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import styles from './Trips.module.css';

// --- Import services ---
import { getMyJourneys } from '../../services/journeyService';
import { createJourneyBatch, getMyJourneyBatches } from '../../services/batchService';
import { submitVerificationRequest } from '../../services/verificationService';


const Trips = () => {
    const { sidebarActive, toggleSidebar } = useSidebar();
    const { showNotification } = useNotification();

    // --- States cho dữ liệu ---
    const [trips, setTrips] = useState([]);
    // Bỏ filteredTrips nếu không còn FilterSectionCar
    // const [filteredTrips, setFilteredTrips] = useState([]);
    const [journeyBatches, setJourneyBatches] = useState([]);
    const [vehicles, setVehicles] = useState([]); // Vẫn giữ để có thể dùng lại filter sau này nếu cần
    const [tripStatsData, setTripStatsData] = useState([
        { icon: 'bi-signpost-2-fill', value: '0', label: 'Tổng số hành trình', gradient: '1', delay: 100 },
        { icon: 'bi-geo-alt-fill', value: '0 km', label: 'Tổng quãng đường', gradient: '2', delay: 200 },
        { icon: 'bi-lightning-charge-fill', value: '0', label: 'Tín chỉ kiếm được', gradient: '3', delay: 300 },
        { icon: 'bi-cloud-arrow-down-fill', value: '0 kg', label: 'CO₂ giảm phát thải', gradient: '4', delay: 400 }
    ]);

    // --- States cho UI ---
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('history'); // Mặc định tab Lịch sử
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedTripIds, setSelectedTripIds] = useState(new Set());
    const [newBatchName, setNewBatchName] = useState('');

    // --- State để trigger refresh dữ liệu ---
    const [refreshKey, setRefreshKey] = useState(0);

    // --- Hàm fetch dữ liệu ---
    const fetchJourneys = useCallback(async () => {
        console.log("Fetching journeys for owner:", CURRENT_OWNER_ID);
        try {
            const fetchedJourneys = await getMyJourneys();
            const journeysArray = fetchedJourneys || [];
            setTrips(journeysArray);
            // Bỏ setFilteredTrips nếu không filter nữa
            // setFilteredTrips(journeysArray);
            console.log("Fetched journeys:", journeysArray);

            const uniqueVehicleTypes = [...new Set(journeysArray.map(trip => trip.vehicleType).filter(Boolean))];
            setVehicles(uniqueVehicleTypes.map((name, index) => ({ id: index + 1, name })));

            if (journeysArray.length > 0) {
                const totalDistance = journeysArray.reduce((sum, trip) => sum + (trip.distanceKm || 0), 0);
                const totalCredits = journeysArray.reduce((sum, trip) => sum + (trip.calculatedCarbonCredits || 0), 0);
                const totalCO2Reduced = totalCredits;

                setTripStatsData([
                    { icon: 'bi-signpost-2-fill', value: journeysArray.length.toString(), label: 'Tổng số hành trình', gradient: '1', delay: 100 },
                    { icon: 'bi-geo-alt-fill', value: `${totalDistance.toFixed(1)} km`, label: 'Tổng quãng đường', gradient: '2', delay: 200 },
                    { icon: 'bi-lightning-charge-fill', value: totalCredits.toFixed(1), label: 'Tín chỉ kiếm được', gradient: '3', delay: 300 },
                    { icon: 'bi-cloud-arrow-down-fill', value: `${totalCO2Reduced.toFixed(1)} kg`, label: 'CO₂ giảm phát thải', gradient: '4', delay: 400 }
                ]);
            } else {
                setTripStatsData([ // Reset stats
                    { icon: 'bi-signpost-2-fill', value: '0', label: 'Tổng số hành trình', gradient: '1', delay: 100 },
                    { icon: 'bi-geo-alt-fill', value: '0 km', label: 'Tổng quãng đường', gradient: '2', delay: 200 },
                    { icon: 'bi-lightning-charge-fill', value: '0', label: 'Tín chỉ kiếm được', gradient: '3', delay: 300 },
                    { icon: 'bi-cloud-arrow-down-fill', value: '0 kg', label: 'CO₂ giảm phát thải', gradient: '4', delay: 400 }
                ]);
            }
        } catch (error) {
            showNotification(`Lỗi tải lịch sử hành trình: ${error.message}`, 'error');
            setTrips([]);
            // setFilteredTrips([]);
            setVehicles([]);
            setTripStatsData([ // Reset stats
                 { icon: 'bi-signpost-2-fill', value: '0', label: 'Tổng số hành trình', gradient: '1', delay: 100 },
                 { icon: 'bi-geo-alt-fill', value: '0 km', label: 'Tổng quãng đường', gradient: '2', delay: 200 },
                 { icon: 'bi-lightning-charge-fill', value: '0', label: 'Tín chỉ kiếm được', gradient: '3', delay: 300 },
                 { icon: 'bi-cloud-arrow-down-fill', value: '0 kg', label: 'CO₂ giảm phát thải', gradient: '4', delay: 400 }
            ]);
        }
    }, [showNotification]);

    const fetchBatches = useCallback(async () => {
        console.log("Fetching batches for owner:", CURRENT_OWNER_ID);
        try {
            const fetchedBatches = await getMyJourneyBatches();
            setJourneyBatches(fetchedBatches || []);
            console.log("Fetched batches:", fetchedBatches);
        } catch (error) {
            showNotification(`Lỗi tải lô hành trình: ${error.message}`, 'error');
            setJourneyBatches([]);
        }
    }, [showNotification]);

    // --- useEffect để fetch dữ liệu ---
    useEffect(() => {
        setLoading(true);
        Promise.all([fetchJourneys(), fetchBatches()])
            .catch(error => {
                console.error("Error during initial data fetch:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [fetchJourneys, fetchBatches, refreshKey]);

    // --- Các hàm xử lý sự kiện ---

    // Bỏ hàm handleFilter nếu không còn FilterSectionCar
    /*
    const handleFilter = (filters) => {
        // ... logic filter cũ ...
        // setFilteredTrips(filtered); // Cập nhật state filteredTrips nếu còn dùng
    };
    */

    const handleViewDetails = async (tripId) => {
        try {
            const trip = trips.find(t => t.id === tripId);
            if (trip) {
                setSelectedTrip(trip);
                setShowDetailModal(true);
            } else {
                showNotification('Không tìm thấy thông tin chi tiết hành trình.', 'warning');
            }
        } catch (error) {
            showNotification(`Lỗi khi lấy chi tiết hành trình: ${error.message}`, 'error');
        }
    };

    const handleSelectTrip = (tripId, isSelected) => {
        setSelectedTripIds(prevSelectedIds => {
            const newSelectedIds = new Set(prevSelectedIds);
            if (isSelected) {
                newSelectedIds.add(tripId);
            } else {
                newSelectedIds.delete(tripId);
            }
            return newSelectedIds;
        });
    }

const handleCreateBatch = async () => {
    console.log("Create Batch button clicked!"); // Log cũ

    if (selectedTripIds.size === 0) {
        showNotification('Vui lòng chọn ít nhất một chuyến đi để tạo lô.', 'warning');
        console.log("handleCreateBatch: No trips selected."); // Log thêm
        return;
    }
    if (!newBatchName.trim()) {
        showNotification('Vui lòng nhập tên lô.', 'warning');
        console.log("handleCreateBatch: Batch name is empty."); // Log thêm
        return;
    }

    const selectedIdsArray = Array.from(selectedTripIds);
    console.log("handleCreateBatch: Attempting to create batch with:", { name: newBatchName, ids: selectedIdsArray }); // Log dữ liệu gửi đi

    // Tạm thời comment showNotification ở đây để tránh che log lỗi nếu có
    // showNotification(`Đang tạo lô "${newBatchName}"...`, 'info');

    try {
        console.log("handleCreateBatch: Calling createJourneyBatch API..."); // Log trước khi gọi API
        const newBatch = await createJourneyBatch(newBatchName, selectedIdsArray);
        console.log("handleCreateBatch: API call successful, response:", newBatch); // Log kết quả API

        showNotification(`Đã tạo lô "${newBatch.name || newBatchName}" thành công!`, 'success');
        setSelectedTripIds(new Set());
        setNewBatchName('');
        handleRefresh();
        setActiveTab('batches');
    } catch (error) {
        // Log lỗi chi tiết hơn
        console.error("handleCreateBatch: API call failed!", error);
        showNotification(`Lỗi tạo lô: ${error.message}`, 'error');
    }
};

    const handleRequestVerification = async (batchId) => {
        if (!batchId) return;
        showNotification(`Đang gửi yêu cầu xác minh cho lô ${batchId}...`, 'info');
        try {
            await submitVerificationRequest(batchId);
            showNotification(`Đã gửi yêu cầu xác minh cho lô ${batchId} thành công.`, 'success');
            handleRefresh(); // Refresh batches
        } catch (error) {
            showNotification(`Lỗi gửi yêu cầu xác minh: ${error.message}`, 'error');
        }
    };

    // --- Cập nhật handleUploadSuccess: Bỏ setActiveTab ---
    const handleUploadSuccess = () => {
        console.log("Trips.jsx: handleUploadSuccess called!");
        handleRefresh(); // Chỉ cần refresh dữ liệu, giữ nguyên tab hiện tại
        // setActiveTab('batches'); // Bỏ dòng này
    };

    const handleRefresh = () => {
        console.log("Trips.jsx: handleRefresh called, updating refreshKey...");
        setRefreshKey(k => k + 1);
    };

    const handleExportReport = () => {
        showNotification('Đang xuất báo cáo...', 'info');
        setTimeout(() => {
            showNotification('Xuất báo cáo thành công!', 'success');
        }, 2000);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTrip(null);
    };

    const handleViewBatchDetails = (batchId) => {
        console.log("Xem chi tiết lô:", batchId);
        showNotification(`Xem chi tiết cho lô ${batchId}`, 'info');
        // TODO: Implement xem chi tiết lô
    };

    const handleDeleteBatch = (batchId) => {
        // TODO: Implement gọi API xóa lô
        if (window.confirm(`Bạn có chắc chắn muốn xóa lô ${batchId}?`)) {
            console.log("Xóa lô:", batchId);
            showNotification(`Đang xóa lô ${batchId}...`, 'warning');
            setTimeout(() => {
                setJourneyBatches(prev => prev.filter(b => b.id !== batchId));
                showNotification(`Đã xóa lô ${batchId}`, 'success');
                // handleRefresh(); // Gọi sau khi API thành công
            }, 1500);
        }
    };

    // --- Render nội dung Tab ---
    const renderTabContent = () => {
        switch (activeTab) {
            case 'history':
                const selectedCount = selectedTripIds.size;
                // Sử dụng trực tiếp state 'trips' vì không còn filter nữa
                const currentTrips = trips;
                return (
                    <>
                        {/* --- Bỏ Filter Section --- */}
                        {/*
                        <FilterSectionCar
                            onFilter={handleFilter}
                            vehicles={vehicles}
                            data-aos="fade-up"
                            data-aos-delay="600"
                        />
                        */}

                        {/* Khu vực tạo lô */}
                        {selectedCount > 0 && (
                            <div className={`${styles.card} ${styles.createBatchSection}`} data-aos="fade-up" data-aos-delay="650">
                                {/* ... JSX khu vực tạo lô giữ nguyên ... */}
                                <div className={styles.cardBody}>
                                    <h4 className={styles.createBatchTitle}>Tạo Lô Hành Trình Mới ({selectedCount} chuyến đi đã chọn)</h4>
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-6">
                                            <label htmlFor="batchName" className={styles.formLabel}>Tên lô <span style={{ color: '#f87171' }}>*</span></label>
                                            <input
                                                type="text"
                                                className={styles.formControl}
                                                id="batchName"
                                                placeholder="Ví dụ: Chuyến đi tháng 10/2025"
                                                value={newBatchName}
                                                onChange={(e) => setNewBatchName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <Button
                                                variant="primary"
                                                onClick={handleCreateBatch}
                                                className="w-100"
                                                disabled={!newBatchName.trim()}
                                            >
                                                <i className="bi bi-plus-circle me-1"></i> Tạo lô
                                            </Button>
                                        </div>
                                        <div className="col-md-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedTripIds(new Set())}
                                                className="w-100"
                                            >
                                                <i className="bi bi-x-circle me-1"></i> Bỏ chọn ({selectedCount})
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Trip List */}
                        <div className={styles.card} data-aos="fade-up" data-aos-delay="700">
                             {/* --- Di chuyển nút Upload vào đây --- */}
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Lịch sử hành trình ({currentTrips.length})</h3>
                                 <div>
                                     <Button
                                         variant="outline"
                                         size="small"
                                         onClick={handleRefresh} // Nút tải lại danh sách
                                         className="me-2"
                                      >
                                         <i className="bi bi-arrow-clockwise"></i>
                                      </Button>
                                     <Button
                                         variant="primary"
                                         size="small"
                                         onClick={() => {
                                             console.log('Opening upload modal'); // Thêm log để debug
                                             setShowUploadModal(true);
                                         }} // Mở modal upload
                                      >
                                         <i className="bi bi-upload me-1"></i> Tải lên file hành trình
                                      </Button>
                                     {currentTrips.length > 0 && (
                                         <Button
                                             variant="outline"
                                             size="small"
                                             onClick={() => {
                                                 if (selectedTripIds.size === currentTrips.length) {
                                                     setSelectedTripIds(new Set());
                                                 } else {
                                                     setSelectedTripIds(new Set(currentTrips.map(t => t.id)));
                                                 }
                                             }}
                                             className="ms-2" // Thêm khoảng cách
                                          >
                                             {selectedTripIds.size === currentTrips.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                          </Button>
                                     )}
                                 </div>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.tripList}>
                                    {currentTrips.length > 0 ? (
                                        currentTrips.map((trip) => (
                                            <TripCard
                                                key={trip.id}
                                                trip={{
                                                    id: trip.id,
                                                    date: new Date(trip.startTime).toLocaleDateString('vi-VN'),
                                                    status: trip.status,
                                                    startLocation: trip.origin,
                                                    endLocation: trip.destination,
                                                    startTime: new Date(trip.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                                                    endTime: new Date(trip.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                                                    distance: trip.distanceKm,
                                                    credits: trip.calculatedCarbonCredits,
                                                    vehicle: trip.vehicleType,
                                                }}
                                                onViewDetails={() => handleViewDetails(trip.id)}
                                                isSelected={selectedTripIds.has(trip.id)}
                                                onSelectChange={handleSelectTrip}
                                            />
                                        ))
                                    ) : (
                                        <div className={styles.emptyState}>
                                            <i className="bi bi-map"></i>
                                            <p>Không tìm thấy hành trình nào.</p>
                                            {/* Giữ nút tải lại */}
                                            <Button variant="secondary" onClick={handleRefresh}>
                                                <i className="bi bi-arrow-clockwise me-1"></i> Tải lại
                                            </Button>
                                            {/* Có thể thêm nút upload ở đây nếu muốn */}
                                             <Button variant="primary" onClick={() => setShowUploadModal(true)} className="ms-2">
                                                 <i className="bi bi-upload me-1"></i> Tải lên file đầu tiên
                                             </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'batches':
                return (
                    <div className={styles.card} data-aos="fade-up" data-aos-delay="600">
                         {/* --- Bỏ nút Upload khỏi header này --- */}
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Quản lý Lô hành trình ({journeyBatches.length})</h3>
                            <div>
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={handleRefresh}
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                </Button>
                                {/* Nút Upload đã bị xóa */}
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            {journeyBatches.length > 0 ? (
                                <div>
                                    {journeyBatches.map(batch => (
                                        <JourneyBatchCard
                                            key={batch.id}
                                            batch={{
                                                id: batch.id,
                                                uploadDate: new Date(batch.creationTime).toLocaleDateString('vi-VN'),
                                                tripCount: batch.numberOfJourneys,
                                                status: batch.status,
                                            }}
                                            onViewDetails={handleViewBatchDetails}
                                            onDelete={handleDeleteBatch}
                                            onSubmitVerification={handleRequestVerification}
                                            canSubmitVerification={batch.status === 'Pending' || batch.status === 0}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <i className="bi bi-file-earmark-zip"></i>
                                    <p>Chưa có lô hành trình nào.</p>
                                    {/* Giữ lại nút này để người dùng biết có thể upload */}
                                    <Button variant="primary" onClick={() => { setActiveTab('history'); setShowUploadModal(true); }}>
                                        <i className="bi bi-upload me-1"></i> Tải lên file hành trình
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Render loading state (giữ nguyên)
    if (loading) {
        return (
            <div className={styles.app}>
                <button className={styles.mobileToggle} onClick={toggleSidebar}>
                    <i className="bi bi-list"></i>
                </button>
                <Sidebar
                    activePage="trips"
                    className={sidebarActive ? 'activemenu' : ''}
                />
                <div className={styles.mainContent}>
                    <Topbar title="Hành trình" />
                    <div className={styles.loadingState}>
                        <i className="bi bi-arrow-repeat spinner-border"></i>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- Render chính ---
    return (
        <div className={styles.app}>
            <button className={styles.mobileToggle} onClick={toggleSidebar}>
                <i className="bi bi-list"></i>
            </button>
            <Sidebar
                activePage="trips"
                className={sidebarActive ? 'activemenu' : ''}
            />
            <div className={styles.mainContent}>
                <Topbar title="Hành trình" />

                <div className={styles.tripStats}>
                    {tripStatsData.map((stat, index) => (
                        <TripStatCard key={index} {...stat} />
                    ))}
                </div>

                <TripMap data-aos="fade-up" data-aos-delay="500" />
                <TripsTabs activeTab={activeTab} onTabChange={setActiveTab} />
                {renderTabContent()}
            </div>

            {/* Modals */}
            <TripDetailModal
                show={showDetailModal}
                onClose={handleCloseDetailModal}
                trip={selectedTrip}
                onExportReport={handleExportReport}
            />
            {/* Đảm bảo UploadJourneyModal vẫn được render */}
            <UploadJourneyModal
                show={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default Trips;