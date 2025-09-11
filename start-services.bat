@echo off
echo ========================================
echo    تشغيل جميع الخدمات
echo ========================================
echo.

echo تشغيل خدمة Python ML...
start "Python ML Service" cmd /k "cd ServiceML && python api.py"

echo انتظار 5 ثواني...
timeout /t 5 /nobreak > nul

echo تشغيل الباك اند...
start "Backend Service" cmd /k "cd Backend\ElectronicsStore.WebAPI && dotnet run"

echo انتظار 10 ثواني...
timeout /t 10 /nobreak > nul

echo تشغيل الفرونت اند...
start "Frontend Service" cmd /k "cd Frontend && npm run dev"

echo.
echo ========================================
echo    جميع الخدمات تم تشغيلها
echo ========================================
echo.
echo Python ML: http://localhost:5000
echo Backend: https://localhost:7001
echo Frontend: http://localhost:5173
echo.
echo اضغط أي مفتاح للخروج...
pause > nul
