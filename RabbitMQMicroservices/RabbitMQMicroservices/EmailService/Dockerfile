# Giai đoạn 1: Build
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy và restore file dự án chính
COPY ["EmailService/EmailService.csproj", "EmailService/"]
RUN dotnet restore "EmailService/EmailService.csproj"

# Copy toàn bộ source code và build
COPY . .
WORKDIR "/src/EmailService"
RUN dotnet build "EmailService.csproj" -c Release -o /app/build

# Giai đoạn 2: Publish
FROM build AS publish
RUN dotnet publish "EmailService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Giai đoạn 3: Final
FROM mcr.microsoft.com/dotnet/runtime:7.0 AS final 
WORKDIR /app
COPY --from=publish /app/publish .

# Khởi chạy ứng dụng
ENTRYPOINT ["dotnet", "EmailService.dll"]