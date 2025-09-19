# 🤝 دليل المساهمة - Electronic Hub

## 📋 نظرة عامة

نرحب بمساهماتكم في تطوير مشروع Electronic Hub! هذا الدليل يوضح كيفية المساهمة في المشروع بشكل فعال ومنظم.

## 🚀 البدء السريع

### 1. Fork المشروع
1. اذهب إلى [صفحة المشروع](https://github.com/your-username/electronic-hub)
2. اضغط على زر "Fork" في أعلى الصفحة
3. اختر الحساب الذي تريد Fork المشروع إليه

### 2. Clone المشروع
```bash
git clone https://github.com/your-username/electronic-hub.git
cd electronic-hub
```

### 3. إضافة Remote
```bash
git remote add upstream https://github.com/original-owner/electronic-hub.git
```

### 4. إنشاء فرع جديد
```bash
git checkout -b feature/your-feature-name
```

## 🔧 إعداد بيئة التطوير

### المتطلبات الأساسية
- **Node.js** 18.0.0 أو أحدث
- **.NET 9.0 SDK** أو أحدث
- **Python 3.8** أو أحدث
- **SQL Server** 2019 أو أحدث
- **Git** لإدارة الإصدارات

### إعداد Backend
```bash
cd Backend
dotnet restore
dotnet ef database update
dotnet run
```

### إعداد Frontend
```bash
cd Frontend
npm install
npm run dev
```

### إعداد ML Service
```bash
cd ServiceML
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python run.py
```

## 📝 معايير الكود

### C# Coding Standards
```csharp
// استخدام async/await
public async Task<UserDto> GetUserByIdAsync(int id)
{
    var user = await _userRepository.GetByIdAsync(id);
    return _mapper.Map<UserDto>(user);
}

// استخدام using statements
using var context = new ApplicationDbContext();
var users = await context.Users.ToListAsync();

// تسمية واضحة للمتغيرات
var activeUsers = await _userService.GetActiveUsersAsync();
var userCount = activeUsers.Count();

// استخدام XML documentation
/// <summary>
/// Gets a user by their unique identifier.
/// </summary>
/// <param name="id">The user's unique identifier.</param>
/// <returns>A task that represents the asynchronous operation. The task result contains the user DTO.</returns>
public async Task<UserDto> GetUserByIdAsync(int id)
```

### TypeScript Coding Standards
```typescript
// استخدام interfaces
interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
}

// استخدام async/await
const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

// استخدام const assertions
const userRoles = ['Admin', 'Employee', 'Cashier'] as const;
type UserRole = typeof userRoles[number];

// استخدام JSDoc
/**
 * Fetches all users from the API
 * @returns Promise that resolves to an array of users
 */
const fetchUsers = async (): Promise<User[]> => {
  // Implementation
};
```

### Python Coding Standards
```python
# استخدام type hints
def get_user_by_id(user_id: int) -> Optional[User]:
    """Get a user by their ID.
    
    Args:
        user_id: The user's unique identifier
        
    Returns:
        User object if found, None otherwise
    """
    return user_repository.get_by_id(user_id)

# استخدام docstrings
class UserService:
    """Service for managing users."""
    
    def __init__(self, user_repository: UserRepository):
        """Initialize the user service.
        
        Args:
            user_repository: Repository for user data access
        """
        self.user_repository = user_repository
```

## 🧪 الاختبار

### Backend Testing
```bash
# تشغيل جميع الاختبارات
dotnet test

# تشغيل اختبارات مع تغطية
dotnet test --collect:"XPlat Code Coverage"

# تشغيل اختبارات معينة
dotnet test --filter "Category=Unit"
```

### Frontend Testing
```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm run test:coverage

# تشغيل الاختبارات في وضع المراقبة
npm run test:watch
```

### ML Service Testing
```bash
# تشغيل الاختبارات
python -m pytest

# تشغيل الاختبارات مع التغطية
python -m pytest --cov=.

# تشغيل اختبارات معينة
python -m pytest tests/test_model_handler.py
```

## 📋 أنواع المساهمات

### 🐛 إصلاح الأخطاء
1. ابحث عن المشكلة في [Issues](https://github.com/your-username/electronic-hub/issues)
2. إذا لم تكن موجودة، أنشئ issue جديد
3. أنشئ فرع جديد: `git checkout -b fix/issue-number`
4. أصلح المشكلة
5. أضف اختبارات للتأكد من الإصلاح
6. أنشئ Pull Request

### ✨ إضافة ميزات جديدة
1. ناقش الميزة في [Discussions](https://github.com/your-username/electronic-hub/discussions)
2. أنشئ issue للميزة
3. أنشئ فرع جديد: `git checkout -b feature/feature-name`
4. طور الميزة
5. أضف اختبارات شاملة
6. حدث التوثيق
7. أنشئ Pull Request

### 📚 تحسين التوثيق
1. حدد الجزء الذي يحتاج تحسين
2. أنشئ فرع جديد: `git checkout -b docs/improvement`
3. حسّن التوثيق
4. تأكد من صحة الروابط
5. أنشئ Pull Request

### 🎨 تحسين التصميم
1. ناقش التحسين في [Discussions](https://github.com/your-username/electronic-hub/discussions)
2. أنشئ فرع جديد: `git checkout -b ui/improvement`
3. نفذ التحسين
4. تأكد من التوافق مع جميع الأجهزة
5. أنشئ Pull Request

## 🔄 عملية المساهمة

### 1. التخطيط
- ناقش التغيير المقترح في [Discussions](https://github.com/your-username/electronic-hub/discussions)
- تأكد من أن التغيير يتماشى مع أهداف المشروع
- اطلب الموافقة من المطورين الرئيسيين

### 2. التطوير
- أنشئ فرع جديد من `main`
- اتبع معايير الكود
- أضف اختبارات شاملة
- حدث التوثيق إذا لزم الأمر

### 3. الاختبار
- تأكد من أن جميع الاختبارات تمر
- اختبر التغيير يدوياً
- تأكد من عدم كسر الوظائف الموجودة

### 4. المراجعة
- أنشئ Pull Request
- املأ قالب Pull Request
- اطلب مراجعة من المطورين
- أجب على التعليقات والاقتراحات

### 5. الدمج
- بعد الموافقة، سيتم دمج التغيير
- احذف الفرع بعد الدمج
- احذف الفرع المحلي

## 📝 قوالب المساهمة

### قالب Issue
```markdown
## وصف المشكلة
وصف واضح ومفصل للمشكلة.

## خطوات إعادة الإنتاج
1. اذهب إلى '...'
2. اضغط على '...'
3. مرر لأسفل إلى '...'
4. شاهد الخطأ

## السلوك المتوقع
وصف واضح ومفصل لما تتوقع حدوثه.

## لقطات الشاشة
إذا أمكن، أضف لقطات شاشة للمساعدة في شرح المشكلة.

## معلومات إضافية
أي معلومات أخرى مفيدة.
```

### قالب Pull Request
```markdown
## وصف التغيير
وصف واضح ومفصل للتغيير المقترح.

## نوع التغيير
- [ ] إصلاح خطأ
- [ ] ميزة جديدة
- [ ] تحسين التوثيق
- [ ] تحسين التصميم
- [ ] إعادة هيكلة الكود
- [ ] تحسين الأداء

## الاختبار
- [ ] تم اختبار التغيير محلياً
- [ ] تم إضافة اختبارات جديدة
- [ ] جميع الاختبارات تمر
- [ ] تم اختبار التوافق مع الإصدارات السابقة

## لقطات الشاشة
إذا أمكن، أضف لقطات شاشة للتغييرات المرئية.

## معلومات إضافية
أي معلومات أخرى مفيدة للمراجعين.
```

## 🔍 مراجعة الكود

### معايير المراجعة
- **الوظائف**: هل الكود يعمل كما هو متوقع؟
- **الأداء**: هل الكود فعال؟
- **الأمان**: هل الكود آمن؟
- **القابلية للقراءة**: هل الكود واضح ومفهوم؟
- **القابلية للصيانة**: هل الكود سهل الصيانة؟

### تعليقات المراجعة
- كن محترفاً ومهذباً
- قدم اقتراحات مفيدة
- اشرح سبب اقتراحك
- اقترح حلول بديلة إذا أمكن

## 🚫 ما لا يجب فعله

### ❌ لا تفعل
- لا ترسل Pull Request بدون مناقشة مسبقة
- لا تكتب كود بدون اختبارات
- لا تكسر الوظائف الموجودة
- لا تنسخ كود من مشاريع أخرى بدون إذن
- لا تستخدم مكتبات غير مرخصة

### ✅ افعل
- اتبع معايير الكود
- اكتب اختبارات شاملة
- حدث التوثيق
- كن محترفاً في التعليقات
- اسأل إذا كنت غير متأكد

## 📞 الحصول على المساعدة

### الموارد المفيدة
- [GitHub Issues](https://github.com/your-username/electronic-hub/issues)
- [GitHub Discussions](https://github.com/your-username/electronic-hub/discussions)
- [Discord Server](https://discord.gg/your-server)
- [Email](mailto:dev@electronic-hub.com)

### الأسئلة الشائعة
- **كيف أبدأ؟** ابدأ بقراءة [دليل المطور](docs/developer-guide.md)
- **كيف أختبر التغيير؟** اتبع [دليل الاختبار](docs/testing-guide.md)
- **كيف أطلب مراجعة؟** أنشئ Pull Request واطلب مراجعة

## 🎉 الاعتراف بالمساهمين

### أنواع الاعتراف
- **المساهمون**: جميع من ساهم في المشروع
- **المطورون الرئيسيون**: المطورون النشطون
- **المساهمون المميزون**: المساهمون البارزون
- **المساهمون في التوثيق**: المساهمون في التوثيق

### كيفية الحصول على الاعتراف
- ساهم بانتظام في المشروع
- قدم مساهمات عالية الجودة
- ساعد المطورين الآخرين
- شارك في المناقشات

## 📄 الترخيص

بالمساهمة في هذا المشروع، فإنك توافق على أن مساهماتك ستكون مرخصة تحت رخصة MIT.

## 🙏 شكر خاص

نشكر جميع المساهمين الذين ساعدوا في تطوير هذا المشروع:

- [المساهمون](https://github.com/your-username/electronic-hub/graphs/contributors)
- [المطورون الرئيسيون](https://github.com/your-username/electronic-hub/graphs/contributors)
- [المساهمون في التوثيق](https://github.com/your-username/electronic-hub/graphs/contributors)

---

<div align="center">

**🤝 دليل المساهمة - Electronic Hub**

*نشكركم على مساهمتكم في تطوير المشروع*

[![Contributors](https://img.shields.io/github/contributors/your-username/electronic-hub)](https://github.com/your-username/electronic-hub/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/your-username/electronic-hub)](https://github.com/your-username/electronic-hub/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/your-username/electronic-hub)](https://github.com/your-username/electronic-hub/pulls)

</div>


