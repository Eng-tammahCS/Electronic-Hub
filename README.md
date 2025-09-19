# 🏪 Electronic Hub - نظام إدارة متجر الإلكترونيات الذكي

[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 نظرة عامة

**Electronic Hub** هو نظام إدارة متجر إلكترونيات متكامل ومتطور، يجمع بين أحدث التقنيات في تطوير الويب والذكاء الاصطناعي لتوفير حل شامل لإدارة المتاجر الإلكترونية.

### 🌟 الميزات الرئيسية

- 🛒 **نظام نقاط البيع (POS)** متطور وسهل الاستخدام
- 📦 **إدارة شاملة للمخزون** مع تتبع دقيق للحركات
- 💰 **إدارة الفواتير** (مبيعات ومشتريات) مع دعم المرتجعات
- 👥 **نظام مستخدمين متقدم** مع صلاحيات مرنة
- 📊 **تقارير وتحليلات ذكية** مع تنبؤات المبيعات
- 🤖 **ذكاء اصطناعي** للتنبؤ بالمبيعات وتحليل الاتجاهات
- 📱 **واجهة مستخدم متجاوبة** تعمل على جميع الأجهزة
- 🔐 **أمان متقدم** مع تشفير البيانات والمصادقة الآمنة

## 🏗️ البنية المعمارية

### Frontend (واجهة المستخدم)
- **React 18.2.0** مع TypeScript
- **Vite** كأداة بناء سريعة
- **Tailwind CSS** للتصميم
- **Shadcn/ui** لمكونات الواجهة
- **React Query** لإدارة البيانات

### Backend (الخادم)
- **ASP.NET Core 9.0** مع C#
- **Entity Framework Core** كـ ORM
- **SQL Server** كقاعدة البيانات
- **JWT Authentication** للمصادقة
- **Clean Architecture** مع أنماط متقدمة

### ML Service (خدمة الذكاء الاصطناعي)
- **Python 3.8+** مع Flask
- **Scikit-learn** و **XGBoost** للتعلم الآلي
- **Pandas** و **NumPy** لمعالجة البيانات
- **تنبؤات ذكية** للمبيعات المستقبلية

## 🚀 البدء السريع

### المتطلبات الأساسية

- **Node.js** 18.0.0 أو أحدث
- **.NET 9.0 SDK** أو أحدث
- **Python 3.8** أو أحدث
- **SQL Server** 2019 أو أحدث
- **Git** لإدارة الإصدارات

### التثبيت والإعداد

#### 1. استنساخ المشروع
```bash
git clone https://github.com/your-username/electronic-hub.git
cd electronic-hub
```

#### 2. إعداد Backend
```bash
cd Backend
dotnet restore
dotnet ef database update
dotnet run
```

#### 3. إعداد Frontend
```bash
cd Frontend
npm install
npm run dev
```

#### 4. إعداد ML Service
```bash
cd ServiceML
pip install -r requirements.txt
python run.py
```

### الوصول للنظام

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:5001
- **API Documentation**: http://localhost:5000/swagger

## 📚 التوثيق

### 📖 دليل المطور
- [البنية المعمارية](PROJECT_ARCHITECTURE.md)
- [مخططات UML](UML/)
- [دليل API](Backend/ElectronicsStore.WebAPI/README.md)

### 🎯 دليل المستخدم
- [دليل الاستخدام](docs/user-guide.md)
- [دليل الإدارة](docs/admin-guide.md)
- [الأسئلة الشائعة](docs/faq.md)

### 🔧 دليل التطوير
- [إرشادات التطوير](docs/development-guidelines.md)
- [معايير الكود](docs/coding-standards.md)
- [دليل الاختبار](docs/testing-guide.md)

## 🏛️ هيكل المشروع

```
Electronic-Hub/
├── 📁 Backend/                    # خادم ASP.NET Core
│   ├── ElectronicsStore.Domain/   # طبقة النطاق
│   ├── ElectronicsStore.Application/ # طبقة التطبيق
│   ├── ElectronicsStore.Infrastructure/ # طبقة البنية التحتية
│   ├── ElectronicsStore.WebAPI/  # طبقة الواجهة
│   └── ElectronicsStore.Tests/   # اختبارات الوحدة
├── 📁 Frontend/                   # واجهة React
│   ├── src/
│   │   ├── components/           # المكونات
│   │   ├── pages/               # الصفحات
│   │   ├── services/            # خدمات API
│   │   └── hooks/               # Custom Hooks
│   └── public/                  # الملفات العامة
├── 📁 ServiceML/                 # خدمة الذكاء الاصطناعي
│   ├── api.py                   # واجهة Flask
│   ├── model_handler.py         # معالج النماذج
│   └── modelAI/                 # النماذج المدربة
├── 📁 UML/                      # مخططات UML
├── 📁 docs/                     # التوثيق التفصيلي
└── 📁 UIUX Design/              # ملفات التصميم
```

## 🎯 الوظائف الرئيسية

### 🛒 إدارة المبيعات
- إنشاء فواتير مبيعات سريعة
- دعم نقاط البيع المتعددة
- إدارة العملاء والخصومات
- طباعة الفواتير

### 📦 إدارة المخزون
- تتبع مستويات المخزون
- تنبيهات المخزون المنخفض
- سجل حركات المخزون
- إدارة الموردين

### 💰 إدارة المشتريات
- فواتير الشراء
- تتبع الموردين
- إدارة المرتجعات
- تحليل التكاليف

### 📊 التقارير والتحليلات
- تقارير المبيعات اليومية/الشهرية
- تحليل ربحية المنتجات
- تقارير المخزون
- تنبؤات المبيعات بالذكاء الاصطناعي

### 👥 إدارة المستخدمين
- نظام أدوار وصلاحيات
- إدارة المستخدمين
- تتبع الأنشطة
- أمان متقدم

## 🔐 الأمان

- **مصادقة JWT** آمنة
- **تشفير كلمات المرور** باستخدام BCrypt
- **حماية من SQL Injection**
- **حماية من XSS**
- **CORS** مُكوَّن بشكل صحيح
- **Rate Limiting** للحماية من الهجمات

## 🧪 الاختبار

### Backend Tests
```bash
cd Backend
dotnet test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

### ML Service Tests
```bash
cd ServiceML
python -m pytest
```

## 🚀 النشر

### Docker
```bash
docker-compose up -d
```

### Azure
```bash
az webapp deployment source config-zip --resource-group myResourceGroup --name myAppName --src myapp.zip
```

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) قبل البدء.

### خطوات المساهمة:
1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 👥 الفريق

- **فريق التطوير** - تطوير النظام
- **فريق التصميم** - تصميم واجهة المستخدم
- **فريق الذكاء الاصطناعي** - تطوير نماذج ML
- **فريق الاختبار** - ضمان الجودة

## 📞 الدعم

- **البريد الإلكتروني**: support@electronic-hub.com
- **المسائل**: [GitHub Issues](https://github.com/your-username/electronic-hub/issues)
- **المناقشات**: [GitHub Discussions](https://github.com/your-username/electronic-hub/discussions)

## 🗓️ خارطة الطريق

### الإصدار 2.0 (قريباً)
- [ ] تطبيق موبايل
- [ ] تكامل مع منصات التجارة الإلكترونية
- [ ] نظام إدارة الفروع
- [ ] تحليلات متقدمة

### الإصدار 3.0 (مستقبلاً)
- [ ] ذكاء اصطناعي متقدم
- [ ] تكامل مع أنظمة المحاسبة
- [ ] نظام إدارة الموظفين
- [ ] تحليلات تنبؤية متقدمة

---

<div align="center">

**🚀 Electronic Hub - مستقبل إدارة المتاجر الإلكترونية**

*مطور بتقنيات حديثة ومتطورة*

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/your-username/electronic-hub)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-AI-orange.svg)](https://github.com/your-username/electronic-hub)

</div>
