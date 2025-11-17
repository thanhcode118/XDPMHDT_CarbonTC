# CarbonTC: Nền tảng Giao dịch Tín chỉ Carbon từ Xe điện

**CarbonTC** là một dự án nền tảng giao dịch tín chỉ carbon được xây dựng trên kiến trúc Microservices. Mục tiêu của dự án là số hóa (tokenize) lượng khí CO₂ giảm phát thải từ xe điện (EV), quy đổi thành tín chỉ carbon và tạo ra một thị trường (Marketplace) minh bạch cho phép các chủ xe (EV Owners) bán và các doanh nghiệp (Buyers) mua các tín chỉ này.

Dự án này là một hệ thống monorepo, bao gồm nhiều dịch vụ (services) độc lập được viết bằng các ngôn ngữ khác nhau (Java/Spring Boot, Node.js và .NET C#).

---

## 🚀 Tính năng nổi bật

Hệ thống được chia thành 4 nhóm chức năng chính:

### 1. Dành cho Chủ xe điện (EV Owner) 🚗
* Kết nối và đồng bộ dữ liệu hành trình từ xe điện (giả lập bằng cách đọc file).
* Tính toán lượng CO₂ giảm phát thải và quy đổi sang tín chỉ carbon.
* Quản lý **Ví Carbon** (theo dõi số dư tín chỉ).
* Niêm yết tín chỉ carbon để bán (Giá cố định / Đấu giá).
* Quản lý giao dịch: theo dõi, hủy, hoặc hoàn tất.
* Quản lý **Ví tiền (E-Wallet)**, nạp tiền (VNPAY) và rút tiền sau khi bán tín chỉ.
* Xem báo cáo cá nhân: lượng CO₂ giảm, doanh thu từ tín chỉ.
* AI gợi ý giá bán tín chỉ dựa trên dữ liệu thị trường.

### 2. Dành cho Người mua Tín chỉ (Carbon Credit Buyer) 🏢
* Tìm kiếm & lọc tín chỉ theo số lượng, giá, khu vực.
* Mua tín chỉ trực tiếp (Buy Now) hoặc tham gia đấu giá (Auction).
* Thanh toán online (tích hợp ví điện tử, VNPAY).
* Nhận chứng nhận tín chỉ (Certificate) để báo cáo giảm phát thải.
* Quản lý lịch sử mua tín chỉ.

### 3. Dành cho Tổ chức Xác minh (Carbon Verification & Audit) 🛡️
* Kiểm tra dữ liệu phát thải & hồ sơ tín chỉ.
* Duyệt hoặc từ chối yêu cầu phát hành tín chỉ carbon.
* Cấp tín chỉ và ghi vào ví carbon của chủ xe (thông qua sự kiện RabbitMQ).
* Xuất báo cáo phát hành tín chỉ carbon.

### 4. Dành cho Quản trị viên (Admin) ⚙️
* Quản lý người dùng (EV owners, buyers, verifiers).
* Quản lý giao dịch: theo dõi, xác nhận, xử lý tranh chấp (disputes).
* Quản lý ví điện tử và dòng tiền (duyệt yêu cầu rút tiền của user).
* Tạo báo cáo tổng hợp (doanh thu phí nền tảng, tổng giao dịch).

---
## 🛠️ Công nghệ sử dụng

Dự án sử dụng kiến trúc polyglot (đa ngôn ngữ) microservices:

* **Backend:**
    * **Java 17 & Spring Boot 3:** `CarbonTC.WalletService`
    * **.NET 8 (C#):** `Auth.Service`, `Marketplace.Service`, `CarbonLifecycle.Service`
    * **Node.js (TypeScript):** `CarbonTC.Admin.Service`
* **Frontend:**
    * **React.js (Vite):** `CarbonTC_Frontend` (cho User)
    * **React.js (TypeScript):** `CarbonTC.Admin.Service` (cho Admin)
* **API Gateway:** Ocelot
* **Cơ sở dữ liệu:** MySQL 8.0, MongoDB, Redis
* **Message Broker:** RabbitMQ
* **Containerization:** Docker & Docker Compose

---

## 🏛️ Kiến trúc Hệ thống

Hệ thống được thiết kế theo mô hình Monorepo, chứa nhiều Microservices độc lập. Các service giao tiếp với nhau bất đồng bộ qua **RabbitMQ** (Kiến trúc Hướng sự kiện) và giao tiếp đồng bộ (request/response) qua **API Gateway (Ocelot)**.

* **`CarbonTC.Auth.Service` (.NET):** Quản lý định danh, đăng ký, đăng nhập, phân quyền (JWT).
* **`CarbonTC.WalletService` (Java):** Quản lý ví tiền (VNĐ), nạp tiền (VNPAY), tạo yêu cầu rút tiền, và quản lý Ví Carbon.
* **`CarbonTC.CarbonLifecycle.Service` (.NET):** Quản lý vòng đời tín chỉ: từ dữ liệu hành trình xe (EV journey), xác minh (Verification) đến phát hành tín chỉ (Issuance).
* **`CarbonTC.Marketplace.Service` (.NET):** Quản lý thị trường: niêm yết (listing), đấu giá (auction), mua/bán (trading).
* **`CarbonTC.Admin.Service` (NodeJS):** Cung cấp giao diện và API cho trang quản trị (theo dõi, báo cáo).
* **`CarbonTC.Gateway` (Ocelot):** Cổng API chung cho Frontend, điều hướng request đến các service tương ứng.
* **`CarbonTC.Frontend` (React):** Giao diện người dùng (User).

---

## 🏁 Khởi chạy Dự án

Dự án được thiết kế để chạy hoàn toàn trên Docker. Đảm bảo bạn đã cài đặt Docker và Docker Compose.

1.  Clone repository này về máy.
2.  Mở terminal tại thư mục gốc của dự án (thư mục `XDPMOOP` chứa file `docker-compose.yml`).
3.  Chạy lệnh sau để build và khởi chạy toàn bộ service (quá trình build lần đầu có thể mất vài phút):
    ```bash
    docker compose up -d --build
    ```
4.  Sau khi các container đã khởi động, bạn có thể truy cập:
    * **Frontend (User):** `http://localhost:5173`
    * **Frontend (Admin):** `http://localhost:5174`
    * **API Gateway:** `http://localhost:5000`
    * **RabbitMQ Dashboard:** `http://localhost:15672` (Login: `guest` / `guest`)
Để tắt toàn bộ hệ thống:
```bash
docker compose down
```

## 👥 Đội ngũ Phát triển
Dự án được phát triển và quản lý bởi các thành viên sau, mỗi người phụ trách một service (mô-đun) chính:

| Service                               | Owner | GitHub Cá nhân |
|:--------------------------------------| :--- | :--- |
| **Identity**                          | Nguyen Ha Thanh | `[Nguyen Ha Thanh](https://github.com/thanhcode118)` |
| **Carbon Calculation & Verification** | Ho Nguyen Thien Hao | `[Ho Nguyen Thien Hao](https://github.com/hongthienhao)` |
| **Marketplace & Trading**             | Nguyen Phuc Dai | `[Nguyen Phuc Dai](https://github.com/PhucDaizz)` |
| **Wallet**                            | Nguyen Thanh Khang | `[Nguyen Thanh Khang](https://github.com/tkhan2004)` |
| **Admin**                             | Nguyen Cao Thanh Dat | `[Nguyen Cao Thanh Dat](https://github.com/ThanhDatis)` |

---
