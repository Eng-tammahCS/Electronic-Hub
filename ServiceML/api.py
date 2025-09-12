#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
واجهة برمجة التطبيقات لنظام التنبؤ بالمبيعات
Sales Prediction API
"""

from flask import Flask, request, jsonify
# import flask_cors
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import warnings
warnings.filterwarnings('ignore')

# استيراد معالج النموذج
from model_handler import sales_model

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5002", 
    "https://localhost:7001", 
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5002",
    "http://127.0.0.1:7001",
    "http://127.0.0.1:5173"
])  # للسماح بطلبات من مصادر مختلفة

# تهيئة النموذج عند بدء التطبيق
def initialize_model():
    """تهيئة النموذج عند بدء التطبيق"""
    if not sales_model.initialize():
        print("تحذير: فشل في تهيئة النموذج")

# تهيئة النموذج مرة واحدة
initialize_model()

# الصفحة الرئيسية - معلومات API
@app.route('/')
def home():
    """الصفحة الرئيسية - معلومات API"""
    return jsonify({
        "message": "مرحباً بك في API التنبؤ بالمبيعات",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "model_info": "/api/model/info",
            "predict": "/api/predict/next",
            "data_summary": "/api/data/summary",
            "recent_data": "/api/data/recent",
            "trends": "/api/data/trends"
        },
        "documentation": "استخدم /api/health للتحقق من حالة الخدمة"
    })

# ===== API Endpoints =====

@app.route('/api/health', methods=['GET'])
def health_check():
    """فحص حالة API"""
    return jsonify({
        "status": "healthy",
        "message": "API يعمل بشكل طبيعي",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health_check_simple():
    """فحص حالة API (endpoint مبسط)"""
    return jsonify({
        "status": "healthy",
        "message": "API يعمل بشكل طبيعي",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/model/info', methods=['GET'])
def get_model_info():
    """الحصول على معلومات النموذج"""
    try:
        info = sales_model.get_model_info()
        return jsonify({
            "success": True,
            "data": info
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"خطأ في الحصول على معلومات النموذج: {str(e)}"
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict_next_day():
    """التنبؤ بمبيعات اليوم التالي"""
    try:
        # التنبؤ باليوم التالي فقط
        result = sales_model.predict_next_day_sales()

        if "error" in result:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 400

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"خطأ في التنبؤ: {str(e)}"
        }), 500

@app.route('/api/predict/next', methods=['GET'])
def predict_next_day_get():
    """التنبؤ بمبيعات اليوم التالي عبر GET request"""
    try:
        result = sales_model.predict_next_day_sales()

        if "error" in result:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 400

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"خطأ في التنبؤ: {str(e)}"
        }), 500

@app.route('/api/data/summary', methods=['GET'])
def get_data_summary():
    """الحصول على ملخص البيانات"""
    try:
        if sales_model.df_original is None:
            return jsonify({
                "success": False,
                "error": "البيانات غير محملة"
            }), 500
        
        df = sales_model.df_original
        
        summary = {
            "total_records": len(df),
            "date_range": {
                "start": df['sale_date'].min().strftime('%Y-%m-%d'),
                "end": df['sale_date'].max().strftime('%Y-%m-%d')
            },
            "sales_stats": {
                "total_sales": float(df['total_amount'].sum()),
                "average_daily_sales": float(df['total_amount'].mean()),
                "max_daily_sales": float(df['total_amount'].max()),
                "min_daily_sales": float(df['total_amount'].min())
            },
            "quantity_stats": {
                "total_quantity": int(df['total_quantity'].sum()),
                "average_daily_quantity": float(df['total_quantity'].mean())
            },
            "invoice_stats": {
                "total_invoices": int(df['invoices_count'].sum()),
                "average_daily_invoices": float(df['invoices_count'].mean())
            }
        }
        
        return jsonify({
            "success": True,
            "data": summary
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"خطأ في الحصول على ملخص البيانات: {str(e)}"
        }), 500

@app.route('/api/data/recent', methods=['GET'])
def get_recent_data():
    """الحصول على البيانات الحديثة"""
    try:
        if sales_model.df_original is None:
            return jsonify({
                "success": False,
                "error": "البيانات غير محملة"
            }), 500
        
        # الحصول على آخر 30 يوم
        df = sales_model.df_original.copy()
        df = df.sort_values('sale_date').tail(30)
        
        # تحويل البيانات لصيغة JSON
        data = []
        for _, row in df.iterrows():
            data.append({
                "date": row['sale_date'].strftime('%Y-%m-%d'),
                "total_amount": float(row['total_amount']),
                "total_quantity": int(row['total_quantity']),
                "invoices_count": int(row['invoices_count']),
                "total_discount": float(row['total_discount'])
            })
        
        return jsonify({
            "success": True,
            "data": data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"خطأ في الحصول على البيانات الحديثة: {str(e)}"
        }), 500

@app.route('/api/data/trends', methods=['GET'])
def get_trends():
    """الحصول على اتجاهات البيانات"""
    try:
        if sales_model.df_original is None:
            return jsonify({
                "success": False,
                "error": "البيانات غير محملة"
            }), 500
        
        df = sales_model.df_original.copy()
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        
        # اتجاهات شهرية
        monthly_trends = df.groupby(df['sale_date'].dt.to_period('M')).agg({
            'total_amount': 'sum',
            'total_quantity': 'sum',
            'invoices_count': 'sum'
        }).reset_index()
        
        monthly_data = []
        for _, row in monthly_trends.iterrows():
            monthly_data.append({
                "month": str(row['sale_date']),
                "total_sales": float(row['total_amount']),
                "total_quantity": int(row['total_quantity']),
                "total_invoices": int(row['invoices_count'])
            })
        
        # اتجاهات أسبوعية (آخر 12 أسبوع)
        df['week'] = df['sale_date'].dt.to_period('W')
        weekly_trends = df.groupby('week').agg({
            'total_amount': 'sum',
            'total_quantity': 'sum',
            'invoices_count': 'sum'
        }).tail(12).reset_index()
        
        weekly_data = []
        for _, row in weekly_trends.iterrows():
            weekly_data.append({
                "week": str(row['week']),
                "total_sales": float(row['total_amount']),
                "total_quantity": int(row['total_quantity']),
                "total_invoices": int(row['invoices_count'])
            })
        
        return jsonify({
            "success": True,
            "data": {
                "monthly": monthly_data,
                "weekly": weekly_data
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"خطأ في الحصول على الاتجاهات: {str(e)}"
        }), 500

# معالج الأخطاء
@app.errorhandler(404)
def not_found(error):
    """معالج خطأ 404"""
    return jsonify({
        "success": False,
        "error": "الصفحة غير موجودة"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """معالج خطأ 500"""
    return jsonify({
        "success": False,
        "error": "خطأ داخلي في الخادم"
    }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("بدء تشغيل خادم API للتنبؤ بالمبيعات")
    print("=" * 50)
    print("الروابط المتاحة:")
    print("- الصفحة الرئيسية: http://localhost:5000/")
    print("- فحص الحالة: http://localhost:5000/api/health")
    print("- معلومات النموذج: http://localhost:5000/api/model/info")
    print("- التنبؤ: http://localhost:5000/api/predict/next")
    print("- ملخص البيانات: http://localhost:5000/api/data/summary")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
