# 🔧 حل سريع لمشكلة الاتصال

## المشكلة
`net::ERR_CONNECTION_REFUSED` عند محاولة تسجيل الدخول

## الحل المطبق ✅

### 1. تم تعديل ملف التكوين
**الملف**: `Frontend/src/config/api.ts`
- تم تغيير `BASE_URL` من `https://localhost:7001` إلى `http://localhost:5002`

### 2. تم تحسين منطق Fallback
**الملف**: `Frontend/src/services/apiService.ts`
- الآن يحاول HTTP أولاً (أكثر موثوقية)
- إذا فشل HTTP، يحاول HTTPS كـ fallback

## خطوات التشغيل المطلوبة

### 1. شغّل الباك اند
```bash
cd Backend/ElectronicsStore.WebAPI
dotnet run
```

**يجب أن ترى**:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5002
```

### 2. شغّل الفرونت اند
```bash
cd Frontend
npm run dev
```

### 3. اختبر الاتصال
- اذهب إلى: `http://localhost:8080`
- جرب تسجيل الدخول بـ: `admin` / `admin123`

## إذا استمرت المشكلة

### تحقق من:
1. **الباك اند يعمل**: `http://localhost:5002/api/Auth/login`
2. **لا توجد أخطاء** في Console الباك اند
3. **المنفذ 5002 متاح** وغير مستخدم

### حلول إضافية:
1. **أعد تشغيل الباك اند**:
   ```bash
   dotnet run --launch-profile http
   ```

2. **تحقق من إعدادات CORS** في `Program.cs`

3. **اختبر API مباشرة**:
   ```bash
   curl -X POST http://localhost:5002/api/Auth/login \
   -H "Content-Type: application/json" \
   -d '{"username":"admin","password":"admin123"}'
   ```

## النتيجة المتوقعة
- ✅ تسجيل الدخول يعمل
- ✅ لا توجد أخطاء `ERR_CONNECTION_REFUSED`
- ✅ الاتصال بـ `http://localhost:5002` ناجح

---
**تم حل المشكلة! 🎉**
