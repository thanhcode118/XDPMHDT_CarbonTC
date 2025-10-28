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
import CreditSelector from '../../components/CreditSelector/CreditSelector';
import PlaceBidModal from '../../components/PlaceBidModal/PlaceBidModal'; // Import modal
import BuyNowModal from '../../components/BuyNowModal/BuyNowModal'; // Import modal
import styles from './Marketplace.module.css';

import { 
  getListings, 
  getSuggestedPrice, 
  getMyListings, 
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

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [sidebarActive, setSidebarActive] = useState(false);
  
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const [myListings, setMyListings] = useState([]);
  
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

  const [availableCredits, setAvailableCredits] = useState([]);
  const [isCreditsLoading, setIsCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState(null);

  const [selectedCreditId, setSelectedCreditId] = useState('');
  const [currentInventory, setCurrentInventory] = useState(null);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);

  const [bannerSuggestedPrice, setBannerSuggestedPrice] = useState(null);
  const [isBannerSuggestionLoading, setIsBannerSuggestionLoading] = useState(true);

  const [formSuggestedPrice, setFormSuggestedPrice] = useState(null);
  const [isFormSuggestionLoading, setIsFormSuggestionLoading] = useState(false);
  const [formSuggestionType, setFormSuggestionType] = useState('generic');

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

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

   // Thêm hàm xử lý mua ngay
  const handleBuyClick = (listing) => {
    setSelectedListing(listing);
    setShowBuyModal(true);
  };

  // Thêm hàm xử lý đặt giá
  const handleBidClick = (listing) => {
    setSelectedListing(listing);
    setShowBidModal(true);
  };

  // Thêm hàm submit cho mua ngay
  const handleBuySubmit = (buyData) => {
    console.log('Buy data:', buyData);
    console.log('Selected listing:', selectedListing);
    // Gọi API mua ngay
    setShowBuyModal(false);
    // TODO: Gọi API purchase
  };

  // Thêm hàm submit cho đặt giá
  const handleBidSubmit = (bidData) => {
    console.log('Bid data:', bidData);
    console.log('Selected listing:', selectedListing);
    // Gọi API đặt giá
    setShowBidModal(false);
    // TODO: Gọi API place bid
  };

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
      setListings([]); 
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
      setIsFormSuggestionLoading(true);
      try {
        const response = await getSuggestedPrice();
        if (response.data && response.data.success) {
          const genericPrice = response.data.data;
          setBannerSuggestedPrice(genericPrice); 
          setFormSuggestedPrice(genericPrice);   
          setFormSuggestionType('generic');
        } 
      } catch (err) {
        console.error(err);
      } finally {
        setIsBannerSuggestionLoading(false);
        setIsFormSuggestionLoading(false); 
      }
    };
    fetchAiSuggestion();
  }, []);

  useEffect(() => {
    setCurrentInventory(null);
    setInventoryError(null);

    // Nếu người dùng bỏ chọn
    if (!selectedCreditId) {
      // Đặt giá của form trở lại giá chung
      setFormSuggestedPrice(bannerSuggestedPrice); 
      setFormSuggestionType('generic');
      return;
    }

    // Nếu người dùng chọn 1 creditId
    const fetchCreditData = async () => {
      // Đặt 2 API vào trạng thái loading
      setIsInventoryLoading(true);
      setIsFormSuggestionLoading(true); // <-- Bắt đầu loading giá cá nhân hóa

      // Tạo 2 hàm promise để gọi song song
      const fetchInventory = getCreditInventory(selectedCreditId);
      const fetchPersonalizedPrice = getSuggestedPrice(selectedCreditId); // <-- Gọi API với creditId

      try {
        // Chờ cả 2 API hoàn thành
        const [inventoryResponse, priceResponse] = await Promise.all([
          fetchInventory,
          fetchPersonalizedPrice
        ]);

        // Xử lý kết quả Inventory
        if (inventoryResponse.data && inventoryResponse.data.success) {
          setCurrentInventory(inventoryResponse.data.data);
        } else {
          setInventoryError(inventoryResponse.data.message || "Lỗi tải tồn kho.");
        }

        // Xử lý kết quả Giá cá nhân hóa
        if (priceResponse.data && priceResponse.data.success) {
          setFormSuggestedPrice(priceResponse.data.data); // <-- Set giá mới cho form
          setFormSuggestionType('personalized'); // Đánh dấu đây là giá cá nhân hóa
        } else {
          // Nếu lỗi, dùng lại giá chung
          setFormSuggestedPrice(bannerSuggestedPrice);
          setFormSuggestionType('generic');
        }

      } catch (err) {
        setInventoryError(err.message || "Lỗi server.");
        setFormSuggestedPrice(bannerSuggestedPrice); // Lỗi mạng, dùng lại giá chung
        setFormSuggestionType('generic');
      } finally {
        setIsInventoryLoading(false);
        setIsFormSuggestionLoading(false); // <-- Kết thúc loading
      }
    };

    fetchCreditData();
  }, [selectedCreditId, bannerSuggestedPrice]);

  
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
    setCurrentListingData(null);
    setModalError(null);
    setModalSuggestedPrice(null); 
    setIsModalSuggestionLoading(false);

    if (editingListingId && isEditModalOpen) {
      const fetchModalData = async () => {
        setIsModalLoading(true);
        try {
          const detailsResponse = await getListingById(editingListingId);
          
          if (detailsResponse.data && detailsResponse.data.success) {
            const listingData = detailsResponse.data.data;
            setCurrentListingData(listingData); 
            
            if (listingData.creditId) {
              setIsModalSuggestionLoading(true);
              try {
                const suggestionResponse = await getSuggestedPrice(listingData.creditId);
                if (suggestionResponse.data && suggestionResponse.data.success) {
                  setModalSuggestedPrice(suggestionResponse.data.data);
                }
              } catch (suggestionErr) {
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

  useEffect(() => {
    if (activeTab === 'sell' || activeTab === 'auction') {
      setIsCreditsLoading(true);
      setCreditsError(null);
      try {
        const MOCK_DATA = [
          {
            creditId: "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
            ownerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            issuedByCVA: "cva-guid-123",
            requestId: "request-guid-456",
            amount: 150.75,
            status: "Verified",
            creditType: "Reforestation",
            vintage: 2024,
            creditSerialNumber: "VCS-2024-12345-XYZ",
            expiryDate: "2034-10-27T00:00:00Z",
            issuedAt: "2024-10-27T00:00:00Z",
            createdAt: "2024-10-20T03:52:43Z"
          },
          {
            creditId: "c7d8e9f0-a1b2-c3d4-e5f6-a7b8c9d0e1f2",
            ownerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            issuedByCVA: "cva-guid-123",
            requestId: "request-guid-789",
            amount: 500,
            status: "Verified",
            creditType: "Solar Energy", 
            vintage: 2023,
            creditSerialNumber: "VCS-2023-54321-ABC",
            expiryDate: "2033-05-10T00:00:00Z",
            issuedAt: "2023-05-10T00:00:00Z",
            createdAt: "2023-05-01T10:00:00Z"
          }
        ];
        setAvailableCredits(MOCK_DATA);
      } catch (err) {
        setCreditsError(`Không thể tải danh sách tín chỉ. ${err.message || "Lỗi không xác định."}`);
      } finally {
        setIsCreditsLoading(false);
      }
    }
  }, [activeTab]);

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
    if (bannerSuggestedPrice) {
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
      auctionEndTime: item.auctionEndTime,
      rawData: item
    };
  };

  const getAiSuggestionContent = () => {
    if (isBannerSuggestionLoading) return "Đang tải gợi ý từ AI...";
    if (bannerSuggestedPrice) {
      const formattedPrice = Math.round(bannerSuggestedPrice).toLocaleString();
      return `Dựa trên dữ liệu thị trường hiện tại, chúng tôi đề xuất bạn niêm yết tín chỉ của mình với giá <strong>${formattedPrice} VNĐ/tín chỉ</strong> để tối đa hóa lợi nhuận.`;
    }
    return "Không có gợi ý nào từ AI.";
  };

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
                listings.map((item) => {
                  const cardProps = mapApiDataToCardProps(item);
                  return (
                    <MarketplaceCard 
                      key={item.id} 
                      {...cardProps}
                      onBuyClick={() => handleBuyClick(cardProps.rawData)}
                      onBidClick={() => handleBidClick(cardProps.rawData)}
                    />
                  );
                })
              )}
            </div>
          </div>
        )}
        {activeTab === 'sell' && (
          <div className={styles.tabContent}>
            <CreditSelector 
              credits={availableCredits}
              selectedCreditId={selectedCreditId}
              onSelectCredit={setSelectedCreditId} 
              isLoading={isCreditsLoading}
              error={creditsError}
            />

            {selectedCreditId && (
              <SellForm 
                onSubmit={handleSellSubmit}
                // Props cho giá gợi ý
                suggestedPrice={formSuggestedPrice}
                isSuggestionLoading={isFormSuggestionLoading}
                suggestionType={formSuggestionType}
                // Props cho tồn kho
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
            <CreditSelector 
              credits={availableCredits}
              selectedCreditId={selectedCreditId}
              onSelectCredit={setSelectedCreditId}
              isLoading={isCreditsLoading}
              error={creditsError}
            />

            {selectedCreditId && (
              <AuctionForm 
                onSubmit={handleAuctionSubmit}
                // Props cho giá gợi ý (sẽ dùng cho giá khởi điểm)
                suggestedPrice={formSuggestedPrice}
                isSuggestionLoading={isFormSuggestionLoading}
                suggestionType={formSuggestionType}
                // Props cho tồn kho
                inventory={currentInventory}
                isLoadingInventory={isInventoryLoading}
                inventoryError={inventoryError}
              />
            )}
          </div>
        )}

        <BuyNowModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          onSubmit={handleBuySubmit}
          listingData={selectedListing}
        />

        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          onSubmit={handleBidSubmit}
          listingData={selectedListing}
        />


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