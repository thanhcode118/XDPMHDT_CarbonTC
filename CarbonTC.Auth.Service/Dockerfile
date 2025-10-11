# ============ BUILD STAGE ===============
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY . .
RUN dotnet restore CarbonTC.Auth.Service.sln
RUN dotnet publish src/CarbonTC.Auth.Api/CarbonTC.Auth.Api.csproj -c Release -o /out

# ============ RUNTIME STAGE ===============
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "CarbonTC.Auth.Api.dll"]
