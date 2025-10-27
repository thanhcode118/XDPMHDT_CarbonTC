import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import AISuggestion from '../../components/AISuggestion/AISuggestion';
import Tabs from '../../components/Tabs/Tabs';
import MarketplaceCard from '../../components/MarketplaceCard/MarketplaceCard';
import SellForm from '../../components/SellForm/SellForm';
import ListingTable from '../../components/ListingTable/ListingTable';
import AuctionForm from '../../components/AuctionForm/AuctionForm';
import EditListingModal from '../../components/EditListingModal/EditListingModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteListingModal/ConfirmDeleteModal';
import styles from './Marketplace.module.css';

import { 
  getListings, 
  getSuggestedPrice, 
  getMyListings, 
  createAuction,
  getListingById, 
  updateListing,
  deleteListing,
  getCreditInventory, 
  createListing       
} from '../../services/listingService';

const mapStatusToString = (status) => {
  switch (status) {
    case 1: return 'active'; 
    case 2: return 'sold';   
    case 3: return 'cancelled'
    default: return 'pending';
  }
};

const MOCK_AVAILABLE_CREDITS = [
  { 
    id: "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
    name: "Nguồn tín chỉ từ dự án Rừng A" 
  },
  { 
    id: "c7d8e9f0-a1b2-c3d4-e5f6-a7b8c9d0e1f2", 
    name: "Nguồn tín chỉ từ dự án Năng lượng B" 
  },
];

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [sidebarActive, setSidebarActive] = useState(false);
  
  // States cho tab 'buy'
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const [myListings, setMyListings] = useState([]);
  
  const [aiSuggestedPrice, setAiSuggestedPrice] = useState(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(true);
  const [suggestionError, setSuggestionError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState(null); 
  const [currentListingData, setCurrentListingData] = useState(null); 
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [modalSuggestedPrice, setModalSuggestedPrice] = useState(null);
  const [isModalSuggestionLoading, setIsModalSuggestionLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState(null); 
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [selectedCreditId, setSelectedCreditId] = useState('');
  const [currentInventory, setCurrentInventory] = useState(null);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);

  const [filterInputs, setFilterInputs] = useState({
    type: '',    
    status: '1',  
    minPrice: '',
    maxPrice: '',
    ownerId: ''
  });
  
  const [queryParams, setQueryParams] = useState({
    pageNumber: 1,
    pageSize: 20,
    type: null,   
    status: 1,    
    minPrice: null,
    maxPrice: null,
    ownerId: null
  });

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };
  
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilterInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSearch = () => {
    setQueryParams(prev => ({
      ...prev,
      type: filterInputs.type ? parseInt(filterInputs.type, 10) : null,
      status: filterInputs.status ? parseInt(filterInputs.status, 10) : null,
      minPrice: filterInputs.minPrice ? parseFloat(filterInputs.minPrice) : null,
      maxPrice: filterInputs.maxPrice ? parseFloat(filterInputs.maxPrice) : null,
      ownerId: filterInputs.ownerId.trim() ? filterInputs.ownerId.trim() : null,
      pageNumber: 1 
    }));
  };

  const fetchMyListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyListings(); 
      if (response.data && response.data.success) {
        const mappedData = response.data.data.map(item => ({
          ...item,
          status: mapStatusToString(item.status) 
        }));
        setMyListings(mappedData);
      } else {
        setError(response.data.message || 'Không thể tải danh sách của bạn.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách của bạn.');
      console.error('Error fetching my listings:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    setError(null);
    
    if (activeTab === 'buy') {
      setListings([]); // Xóa danh sách cũ
      const fetchListings = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const cleanParams = {};
          for (const key in queryParams) {
            if (queryParams[key] !== null && queryParams[key] !== undefined && queryParams[key] !== '') {
              cleanParams[key] = queryParams[key];
            }
          }
          const response = await getListings(cleanParams);
          if (response.data && response.data.success) {
            setListings(response.data.data.items);
          } else {
            setError(response.data.message || 'Không thể tải dữ liệu.');
          }
        } catch (err) {
          setError(err.message || 'Đã xảy ra lỗi khi kết nối server.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchListings();
    } else if (activeTab === 'sell') {
      setMyListings([]); 
      fetchMyListings(); 
    } else if (activeTab === 'auction') {
      setIsLoading(false); 
    }
  }, [activeTab, queryParams]); 
  useEffect(() => {
    const fetchAiSuggestion = async () => {
      setIsSuggestionLoading(true);
      setSuggestionError(null);
      try {
        const response = await getSuggestedPrice();
        if (response.data && response.data.success) {
          setAiSuggestedPrice(response.data.data); 
        } else {
          setSuggestionError(response.data.message || "Lỗi");
        }
      } catch (err) {
        setSuggestionError(err.message || "Không thể kết nối API gợi ý.");
        console.error(err);
      } finally {
        setIsSuggestionLoading(false);
      }
    };
    fetchAiSuggestion();
  }, []);

  
  const handleSellSubmit = async (formData) => {
    if (!selectedCreditId) {
      alert("Lỗi: Không có nguồn tín chỉ nào được chọn.");
      return;
    }
    try {
      setIsLoading(true); 
      const listingData = {
        creditId: selectedCreditId,
        type: 1, 
        pricePerUnit: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity),
      };
      
      const response = await createListing(listingData);
      if (response.data && response.data.success) {
        alert('Niêm yết thành công!');
        fetchMyListings(); 
        setActiveTab('sell'); 
      } else {
        alert('Có lỗi xảy ra: ' + (response.data.message || 'Không thể tạo niêm yết'));
      }
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể kết nối server'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuctionSubmit = async (formData) => {
    if (!selectedCreditId) {
      alert("Lỗi: Không có nguồn tín chỉ nào được chọn.");
      return;
    }
    try {
      setIsLoading(true);
      const auctionData = {
        creditId: selectedCreditId,
        type: 2, 
        quantity: parseFloat(formData.quantity),
        minimumBid: parseFloat(formData.startPrice), 
        auctionEndTime: new Date(formData.endDate).toISOString(), 
      };
      
      const response = await createListing(auctionData); 
      if (response.data && response.data.success) {
        alert('Tạo phiên đấu giá thành công!');
        fetchMyListings(); 
        setActiveTab('sell');
      } else {
        alert('Có lỗi xảy ra: ' + (response.data.message || 'Không thể tạo đấu giá'));
      }
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể kết nối server'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditListing = (listingId) => {
    console.log('Mở modal chỉnh sửa cho:', listingId);
    setEditingListingId(listingId); 
    setIsEditModalOpen(true); 
  };
  const handleCancelListing = (listingId) => {
    setDeletingListingId(listingId);
    setDeleteError(null);
    setIsDeleteModalOpen(true); 
  };
  const handleViewDetails = (listingId) => {
    console.log('View details:', listingId);
  };

  useEffect(() => {
    // Reset tất cả state của modal khi mở
    setCurrentListingData(null);
    setModalError(null);
    setModalSuggestedPrice(null); // <-- Reset gợi ý
    setIsModalSuggestionLoading(false);

    if (editingListingId && isEditModalOpen) {
      const fetchModalData = async () => {
        setIsModalLoading(true);
        try {
          // Bước 1: Tải chi tiết listing
          const detailsResponse = await getListingById(editingListingId);
          
          if (detailsResponse.data && detailsResponse.data.success) {
            const listingData = detailsResponse.data.data;
            setCurrentListingData(listingData); // <-- Set data cho form
            
            // Bước 2: Nếu thành công, dùng creditId để tải gợi ý
            if (listingData.creditId) {
              setIsModalSuggestionLoading(true);
              try {
                const suggestionResponse = await getSuggestedPrice(listingData.creditId);
                if (suggestionResponse.data && suggestionResponse.data.success) {
                  setModalSuggestedPrice(suggestionResponse.data.data);
                }
              } catch (suggestionErr) {
                // Lỗi tải gợi ý không nên chặn modal
                console.error("Lỗi tải gợi ý giá cho modal:", suggestionErr);
              } finally {
                setIsModalSuggestionLoading(false);
              }
            }
          } else {
            setModalError(detailsResponse.data.message || "Không thể tải chi tiết.");
          }
        } catch (err) {
          setModalError(err.message || "Lỗi server.");
        } finally {
          setIsModalLoading(false);
        }
      };

      fetchModalData();
    }
  }, [editingListingId, isEditModalOpen]);

  useEffect(() => {
    setCurrentInventory(null);
    setInventoryError(null);
    
    if (selectedCreditId) {
      const fetchInventory = async () => {
        setIsInventoryLoading(true);
        try {
          const response = await getCreditInventory(selectedCreditId);
          if (response.data && response.data.success) {
            setCurrentInventory(response.data.data); 
          } else {
            setInventoryError(response.data.message || "Không thể lấy tồn kho.");
          }
        } catch (err) {
          setInventoryError(err.message || "Lỗi server.");
        } finally {
          setIsInventoryLoading(false);
        }
      };
      fetchInventory();
    }
  }, [selectedCreditId]);

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingListingId(null);
    setCurrentListingData(null);
    setModalError(null);
    setModalSuggestedPrice(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingListingId(null);
    setDeleteError(null); 
  };

  const handleConfirmDelete = async () => {
    if (!deletingListingId) return;

    setIsDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await deleteListing(deletingListingId);

      if (response.data && response.data.success) {
        handleCloseDeleteModal(); 
        fetchMyListings(); 
      } else {
        const errorMsg = response.data?.errors?.[0]?.description 
                         || response.data?.message 
                         || "Lỗi không xác định.";
        setDeleteError(errorMsg);
      }
    } catch (err) {
      // Lỗi mạng hoặc server 500
      setDeleteError(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleUpdateSubmit = async (formData) => {
    if (!editingListingId) return;

    setIsModalLoading(true); 
    setModalError(null);
    
    try {
      const updateData = {
        type: parseInt(formData.type, 10),
        status: parseInt(formData.status, 10),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        minimumBid: formData.type == 2 ? parseFloat(formData.minimumBid) : null,
        auctionEndTime: formData.type == 2 ? (formData.auctionEndTime ? new Date(formData.auctionEndTime).toISOString() : null) : null,
        closedAt: formData.status != 1 ? (formData.closedAt ? new Date(formData.closedAt).toISOString() : new Date().toISOString()) : null,
    };

      const response = await updateListing(editingListingId, updateData);

      if (response.data && response.data.success) {
        handleCloseModal(); 
        fetchMyListings(); 
      } else {
        setModalError(response.data.message || "Lỗi cập nhật.");
      }
    } catch (err) {
      setModalError(err.message || "Lỗi server.");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (aiSuggestedPrice) {
      setActiveTab('sell');
    }
  };

  const mapApiDataToCardProps = (item) => {
    const isFixedPrice = item.type === 1;
    const isAuction = item.type === 2;
    let price = item.pricePerUnit;
    let total = item.quantity * item.pricePerUnit;
    let totalLabel = "Tổng giá";
    let priceLabel = "Giá/tín chỉ";
    let trendType = 'up'; 
    
    if (isAuction) {
      total = item.minimumBid; 
      totalLabel = "Giá khởi điểm";
      priceLabel = "Giá/tín chỉ (tham khảo)";
      trendType = 'time'; 
    }
    
    return {
      id: item.id,
      type: isFixedPrice ? 'fixed-price' : 'auction',
      typeText: isFixedPrice ? 'Giá cố định' : 'Đấu giá',
      priceTrend: trendType,
      title: `Tín chỉ từ Owner: ${item.ownerId?.substring(0, 8)}...`,
      quantity: item.quantity,
      price: price,
      priceLabel: priceLabel,
      total: total,
      totalLabel: totalLabel,
      seller: `Owner ID: ${item.ownerId}`,
      auctionEndTime: item.auctionEndTime 
    };
  };

  const getAiSuggestionContent = () => {
    if (isSuggestionLoading) {
      return "Đang tải gợi ý từ AI...";
    }
    if (suggestionError) {
      return "Không thể tải gợi ý giá vào lúc này.";
    }
    if (aiSuggestedPrice) {
      const formattedPrice = Math.round(aiSuggestedPrice).toLocaleString();
      return `Dựa trên dữ liệu thị trường hiện tại, chúng tôi đề xuất bạn niêm yết tín chỉ của mình với giá <strong>${formattedPrice} VNĐ/tín chỉ</strong> để tối đa hóa lợi nhuận.`;
    }
    return "Không có gợi ý nào từ AI.";
  };

  const renderCreditSelector = () => (
    <div className={styles.formSection} data-aos="fade-up" style={{ marginBottom: '20px' }}>
      <label htmlFor="creditSource" className={styles.formLabel}>
        <strong>Bước 1: Chọn nguồn tín chỉ</strong>
      </label>
      <select
        id="creditSource"
        className={styles.formSelect}
        value={selectedCreditId}
        onChange={(e) => setSelectedCreditId(e.target.value)}
      >
        <option value="">-- Chọn nguồn Carbon Credit --</option>
        {MOCK_AVAILABLE_CREDITS.map(credit => (
          <option key={credit.id} value={credit.id}>
            {credit.name} (ID: ...{credit.id.slice(-6)})
          </option>
        ))}
      </select>
      <small className={styles.textSecondary}>
        Đây là danh sách (giả lập) các nguồn tín chỉ đã được xác minh của bạn.
      </small>
    </div>
  );


  return (
    <div className={styles.app}>
      <button className={styles.mobileToggle} id="sidebarToggle" onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>
      
      <Sidebar 
        activePage="marketplace" 
        className={sidebarActive ? 'activemenu' : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar title="Thị trường tín chỉ carbon" />
        
        <AISuggestion
          title="Gợi ý từ AI"
          content={getAiSuggestionContent()} 
          actionText="Niêm yết theo gợi ý"
          onAction={handleApplySuggestion}
        />
        
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'buy' && (
          <div className={styles.tabContent}>
            <div className={styles.filterSection} data-aos="fade-up" data-aos-delay="200">
              <h3 className={styles.filterTitle}>Bộ lọc tìm kiếm</h3>
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="type" className={styles.formLabel}>Loại niêm yết</label>
                  <select 
                    className={styles.formSelect} 
                    id="type"
                    value={filterInputs.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tất cả</option> 
                    <option value="1">Giá cố định (FixedPrice)</option>
                    <option value="2">Đấu giá (Auction)</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="status" className={styles.formLabel}>Trạng thái</label>
                  <select 
                    className={styles.formSelect} 
                    id="status"
                    value={filterInputs.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tất cả</option>
                    <option value="1">Đang mở (Open)</option>
                    <option value="2">Đã đóng (Closed)</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="minPrice" className={styles.formLabel}>Giá tối thiểu (VNĐ)</label>
                  <input 
                    type="number" 
                    className={styles.formControl} 
                    id="minPrice" 
                    placeholder="Tối thiểu..." 
                    value={filterInputs.minPrice}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="maxPrice" className={styles.formLabel}>Giá tối đa (VNĐ)</label>
                  <input 
                    type="number" 
                    className={styles.formControl} 
                    id="maxPrice" 
                    placeholder="Tối đa..." 
                    value={filterInputs.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-9">
                  <label htmlFor="ownerId" className={styles.formLabel}>Mã người bán (OwnerId)</label>
                  <input 
                    type="text" 
                    className={styles.formControl} 
                    id="ownerId" 
                    placeholder="Nhập GUID của người bán (tùy chọn)..." 
                    value={filterInputs.ownerId}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button 
                    className={`${styles.btnCustom} ${styles.btnPrimaryCustom} w-100`}
                    onClick={handleSearch}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.marketplaceGrid}>
              {isLoading && <p>Đang tải dữ liệu...</p>}
              {!isLoading && error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
              {!isLoading && !error && listings.length === 0 && <p>Không tìm thấy listing nào phù hợp.</p>}
              {!isLoading && !error && listings.length > 0 && (
                listings.map((item) => (
                  <MarketplaceCard key={item.id} {...mapApiDataToCardProps(item)} />
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === 'sell' && (
          <div className={styles.tabContent}>
            {renderCreditSelector()}

            {selectedCreditId && (
              <SellForm 
                suggestedPrice={aiSuggestedPrice}
                onSubmit={handleSellSubmit}
                // Truyền props tồn kho xuống
                inventory={currentInventory}
                isLoadingInventory={isInventoryLoading}
                inventoryError={inventoryError}
              />
            )}
            
            {isLoading && <p>Đang tải danh sách của bạn...</p>}
            {!isLoading && error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
            {!isLoading && !error && (
              <ListingTable 
                listings={myListings} 
                onEdit={handleEditListing}
                onCancel={handleCancelListing}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        )}

        {/* --- TAB ĐẤU GIÁ --- */}
        {activeTab === 'auction' && (
          <div className={styles.tabContent}>
            {renderCreditSelector()}
            {selectedCreditId && (
              <AuctionForm 
                onSubmit={handleAuctionSubmit}
                inventory={currentInventory}
                isLoadingInventory={isInventoryLoading}
                inventoryError={inventoryError}
              />
            )}
          </div>
        )}

        <EditListingModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleUpdateSubmit}
          listingData={currentListingData}
          isLoading={isModalLoading}
          error={modalError}
          suggestedPrice={modalSuggestedPrice}
          isSuggestionLoading={isModalSuggestionLoading}
        />
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleteLoading}
          error={deleteError}
        />
      </div>
    </div>
  );
};

export default Marketplace;