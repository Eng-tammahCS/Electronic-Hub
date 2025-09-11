@echo off
chcp 65001 >nul
title نظام التنبؤ بالمبيعات الذكي

echo ================================================
echo 🚀 نظام التنبؤ بالمبيعات الذكي
echo    Sales Prediction System
echo ================================================
echo.

echo 🔍 فحص Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ خطأ: Python غير مثبت أو غير موجود في PATH
    echo 💡 يرجى تثبيت Python 3.8 أو أحدث
    pause
   exit /b 1
)

echo ✅ Python متوفر

echo.
echo 📦 تثبيت المتطلبات...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ فشل في تثبيت المتطلبات
    pause
    exit /b 1
)

echo ✅ تم تثبيت المتطلبات

echo.
echo 🔍 فحص ملف البيانات...
if exist "data\Daily_sales.csv" (
    echo ✅ ملف البيانات موجود في مجلد data
) else if exist "Daily_sales.csv" (
    echo ✅ ملف البيانات موجود في المجلد الرئيسي
) else (
    echo ❌ خطأ: ملف البيانات Daily_sales.csv غير موجود
    echo 💡 تأكد من وضع ملف البيانات في المجلد الحالي أو مجلد data\
    pause
    exit /b 1
)

echo.
echo 🚀 بدء تشغيل النظام...
echo 🌐 سيكون النظام متاحاً على: http://localhost:5000
echo.
echo 📱 الصفحات المتاحة:
echo    - الرئيسية: http://localhost:5000/
echo    - التنبؤ: http://localhost:5000/predict
echo    - لوحة التحكم: http://localhost:5000/dashboard
echo    - التوثيق: http://localhost:5000/docs
echo.
echo ⏹️  اضغط Ctrl+C لإيقاف الخادم
echo ================================================

python api.py

echo.
echo 👋 شكراً لاستخدام نظام التنبؤ بالمبيعات!
pause
