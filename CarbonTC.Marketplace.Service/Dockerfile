FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY CarbonTC.SharedLibrary/SharedLibrary/SharedLibrary.csproj CarbonTC.SharedLibrary/
COPY CarbonTC.Marketplace.Service/CarbonTC.API/CarbonTC.API.csproj CarbonTC.Marketplace.Service/CarbonTC.API/ 
COPY CarbonTC.Marketplace.Service/Application/Application.csproj CarbonTC.Marketplace.Service/Application/ 
COPY CarbonTC.Marketplace.Service/Domain/Domain.csproj CarbonTC.Marketplace.Service/Domain/
COPY CarbonTC.Marketplace.Service/Infrastructure/Infrastructure.csproj CarbonTC.Marketplace.Service/Infrastructure/

RUN dotnet restore CarbonTC.Marketplace.Service/CarbonTC.API/CarbonTC.API.csproj

COPY . .

WORKDIR /src/CarbonTC.Marketplace.Service/CarbonTC.API
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 5003
ENV ASPNETCORE_URLS=http://+:5003
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CarbonTC.API.dll"]