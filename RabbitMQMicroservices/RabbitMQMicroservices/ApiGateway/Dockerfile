# Giai đoạn 1: Build (Sử dụng SDK để restore và build code)
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy và restore file dự án chính
COPY ["ApiGateway/ApiGateway.csproj", "ApiGateway/"]
RUN dotnet restore "ApiGateway/ApiGateway.csproj"

# Copy toàn bộ source code và build
COPY . .
WORKDIR "/src/ApiGateway"
RUN dotnet build "ApiGateway.csproj" -c Release -o /app/build

# Giai đoạn 2: Publish (Tạo ra các file sẵn sàng triển khai)
FROM build AS publish
RUN dotnet publish "ApiGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Giai đoạn 3: Final (Sử dụng runtime image nhỏ gọn)
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
# Đặt cổng mặc định mà container sẽ lắng nghe
ENV ASPNETCORE_URLS=http://+:8080 
COPY --from=publish /app/publish .

# Khởi chạy ứng dụng
ENTRYPOINT ["dotnet", "ApiGateway.dll"]