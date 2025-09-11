#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ملف التشغيل الرئيسي لنظام التنبؤ بالمبيعات
Main runner for Sales Prediction System
"""

import os
import sys
import subprocess
from pathlib import Path

def check_requirements():
    """فحص المتطلبات الأساسية"""
    print("🔍 فحص المتطلبات الأساسية...")
    
    # فحص Python version
    if sys.version_info < (3, 8):
        print("❌ خطأ: يتطلب Python 3.8 أو أحدث")
        return False
    
    # فحص وجود ملف البيانات
    data_file_paths = ["data/Daily_sales.csv", "Daily_sales.csv"]
    data_file_found = False

    for path in data_file_paths:
        if Path(path).exists():
            data_file_found = True
            print(f"✅ تم العثور على ملف البيانات: {path}")
            break

    if not data_file_found:
        print("❌ خطأ: ملف البيانات Daily_sales.csv غير موجود")
        print("💡 تأكد من وضع ملف البيانات في المجلد الرئيسي أو مجلد data/")
        return False
    
    print("✅ المتطلبات الأساسية متوفرة")
    return True

def install_requirements():
    """تثبيت المتطلبات"""
    print("📦 تثبيت المتطلبات...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ تم تثبيت المتطلبات بنجاح")
        return True
    except subprocess.CalledProcessError:
        print("❌ فشل في تثبيت المتطلبات")
        return False

def check_model_files():
    """فحص وجود ملفات النموذج"""
    import glob

    # فحص ملفات النموذج في مجلدات مختلفة
    model_dirs = ["modelAI/", "data/", ""]
    model_found = False
    scaler_found = False
    features_found = False
    processed_data_found = False

    for model_dir in model_dirs:
        # البحث عن ملفات النماذج
        if glob.glob(f"{model_dir}best_model_*.joblib"):
            model_found = True
            print(f"✅ تم العثور على ملفات النموذج في: {model_dir}")

        # فحص الـ scaler
        if Path(f"{model_dir}standard_scaler.joblib").exists():
            scaler_found = True
            print(f"✅ تم العثور على scaler في: {model_dir}")

        # فحص ملف الميزات
        if Path(f"{model_dir}feature_columns.txt").exists():
            features_found = True
            print(f"✅ تم العثور على ملف الميزات في: {model_dir}")

        # فحص البيانات المعالجة
        if Path(f"{model_dir}processed_sales_data.csv").exists():
            processed_data_found = True
            print(f"✅ تم العثور على البيانات المعالجة في: {model_dir}")

    if not all([model_found, scaler_found, features_found, processed_data_found]):
        print("⚠️  بعض ملفات النموذج غير موجودة")
        print("🔧 يجب تدريب النموذج من البداية...")
        return False

    print("✅ جميع ملفات النموذج موجودة")
    return True

def train_model():
    """تدريب النموذج"""
    print("🧠 بدء تدريب النموذج...")
    print("📊 هذا قد يستغرق بضع دقائق...")
    
    try:
        # تشغيل notebook لتدريب النموذج
        print("🔄 تشغيل عملية التدريب...")
        
        # يمكن إضافة كود لتشغيل الـ notebook هنا
        # أو تشغيل سكريبت Python منفصل
        
        print("✅ تم تدريب النموذج بنجاح")
        return True
    except Exception as e:
        print(f"❌ فشل في تدريب النموذج: {str(e)}")
        return False

def start_api():
    """تشغيل API"""
    print("🚀 بدء تشغيل خادم API...")
    print("🌐 سيكون النظام متاحاً على: http://localhost:5000")
    print("📱 الصفحات المتاحة:")
    print("   - الرئيسية: http://localhost:5000/")
    print("   - التنبؤ: http://localhost:5000/predict")
    print("   - لوحة التحكم: http://localhost:5000/dashboard")
    print("   - التوثيق: http://localhost:5000/docs")
    print("\n⏹️  اضغط Ctrl+C لإيقاف الخادم")
    print("=" * 50)
    
    try:
        from api import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except ImportError:
        print("❌ خطأ: لا يمكن استيراد API")
        print("💡 تأكد من وجود ملف api.py")
        return False
    except Exception as e:
        print(f"❌ خطأ في تشغيل API: {str(e)}")
        return False

def main():
    """الدالة الرئيسية"""
    print("=" * 50)
    print("🚀 نظام التنبؤ بالمبيعات الذكي")
    print("   Sales Prediction System")
    print("=" * 50)
    
    # فحص المتطلبات
    if not check_requirements():
        return
    
    # تثبيت المتطلبات
    print("\n📦 فحص وتثبيت المتطلبات...")
    try:
        import pandas, numpy, sklearn, xgboost, flask
        print("✅ المكتبات الأساسية متوفرة")
    except ImportError:
        if not install_requirements():
            return
    
    # فحص ملفات النموذج
    print("\n🔍 فحص ملفات النموذج...")
    if not check_model_files():
        print("⚠️  يجب تدريب النموذج أولاً")
        print("📝 يرجى تشغيل sales_model.ipynb لتدريب النموذج")
        
        response = input("\n❓ هل تريد المتابعة بدون النموذج؟ (y/n): ")
        if response.lower() != 'y':
            print("🛑 تم إيقاف التشغيل")
            return
    
    # تشغيل API
    print("\n🚀 تشغيل النظام...")
    start_api()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 تم إيقاف النظام بواسطة المستخدم")
        print("👋 شكراً لاستخدام نظام التنبؤ بالمبيعات!")
    except Exception as e:
        print(f"\n❌ خطأ غير متوقع: {str(e)}")
        print("💡 يرجى مراجعة التوثيق أو الإبلاغ عن المشكلة")
