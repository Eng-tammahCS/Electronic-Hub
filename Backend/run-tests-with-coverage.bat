@echo off
echo Running Electronics Store Tests with Code Coverage...
echo.

cd /d "c:\Users\HP\OneDrive\Desktop\github\9-13\Electronic-Hub\Backend"

dotnet test ElectronicsStore.Tests --collect:"XPlat Code Coverage" --settings coverlet.runsettings

echo.
echo Test execution with coverage completed.
echo.
echo To view detailed coverage report, run: reportgenerator -reports:ElectronicsStore.Tests\TestResults\**\coverage.cobertura.xml -targetdir:coveragereport -reporttypes:Html
pause