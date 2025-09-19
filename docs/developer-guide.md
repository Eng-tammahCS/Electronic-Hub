# 🛠️ دليل المطور - Electronic Hub

## 📋 نظرة عامة

هذا الدليل يوضح كيفية تطوير وإدارة مشروع Electronic Hub. يغطي جميع الجوانب التقنية من الإعداد إلى النشر.

## 🏗️ البنية المعمارية

### Clean Architecture

المشروع يتبع مبادئ Clean Architecture مع فصل الطبقات:

```
┌─────────────────────────────────────┐
│           Presentation Layer        │ ← Controllers, UI
├─────────────────────────────────────┤
│           Application Layer         │ ← Services, DTOs
├─────────────────────────────────────┤
│             Domain Layer            │ ← Entities, Interfaces
├─────────────────────────────────────┤
│         Infrastructure Layer        │ ← Data Access, External Services
└─────────────────────────────────────┘
```

### التقنيات المستخدمة

#### Backend
- **ASP.NET Core 9.0** - إطار عمل الويب
- **Entity Framework Core** - ORM
- **SQL Server** - قاعدة البيانات
- **AutoMapper** - تحويل البيانات
- **JWT Bearer** - المصادقة
- **Swagger** - توثيق API

#### Frontend
- **React 18.2.0** - مكتبة واجهة المستخدم
- **TypeScript 5.0** - لغة البرمجة
- **Vite** - أداة البناء
- **Tailwind CSS** - إطار عمل CSS
- **Shadcn/ui** - مكتبة المكونات
- **React Query** - إدارة البيانات
- **React Router** - التنقل

#### ML Service
- **Python 3.8+** - لغة البرمجة
- **Flask** - إطار عمل الويب
- **Scikit-learn** - التعلم الآلي
- **XGBoost** - خوارزميات متقدمة
- **Pandas** - معالجة البيانات

## 🚀 إعداد بيئة التطوير

### المتطلبات الأساسية

```bash
# Node.js
node --version  # يجب أن يكون 18.0.0 أو أحدث

# .NET SDK
dotnet --version  # يجب أن يكون 9.0 أو أحدث

# Python
python --version  # يجب أن يكون 3.8 أو أحدث

# Git
git --version
```

### خطوات الإعداد

#### 1. استنساخ المشروع
```bash
git clone https://github.com/your-username/electronic-hub.git
cd electronic-hub
```

#### 2. إعداد Backend
```bash
cd Backend

# استعادة الحزم
dotnet restore

# إعداد قاعدة البيانات
dotnet ef database update

# تشغيل المشروع
dotnet run --project ElectronicsStore.WebAPI
```

#### 3. إعداد Frontend
```bash
cd Frontend

# تثبيت الحزم
npm install

# تشغيل في وضع التطوير
npm run dev
```

#### 4. إعداد ML Service
```bash
cd ServiceML

# إنشاء بيئة افتراضية
python -m venv venv

# تفعيل البيئة الافتراضية
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل الخدمة
python run.py
```

## 🏛️ هيكل المشروع التفصيلي

### Backend Structure
```
Backend/
├── ElectronicsStore.Domain/           # طبقة النطاق
│   ├── Entities/                     # الكيانات
│   │   ├── User.cs
│   │   ├── Product.cs
│   │   ├── SalesInvoice.cs
│   │   └── ...
│   ├── Interfaces/                   # واجهات النطاق
│   │   ├── IUserRepository.cs
│   │   ├── IProductRepository.cs
│   │   └── ...
│   └── Enums/                        # التعدادات
│       ├── MovementType.cs
│       └── PaymentMethod.cs
├── ElectronicsStore.Application/      # طبقة التطبيق
│   ├── Services/                     # الخدمات
│   │   ├── UserService.cs
│   │   ├── ProductService.cs
│   │   └── ...
│   ├── DTOs/                         # كائنات نقل البيانات
│   │   ├── UserDto.cs
│   │   ├── ProductDto.cs
│   │   └── ...
│   ├── Interfaces/                   # واجهات الخدمات
│   │   ├── IUserService.cs
│   │   ├── IProductService.cs
│   │   └── ...
│   └── Mappings/                     # تحويل البيانات
│       └── AutoMapperProfile.cs
├── ElectronicsStore.Infrastructure/   # طبقة البنية التحتية
│   ├── Data/                         # إعدادات قاعدة البيانات
│   │   └── ApplicationDbContext.cs
│   └── Repositories/                 # مستودعات البيانات
│       ├── UserRepository.cs
│       ├── ProductRepository.cs
│       └── ...
└── ElectronicsStore.WebAPI/          # طبقة الواجهة
    ├── Controllers/                  # وحدات التحكم
    │   ├── AuthController.cs
    │   ├── UsersController.cs
    │   └── ...
    ├── Middleware/                   # البرمجيات الوسطية
    │   └── ErrorHandlingMiddleware.cs
    └── Program.cs                    # نقطة البداية
```

### Frontend Structure
```
Frontend/
├── src/
│   ├── components/                   # المكونات
│   │   ├── ui/                      # مكونات UI أساسية
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── layout/                  # مكونات التخطيط
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── forms/                   # مكونات النماذج
│   │       ├── LoginForm.tsx
│   │       ├── ProductForm.tsx
│   │       └── ...
│   ├── pages/                       # الصفحات
│   │   ├── auth/                    # صفحات المصادقة
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/               # لوحة التحكم
│   │   │   └── DashboardPage.tsx
│   │   ├── products/                # إدارة المنتجات
│   │   │   ├── ProductsPage.tsx
│   │   │   └── ProductDetailsPage.tsx
│   │   └── sales/                   # إدارة المبيعات
│   │       ├── SalesPage.tsx
│   │       └── POSPage.tsx
│   ├── services/                    # خدمات API
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   └── ...
│   ├── hooks/                       # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   └── ...
│   ├── contexts/                    # React Contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── utils/                       # وظائف مساعدة
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validators.ts
│   └── types/                       # تعريفات TypeScript
│       ├── auth.ts
│       ├── product.ts
│       └── ...
├── public/                          # الملفات العامة
└── package.json                     # إعدادات المشروع
```

## 🔧 أنماط التطوير

### 1. Repository Pattern
```csharp
public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> GetByIdAsync(int id);
    Task<User> AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(int id);
}
```

### 2. Unit of Work Pattern
```csharp
public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IProductRepository Products { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
```

### 3. Service Layer Pattern
```csharp
public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto> GetUserByIdAsync(int id);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task UpdateUserAsync(int id, UpdateUserDto dto);
    Task DeleteUserAsync(int id);
}
```

### 4. DTO Pattern
```csharp
public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string RoleName { get; set; }
    public bool IsActive { get; set; }
}
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

## 📊 مراقبة الأداء

### Backend Monitoring
- **Application Insights** - مراقبة الأداء
- **Serilog** - تسجيل الأحداث
- **Health Checks** - فحص صحة النظام

### Frontend Monitoring
- **React DevTools** - أدوات التطوير
- **Performance Profiler** - تحليل الأداء
- **Bundle Analyzer** - تحليل حجم الحزم

### Database Monitoring
- **Query Performance** - أداء الاستعلامات
- **Index Usage** - استخدام الفهارس
- **Connection Pooling** - تجميع الاتصالات

## 🔐 الأمان

### Authentication & Authorization
```csharp
[Authorize(Roles = "Admin")]
[HttpGet]
public async Task<IActionResult> GetUsers()
{
    // Implementation
}
```

### Input Validation
```csharp
public class CreateUserDto
{
    [Required]
    [StringLength(50)]
    public string Username { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; }
}
```

### Data Protection
```csharp
public class PasswordService
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
    
    public bool VerifyPassword(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}
```

## 🚀 النشر

### Docker Deployment
```dockerfile
# Dockerfile للـ Backend
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["ElectronicsStore.WebAPI/ElectronicsStore.WebAPI.csproj", "ElectronicsStore.WebAPI/"]
RUN dotnet restore "ElectronicsStore.WebAPI/ElectronicsStore.WebAPI.csproj"
COPY . .
WORKDIR "/src/ElectronicsStore.WebAPI"
RUN dotnet build "ElectronicsStore.WebAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ElectronicsStore.WebAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ElectronicsStore.WebAPI.dll"]
```

### Azure Deployment
```bash
# إنشاء App Service
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name myAppName --runtime "DOTNET|9.0"

# نشر التطبيق
az webapp deployment source config-zip --resource-group myResourceGroup --name myAppName --src myapp.zip
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
```

## 🔍 استكشاف الأخطاء

### Backend Debugging
```csharp
// استخدام logging
_logger.LogInformation("User {UserId} created successfully", user.Id);
_logger.LogError(ex, "Error creating user {UserId}", user.Id);

// استخدام breakpoints
Debugger.Break();

// استخدام conditional compilation
#if DEBUG
    _logger.LogDebug("Debug information: {Data}", data);
#endif
```

### Frontend Debugging
```typescript
// استخدام console.log
console.log('User data:', userData);

// استخدام React DevTools
// تثبيت React Developer Tools extension

// استخدام debugger
debugger; // توقف التنفيذ هنا
```

## 📚 الموارد المفيدة

### Documentation
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Entity Framework Documentation](https://docs.microsoft.com/en-us/ef/)

### Tools
- [Visual Studio Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - API Testing
- [SQL Server Management Studio](https://docs.microsoft.com/en-us/sql/ssms/)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)

### Learning Resources
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Design Patterns](https://refactoring.guru/design-patterns)

---

<div align="center">

**🛠️ دليل المطور - Electronic Hub**

*للمساهمة في تطوير المشروع، يرجى قراءة [دليل المساهمة](CONTRIBUTING.md)*

</div>


