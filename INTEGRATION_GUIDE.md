# دليل التكامل بين الباك اند والفرونت اند

## 📋 نظرة عامة

تم تكوين المشروع بنجاح للعمل مع ASP.NET Core Web API (الباك اند) و React + TypeScript + Vite (الفرونت اند) مع دعم كامل للمصادقة باستخدام JWT.

## 🗂️ هيكل المشروع

```
project_v4/
├── Backend/                          # ASP.NET Core Web API
│   └── ElectronicsStore.WebAPI/      # مشروع الباك اند الرئيسي
└── Frontend/                         # React + TypeScript + Vite
    └── src/                          # كود الفرونت اند
```

## 🔧 الملفات المُنشأة/المُحدثة

### الباك اند (Backend)
- ✅ **Program.cs**: مُكوَّن بالفعل مع JWT و CORS
- ✅ **appsettings.json**: يحتوي على إعدادات JWT
- ✅ **AuthController.cs**: جاهز مع endpoints للمصادقة

### الفرونت اند (Frontend)
- ✅ **src/config/api.ts**: تكوين API و endpoints
- ✅ **src/services/apiService.ts**: خدمة API شاملة مع JWT
- ✅ **src/services/productService.ts**: خدمة المنتجات
- ✅ **src/hooks/useProducts.ts**: React hooks للمنتجات
- ✅ **src/hooks/useAuth.ts**: React hooks للمصادقة
- ✅ **src/contexts/AuthContext.tsx**: مُحدث للتعامل مع JWT
- ✅ **src/components/ProtectedRoute.tsx**: حماية الصفحات
- ✅ **src/components/LoadingSpinner.tsx**: مكون التحميل
- ✅ **src/components/ErrorBoundary.tsx**: معالجة الأخطاء
- ✅ **src/components/Toast.tsx**: نظام الإشعارات
- ✅ **src/pages/auth/LoginPage.tsx**: مُحدث للتعامل مع API
- ✅ **src/pages/inventory/ProductsPageUpdated.tsx**: مثال على استخدام API

## 🚀 تعليمات التشغيل

### 1. تشغيل الباك اند

```bash
# الانتقال إلى مجلد الباك اند
cd Backend/ElectronicsStore.WebAPI

# تثبيت التبعيات (إذا لزم الأمر)
dotnet restore

# تشغيل الباك اند
dotnet run
```

**الباك اند سيعمل على:**
- HTTPS: `https://localhost:7001`
- HTTP: `http://localhost:5002`

### 2. تشغيل الفرونت اند

```bash
# الانتقال إلى مجلد الفرونت اند
cd Frontend

# تثبيت التبعيات
npm install

# تشغيل الفرونت اند
npm run dev
```

**الفرونت اند سيعمل على:**
- `http://localhost:8080`

## 🔐 المصادقة والصلاحيات

### حسابات تجريبية
- **مدير النظام**: `admin` / `admin123`
- **موظف نقاط البيع**: `pos` / `pos123`

### JWT Token
- يتم تخزين JWT في `localStorage`
- مدة صلاحية الـ token: 60 دقيقة
- يتم إرفاق الـ token تلقائياً في جميع الطلبات المحمية

## 🌐 CORS Configuration

الباك اند مُكوَّن للسماح بالاتصال من:
- `http://localhost:8080` (Vite)
- `http://localhost:3000` (React)
- `http://localhost:4200` (Angular)
- `http://127.0.0.1:5500` (Live Server)

## 📡 API Endpoints

### المصادقة
- `POST /api/Auth/login` - تسجيل الدخول
- `POST /api/Auth/logout` - تسجيل الخروج
- `GET /api/Auth/me` - بيانات المستخدم الحالي
- `POST /api/Auth/refresh-token` - تجديد الـ token

### المنتجات
- `GET /api/Products` - قائمة المنتجات
- `POST /api/Products` - إضافة منتج جديد
- `PUT /api/Products/{id}` - تحديث منتج
- `DELETE /api/Products/{id}` - حذف منتج

## 🛠️ استخدام API في الفرونت اند

### 1. استخدام خدمة API

```typescript
import { apiService } from '@/services/apiService';

// تسجيل الدخول
const result = await apiService.login({ username: 'admin', password: 'admin123' });

// الحصول على المنتجات
const products = await apiService.get('/api/Products');
```

### 2. استخدام React Hooks

```typescript
import { useProducts, useCreateProduct } from '@/hooks/useProducts';

function ProductsComponent() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  
  // استخدام البيانات...
}
```

### 3. حماية الصفحات

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <ProtectedRoute requiredRole="Admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

## 🔍 استكشاف الأخطاء

### مشاكل الاتصال
1. تأكد من تشغيل الباك اند على المنفذ الصحيح
2. تحقق من إعدادات CORS
3. تأكد من صحة عنوان URL في `src/config/api.ts`

### مشاكل المصادقة
1. تحقق من صحة بيانات تسجيل الدخول
2. تأكد من وجود المستخدم في قاعدة البيانات
3. تحقق من إعدادات JWT في `appsettings.json`

### مشاكل CORS
1. تأكد من إضافة المنفذ الصحيح في `Program.cs`
2. تحقق من إعدادات `AllowCredentials()`

## 📝 ملاحظات مهمة

1. **الأمان**: في الإنتاج، يجب تغيير `SecretKey` في JWT
2. **HTTPS**: في الإنتاج، يجب تفعيل HTTPS فقط
3. **CORS**: في الإنتاج، يجب تحديد الأصول المسموحة بدقة
4. **التخزين**: JWT محفوظ في `localStorage` (يمكن تحسينه لاحقاً)

## 🎯 الخطوات التالية

1. إضافة المزيد من API endpoints
2. تحسين معالجة الأخطاء
3. إضافة refresh token تلقائي
4. تحسين الأمان (HttpOnly cookies)
5. إضافة اختبارات وحدة

## 📞 الدعم

إذا واجهت أي مشاكل، تحقق من:
1. Console في المتصفح للأخطاء
2. Network tab لطلبات API
3. Console في الباك اند للأخطاء
4. إعدادات قاعدة البيانات

---

**تم التكامل بنجاح! 🎉**

يمكنك الآن تشغيل المشروعين والاستمتاع بالتكامل الكامل بين الباك اند والفرونت اند.

## 🔍 خطوات استكشاف الأخطاء:

1. **تأكد من تشغيل الباك اند**:
   ```bash
   cd Backend/ElectronicsStore.WebAPI
   dotnet run
   ```

2. **تحقق من المنفذ**:
   - يجب أن يعمل على `http://localhost:5002`
   - لا يجب أن يكون هناك أخطاء في Console

3. **عدّل ملف التكوين**:
   - غير `BASE_URL` إلى `http://localhost:5002`

4. **أعد تشغيل الفرونت اند**:
   ```bash
   cd Frontend
   npm run dev
   ```

## 📝 ملاحظة مهمة:

المشكلة أن النظام يحاول الاتصال بـ HTTPS أولاً، وإذا فشل، يجب أن ينتقل إلى HTTP. لكن يبدو أن منطق Fallback لا يعمل بشكل صحيح.

**الحل الأسرع** هو تعديل `BASE_URL` لاستخدام HTTP مباشرة.

هل تريد مني مساعدتك في تطبيق هذه التعديلات؟
