@echo off
echo Running Electronics Store Integration Tests...
echo.

cd /d "c:\Users\HP\OneDrive\Desktop\github\9-13\Electronic-Hub\Backend"

dotnet test ElectronicsStore.IntegrationTests

echo.
echo Integration test execution completed.
pause