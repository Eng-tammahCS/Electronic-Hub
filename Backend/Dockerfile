# Use the official .NET 9.0 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the official .NET 9.0 SDK as build image
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["ElectronicsStore.WebAPI/ElectronicsStore.WebAPI.csproj", "ElectronicsStore.WebAPI/"]
COPY ["ElectronicsStore.Application/ElectronicsStore.Application.csproj", "ElectronicsStore.Application/"]
COPY ["ElectronicsStore.Domain/ElectronicsStore.Domain.csproj", "ElectronicsStore.Domain/"]
COPY ["ElectronicsStore.Infrastructure/ElectronicsStore.Infrastructure.csproj", "ElectronicsStore.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "ElectronicsStore.WebAPI/ElectronicsStore.WebAPI.csproj"

# Copy source code
COPY . .

# Build the application
WORKDIR "/src/ElectronicsStore.WebAPI"
RUN dotnet build "ElectronicsStore.WebAPI.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "ElectronicsStore.WebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Create final runtime image
FROM base AS final
WORKDIR /app

# Copy published application
COPY --from=publish /app/publish .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start the application
ENTRYPOINT ["dotnet", "ElectronicsStore.WebAPI.dll"]


