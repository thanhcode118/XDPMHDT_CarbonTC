import * as signalR from "@microsoft/signalr";

let connection = null;
let connectionCount = 0;
let connectionPromise = null;

const envApiUrl = import.meta.env.VITE_APIGATEWAY_BASE_URL; 
const defaultApiUrl = 'http://localhost:7000/api';
const apiBaseUrl = envApiUrl || defaultApiUrl;
const serverBaseUrl = apiBaseUrl.replace(/\/api$/, '');

const createConnection = () => {
    // Ưu tiên accessToken, fallback về userToken để tương thích ngược
    const token = localStorage.getItem('accessToken') || localStorage.getItem('userToken');
    
    if (!token) {
        console.error('No token found in localStorage for SignalR connection');
        return null;
    }


    const connectionUrl = `${serverBaseUrl}/hubs/auction?access_token=${token}`;

    const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(connectionUrl, {
            skipNegotiation: true, // Thử bật nếu có lỗi negotiation
            transport: signalR.HttpTransportType.WebSockets // Thử chỉ định transport
        })
        .withAutomaticReconnect() 
        .configureLogging(signalR.LogLevel.Information)
        .build();

    newConnection.onreconnecting((error) => {
        console.warn(`SignalR Connection lost due to error "${error}". Reconnecting.`);
    });
    newConnection.onreconnected((connectionId) => {
        console.log(`SignalR Connection reestablished. Connected with connectionId "${connectionId}".`);
    });
    newConnection.onclose((error) => {
        console.error(`SignalR Connection closed due to error "${error}". Try refreshing the page.`);
    });

    return newConnection;
};

export const startConnection = () => {
    // 1. Nếu đang có promise kết nối (đang connecting), trả về chính nó để không gọi start lần 2
    if (connectionPromise) {
        return connectionPromise;
    }

    // 2. Nếu connection đã tồn tại và ĐÃ KẾT NỐI, không cần làm gì cả
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        console.log("⚠️ SignalR already connected.");
        return Promise.resolve(connection);
    }

    connectionPromise = new Promise((resolve, reject) => {
        const run = async () => {
            // 3. Nếu connection chưa có hoặc đã bị ngắt, tạo mới
            if (!connection || connection.state === signalR.HubConnectionState.Disconnected) {
                connection = createConnection();
            }
            
            if (!connection) {
                 connectionPromise = null;
                 return reject(new Error("Thiếu token"));
            }

            // Chỉ start nếu trạng thái là Disconnected
            if (connection.state === signalR.HubConnectionState.Disconnected) {
                try {
                    connectionCount++;
                    console.log(`🔄 Creating new SignalR connection #${connectionCount}`);
                    await connection.start();
                    console.log("✅ SignalR Connected successfully.");
                    resolve(connection);
                } catch (err) {
                    console.error("❌ SignalR Connection failed: ", err);
                    connectionPromise = null; // Reset promise nếu lỗi để lần sau thử lại
                    reject(err);
                }
            } else {
                 resolve(connection);
            }
        };

        run();
    });

    return connectionPromise;
};


export const getConnection = () => {
    return connection;
};

export const joinAuctionGroup = async (listingId) => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
        console.warn("Chờ kết nối (join)...");
        try {
            await connectionPromise; 
        } catch (err) {
            console.error("Không thể tham gia group, kết nối thất bại:", err);
            return;
        }
    }

    try {
        await connection.invoke("JoinAuction", listingId);
        console.log(`Joined auction group: ${listingId}`);
    } catch (err) {
        console.error(`Error joining auction group ${listingId}:`, err);
    }
};

export const leaveAuctionGroup = async (listingId) => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
        console.warn("Connection không sẵn sàng (leave), có thể đã ngắt kết nối.");
        return; 
    }
    
    try {
        await connection.invoke("LeaveAuction", listingId);
        console.log(`Left auction group: ${listingId}`);
    } catch (err) {
        console.error(`Error leaving auction group ${listingId}:`, err);
    }
};

export const registerAuctionEvents = (handlers) => {
    const conn = getConnection();
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            console.log("🔄 ĐANG ĐĂNG KÝ SIGNALR EVENTS (phiên bản đã sửa)");
            
            if (handlers.onBidPlaced) {
                conn.off("bidplaced"); 
                conn.on("bidplaced", (bidDto) => {
                    console.log("✅ NHẬN ĐƯỢC bidplaced EVENT:", bidDto);
                    handlers.onBidPlaced(bidDto);
                });
                console.log("✅ Đã đăng ký listener cho 'bidplaced'");
            }

            if (handlers.onEndAuction) {
                conn.off("auctionended"); 
                conn.on("auctionended", (endData) => { 
                    console.log("✅ NHẬN ĐƯỢC auctionended EVENT:", endData);
                    handlers.onEndAuction(endData);
                });
                console.log("✅ Đã đăng ký listener cho 'auctionended'");
            }

            if (handlers.onUserOutbid) {
                conn.off("useroutbid"); 
                conn.on("useroutbid", (listingId) => {
                    console.log("✅ NHẬN ĐƯỢC useroutbid EVENT:", listingId);
                    handlers.onUserOutbid(listingId);
                });
                console.log("✅ Đã đăng ký listener cho 'useroutbid'");
            }
    } else {
        console.error("❌ Không thể đăng ký events: SignalR connection không khả dụng");
    }
};

export const stopConnection = async () => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        try {
            await connection.stop();
            console.log("SignalR Connection stopped.");
        } catch (err) {
            console.error("Error stopping connection:", err);
        }
    }
    connectionPromise = null; 
};

export const removeAuctionListeners = () => {
    const conn = getConnection();
    if (conn) {
        console.log("🔕 Gỡ bỏ các sự kiện đấu giá (Cleanup)");
        // .off("tên_sự_kiện") không tham số sẽ gỡ bỏ TẤT CẢ handler của sự kiện đó
        conn.off("bidplaced");
        conn.off("auctionended");
        conn.off("useroutbid");
    }
};