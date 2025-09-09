@echo off
echo ========================================
echo    ElectroHub Pro - ASP.NET Backend
echo ========================================
echo.

echo Checking .NET installation...
dotnet --version
if %errorlevel% neq 0 (
    echo ERROR: .NET SDK not found!
    echo Please install .NET 8 SDK from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

echo.
echo Building and starting ASP.NET Core Web API...
echo Backend will be available at: https://localhost:7001
echo API Documentation: https://localhost:7001/swagger
echo Test Endpoint: https://localhost:7001/api/test
echo Login Endpoint: https://localhost:7001/api/auth/login
echo.

cd Backend\ElectronicsStore.WebAPI

echo Restoring packages...
dotnet restore

echo Building project...
dotnet build

echo.
echo ========================================
echo Starting server...
echo Press Ctrl+C to stop the server
echo ========================================
echo.

dotnet run

pause
