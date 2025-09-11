#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تنبؤ المبيعات اليومية - المرحلة الرابعة
واجهة برمجة التطبيقات (API) مع Flask
"""

from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

# متغيرات عامة لتخزين النموذج والـ Scaler
model = None
scaler = None
feature_columns = None

def load_model_and_scaler():
    """تحميل النموذج والـ Scaler"""
    global model, scaler, feature_columns
    
    try:
        # محاولة تحميل النموذج (سنحاول جميع الأنواع)
        model_types = ['xgboost', 'randomforest', 'linearregression']
        model_loaded = False
        
        for model_type in model_types:
            try:
                model_file = f'best_model_{model_type}.joblib'
                model = joblib.load(model_file)
                print(f"✓ تم تحميل النموذج: {model_type}")
                model_loaded = True
                break
            except FileNotFoundError:
                continue
        
        if not model_loaded:
            raise FileNotFoundError("لم يتم العثور على أي نموذج محفوظ")
        
        # تحميل الـ Scaler
        scaler = joblib.load('standard_scaler.joblib')
        print("✓ تم تحميل الـ Scaler")
        
        # تحميل قائمة الميزات
        with open('feature_columns.txt', 'r', encoding='utf-8') as f:
            feature_columns = [line.strip() for line in f.readlines()]
        print(f"✓ تم تحميل قائمة الميزات: {len(feature_columns)} ميزة")
        
        return True
        
    except Exception as e:
        print(f"❌ خطأ في تحميل النموذج: {str(e)}")
        return False

def create_features_for_prediction(input_data):
    """إنشاء الميزات للتنبؤ بناءً على المدخلات"""
    try:
        # إنشاء DataFrame فارغ مع التاريخ المطلوب
        target_date = pd.to_datetime(input_data['sale_date'])
        
        # إنشاء DataFrame مع التاريخ المستهدف
        df = pd.DataFrame({'sale_date': [target_date]})
        df.set_index('sale_date', inplace=True)
        
        # إنشاء ميزات التقويم
        df['year'] = df.index.year
        df['month'] = df.index.month
        df['day'] = df.index.day
        df['day_of_week'] = df.index.dayofweek
        df['day_of_year'] = df.index.dayofyear
        df['week_of_year'] = df.index.isocalendar().week
        
        # ميزات منطقية
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_month_start'] = df.index.is_month_start.astype(int)
        df['is_month_end'] = df.index.is_month_end.astype(int)
        
        # الميزات المتأخرة (من المدخلات)
        df['sales_lag_1'] = input_data.get('sales_lag_1', 0)
        df['sales_lag_2'] = input_data.get('sales_lag_2', 0)
        df['sales_lag_3'] = input_data.get('sales_lag_3', 0)
        df['sales_lag_7'] = input_data.get('sales_lag_7', 0)
        df['sales_lag_14'] = input_data.get('sales_lag_14', 0)
        df['sales_lag_30'] = input_data.get('sales_lag_30', 0)
        
        df['quantity_lag_1'] = input_data.get('quantity_lag_1', 0)
        df['quantity_lag_7'] = input_data.get('quantity_lag_7', 0)
        
        df['invoices_lag_1'] = input_data.get('invoices_lag_1', 0)
        df['invoices_lag_7'] = input_data.get('invoices_lag_7', 0)
        
        df['discount_lag_1'] = input_data.get('discount_lag_1', 0)
        df['discount_lag_7'] = input_data.get('discount_lag_7', 0)
        
        # الميزات المتحركة (من المدخلات)
        df['rolling_mean_sales_7'] = input_data.get('rolling_mean_sales_7', 0)
        df['rolling_std_sales_7'] = input_data.get('rolling_std_sales_7', 0)
        df['rolling_max_sales_7'] = input_data.get('rolling_max_sales_7', 0)
        df['rolling_min_sales_7'] = input_data.get('rolling_min_sales_7', 0)
        
        df['rolling_mean_sales_14'] = input_data.get('rolling_mean_sales_14', 0)
        df['rolling_std_sales_14'] = input_data.get('rolling_std_sales_14', 0)
        df['rolling_max_sales_14'] = input_data.get('rolling_max_sales_14', 0)
        df['rolling_min_sales_14'] = input_data.get('rolling_min_sales_14', 0)
        
        df['rolling_mean_sales_30'] = input_data.get('rolling_mean_sales_30', 0)
        df['rolling_std_sales_30'] = input_data.get('rolling_std_sales_30', 0)
        df['rolling_max_sales_30'] = input_data.get('rolling_max_sales_30', 0)
        df['rolling_min_sales_30'] = input_data.get('rolling_min_sales_30', 0)
        
        df['rolling_mean_quantity_7'] = input_data.get('rolling_mean_quantity_7', 0)
        df['rolling_std_quantity_7'] = input_data.get('rolling_std_quantity_7', 0)
        df['rolling_mean_quantity_14'] = input_data.get('rolling_mean_quantity_14', 0)
        df['rolling_std_quantity_14'] = input_data.get('rolling_std_quantity_14', 0)
        
        df['rolling_mean_invoices_7'] = input_data.get('rolling_mean_invoices_7', 0)
        df['rolling_std_invoices_7'] = input_data.get('rolling_std_invoices_7', 0)
        df['rolling_mean_invoices_14'] = input_data.get('rolling_mean_invoices_14', 0)
        df['rolling_std_invoices_14'] = input_data.get('rolling_std_invoices_14', 0)
        
        # الميزات المتقدمة
        df['weekly_avg_sales'] = input_data.get('weekly_avg_sales', 0)
        df['sales_change_pct'] = input_data.get('sales_change_pct', 0)
        df['monthly_avg_sales'] = input_data.get('monthly_avg_sales', 0)
        df['day_of_week_avg'] = input_data.get('day_of_week_avg', 0)
        
        # إعادة ترتيب الأعمدة حسب ترتيب الميزات الأصلية
        df = df.reindex(columns=feature_columns)
        
        return df
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء الميزات: {str(e)}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """فحص صحة الخدمة"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'features_loaded': feature_columns is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_sales():
    """التنبؤ بالمبيعات للغد"""
    try:
        # التحقق من تحميل النموذج
        if model is None or scaler is None or feature_columns is None:
            return jsonify({
                'error': 'النموذج غير محمل. يرجى التأكد من تشغيل السكريبتات السابقة.',
                'status': 'error'
            }), 500
        
        # استقبال البيانات
        input_data = request.get_json()
        
        if not input_data:
            return jsonify({
                'error': 'لم يتم استلام أي بيانات',
                'status': 'error'
            }), 400
        
        # التحقق من وجود التاريخ
        if 'sale_date' not in input_data:
            return jsonify({
                'error': 'يجب توفير تاريخ المبيعات (sale_date)',
                'status': 'error'
            }), 400
        
        # إنشاء الميزات
        features_df = create_features_for_prediction(input_data)
        
        if features_df is None:
            return jsonify({
                'error': 'فشل في إنشاء الميزات',
                'status': 'error'
            }), 500
        
        # توحيد قياس الميزات
        features_scaled = scaler.transform(features_df)
        
        # التنبؤ
        prediction = model.predict(features_scaled)[0]
        
        # إرجاع النتيجة
        return jsonify({
            'status': 'success',
            'prediction': float(prediction),
            'prediction_date': input_data['sale_date'],
            'target_date': (pd.to_datetime(input_data['sale_date']) + timedelta(days=1)).strftime('%Y-%m-%d'),
            'features_used': len(feature_columns),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'خطأ في التنبؤ: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/features_info', methods=['GET'])
def get_features_info():
    """معلومات عن الميزات المطلوبة"""
    if feature_columns is None:
        return jsonify({
            'error': 'قائمة الميزات غير محملة',
            'status': 'error'
        }), 500
    
    return jsonify({
        'status': 'success',
        'total_features': len(feature_columns),
        'features': feature_columns,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/example_request', methods=['GET'])
def get_example_request():
    """مثال على طلب التنبؤ"""
    example_data = {
        "sale_date": "2024-01-15",
        "sales_lag_1": 15000.0,
        "sales_lag_7": 14500.0,
        "quantity_lag_1": 150,
        "invoices_lag_1": 25,
        "discount_lag_1": 500.0,
        "rolling_mean_sales_7": 14800.0,
        "rolling_std_sales_7": 1200.0,
        "rolling_max_sales_7": 16500.0,
        "rolling_min_sales_7": 13500.0,
        "weekly_avg_sales": 14800.0,
        "monthly_avg_sales": 15000.0,
        "day_of_week_avg": 15200.0
    }
    
    return jsonify({
        'status': 'success',
        'example_request': example_data,
        'description': 'مثال على البيانات المطلوبة للتنبؤ',
        'note': 'يمكن توفير قيم افتراضية (0) للميزات غير المتوفرة'
    })

@app.route('/', methods=['GET'])
def home():
    """الصفحة الرئيسية"""
    return render_template('index.html')

@app.route('/predict', methods=['GET'])
def predict_page():
    """صفحة التنبؤ"""
    return render_template('predict.html')

@app.route('/dashboard', methods=['GET'])
def dashboard():
    """صفحة لوحة التحكم"""
    return render_template('dashboard.html')

@app.route('/api-docs', methods=['GET'])
def api_docs():
    """صفحة وثائق API"""
    return render_template('api_docs.html')

@app.route('/api', methods=['GET'])
def api_info():
    """معلومات API (JSON)"""
    return jsonify({
        'title': 'نظام تنبؤ المبيعات اليومية',
        'version': '1.0.0',
        'description': 'API للتنبؤ بالمبيعات اليومية للغد (T+1)',
        'endpoints': {
            'GET /': 'الصفحة الرئيسية',
            'GET /predict': 'صفحة التنبؤ',
            'GET /dashboard': 'لوحة التحكم',
            'GET /api-docs': 'وثائق API',
            'GET /api': 'معلومات API (JSON)',
            'GET /health': 'فحص صحة الخدمة',
            'POST /predict': 'التنبؤ بالمبيعات',
            'GET /features_info': 'معلومات الميزات',
            'GET /example_request': 'مثال على الطلب'
        },
        'usage': 'استخدم POST /predict مع البيانات المطلوبة للتنبؤ',
        'timestamp': datetime.now().isoformat()
    })

def main():
    """تشغيل التطبيق"""
    print("=" * 60)
    print("بدء تشغيل نظام تنبؤ المبيعات - API")
    print("=" * 60)
    
    # تحميل النموذج والـ Scaler
    if not load_model_and_scaler():
        print("❌ فشل في تحميل النموذج. تأكد من تشغيل السكريبتات السابقة.")
        return
    
    print("\n" + "=" * 60)
    print("تم تحميل النموذج بنجاح!")
    print("=" * 60)
    print("الخدمة متاحة على: http://localhost:5000")
    print("🌐 الصفحة الرئيسية: http://localhost:5000/")
    print("🔮 صفحة التنبؤ: http://localhost:5000/predict")
    print("📊 لوحة التحكم: http://localhost:5000/dashboard")
    print("📖 وثائق API: http://localhost:5000/api-docs")
    print("🔧 API JSON: http://localhost:5000/api")
    print("💚 فحص الصحة: http://localhost:5000/health")
    print("=" * 60)
    
    # تشغيل التطبيق
    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == '__main__':
    main()
