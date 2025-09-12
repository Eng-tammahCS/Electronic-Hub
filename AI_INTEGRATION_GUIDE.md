# 🧠 دليل تكامل الذكاء الاصطناعي - AI Integration Guide

## 📋 نظرة عامة

هذا الدليل يوضح كيفية تشغيل وتكامل نظام الذكاء الاصطناعي للتنبؤ بالمبيعات في مشروع Electronics Store.

## 🏗️ البنية العامة

```
المستخدم → Frontend (React) → Backend (ASP.NET) → Python ML Service
```

### المنافذ المستخدمة:
- **Frontend**: `http://localhost:8080`
- **Backend**: `http://localhost:7001` (HTTPS) / `http://localhost:5002` (HTTP)
- **ML Service**: `http://localhost:5000`

## 🚀 خطوات التشغيل

### 1. تشغيل خدمة Python ML

```bash
# الطريقة الأولى: استخدام ملف التشغيل
cd ServiceML
python api.py

# الطريقة الثانية: استخدام ملف .bat
start-ml-service.bat
```

### 2. تشغيل Backend (ASP.NET)

```bash
# الطريقة الأولى: استخدام Visual Studio
# افتح ElectronicsStore.sln واشغل المشروع

# الطريقة الثانية: استخدام .NET CLI
cd Backend/ElectronicsStore.WebAPI
dotnet run

# الطريقة الثالثة: استخدام ملف .bat
start-backend.bat
```

### 3. تشغيل Frontend (React)

```bash
# الطريقة الأولى: استخدام npm
cd Frontend
npm install
npm run dev

# الطريقة الثانية: استخدام ملف .bat
start-services.bat
```

## 🔧 الإعدادات المطلوبة

### Backend Configuration

في `appsettings.json`:
```json
{
  "MLService": {
    "BaseUrl": "http://localhost:5000",
    "Timeout": 30
  }
}
```

### Frontend Configuration

في `vite.config.ts`:
```typescript
define: {
  'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:7001'),
  'import.meta.env.VITE_ML_SERVICE_URL': JSON.stringify('http://localhost:5000'),
}
```

## 📡 API Endpoints

### Python ML Service (Port 5000)

- `GET /` - الصفحة الرئيسية
- `GET /health` - فحص حالة الخدمة
- `GET /api/health` - فحص حالة الخدمة (مفصل)
- `GET /api/predict/next` - التنبؤ باليوم التالي
- `GET /api/model/info` - معلومات النموذج
- `GET /api/data/summary` - ملخص البيانات

### Backend API (Port 7001)

- `GET /api/predictions/tomorrow` - تنبؤ مبيعات الغد
- `GET /api/predictions/status` - حالة خدمة التنبؤ
- `GET /api/predictions/model-info` - معلومات النموذج

## 🧪 اختبار التكامل

### 1. اختبار خدمة Python ML

```bash
# فحص حالة الخدمة
curl http://localhost:5000/health

# اختبار التنبؤ
curl http://localhost:5000/api/predict/next
```

### 2. اختبار Backend

```bash
# فحص حالة خدمة التنبؤ
curl http://localhost:7001/api/predictions/status

# اختبار التنبؤ
curl http://localhost:7001/api/predictions/tomorrow
```

### 3. اختبار Frontend

1. افتح `http://localhost:8080`
2. انتقل إلى صفحة "تنبؤات المبيعات"
3. تحقق من عرض البيانات

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. خدمة Python ML لا تعمل
```bash
# تحقق من تثبيت المتطلبات
cd ServiceML
pip install -r requirements.txt

# تحقق من وجود ملف البيانات
ls data/Daily_sales.csv
```

#### 2. Backend لا يتصل بـ ML Service
- تحقق من أن ML Service يعمل على المنفذ 5000
- تحقق من إعدادات CORS في Python
- تحقق من إعدادات MLService في appsettings.json

#### 3. Frontend لا يتصل بـ Backend
- تحقق من أن Backend يعمل على المنفذ 7001
- تحقق من إعدادات CORS في Backend
- تحقق من متغيرات البيئة في Frontend

#### 4. مشاكل CORS
```python
# في ServiceML/api.py
CORS(app, origins=[
    "http://localhost:5002", 
    "https://localhost:7001", 
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080"
])
```

## 📊 البيانات المطلوبة

### ملف البيانات الأساسي:
- `ServiceML/data/Daily_sales.csv` - بيانات المبيعات اليومية

### ملفات النموذج:
- `ServiceML/modelAI/best_model_randomforest.joblib` - النموذج المدرب
- `ServiceML/modelAI/standard_scaler.joblib` - معالج البيانات
- `ServiceML/modelAI/feature_columns.txt` - أسماء الميزات

## 🔄 دورة العمل

1. **المستخدم** يفتح صفحة التنبؤات في Frontend
2. **Frontend** يرسل طلب إلى Backend على `/api/predictions/tomorrow`
3. **Backend** يرسل طلب إلى Python ML Service على `/api/predict/next`
4. **Python ML Service** يعالج البيانات ويعيد التنبؤ
5. **Backend** يعيد النتيجة إلى Frontend
6. **Frontend** يعرض التنبؤ للمستخدم

## 📝 ملاحظات مهمة

- تأكد من تشغيل جميع الخدمات بالترتيب الصحيح
- تحقق من المنافذ المستخدمة
- تأكد من وجود ملفات البيانات والنماذج
- في حالة فشل الاتصال، سيتم عرض بيانات تجريبية

## 🆘 الدعم

في حالة وجود مشاكل:
1. تحقق من ملفات السجل (Logs)
2. تأكد من تشغيل جميع الخدمات
3. تحقق من إعدادات الشبكة والمنافذ
4. راجع هذا الدليل خطوة بخطوة
