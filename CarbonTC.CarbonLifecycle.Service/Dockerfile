# Stage 1: Build application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file to the root of the WORKDIR
# This enables 'dotnet restore' for the entire solution
COPY CarbonTC.CarbonLifecycle.Service.sln .

# Copy all .csproj files for all projects
# This allows dotnet restore to happen before copying all source code,
# leveraging Docker's layer caching for faster rebuilds if only code changes
COPY CarbonTC.CarbonLifecycle.Api/*.csproj CarbonTC.CarbonLifecycle.Api/
COPY CarbonTC.CarbonLifecycle.Application/*.csproj CarbonTC.CarbonLifecycle.Application/
COPY CarbonTC.CarbonLifecycle.Domain/*.csproj CarbonTC.CarbonLifecycle.Domain/
COPY CarbonTC.CarbonLifecycle.Infrastructure/*.csproj CarbonTC.CarbonLifecycle.Infrastructure/
COPY CarbonTC.CarbonLifecycle.Service/*.csproj CarbonTC.CarbonLifecycle.Service/

# Restore NuGet packages for the entire solution
RUN dotnet restore CarbonTC.CarbonLifecycle.Service.sln

# Copy the rest of the application's source code
# This should be done after restore to maximize cache hit for previous layers
COPY . .

# Set the working directory to the API project to build it
WORKDIR /src/CarbonTC.CarbonLifecycle.Api

# Build the API project in Release configuration
RUN dotnet build CarbonTC.CarbonLifecycle.Api.csproj -c Release -o /app/build

# Stage 2: Publish application
FROM build AS publish
WORKDIR /src/CarbonTC.CarbonLifecycle.Api
# Publish the API project. --no-build avoids re-building if it was already built in the previous step.
RUN dotnet publish CarbonTC.CarbonLifecycle.Api.csproj -c Release -o /app/publish
# Stage 3: Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Expose ports for HTTP and HTTPS
EXPOSE 8080
EXPOSE 8081

# Copy the published output from the 'publish' stage to the final runtime image
COPY --from=publish /app/publish .

# Define the entry point for the application when the container starts
ENTRYPOINT ["dotnet", "CarbonTC.CarbonLifecycle.Api.dll"]