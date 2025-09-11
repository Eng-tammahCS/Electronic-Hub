# دليل تكامل صفحة نقاط البيع مع قاعدة البيانات

## 📋 نظرة عامة

تم تحديث صفحة نقاط البيع (POS) لتعمل مع قاعدة البيانات الحقيقية بدلاً من البيانات الوهمية. هذا التحديث يشمل:

- ✅ ربط المنتجات بقاعدة البيانات
- ✅ ربط العملاء بقاعدة البيانات  
- ✅ حفظ المبيعات في قاعدة البيانات
- ✅ تحديث المخزون تلقائياً
- ✅ معالجة الأخطاء ورسائل المستخدم
- ✅ واجهة مستخدم محسنة

## 🔧 الملفات المحدثة

### 1. خدمات جديدة
- `Frontend/src/services/salesService.ts` - خدمة المبيعات
- `Frontend/src/hooks/useSales.ts` - hooks للمبيعات

### 2. ملفات محدثة
- `Frontend/src/pages/pos/POSPage.tsx` - الصفحة الرئيسية محدثة بالكامل

## 🚀 الميزات الجديدة

### 1. **تحميل المنتجات من قاعدة البيانات**
```typescript
const { data: productsResponse, isLoading, error } = useProducts({
  page: 1,
  pageSize: 100
});
```

### 2. **تحميل العملاء من قاعدة البيانات**
```typescript
const { data: customersData, isLoading: customersLoading } = useQuery({
  queryKey: ['customers'],
  queryFn: async () => {
    const response = await apiService.get(API_CONFIG.ENDPOINTS.CUSTOMERS);
    return response.data;
  }
});
```

### 3. **حفظ المبيعات في قاعدة البيانات**
```typescript
const createSaleMutation = useCreateSale();

const saleData = {
  invoiceNumber: salesService.generateInvoiceNumber(),
  customerName: selectedCustomer?.name || null,
  invoiceDate: new Date().toISOString(),
  discountTotal: discountAmount,
  paymentMethod: paymentMethod,
  details: cart.map(item => ({
    productId: item.product.id,
    quantity: item.quantity,
    unitPrice: item.product.defaultSellingPrice,
    discountAmount: 0
  }))
};

await createSaleMutation.mutateAsync(saleData);
```

### 4. **معالجة الأخطاء المتقدمة**
- رسائل خطأ واضحة للمستخدم
- إعادة المحاولة عند فشل التحميل
- حالات تحميل مرئية
- حماية من العمليات المتكررة

### 5. **تحديث المخزون التلقائي**
- يتم تحديث المخزون تلقائياً بعد البيع
- إعادة تحميل المنتجات لضمان دقة البيانات
- منع البيع عند نفاد المخزون

## 🎯 الوظائف المحسنة

### 1. **البحث والفلترة**
- البحث بالاسم، الباركود، أو الفئة
- فلترة العملاء بالاسم أو الهاتف
- عرض حالة المخزون في الوقت الفعلي

### 2. **إدارة السلة**
- إضافة/إزالة المنتجات
- تعديل الكميات مع التحقق من المخزون
- حساب المجاميع التلقائي
- تطبيق الخصومات والضرائب

### 3. **طرق الدفع**
- نقدي
- بطاقة ائتمان
- دعم PaymentMethod enum من Backend

### 4. **اختصارات لوحة المفاتيح**
- F1: مسح الكل
- F2: إتمام البيع
- F3: تحميل العملاء

## 🔄 تدفق العمل الجديد

1. **تحميل الصفحة**
   - تحميل المنتجات من API
   - إعداد واجهة المستخدم

2. **البحث عن المنتجات**
   - فلترة المنتجات حسب البحث
   - عرض حالة المخزون

3. **إضافة للسلة**
   - التحقق من توفر المخزون
   - إضافة المنتج للسلة
   - حساب المجاميع

4. **اختيار العميل**
   - تحميل العملاء عند الطلب (F3)
   - اختيار عميل أو عميل عادي

5. **إتمام البيع**
   - التحقق من صحة البيانات
   - إنشاء فاتورة في قاعدة البيانات
   - تحديث المخزون
   - إظهار رسالة نجاح
   - مسح السلة

## 🛡️ معالجة الأخطاء

### 1. **أخطاء التحميل**
```typescript
{isLoadingProducts ? (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
    <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
  </div>
) : productsError ? (
  <div className="flex items-center justify-center py-12">
    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
    <p className="text-destructive mb-2">خطأ في تحميل المنتجات</p>
    <Button variant="outline" onClick={() => refetchProducts()}>
      إعادة المحاولة
    </Button>
  </div>
) : (
  // عرض المنتجات
)}
```

### 2. **أخطاء البيع**
```typescript
try {
  const result = await createSaleMutation.mutateAsync(saleData);
  if (result.success) {
    toast({
      title: "تم إتمام البيع بنجاح",
      description: `فاتورة رقم ${invoiceNumber} بقيمة ${total.toFixed(2)} ر.س`,
      duration: 5000
    });
  }
} catch (error: any) {
  toast({
    title: "خطأ في إتمام البيع",
    description: error.message || 'حدث خطأ غير متوقع',
    variant: "destructive"
  });
}
```

## 📊 أنواع البيانات

### Product (من productService)
```typescript
interface Product {
  id: number;
  name: string;
  barcode?: string;
  categoryId: number;
  categoryName: string;
  supplierId?: number;
  supplierName?: string;
  defaultCostPrice: number;
  defaultSellingPrice: number;
  minSellingPrice: number;
  description?: string;
  createdAt: string;
  currentQuantity: number;
}
```

### Customer
```typescript
interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
}
```

### CreateSalesInvoiceRequest
```typescript
interface CreateSalesInvoiceRequest {
  invoiceNumber: string;
  customerName?: string;
  invoiceDate: string;
  discountTotal: number;
  paymentMethod: PaymentMethod;
  details: CreateSalesInvoiceDetailRequest[];
}
```

## 🎨 تحسينات واجهة المستخدم

### 1. **حالات التحميل**
- مؤشرات تحميل للمنتجات والعملاء
- تعطيل الأزرار أثناء المعالجة
- رسائل حالة واضحة

### 2. **رسائل المستخدم**
- رسائل نجاح للعمليات
- رسائل خطأ مفصلة
- تأكيدات للعمليات المهمة

### 3. **التجاوب**
- واجهة متجاوبة لجميع الأحجام
- تخطيط مرن للسلة والمنتجات
- أزرار تفاعلية

## 🔧 التكوين المطلوب

### 1. **API Endpoints**
تأكد من أن الـ API endpoints التالية متاحة:
- `GET /api/Products` - تحميل المنتجات
- `GET /api/Customers` - تحميل العملاء
- `POST /api/SalesInvoices` - إنشاء فاتورة بيع

### 2. **Authentication**
تأكد من أن المستخدم مسجل دخول ولديه الصلاحيات المطلوبة.

### 3. **Environment Variables**
```env
VITE_API_BASE_URL=http://localhost:5002
```

## 🧪 الاختبار

### 1. **اختبار التحميل**
- تحميل المنتجات
- تحميل العملاء
- معالجة أخطاء الشبكة

### 2. **اختبار البيع**
- إضافة منتجات للسلة
- اختيار عميل
- إتمام البيع
- التحقق من تحديث المخزون

### 3. **اختبار الأخطاء**
- نفاد المخزون
- أخطاء الشبكة
- بيانات غير صحيحة

## 📝 ملاحظات مهمة

1. **المخزون**: يتم التحقق من المخزون قبل البيع وتحديثه تلقائياً
2. **الضرائب**: يتم حساب ضريبة القيمة المضافة (15%) تلقائياً
3. **أرقام الفواتير**: يتم إنشاؤها تلقائياً بصيغة `INV-YYYYMMDD-XXXXXX`
4. **التخزين المؤقت**: يتم استخدام React Query للتخزين المؤقت
5. **التحديث التلقائي**: يتم تحديث البيانات تلقائياً بعد العمليات

## 🚀 الاستخدام

1. افتح صفحة نقاط البيع (`/pos`)
2. انتظر تحميل المنتجات
3. ابحث عن المنتجات أو تصفحها
4. أضف المنتجات للسلة
5. اختر عميل (اختياري)
6. حدد طريقة الدفع
7. اضغط "إتمام البيع" أو F2

---

**تم التحديث بنجاح! 🎉**

صفحة نقاط البيع الآن تعمل بالكامل مع قاعدة البيانات وتوفر تجربة مستخدم محسنة مع معالجة شاملة للأخطاء.
