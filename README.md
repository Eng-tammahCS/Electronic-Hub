# 🏪 Electronic Hub - نظام إدارة متجر الإلكترونيات

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-green.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 نظرة عامة

**Electronic Hub** هو نظام إدارة متجر إلكترونيات متكامل ومتطور، مبني باستخدام أحدث التقنيات. يوفر إدارة شاملة للمنتجات، الفواتير، الموردين، والمبيعات مع واجهة مستخدم حديثة ومتجاوبة.

## ✨ المميزات الرئيسية

### 🛒 إدارة المنتجات والمخزون
- إدارة شاملة للمنتجات والفئات
- تتبع المخزون في الوقت الفعلي
- تنبيهات المخزون المنخفض
- إدارة الموردين والعملاء

### 💰 نظام نقاط البيع (POS)
- واجهة بيع سريعة وسهلة
- دعم طرق دفع متعددة
- طباعة الفواتير
- إدارة المبيعات والإرجاع

### 📊 التقارير والإحصائيات
- تقارير مبيعات مفصلة
- إحصائيات المخزون
- تحليل الأداء
- تنبؤات المبيعات بالذكاء الاصطناعي

### 🔐 الأمان والصلاحيات
- نظام مصادقة JWT متقدم
- إدارة المستخدمين والصلاحيات
- تشفير آمن للبيانات
- حماية من SQL Injection و XSS

## 🏗️ البنية المعمارية

### Frontend (React + TypeScript)
- **React 18** مع TypeScript
- **Tailwind CSS** للتصميم
- **Shadcn/ui** للمكونات
- **React Query** لإدارة البيانات
- **Vite** للبناء السريع

### Backend (ASP.NET Core 9.0)
- **Clean Architecture** مع SOLID Principles
- **Entity Framework Core** لقاعدة البيانات
- **JWT Authentication** للمصادقة
- **AutoMapper** لتحويل البيانات
- **Swagger** لتوثيق API

### Machine Learning (Python)
- **Flask** للـ API
- **scikit-learn** للتعلم الآلي
- **XGBoost** للتنبؤات
- **Pandas** لمعالجة البيانات

### Database
- **SQL Server** كقاعدة بيانات رئيسية
- **Entity Framework Core** كـ ORM
- **Code First** للهجرة

## 🚀 البدء السريع

### المتطلبات
- .NET 9.0 SDK
- Node.js 18+
- Python 3.11+
- SQL Server

### التثبيت والتشغيل

#### 1. تشغيل Backend
```bash
cd Backend
dotnet restore
dotnet run --project ElectronicsStore.WebAPI
```

#### 2. تشغيل Frontend
```bash
cd Frontend
npm install
npm start
```

#### 3. تشغيل ML Service
```bash
cd ServiceML
pip install -r requirements.txt
python run.py
```

#### 4. تشغيل جميع الخدمات
```bash
# Windows
start-services.bat

# أو تشغيل كل خدمة منفصلة
start-backend.bat
start-ml-service.bat
```

## 🧪 الاختبارات

### تشغيل الاختبارات
```bash
cd Backend

# Unit Tests
dotnet test ElectronicsStore.Tests

# Integration Tests
dotnet test ElectronicsStore.IntegrationTests

# جميع الاختبارات مع Coverage
dotnet test --collect:"XPlat Code Coverage"
```

### نتائج الاختبارات
- ✅ **Unit Tests**: 33/33 (100% نجاح)
- ✅ **Integration Tests**: 5/5 (100% نجاح)
- ✅ **إجمالي**: 38/38 (100% نجاح)

## 📁 هيكل المشروع

```
Electronic-Hub/
├── 📂 Backend/                    # ASP.NET Core Web API
│   ├── ElectronicsStore.Application/  # Business Logic
│   ├── ElectronicsStore.Domain/       # Entities & Interfaces
│   ├── ElectronicsStore.Infrastructure/ # Data Access
│   ├── ElectronicsStore.WebAPI/       # API Controllers
│   ├── ElectronicsStore.Tests/        # Unit Tests
│   └── ElectronicsStore.IntegrationTests/ # Integration Tests
├── 📂 Frontend/                   # React Application
│   ├── src/
│   │   ├── components/           # UI Components
│   │   ├── pages/               # Application Pages
│   │   ├── services/            # API Services
│   │   └── contexts/            # React Contexts
├── 📂 ServiceML/                 # Machine Learning Service
│   ├── modelAI/                 # ML Models
│   ├── data/                    # Training Data
│   └── api.py                   # Flask API
└── 📄 start-*.bat               # Startup Scripts
```

## 🔧 التقنيات المستخدمة

### Backend
- **ASP.NET Core 9.0** - Web API Framework
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **JWT Bearer** - Authentication
- **AutoMapper** - Object Mapping
- **Swagger/OpenAPI** - API Documentation
- **xUnit** - Unit Testing
- **Moq** - Mocking Framework

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component Library
- **React Query** - Data Fetching
- **React Router** - Navigation
- **Lucide React** - Icons

### Machine Learning
- **Python 3.11** - Programming Language
- **Flask** - Web Framework
- **scikit-learn** - ML Library
- **XGBoost** - Gradient Boosting
- **Pandas** - Data Manipulation
- **NumPy** - Numerical Computing

## 🎯 Design Patterns المستخدمة

- **Repository Pattern** - Data Access Abstraction
- **Unit of Work** - Transaction Management
- **Strategy Pattern** - Pricing Strategies
- **Observer Pattern** - Inventory Notifications
- **Facade Pattern** - Business Operations
- **Dependency Injection** - IoC Container

## 🔐 الأمان

- **JWT Authentication** مع Refresh Tokens
- **Role-Based Access Control (RBAC)**
- **Input Validation** و **SQL Injection Prevention**
- **XSS Protection** و **CSRF Protection**
- **Password Hashing** مع PBKDF2
- **HTTPS** للاتصال الآمن

## 📊 API Documentation

بعد تشغيل Backend، يمكنك الوصول إلى:
- **Swagger UI**: `https://localhost:7001/swagger`
- **API Endpoints**: جميع الـ APIs موثقة
- **Authentication**: JWT Bearer Token

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 👨‍💻 المطور

**أحمد وسال** - [@Eng_Ahmed_Wasal](https://github.com/Eng_Ahmed_Wasal)

## 🙏 شكر وتقدير

- فريق React للـ UI Library الرائعة
- فريق Microsoft لـ .NET Core
- مجتمع Python للـ ML Libraries
- جميع المساهمين في المشروع

---

## 📞 التواصل

- **Email**: [ahmed.wasal@example.com](mailto:ahmed.wasal@example.com)
- **GitHub**: [@Eng_Ahmed_Wasal](https://github.com/Eng_Ahmed_Wasal)
- **LinkedIn**: [Ahmed Wasal](https://linkedin.com/in/ahmed-wasal)

---

⭐ **إذا أعجبك المشروع، لا تنس إعطاؤه نجمة!** ⭐
