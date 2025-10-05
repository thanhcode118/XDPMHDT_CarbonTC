# Giai đoạn 1: Build
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy và restore file dự án chính
COPY ["OrderService/OrderService.csproj", "OrderService/"]
RUN dotnet restore "OrderService/OrderService.csproj"

# Copy toàn bộ source code và build
COPY . .
WORKDIR "/src/OrderService"
RUN dotnet build "OrderService.csproj" -c Release -o /app/build

# Giai đoạn 2: Publish
FROM build AS publish
RUN dotnet publish "OrderService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Giai đoạn 3: Final
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
# Đặt cổng mà service sẽ lắng nghe (phải khớp với cấu hình trong Docker Compose/API Gateway)
ENV ASPNETCORE_URLS=http://+:8080 
COPY --from=publish /app/publish .

# Khởi chạy ứng dụng
ENTRYPOINT ["dotnet", "OrderService.dll"]