import * as signalR from "@microsoft/signalr";

let connection = null;
let connectionCount = 0;
let connectionPromise = null;

const createConnection = () => {

    const token = localStorage.getItem('userToken');
    
    if (!token) {
        console.error('No token found in localStorage for SignalR connection');
        return null;
    }


    const connectionUrl = `https://localhost:5003/hubs/auction?access_token=${token}`;

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
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = new Promise((resolve, reject) => {
        const run = async () => {
            connection = createConnection();
            if (!connection) {
                console.error("Không thể tạo connection (thiếu token?)");
                connectionPromise = null;
                return reject(new Error("Thiếu token"));
            }

            connectionCount++;
            console.log(`🔄 Creating new SignalR connection #${connectionCount}`);

            try {
                await connection.start();
                console.log("✅ SignalR Connected successfully.");
                resolve(connection);
            } catch (err) {
                console.error("❌ SignalR Connection failed: ", err);
                connectionPromise = null;
                reject(err);
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
    if (connection) {
        await connection.stop();
        connection = null;
        connectionPromise = null; 
        console.log("SignalR Connection stopped.");
    }
};