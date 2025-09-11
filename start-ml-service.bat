@echo off
echo ========================================
echo    تشغيل خدمة Python ML للتنبؤات
echo ========================================
echo.

cd ServiceML

echo فحص Python...
python --version
if %errorlevel% neq 0 (
    echo خطأ: Python غير مثبت أو غير موجود في PATH
    pause
    exit /b 1
)

echo.
echo فحص المكتبات المطلوبة...
pip list | findstr flask
if %errorlevel% neq 0 (
    echo تثبيت المكتبات المطلوبة...
    pip install -r requirements.txt
)

echo.
echo تشغيل خدمة ML...
echo الخدمة ستكون متاحة على: http://localhost:5000
echo.
echo اضغط Ctrl+C لإيقاف الخدمة
echo.

python api.py

pause
