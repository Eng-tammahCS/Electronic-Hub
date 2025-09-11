#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام التعامل مع نموذج التنبؤ بالمبيعات
Sales Prediction Model Handler
"""

import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class SalesModelHandler:
    """فئة للتعامل مع نموذج التنبؤ بالمبيعات"""
    
    def __init__(self):
        """تهيئة معالج النموذج"""
        self.model = None
        self.scaler = None
        self.feature_columns = None
        self.df_original = None
        self.df_clean = None
        self.last_available_date = None
        
    def load_artifacts(self):
        """تحميل النموذج والمكونات المحفوظة"""
        try:
            # محاولة تحميل أنواع مختلفة من النماذج من مجلد modelAI
            model_types = ['randomforest', 'xgboost', 'linearregression']
            model_loaded = False

            for model_type in model_types:
                try:
                    model_file = f'modelAI/best_model_{model_type}.joblib'
                    self.model = joblib.load(model_file)
                    print(f"✓ تم تحميل النموذج: {model_type}")
                    model_loaded = True
                    break
                except FileNotFoundError:
                    continue

            if not model_loaded:
                raise FileNotFoundError("لم يتم العثور على أي نموذج محفوظ في مجلد modelAI")

            # تحميل الـ Scaler
            self.scaler = joblib.load('modelAI/standard_scaler.joblib')
            print("✓ تم تحميل الـ Scaler")

            # تحميل قائمة الميزات
            with open('modelAI/feature_columns.txt', 'r', encoding='utf-8') as f:
                self.feature_columns = [line.strip() for line in f]
            print("✓ تم تحميل قائمة الميزات")

            return True

        except Exception as e:
            print(f"خطأ في تحميل المكونات: {str(e)}")
            return False
    
    def load_data(self):
        """تحميل البيانات الأصلية والمعالجة"""
        try:
            # تحميل البيانات الأصلية من مجلد data
            self.df_original = pd.read_csv('data/Daily_sales.csv', parse_dates=['sale_date'])
            self.last_available_date = self.df_original['sale_date'].max()
            print(f"✓ تم تحميل البيانات الأصلية. آخر تاريخ متاح: {self.last_available_date.date()}")

            # تحميل البيانات المعالجة من مجلد data
            self.df_clean = pd.read_csv('data/processed_sales_data.csv', index_col=0, parse_dates=True)
            print("✓ تم تحميل البيانات المعالجة")

            return True

        except Exception as e:
            print(f"خطأ في تحميل البيانات: {str(e)}")
            return False
    
    def initialize(self):
        """تهيئة المعالج بتحميل جميع المكونات"""
        print("=" * 50)
        print("تهيئة معالج نموذج التنبؤ بالمبيعات")
        print("=" * 50)
        
        if not self.load_artifacts():
            return False
        
        if not self.load_data():
            return False
        
        print("✓ تم تهيئة المعالج بنجاح")
        return True
    
    def create_datetime_features(self, target_date):
        """إنشاء ميزات التاريخ والوقت للتاريخ المحدد"""
        X_predict = pd.DataFrame(index=[target_date])
        
        # ميزات التاريخ والوقت الأساسية
        X_predict['year'] = X_predict.index.year
        X_predict['month'] = X_predict.index.month
        X_predict['day'] = X_predict.index.day
        X_predict['day_of_week'] = X_predict.index.dayofweek
        X_predict['day_of_year'] = X_predict.index.dayofyear
        X_predict['week_of_year'] = X_predict.index.isocalendar().week
        
        # ميزات منطقية
        X_predict['is_weekend'] = X_predict['day_of_week'].isin([5, 6]).astype(int)
        X_predict['is_month_start'] = X_predict.index.is_month_start.astype(int)
        X_predict['is_month_end'] = X_predict.index.is_month_end.astype(int)
        
        return X_predict
    
    def create_lag_features(self, X_predict, target_date):
        """إنشاء ميزات التأخير للتاريخ المحدد"""
        # إعداد البيانات للحصول على ميزات التأخير
        data_for_features = self.df_original[self.df_original['sale_date'] <= self.last_available_date].copy()
        data_for_features['sale_date'] = pd.to_datetime(data_for_features['sale_date'])
        data_for_features = data_for_features.sort_values('sale_date').reset_index(drop=True)
        data_for_features.set_index('sale_date', inplace=True)
        
        # ميزات تأخير المبيعات
        for lag in [1, 2, 3, 7, 14, 30]:
            lag_date = target_date - pd.Timedelta(days=lag)
            if lag_date in data_for_features.index:
                X_predict[f'sales_lag_{lag}'] = data_for_features.loc[lag_date, 'total_amount']
            else:
                X_predict[f'sales_lag_{lag}'] = np.nan
        
        # ميزات تأخير أخرى
        for lag in [1, 7]:
            lag_date = target_date - pd.Timedelta(days=lag)
            if lag_date in data_for_features.index:
                X_predict[f'quantity_lag_{lag}'] = data_for_features.loc[lag_date, 'total_quantity']
                X_predict[f'invoices_lag_{lag}'] = data_for_features.loc[lag_date, 'invoices_count']
                X_predict[f'discount_lag_{lag}'] = data_for_features.loc[lag_date, 'total_discount']
            else:
                X_predict[f'quantity_lag_{lag}'] = np.nan
                X_predict[f'invoices_lag_{lag}'] = np.nan
                X_predict[f'discount_lag_{lag}'] = np.nan
        
        return X_predict, data_for_features
    
    def create_rolling_features(self, X_predict, data_for_features):
        """إنشاء ميزات المتوسطات المتحركة"""
        # ميزات المتوسطات المتحركة للمبيعات
        for window in [7, 14, 30]:
            rolling_mean_sales = data_for_features['total_amount'].rolling(window=window).mean().iloc[-1]
            rolling_std_sales = data_for_features['total_amount'].rolling(window=window).std().iloc[-1]
            rolling_max_sales = data_for_features['total_amount'].rolling(window=window).max().iloc[-1]
            rolling_min_sales = data_for_features['total_amount'].rolling(window=window).min().iloc[-1]
            
            X_predict[f'rolling_mean_sales_{window}'] = rolling_mean_sales
            X_predict[f'rolling_std_sales_{window}'] = rolling_std_sales
            X_predict[f'rolling_max_sales_{window}'] = rolling_max_sales
            X_predict[f'rolling_min_sales_{window}'] = rolling_min_sales
        
        # ميزات المتوسطات المتحركة للكميات والفواتير
        for window in [7, 14]:
            rolling_mean_quantity = data_for_features['total_quantity'].rolling(window=window).mean().iloc[-1]
            rolling_std_quantity = data_for_features['total_quantity'].rolling(window=window).std().iloc[-1]
            rolling_mean_invoices = data_for_features['invoices_count'].rolling(window=window).mean().iloc[-1]
            rolling_std_invoices = data_for_features['invoices_count'].rolling(window=window).std().iloc[-1]
            
            X_predict[f'rolling_mean_quantity_{window}'] = rolling_mean_quantity
            X_predict[f'rolling_std_quantity_{window}'] = rolling_std_quantity
            X_predict[f'rolling_mean_invoices_{window}'] = rolling_mean_invoices
            X_predict[f'rolling_std_invoices_{window}'] = rolling_std_invoices
        
        return X_predict
    
    def create_advanced_features(self, X_predict, data_for_features, target_date):
        """إنشاء الميزات المتقدمة"""
        # متوسط المبيعات الأسبوعي
        X_predict['weekly_avg_sales'] = data_for_features['total_amount'].rolling(window=7).mean().iloc[-1]
        
        # نسبة التغيير في المبيعات
        X_predict['sales_change_pct'] = data_for_features['total_amount'].pct_change().iloc[-1]
        
        # متوسط المبيعات الشهري ومتوسط يوم الأسبوع
        X_predict['monthly_avg_sales'] = self.df_clean.groupby(self.df_clean.index.month)['total_amount'].mean().loc[target_date.month]
        X_predict['day_of_week_avg'] = self.df_clean.groupby(self.df_clean.index.dayofweek)['total_amount'].mean().loc[target_date.dayofweek]
        
        return X_predict
    
    def predict_next_day_sales(self):
        """
        التنبؤ بمبيعات اليوم التالي فقط
        هذه الدالة تتنبأ باليوم التالي مباشرة بعد آخر تاريخ في البيانات

        Returns:
            dict: نتيجة التنبؤ أو رسالة خطأ
        """
        if not all([
    self.model is not None,
    self.scaler is not None,
    self.feature_columns is not None and len(self.feature_columns) > 0,
    self.df_original is not None and not self.df_original.empty,
    self.last_available_date is not None,
        ]):
              return {"error": "النموذج غير مهيأ. يرجى تشغيل initialize() أولاً"}
        
        # if not all([self.model, self.scaler, self.feature_columns, self.df_original, self.last_available_date]):
        #     return {"error": "النموذج غير مهيأ. يرجى تشغيل initialize() أولاً"}

        # حساب التاريخ التالي
        next_date = self.last_available_date + pd.Timedelta(days=1)
        target_date_str = next_date.strftime('%Y-%m-%d')

        try:
            # إعداد البيانات للميزات
            data_for_features = self.df_original[self.df_original['sale_date'] <= self.last_available_date].copy()
            data_for_features['sale_date'] = pd.to_datetime(data_for_features['sale_date'])
            data_for_features = data_for_features.sort_values('sale_date').reset_index(drop=True)
            data_for_features.set_index('sale_date', inplace=True)

            # إنشاء DataFrame للتاريخ المستهدف
            X_predict = pd.DataFrame(index=[next_date])

            # إنشاء الميزات الزمنية
            X_predict['year'] = X_predict.index.year
            X_predict['month'] = X_predict.index.month
            X_predict['day'] = X_predict.index.day
            X_predict['day_of_week'] = X_predict.index.dayofweek
            X_predict['day_of_year'] = X_predict.index.dayofyear
            X_predict['week_of_year'] = X_predict.index.isocalendar().week
            X_predict['is_weekend'] = X_predict['day_of_week'].isin([5, 6]).astype(int)
            X_predict['is_month_start'] = X_predict.index.is_month_start.astype(int)
            X_predict['is_month_end'] = X_predict.index.is_month_end.astype(int)

            # إنشاء ميزات التأخير
            for lag in [1, 2, 3, 7, 14, 30]:
                lag_date = next_date - pd.Timedelta(days=lag)
                if lag_date in data_for_features.index:
                    X_predict[f'sales_lag_{lag}'] = data_for_features.loc[lag_date, 'total_amount']
                else:
                    X_predict[f'sales_lag_{lag}'] = np.nan

            for lag in [1, 7]:
                lag_date = next_date - pd.Timedelta(days=lag)
                if lag_date in data_for_features.index:
                    X_predict[f'quantity_lag_{lag}'] = data_for_features.loc[lag_date, 'total_quantity']
                    X_predict[f'invoices_lag_{lag}'] = data_for_features.loc[lag_date, 'invoices_count']
                    X_predict[f'discount_lag_{lag}'] = data_for_features.loc[lag_date, 'total_discount']
                else:
                    X_predict[f'quantity_lag_{lag}'] = np.nan
                    X_predict[f'invoices_lag_{lag}'] = np.nan
                    X_predict[f'discount_lag_{lag}'] = np.nan

            # إنشاء ميزات المتوسطات المتحركة
            for window in [7, 14, 30]:
                X_predict[f'rolling_mean_sales_{window}'] = data_for_features['total_amount'].rolling(window=window).mean().iloc[-1]
                X_predict[f'rolling_std_sales_{window}'] = data_for_features['total_amount'].rolling(window=window).std().iloc[-1]
                X_predict[f'rolling_max_sales_{window}'] = data_for_features['total_amount'].rolling(window=window).max().iloc[-1]
                X_predict[f'rolling_min_sales_{window}'] = data_for_features['total_amount'].rolling(window=window).min().iloc[-1]

            for window in [7, 14]:
                X_predict[f'rolling_mean_quantity_{window}'] = data_for_features['total_quantity'].rolling(window=window).mean().iloc[-1]
                X_predict[f'rolling_std_quantity_{window}'] = data_for_features['total_quantity'].rolling(window=window).std().iloc[-1]
                X_predict[f'rolling_mean_invoices_{window}'] = data_for_features['invoices_count'].rolling(window=window).mean().iloc[-1]
                X_predict[f'rolling_std_invoices_{window}'] = data_for_features['invoices_count'].rolling(window=window).std().iloc[-1]

            # إنشاء الميزات المتقدمة
            X_predict['weekly_avg_sales'] = data_for_features['total_amount'].rolling(window=7).mean().iloc[-1]
            X_predict['sales_change_pct'] = data_for_features['total_amount'].pct_change().iloc[-1]
            X_predict['monthly_avg_sales'] = self.df_clean.groupby(self.df_clean.index.month)['total_amount'].mean().loc[next_date.month]
            X_predict['day_of_week_avg'] = self.df_clean.groupby(self.df_clean.index.dayofweek)['total_amount'].mean().loc[next_date.dayofweek]

            # ترتيب الميزات حسب القائمة المحفوظة
            X_predict = X_predict[self.feature_columns]

            # التحقق من وجود قيم مفقودة
            if X_predict.isnull().values.any():
                nan_features = X_predict.columns[X_predict.isnull().any()].tolist()
                return {
                    "error": f"الميزات للتاريخ {target_date_str} تحتوي على قيم مفقودة: {nan_features}"
                }

            # تطبيق التطبيع
            X_predict_scaled = self.scaler.transform(X_predict)

            # التنبؤ
            predicted_sales = self.model.predict(X_predict_scaled)[0]

            return {
                "success": True,
                "date": target_date_str,
                "last_available_date": self.last_available_date.strftime('%Y-%m-%d'),
                "predicted_sales": round(predicted_sales, 2),
                "message": f"التنبؤ بمبيعات اليوم التالي ({target_date_str}): {predicted_sales:.2f} ريال"
            }

        except Exception as e:
            return {"error": f"خطأ في التنبؤ: {str(e)}"}
    
    def get_model_info(self):
        """الحصول على معلومات النموذج"""
        if not self.model:
            return {"error": "النموذج غير محمل"}

        next_date = None
        if self.last_available_date:
            next_date = (self.last_available_date + pd.Timedelta(days=1)).strftime('%Y-%m-%d')

        return {
            "model_type": type(self.model).__name__,
            "features_count": len(self.feature_columns) if self.feature_columns else 0,
            "last_available_date": self.last_available_date.strftime('%Y-%m-%d') if self.last_available_date else None,
            "next_prediction_date": next_date,
            "prediction_note": "يمكن التنبؤ فقط باليوم التالي مباشرة بعد آخر تاريخ في البيانات",
            "data_range_days": len(self.df_original) if self.df_original is not None else 0
        }

# إنشاء مثيل عام للاستخدام
sales_model = SalesModelHandler()
