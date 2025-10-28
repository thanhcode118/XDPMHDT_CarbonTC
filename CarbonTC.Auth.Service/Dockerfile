# ================================
# Stage 1: Build
# ================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution file
COPY ["CarbonTC.Auth.Service.sln", "./"]

# Copy project files
COPY ["src/CarbonTC.Auth.Api/CarbonTC.Auth.Api.csproj", "src/CarbonTC.Auth.Api/"]
COPY ["src/CarbonTC.Auth.Application/CarbonTC.Auth.Application.csproj", "src/CarbonTC.Auth.Application/"]
COPY ["src/CarbonTC.Auth.Domain/CarbonTC.Auth.Domain.csproj", "src/CarbonTC.Auth.Domain/"]
COPY ["src/CarbonTC.Auth.Infrastructure/CarbonTC.Auth.Infrastructure.csproj", "src/CarbonTC.Auth.Infrastructure/"]

# ✅ Restore dependencies using the main API project
RUN dotnet restore "src/CarbonTC.Auth.Api/CarbonTC.Auth.Api.csproj"

# Copy all source code (sau restore mới copy full source để cache hiệu quả)
COPY . .

# Build the API project
WORKDIR "/src/src/CarbonTC.Auth.Api"
RUN dotnet build "CarbonTC.Auth.Api.csproj" -c Release -o /app/build

# ================================
# Stage 2: Publish
# ================================
FROM build AS publish
WORKDIR "/src/src/CarbonTC.Auth.Api"
RUN dotnet publish "CarbonTC.Auth.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ================================
# Stage 3: Final Runtime Image
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Cài curl để phục vụ healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Tạo user không phải root để bảo mật
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy từ stage publish
COPY --from=publish /app/publish .

# Phân quyền cho user không root
RUN chown -R appuser:appuser /app

# Chạy dưới quyền user appuser
USER appuser

# Mở port ứng dụng
EXPOSE 8080

# Healthcheck để kiểm tra container hoạt động
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl --fail http://localhost:8080/health || exit 1

# Điểm khởi động
ENTRYPOINT ["dotnet", "CarbonTC.Auth.Api.dll"]
