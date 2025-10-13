# 🪙 CarbonTC Wallet Service

## 🔍 Giới thiệu
**CarbonTC Wallet Service** là một microservice trong hệ thống **Carbon Trading & Credit Management Platform (CarbonTC)**.  
Service này chịu trách nhiệm **quản lý ví tín chỉ carbon (Carbon Wallet)** và **ví tiền điện tử (E-Wallet)** của người dùng,  
đồng thời xử lý các giao dịch thanh toán, chuyển tín chỉ, rút tiền và phát hành chứng nhận.
---
## ⚙️ Chức năng chính
- 🏦 **Quản lý ví tiền (E-Wallet)**
    - Tạo ví người dùng
    - Nạp tiền, rút tiền, xem số dư
- 🌱 **Quản lý ví carbon (Carbon Wallet)**
    - Theo dõi lượng tín chỉ carbon
    - Chuyển tín chỉ giữa các ví
- 💸 **Xử lý thanh toán**
    - Tích hợp **VNPay Sandbox**
    - Thanh toán tự động cho các giao dịch mua/bán tín chỉ
- 📜 **Chứng nhận giao dịch (Certificates)**
    - Tạo chứng nhận cho giao dịch carbon thành công
- 🔔 **Tích hợp Message Broker (RabbitMQ)**
    - Lắng nghe sự kiện từ Marketplace Service
    - Phát hành sự kiện thanh toán & chuyển tín chỉ thành công

---
## 🧩 Công nghệ sử dụng

| Thành phần | Công nghệ |
|-------------|--------|
| **Ngôn ngữ** | Java 21 |
| **Framework** | Spring Boot 3.x |
| **ORM** | Hibernate / JPA |
| **CSDL** | MySQL |
| **API Docs** | Springdoc OpenAPI (Swagger UI) |
| **Message Queue** | RabbitMQ |
| **Build Tool** | Maven |
| **Version Control** | Git / GitHub |
| **Containerization** | Docker |
| **Cache / Messaging Support** | Redis (planned) |

---
## 🏗️ Kiến trúc hệ thống

**CarbonTC Wallet Service** là một phần trong kiến trúc **microservices** gồm các thành phần:
- 🧍 **Identity Service** – Quản lý người dùng và xác thực
- ♻️ **Carbon Lifecycle Service** – Quản lý phát hành tín chỉ carbon
- 💹 **Marketplace Service** – Sàn giao dịch tín chỉ carbon
- 🪙 **Wallet Service** – Quản lý ví, thanh toán, rút tiền, chứng nhận
- 🛡️ **Admin Service** – Quản trị và giám sát toàn hệ thống
---
## 👨‍💻 Tác giả
**Nguyễn Thanh Khang**
> Backend Developer – CarbonTC Platform  
> Wallet Service
---

