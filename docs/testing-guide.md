# 🧪 دليل الاختبار - Electronic Hub

## 📋 نظرة عامة

هذا الدليل يوضح كيفية اختبار مشروع Electronic Hub بشكل شامل وفعال. يغطي جميع أنواع الاختبارات من اختبارات الوحدة إلى اختبارات التكامل.

## 🎯 أنواع الاختبارات

### 1. اختبارات الوحدة (Unit Tests)
- اختبار الوظائف الفردية
- اختبار الكلاسات المنفردة
- اختبار المنطق الأساسي

### 2. اختبارات التكامل (Integration Tests)
- اختبار تكامل الطبقات
- اختبار قاعدة البيانات
- اختبار APIs

### 3. اختبارات النظام (System Tests)
- اختبار النظام ككل
- اختبار سيناريوهات المستخدم
- اختبار الأداء

### 4. اختبارات القبول (Acceptance Tests)
- اختبار متطلبات العمل
- اختبار سيناريوهات المستخدم النهائي
- اختبار التوافق

## 🔧 إعداد بيئة الاختبار

### Backend Testing Setup
```bash
cd Backend
dotnet restore
dotnet test
```

### Frontend Testing Setup
```bash
cd Frontend
npm install
npm test
```

### ML Service Testing Setup
```bash
cd ServiceML
pip install -r requirements.txt
python -m pytest
```

## 🧪 اختبارات Backend

### اختبارات الوحدة

#### اختبار الخدمات
```csharp
[Test]
public async Task GetUserByIdAsync_ValidId_ReturnsUser()
{
    // Arrange
    var userId = 1;
    var user = new User { Id = userId, Username = "testuser" };
    _mockRepository.Setup(x => x.GetByIdAsync(userId))
                   .ReturnsAsync(user);

    // Act
    var result = await _userService.GetUserByIdAsync(userId);

    // Assert
    Assert.That(result, Is.Not.Null);
    Assert.That(result.Id, Is.EqualTo(userId));
    Assert.That(result.Username, Is.EqualTo("testuser"));
}

[Test]
public async Task CreateUserAsync_ValidData_CreatesUser()
{
    // Arrange
    var createUserDto = new CreateUserDto
    {
        Username = "newuser",
        Email = "newuser@example.com",
        Password = "password123"
    };

    // Act
    var result = await _userService.CreateUserAsync(createUserDto);

    // Assert
    Assert.That(result, Is.Not.Null);
    Assert.That(result.Username, Is.EqualTo("newuser"));
    _mockRepository.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Once);
}
```

#### اختبار Controllers
```csharp
[Test]
public async Task GetUsers_ReturnsOkResult()
{
    // Arrange
    var users = new List<UserDto>
    {
        new UserDto { Id = 1, Username = "user1" },
        new UserDto { Id = 2, Username = "user2" }
    };
    
    _mockUserService.Setup(x => x.GetAllUsersAsync())
                   .ReturnsAsync(users);

    // Act
    var result = await _controller.GetUsers();

    // Assert
    Assert.That(result, Is.InstanceOf<OkObjectResult>());
    var okResult = result as OkObjectResult;
    Assert.That(okResult.Value, Is.EqualTo(users));
}
```

### اختبارات التكامل

#### اختبار قاعدة البيانات
```csharp
[Test]
public async Task CreateUser_ValidData_UserCreatedInDatabase()
{
    // Arrange
    var createUserDto = new CreateUserDto
    {
        Username = "testuser",
        Email = "test@example.com",
        Password = "password123"
    };

    // Act
    var result = await _userService.CreateUserAsync(createUserDto);

    // Assert
    var userInDb = await _context.Users.FindAsync(result.Id);
    Assert.That(userInDb, Is.Not.Null);
    Assert.That(userInDb.Username, Is.EqualTo("testuser"));
}
```

#### اختبار APIs
```csharp
[Test]
public async Task GetUsers_ReturnsListOfUsers()
{
    // Arrange
    var client = _factory.CreateClient();

    // Act
    var response = await client.GetAsync("/api/users");

    // Assert
    response.EnsureSuccessStatusCode();
    var content = await response.Content.ReadAsStringAsync();
    var users = JsonSerializer.Deserialize<List<UserDto>>(content);
    Assert.That(users, Is.Not.Null);
    Assert.That(users.Count, Is.GreaterThan(0));
}
```

## 🧪 اختبارات Frontend

### اختبارات المكونات

#### اختبار مكون بسيط
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### اختبار مكون مع Hooks
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserList } from './UserList';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('UserList', () => {
  it('displays list of users', async () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });
});
```

### اختبارات الصفحات

#### اختبار صفحة تسجيل الدخول
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('submits form with valid data', async () => {
    const mockLogin = jest.fn();
    render(<LoginPage onLogin={mockLogin} />);

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });
});
```

### اختبارات Hooks

#### اختبار Custom Hook
```typescript
import { renderHook, act } from '@testing-library/react';
import { useUsers } from './useUsers';

describe('useUsers', () => {
  it('fetches users successfully', async () => {
    const { result } = renderHook(() => useUsers());

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(result.current.users).toHaveLength(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
```

## 🧪 اختبارات ML Service

### اختبارات النماذج

#### اختبار Model Handler
```python
import pytest
from model_handler import ModelHandler

class TestModelHandler:
    def test_load_model_success(self):
        handler = ModelHandler()
        model = handler.load_model('best_model_randomforest.joblib')
        assert model is not None

    def test_predict_sales_success(self):
        handler = ModelHandler()
        prediction = handler.predict_sales()
        assert prediction is not None
        assert isinstance(prediction, float)
        assert prediction > 0

    def test_predict_sales_with_invalid_data(self):
        handler = ModelHandler()
        with pytest.raises(ValueError):
            handler.predict_sales(invalid_data=True)
```

#### اختبار API Endpoints
```python
import pytest
from api import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'

def test_predict_endpoint(client):
    response = client.post('/api/predict')
    assert response.status_code == 200
    data = response.get_json()
    assert 'prediction' in data
    assert isinstance(data['prediction'], float)
```

## 🔍 اختبارات الأداء

### Backend Performance Tests
```csharp
[Test]
public async Task GetUsers_PerformanceTest()
{
    // Arrange
    var stopwatch = Stopwatch.StartNew();

    // Act
    var result = await _userService.GetAllUsersAsync();

    // Assert
    stopwatch.Stop();
    Assert.That(stopwatch.ElapsedMilliseconds, Is.LessThan(1000));
    Assert.That(result.Count(), Is.GreaterThan(0));
}
```

### Frontend Performance Tests
```typescript
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('renders large user list quickly', () => {
    const start = performance.now();
    render(<UserList users={largeUserList} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // 100ms
  });
});
```

## 🧪 اختبارات الأمان

### اختبارات المصادقة
```csharp
[Test]
public async Task Login_InvalidCredentials_ReturnsUnauthorized()
{
    // Arrange
    var loginDto = new LoginDto
    {
        Username = "invaliduser",
        Password = "wrongpassword"
    };

    // Act
    var result = await _authController.Login(loginDto);

    // Assert
    Assert.That(result, Is.InstanceOf<UnauthorizedResult>());
}
```

### اختبارات التفويض
```csharp
[Test]
public async Task GetUsers_WithoutAdminRole_ReturnsForbidden()
{
    // Arrange
    var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
    {
        new Claim(ClaimTypes.Role, "Employee")
    }));

    // Act
    var result = await _controller.GetUsers();

    // Assert
    Assert.That(result, Is.InstanceOf<ForbidResult>());
}
```

## 🧪 اختبارات التكامل

### اختبارات API Integration
```csharp
[Test]
public async Task CreateUser_IntegrationTest()
{
    // Arrange
    var client = _factory.CreateClient();
    var createUserDto = new
    {
        Username = "newuser",
        Email = "newuser@example.com",
        Password = "password123"
    };

    // Act
    var response = await client.PostAsJsonAsync("/api/users", createUserDto);

    // Assert
    response.EnsureSuccessStatusCode();
    var user = await response.Content.ReadFromJsonAsync<UserDto>();
    Assert.That(user, Is.Not.Null);
    Assert.That(user.Username, Is.EqualTo("newuser"));
}
```

### اختبارات Frontend-Backend Integration
```typescript
describe('User Management Integration', () => {
  it('creates user and displays in list', async () => {
    render(<UserManagement />);

    // Create user
    fireEvent.click(screen.getByText('Add User'));
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'newuser' }
    });
    fireEvent.click(screen.getByText('Save'));

    // Verify user appears in list
    await waitFor(() => {
      expect(screen.getByText('newuser')).toBeInTheDocument();
    });
  });
});
```

## 🧪 اختبارات قاعدة البيانات

### اختبارات Migration
```csharp
[Test]
public async Task DatabaseMigration_AppliesSuccessfully()
{
    // Arrange
    var context = new ApplicationDbContext(_options);

    // Act
    await context.Database.MigrateAsync();

    // Assert
    Assert.That(await context.Database.CanConnectAsync(), Is.True);
}
```

### اختبارات Data Integrity
```csharp
[Test]
public async Task CreateUser_WithDuplicateUsername_ThrowsException()
{
    // Arrange
    var user1 = new User { Username = "testuser", Email = "test1@example.com" };
    var user2 = new User { Username = "testuser", Email = "test2@example.com" };

    await _context.Users.AddAsync(user1);
    await _context.SaveChangesAsync();

    // Act & Assert
    await _context.Users.AddAsync(user2);
    Assert.ThrowsAsync<DbUpdateException>(async () => await _context.SaveChangesAsync());
}
```

## 🧪 اختبارات UI/UX

### اختبارات Accessibility
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<UserList />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### اختبارات Responsive Design
```typescript
describe('Responsive Design Tests', () => {
  it('displays correctly on mobile', () => {
    global.innerWidth = 375;
    global.innerHeight = 667;
    
    render(<Dashboard />);
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
  });
});
```

## 🧪 اختبارات التحميل

### Load Testing
```csharp
[Test]
public async Task GetUsers_LoadTest()
{
    var tasks = new List<Task>();
    
    for (int i = 0; i < 100; i++)
    {
        tasks.Add(Task.Run(async () =>
        {
            var response = await _client.GetAsync("/api/users");
            response.EnsureSuccessStatusCode();
        }));
    }
    
    await Task.WhenAll(tasks);
}
```

## 🧪 اختبارات التكامل المستمر

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup .NET
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: '9.0.x'
    - name: Restore dependencies
      run: dotnet restore
    - name: Build
      run: dotnet build --no-restore
    - name: Test
      run: dotnet test --no-build --verbosity normal
```

## 📊 تقارير الاختبار

### Coverage Reports
```bash
# Backend
dotnet test --collect:"XPlat Code Coverage"
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coverage"

# Frontend
npm run test:coverage

# ML Service
python -m pytest --cov=. --cov-report=html
```

## 🔧 أدوات الاختبار

### Backend Tools
- **xUnit** - إطار اختبار الوحدة
- **Moq** - مكتبة Mocking
- **FluentAssertions** - مكتبة Assertions
- **Testcontainers** - اختبارات قاعدة البيانات

### Frontend Tools
- **Jest** - إطار اختبار JavaScript
- **React Testing Library** - اختبار مكونات React
- **Cypress** - اختبارات E2E
- **Storybook** - اختبار مكونات UI

### ML Service Tools
- **pytest** - إطار اختبار Python
- **pytest-cov** - تغطية الكود
- **pytest-mock** - Mocking
- **requests-mock** - اختبار HTTP

## 📝 أفضل الممارسات

### 1. اكتب اختبارات واضحة
```csharp
// ❌ سيء
[Test]
public void Test1()
{
    var result = _service.DoSomething();
    Assert.That(result, Is.Not.Null);
}

// ✅ جيد
[Test]
public async Task GetUserByIdAsync_ValidId_ReturnsUser()
{
    // Arrange
    var userId = 1;
    var expectedUser = new User { Id = userId, Username = "testuser" };
    _mockRepository.Setup(x => x.GetByIdAsync(userId))
                   .ReturnsAsync(expectedUser);

    // Act
    var result = await _userService.GetUserByIdAsync(userId);

    // Assert
    Assert.That(result, Is.Not.Null);
    Assert.That(result.Id, Is.EqualTo(userId));
    Assert.That(result.Username, Is.EqualTo("testuser"));
}
```

### 2. استخدم أسماء وصفية
```csharp
// ❌ سيء
[Test]
public void Test_User_1() { }

// ✅ جيد
[Test]
public async Task GetUserByIdAsync_ValidId_ReturnsUser() { }
```

### 3. اختبر الحالات الحدية
```csharp
[Test]
public async Task GetUserByIdAsync_InvalidId_ReturnsNull()
{
    // Arrange
    var invalidId = -1;

    // Act
    var result = await _userService.GetUserByIdAsync(invalidId);

    // Assert
    Assert.That(result, Is.Null);
}
```

### 4. استخدم Mocking بحكمة
```csharp
// ❌ سيء - اختبار كل شيء
_mockRepository.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
               .ReturnsAsync(new User());

// ✅ جيد - اختبار حالة محددة
_mockRepository.Setup(x => x.GetByIdAsync(1))
               .ReturnsAsync(new User { Id = 1, Username = "testuser" });
```

## 🚀 تشغيل الاختبارات

### تشغيل جميع الاختبارات
```bash
# Backend
dotnet test

# Frontend
npm test

# ML Service
python -m pytest
```

### تشغيل اختبارات معينة
```bash
# Backend
dotnet test --filter "Category=Unit"

# Frontend
npm test -- --testNamePattern="UserList"

# ML Service
python -m pytest tests/test_model_handler.py
```

### تشغيل اختبارات مع التغطية
```bash
# Backend
dotnet test --collect:"XPlat Code Coverage"

# Frontend
npm run test:coverage

# ML Service
python -m pytest --cov=.
```

---

<div align="center">

**🧪 دليل الاختبار - Electronic Hub**

*للمساعدة في الاختبار، يرجى التواصل مع فريق التطوير*

</div>


