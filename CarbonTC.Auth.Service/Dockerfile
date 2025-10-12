# CarbonTC.Auth.Service/Dockerfile

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files
COPY ["src/CarbonTC.Auth.Api/CarbonTC.Auth.Api.csproj", "src/CarbonTC.Auth.Api/"]
COPY ["src/CarbonTC.Auth.Application/CarbonTC.Auth.Application.csproj", "src/CarbonTC.Auth.Application/"]
COPY ["src/CarbonTC.Auth.Domain/CarbonTC.Auth.Domain.csproj", "src/CarbonTC.Auth.Domain/"]
COPY ["src/CarbonTC.Auth.Infrastructure/CarbonTC.Auth.Infrastructure.csproj", "src/CarbonTC.Auth.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/CarbonTC.Auth.Api/CarbonTC.Auth.Api.csproj"

# Copy everything else
COPY . .
WORKDIR "/src/src/CarbonTC.Auth.Api"
RUN dotnet build "CarbonTC.Auth.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CarbonTC.Auth.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CarbonTC.Auth.Api.dll"]