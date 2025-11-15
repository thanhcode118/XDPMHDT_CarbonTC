import { useState, useEffect, useCallback } from 'react';
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
import PlaceBidModal from '../../components/PlaceBidModal/PlaceBidModal'; 
import BuyNowModal from '../../components/BuyNowModal/BuyNowModal'; 
import PurchaseSuccessModal from '../../components/PurchaseSuccessModal/PurchaseSuccessModal'; 
import Pagination from '../../components/Pagination/Pagination';
import styles from './Marketplace.module.css';

import { 
  getUserIdFromToken,
  getListings, 
  getSuggestedPrice, 
  getMyListings, 
  getListingById, 
  updateListing,
  deleteListing,
  getCreditInventory, 
  createListing,
  buyListing,
  placeBid,
  getUserCredits
} from '../../services/listingService';

import { 
    startConnection, 
    stopConnection, 
    joinAuctionGroup, 
    leaveAuctionGroup, 
    registerAuctionEvents 
} from '../../services/signalrService';
import UserSelector from '../../components/UserSelector/UserSelector';
import { toast, ToastContainer } from 'react-toastify';
import { convertVnTimeToUTC } from '../../utils/formatters';

const mapStatusToString = (status) => {
  switch (status) {
    case 1: return 'active'; 
    case 2: return 'closed';     
    case 3: return 'cancelled';  
    case 4: return 'sold';       
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

  const [isActionModalLoading, setIsActionModalLoading] = useState(false);
  const [actionModalError, setActionModalError] = useState(null);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({});

  const [auctionUpdates, setAuctionUpdates] = useState({});  

  const [filterInputs, setFilterInputs] = useState({
    type: '',    
    status: '1',  
    minPrice: '',
    maxPrice: '',
    ownerId: ''
  });
  
  const [totalPages, setTotalPages] = useState(1);

  const [queryParams, setQueryParams] = useState({
    pageNumber: 1,
    pageSize: 20,
    type: null,   
    status: 1,    
    minPrice: null,
    maxPrice: null,
    ownerId: null
  });

  const handlePageChange = (newPage) => {
    setQueryParams(prev => ({
      ...prev,
      pageNumber: newPage
    }));
    // useEffect [queryParams] sẽ tự động gọi lại API
  };


  const handleBuyClick = async (listingFromList) => {
    setActionModalError(null);       
    setIsActionModalLoading(true); 
    setShowBuyModal(true);         
    setSelectedListing(null); 
    try {
      const response = await getListingById(listingFromList.id);
      if (response.data && response.data.success) {
        setSelectedListing(response.data.data); 
      } else {
        setActionModalError(response.data.message || "Không thể tải chi tiết niêm yết.");
      }
    } catch (err) {
      setActionModalError(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setIsActionModalLoading(false); 
    }       
  };

  const handleCloseBuyModal = () => {
    setShowBuyModal(false);
    setSelectedListing(null);
    setActionModalError(null); 
  };

  const handleCloseBidModal = () => {
        if (selectedListing) {
            // *** RỜI ROOM SIGNALR ***
            leaveAuctionGroup(selectedListing.id);
        }
        setShowBidModal(false);
        setSelectedListing(null);
        setActionModalError(null);
    };

  
  const handleBidClick = async (listingFromList) => {
    const currentUserId = getUserIdFromToken();
    if (listingFromList.ownerId === currentUserId) {
        // setActionModalError("Bạn là chủ sở hữu - có thể xem nhưng không thể đặt giá");
        setShowBidModal(true);
        setSelectedListing(null); 
        setIsActionModalLoading(true); 

        try {
            const response = await getListingById(listingFromList.id);
            if (response.data && response.data.success) {
                const listingDetails = response.data.data;
                setSelectedListing(listingDetails);
                joinAuctionGroup(listingDetails.id); 
            } else {
                setActionModalError(response.data.message || "Không thể tải chi tiết auction.");
            }
        } catch (err) {
            setActionModalError(err.message || "Lỗi kết nối máy chủ.");
            console.error("❌ Lỗi khi chủ sở hữu xem auction:", err);
        } finally {
            setIsActionModalLoading(false);
        }
        return;
    }

    setActionModalError(null);
    setIsActionModalLoading(true);
    setShowBidModal(true);
    setSelectedListing(null);

    try {
        const response = await getListingById(listingFromList.id);
        if (response.data && response.data.success) {
            const listingDetails = response.data.data;
            setSelectedListing(listingDetails);
            // *** THAM GIA ROOM SIGNALR ***
            joinAuctionGroup(listingDetails.id); 
        } else {
            setActionModalError(response.data.message || "Không thể tải chi tiết.");
        }
    } catch (err) {
        setActionModalError(err.message || "Lỗi kết nối máy chủ.");
    } finally {
        setIsActionModalLoading(false);
    }
};

const handleBuySubmit = async (buyData) => {
  if (!selectedListing || !selectedListing.id) {
    alert("Lỗi: Không tìm thấy thông tin listing.");
    return;
  }

  const listingIdToUpdate = selectedListing.id; 
  const boughtQuantity = buyData.quantity;

  setIsSubmittingAction(true); 
  setActionModalError(null);   

  try {
    const response = await buyListing(selectedListing.id, buyData.quantity);

    if (response.data && response.data.success) {

      setSuccessData({
        type: 'buy',
        quantity: buyData.quantity,
        pricePerUnit: buyData.totalAmount / buyData.quantity,
        totalAmount: buyData.totalAmount,
        sellerName: 'Công ty ABC',
        creditType: 'Carbon Credit từ xe điện',
        transactionId: '',
        estimatedDelivery: '2-3 ngày làm việc'
      });
      setShowSuccessModal(true);

      handleCloseBuyModal();
      
      setListings(prevListings => {
        const newListings = prevListings.map(listing => {
            if (listing.id === listingIdToUpdate) {
                const remainingQuantity = Math.max(0, listing.quantity - boughtQuantity);
                
                // Trả về object mới với quantity đã cập nhật
                return {
                    ...listing,
                    quantity: remainingQuantity,
                    // (Tùy chọn) Cập nhật status nếu quantity = 0?
                    // status: remainingQuantity <= 0 ? 2 : listing.status // Giả định 2 = Closed/Sold
                };
            }
            return listing;
        });
        return newListings.filter(listing => listing.quantity > 0);
      });
    } else {
        const specificError = response.data?.errors?.[0]; 
        const generalMessage = response.data?.message;
        const errorMsg = specificError || generalMessage || "Giao dịch không thành công.";
      setActionModalError(errorMsg);
    }
  } catch (err) {
    setActionModalError(err.message || "Lỗi kết nối máy chủ.");
  } finally {
    setIsSubmittingAction(false); 
  }
};

const handleBidSubmit = async (bidData) => {
      if (!selectedListing || !selectedListing.id) {
          alert("Lỗi: Không tìm thấy thông tin listing.");
          return;
      }
      
      setActionModalError(null);

      // Lấy thông tin auction hiện tại từ state `auctionUpdates`
      const currentAuctionState = auctionUpdates[selectedListing.id] || {};
      const currentPrice = currentAuctionState.latestBid?.bidAmount || selectedListing.minimumBid || 0;

      // Validation cơ bản phía client
      if (bidData.bidAmount <= currentPrice) {
            setActionModalError(`Giá đặt phải cao hơn giá hiện tại (${currentPrice.toLocaleString()} VNĐ).`);
            return;
      }

      setIsSubmittingAction(true);
      setActionModalError(null);

      try {
          // Gọi API đặt giá mới
          const response = await placeBid(selectedListing.id, bidData.bidAmount);

          if (response.data && response.data.success) {
              console.log("Đặt giá thành công! Chờ cập nhật từ SignalR...");
              setSuccessData({
                type: 'bid',
                quantity: selectedListing?.quantity || 0,
                pricePerUnit: bidData.bidAmount,
                totalAmount: response.data.bidAmount * (selectedListing?.quantity || 0),
                bidTime: response.data.bidTime,
                listingId: selectedListing.id,
              });
              setShowSuccessModal(true);
              setActionModalError(null);
          } else {
              const specificError = response.data?.errors?.[0];
              const generalMessage = response.data?.message;
              let errorMsg = specificError || generalMessage || "Đặt giá không thành công.";

              if (errorMsg.includes('own listing')) {
                  errorMsg = "Bạn không thể đặt giá trên sản phẩm của chính mình";
              }
              setActionModalError(errorMsg);
          }
      } catch (err) {
          let errorMsg = err.message || "Lỗi kết nối máy chủ.";
      
          // Xử lý lỗi từ response 
          if (err.response?.data?.errors?.[0]) {
              errorMsg = err.response.data.errors[0];
          } else if (err.response?.data?.message) {
              errorMsg = err.response.data.message;
          }
          
          // Lỗi cho trường hợp chủ sở hữu
          if (errorMsg.includes('own listing')) {
              errorMsg = "Bạn không thể đặt giá trên sản phẩm của chính mình";
          }
          
          setActionModalError(errorMsg);
      } finally {
          setIsSubmittingAction(false);
      }
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

  const handleRealtimeBid = useCallback((bidDto) => {
    // bidDto = { listingId, bidderId, bidAmount, bidTime }
    console.log("Received BidPlaced:", bidDto);
    setAuctionUpdates(prev => ({
        ...prev,
        [bidDto.listingId]: {
            ...(prev[bidDto.listingId] || {}),
            latestBid: bidDto, 
            currentPrice: bidDto.bidAmount 
        }
    }));
  }, []);

    const handleRealtimeEndAuction = useCallback((endData) => {
        // endData = { listingId, winningBidderId, winningBidAmount }
        console.log("Received EndAuction:", endData);

        const currentUserId = getUserIdFromToken();
        const isWinner = currentUserId === endData.winningBidderId;

        const endedListing = listings.find(listing => listing.id === endData.listingId);
        const isOwner = endedListing && endedListing.ownerId === currentUserId;

        if (isWinner) {
        toast.success(
            `🎉 Chúc mừng! Bạn đã thắng phiên đấu giá với giá ${endData.winningBidAmount?.toLocaleString()} VNĐ!`, 
            {
                position: "top-right",
                autoClose: 10000, // 10 giây
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            }
        );
        setSuccessData({
          type: 'bid',
          quantity: 50,
          pricePerUnit: 14500,
          totalAmount: 725000,
          sellerName: 'Công ty ABC',
          creditType: 'Carbon Credit từ xe điện',
          transactionId: 'TX-2024-001234',
          estimatedDelivery: '2-3 ngày làm việc'
        });
        setShowSuccessModal(true);


        } else if (isOwner) {
            toast.info(
                `🏁 Phiên đấu giá của bạn đã kết thúc. Người thắng: ...${endData.winningBidderId?.slice(-6)}`, 
                {
                    position: "top-right",
                    autoClose: 8000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                }
            );
        } else {
            // Thông báo cho những người tham gia khác
            toast.warn(
                `ℹ️ Phiên đấu giá bạn tham gia đã kết thúc. Người thắng: ...${endData.winningBidderId?.slice(-6)}`, 
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                }
            );
        }

        setAuctionUpdates(prev => ({
            ...prev,
            [endData.listingId]: {
                ...(prev[endData.listingId] || {}), 
                isEnded: true,
                winnerInfo: endData
            }
        }));
    }, []);

    const handleRealtimeOutbid = useCallback((listingId) => {
        console.log(`You were outbid on listing: ${listingId}`);
        toast.warn(
          `Bạn vừa bị trả giá cao hơn tại một phiên đấu giá!`, 
          {
            position: "top-right",
            autoClose: 5000,  
            theme: "light",
            onClick: () => {
              const outbidListing = listings.find(l => l.id === listingId);
              if (outbidListing) {
                handleBidClick(outbidListing); 
              }
            }
          }
        );
    }, [listings]);


  useEffect(() => {
    const setupSignalR = async () => {
      try {
        // Chờ cho đến khi startConnection() THỰC SỰ hoàn thành
        const conn = await startConnection(); 

        if (conn) {
          registerAuctionEvents({
            onBidPlaced: handleRealtimeBid,
            onEndAuction: handleRealtimeEndAuction,
            onUserOutbid: handleRealtimeOutbid
          });
          } else {
            console.error("❌ Không thể đăng ký SignalR events: Kết nối thất bại.");
          }
      } catch (err) {
        console.error("Lỗi nghiêm trọng khi khởi tạo SignalR:", err);
      }
     };  
     setupSignalR(); 
     return () => {
      stopConnection();
     };
  }, [handleRealtimeBid, handleRealtimeEndAuction, handleRealtimeOutbid]);
  
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
            setTotalPages(response.data.data.totalPages || 1);
          } else {
            setError(response.data.message || 'Không thể tải dữ liệu.');
            setTotalPages(1);
          }
        } catch (err) {
          setError(err.message || 'Đã xảy ra lỗi khi kết nối server.');
          console.error(err);
          setTotalPages(1);
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
      setIsFormSuggestionLoading(true); 

      // Tạo 2 hàm promise để gọi song song
      const fetchInventory = getCreditInventory(selectedCreditId);
      const fetchPersonalizedPrice = getSuggestedPrice(selectedCreditId);

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
          setFormSuggestedPrice(priceResponse.data.data);
          setFormSuggestionType('personalized'); // Đánh dấu đây là giá cá nhân hóa
        } else {
          // Nếu lỗi, dùng lại giá chung
          setFormSuggestedPrice(bannerSuggestedPrice);
          setFormSuggestionType('generic');
        }

      } catch (err) {
        setInventoryError(err.message || "Lỗi server.");
        setFormSuggestedPrice(bannerSuggestedPrice); 
        setFormSuggestionType('generic');
      } finally {
        setIsInventoryLoading(false);
        setIsFormSuggestionLoading(false); 
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
        auctionEndTime: convertVnTimeToUTC(formData.endDate), 
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
    if (activeTab === 'sell' || activeTab === 'auction') {
      const fetchUserCredits = async () => {
        setIsCreditsLoading(true);
        setCreditsError(null);
        try {
          const userId = getUserIdFromToken(); 
          if (!userId) {
            throw new Error("Không tìm thấy User ID. Vui lòng đăng nhập lại.");
          }

          const response = await getUserCredits(userId); 

          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            const mappedData = response.data.data.map(apiCredit => {
              // Hàm nội tuyến để map status
              const getCreditStatus = (status) => {
                return status === 1 ? "Verified" : "Pending"; 
              };
              
              const getVintage = (dateString) => {
                try {
                  return new Date(dateString).getFullYear();
                } catch (e) {
                  return null; 
                }
              };

              return {
                creditId: apiCredit.id,
                ownerId: apiCredit.userId,
                issuedByCVA: null, // API response không có
                requestId: apiCredit.verificationRequestId || apiCredit.journeyBatchId, // Ưu tiên verificationRequestId
                amount: apiCredit.amountKgCO2e, // Map từ amountKgCO2e
                status: getCreditStatus(apiCredit.status), // Map từ status: 1
                creditType: "Carbon Credit", // API không có, dùng giá trị mặc định
                vintage: getVintage(apiCredit.issueDate), // Lấy năm từ issueDate
                creditSerialNumber: apiCredit.transactionHash, // Dùng transactionHash
                expiryDate: apiCredit.expiryDate,
                issuedAt: apiCredit.issueDate,
                createdAt: apiCredit.issueDate, // API không có createdAt, dùng tạm issueDate
              };
            });
            setAvailableCredits(mappedData);
            console.log(mappedData);
          } else {
            throw new Error(response.data.message || "Không thể tải danh sách tín chỉ.");
          }
        } catch (err) {
          console.error("Error fetching user credits:", err); // Thêm log
          setCreditsError(`Không thể tải danh sách tín chỉ. ${err.message || "Lỗi không xác định."}`);
        } finally {
          setIsCreditsLoading(false);
        }
      };

      fetchUserCredits(); // Gọi hàm async
    }
  }, [activeTab]);

  // useEffect(() => {
  //   setCurrentInventory(null);
  //   setInventoryError(null);
  //   if (selectedCreditId) {
  //     const fetchInventory = async () => {
  //       setIsInventoryLoading(true);
  //       try {
  //         const response = await getCreditInventory(selectedCreditId);
  //         if (response.data && response.data.success) {
  //           setCurrentInventory(response.data.data);
  //         } else {
  //           setInventoryError(response.data.message || "Không thể lấy tồn kho.");
  //         }
  //       } catch (err) {
  //         setInventoryError(err.message || "Lỗi server.");
  //       } finally {
  //         setIsInventoryLoading(false);
  //       }
  //     };
  //     fetchInventory();
  //   }
  // }, [selectedCreditId]);

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
      price = item.minimumBid || 0;
      total = item.minimumBid * item.quantity; 
      totalLabel = "Tổng giá khởi điểm";
      priceLabel = "Giá/TC (khởi điểm)";
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
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999999999 }}
      />
      
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
                      rawData={item}
                      onBuyClick={() => handleBuyClick(cardProps.rawData)}
                      onBidClick={() => handleBidClick(cardProps.rawData)}
                    />
                  );
                })
              )}
            </div>
            {!isLoading && totalPages > 1 && (
              <Pagination
                currentPage={queryParams.pageNumber}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
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
          onClose={handleCloseBuyModal} 
          onSubmit={handleBuySubmit}
          listingData={selectedListing}
          isLoading={isActionModalLoading} 
          isSubmitting={isSubmittingAction}
          error={actionModalError}       
        />

        <PlaceBidModal
          isOpen={showBidModal}
          onClose={handleCloseBidModal} 
          onSubmit={handleBidSubmit}
          listingData={selectedListing}
          isLoading={isActionModalLoading} 
          isSubmitting={isSubmittingAction}
          error={actionModalError}
          auctionRealtimeData={selectedListing ? auctionUpdates[selectedListing.id] : null}
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

        <PurchaseSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          transactionData={successData}
        />

        <UserSelector/>
      </div>
    </div>
  );
};

export default Marketplace;