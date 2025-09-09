using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;

namespace ElectronicsStore.Application.Services;

/// <summary>
/// خدمات إدارة المستخدمين
/// </summary>
public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordService _passwordService;

    public UserService(IUnitOfWork unitOfWork, IPasswordService passwordService)
    {
        _unitOfWork = unitOfWork;
        _passwordService = passwordService;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        var result = new List<UserDto>();

        foreach (var user in users)
        {
            var dto = await MapToUserDtoAsync(user);
            result.Add(dto);
        }

        return result.OrderBy(u => u.Username);
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return null;

        return await MapToUserDtoAsync(user);
    }

    public async Task<UserDto?> GetUserByUsernameAsync(string username)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.Username == username);
        var user = users.FirstOrDefault();
        if (user == null) return null;

        return await MapToUserDtoAsync(user);
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.Email == email);
        var user = users.FirstOrDefault();
        if (user == null) return null;

        return await MapToUserDtoAsync(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        // التحقق من صحة البيانات
        await ValidateCreateUserAsync(dto);

        // تشفير كلمة المرور
        var hashedPassword = _passwordService.HashPassword(dto.Password);

        // إنشاء المستخدم
        var user = new User
        {
            Username = dto.Username.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Password = hashedPassword,
            FullName = dto.FullName?.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim(),
            RoleId = dto.RoleId,
            IsActive = dto.IsActive,
            Image = dto.Image?.Trim(),
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return await GetUserByIdAsync(user.Id) 
               ?? throw new Exception("Failed to retrieve created user");
    }

    public async Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var existingUser = await _unitOfWork.Users.GetByIdAsync(id);
        if (existingUser == null)
            throw new KeyNotFoundException($"User with ID {id} not found");

        // التحقق من صحة البيانات
        await ValidateUpdateUserAsync(dto, id);

        // تحديث البيانات
        existingUser.Email = dto.Email.Trim().ToLower();
        existingUser.FullName = dto.FullName?.Trim();
        existingUser.PhoneNumber = dto.PhoneNumber?.Trim();
        existingUser.RoleId = dto.RoleId;
        existingUser.IsActive = dto.IsActive;
        existingUser.Image = dto.Image?.Trim();
        // تحديث تاريخ التعديل غير متاح في BaseEntity

        await _unitOfWork.Users.UpdateAsync(existingUser);
        await _unitOfWork.SaveChangesAsync();

        return await GetUserByIdAsync(id) 
               ?? throw new Exception("Failed to retrieve updated user");
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {id} not found");

        // بدلاً من الحذف، نقوم بإلغاء التفعيل
        user.IsActive = false;
        // تحديث تاريخ التعديل غير متاح في BaseEntity

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ActivateUserAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {id} not found");

        user.IsActive = true;
        // تحديث تاريخ التعديل غير متاح في BaseEntity

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeactivateUserAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {id} not found");

        user.IsActive = false;
        // تحديث تاريخ التعديل غير متاح في BaseEntity

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(int id, ChangePasswordDto dto)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {id} not found");

        // التحقق من كلمة المرور الحالية
        if (!_passwordService.VerifyPassword(dto.CurrentPassword, user.Password))
            throw new ArgumentException("كلمة المرور الحالية غير صحيحة");

        // تشفير كلمة المرور الجديدة
        var hashedPassword = _passwordService.HashPassword(dto.NewPassword);

        // تحديث كلمة المرور
        user.Password = hashedPassword;
        // تحديث تاريخ التعديل غير متاح في BaseEntity

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ResetPasswordAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {id} not found");

        // إنشاء كلمة مرور مؤقتة
        var tempPassword = GenerateTemporaryPassword();
        var hashedPassword = _passwordService.HashPassword(tempPassword);

        // تحديث كلمة المرور
        user.Password = hashedPassword;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // TODO: إرسال كلمة المرور المؤقتة عبر البريد الإلكتروني
        // في الوقت الحالي، سنعرض كلمة المرور في الـ logs للاختبار
        Console.WriteLine($"Temporary password for user {user.Username}: {tempPassword}");
    }

    private string GenerateTemporaryPassword()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 8)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    public async Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return await GetAllUsersAsync();

        var searchTermLower = searchTerm.ToLower();
        var allUsers = await GetAllUsersAsync();

        return allUsers.Where(u => 
            u.Username.ToLower().Contains(searchTermLower) ||
            u.Email.ToLower().Contains(searchTermLower) ||
            (!string.IsNullOrEmpty(u.FullName) && u.FullName.ToLower().Contains(searchTermLower)) ||
            u.RoleName.ToLower().Contains(searchTermLower));
    }

    public async Task<IEnumerable<UserDto>> GetUsersByRoleAsync(int roleId)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.RoleId == roleId);
        var result = new List<UserDto>();

        foreach (var user in users)
        {
            var dto = await MapToUserDtoAsync(user);
            result.Add(dto);
        }

        return result.OrderBy(u => u.Username);
    }

    public async Task<IEnumerable<UserDto>> GetActiveUsersAsync()
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.IsActive);
        var result = new List<UserDto>();

        foreach (var user in users)
        {
            var dto = await MapToUserDtoAsync(user);
            result.Add(dto);
        }

        return result.OrderBy(u => u.Username);
    }

    public async Task<IEnumerable<UserDto>> GetInactiveUsersAsync()
    {
        var users = await _unitOfWork.Users.FindAsync(u => !u.IsActive);
        var result = new List<UserDto>();

        foreach (var user in users)
        {
            var dto = await MapToUserDtoAsync(user);
            result.Add(dto);
        }

        return result.OrderBy(u => u.Username);
    }

    public async Task<UsersSummaryDto> GetUsersSummaryAsync()
    {
        var allUsers = await GetAllUsersAsync();
        var today = DateTime.Today;
        var thisMonth = new DateTime(today.Year, today.Month, 1);

        var summary = new UsersSummaryDto
        {
            TotalUsers = allUsers.Count(),
            ActiveUsers = allUsers.Count(u => u.IsActive),
            InactiveUsers = allUsers.Count(u => !u.IsActive),
            NewUsersThisMonth = allUsers.Count(u => u.CreatedAt >= thisMonth),
            UsersLoggedInToday = allUsers.Count(u => u.LastLoginAt?.Date == today),
            RoleDistribution = GetRoleDistribution(allUsers)
        };

        return summary;
    }

    public async Task<bool> IsUsernameExistsAsync(string username, int? excludeUserId = null)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.Username == username);
        var existingUser = users.FirstOrDefault();

        if (existingUser == null) return false;
        if (excludeUserId.HasValue && existingUser.Id == excludeUserId.Value) return false;

        return true;
    }

    public async Task<bool> IsEmailExistsAsync(string email, int? excludeUserId = null)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.Email == email.ToLower());
        var existingUser = users.FirstOrDefault();

        if (existingUser == null) return false;
        if (excludeUserId.HasValue && existingUser.Id == excludeUserId.Value) return false;

        return true;
    }

    public async Task UpdateLastLoginAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user != null)
        {
            user.LastLoginAt = DateTime.Now;
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    private async Task<UserDto> MapToUserDtoAsync(User user)
    {
        try
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(user.RoleId);

            // إنشاء قائمة صلاحيات افتراضية بناءً على الدور
            var permissions = new List<string>();
            var roleName = "Unknown Role";

            if (role != null && !string.IsNullOrEmpty(role.Name))
            {
                roleName = role.Name;
                // إضافة صلاحيات افتراضية حسب الدور
                switch (role.Name.ToLower())
                {
                    case "admin":
                    case "مدير":
                        permissions.AddRange(new[] {
                            "CREATE_USER", "UPDATE_USER", "DELETE_USER", "VIEW_USERS",
                            "CREATE_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT", "VIEW_PRODUCTS",
                            "CREATE_CATEGORY", "UPDATE_CATEGORY", "DELETE_CATEGORY", "VIEW_CATEGORIES",
                            "CREATE_SUPPLIER", "UPDATE_SUPPLIER", "DELETE_SUPPLIER", "VIEW_SUPPLIERS",
                            "CREATE_INVOICE", "UPDATE_INVOICE", "DELETE_INVOICE", "VIEW_INVOICES",
                            "CREATE_EXPENSE", "UPDATE_EXPENSE", "DELETE_EXPENSE", "VIEW_EXPENSES",
                            "VIEW_REPORTS", "VIEW_DASHBOARD"
                        });
                        break;
                    case "employee":
                    case "موظف":
                        permissions.AddRange(new[] {
                            "VIEW_PRODUCTS", "UPDATE_PRODUCT",
                            "VIEW_CATEGORIES", "CREATE_CATEGORY",
                            "VIEW_SUPPLIERS", "CREATE_SUPPLIER",
                            "CREATE_INVOICE", "VIEW_INVOICES",
                            "CREATE_EXPENSE", "VIEW_EXPENSES",
                            "VIEW_DASHBOARD"
                        });
                        break;
                    case "cashier":
                    case "كاشير":
                        permissions.AddRange(new[] {
                            "VIEW_PRODUCTS",
                            "CREATE_INVOICE", "VIEW_INVOICES",
                            "VIEW_DASHBOARD"
                        });
                        break;
                    default:
                        permissions.Add("VIEW_DASHBOARD");
                        break;
                }
            }
            else
            {
                // إذا لم يتم العثور على الدور، أعطي صلاحيات افتراضية حسب RoleId
                switch (user.RoleId)
                {
                    case 1: // Admin
                        roleName = "Admin";
                        permissions.AddRange(new[] {
                            "CREATE_USER", "UPDATE_USER", "DELETE_USER", "VIEW_USERS",
                            "CREATE_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT", "VIEW_PRODUCTS",
                            "CREATE_CATEGORY", "UPDATE_CATEGORY", "DELETE_CATEGORY", "VIEW_CATEGORIES",
                            "CREATE_SUPPLIER", "UPDATE_SUPPLIER", "DELETE_SUPPLIER", "VIEW_SUPPLIERS",
                            "CREATE_INVOICE", "UPDATE_INVOICE", "DELETE_INVOICE", "VIEW_INVOICES",
                            "CREATE_EXPENSE", "UPDATE_EXPENSE", "DELETE_EXPENSE", "VIEW_EXPENSES",
                            "VIEW_REPORTS", "VIEW_DASHBOARD"
                        });
                        break;
                    case 2: // Employee
                        roleName = "Employee";
                        permissions.AddRange(new[] {
                            "VIEW_PRODUCTS", "UPDATE_PRODUCT",
                            "VIEW_CATEGORIES", "CREATE_CATEGORY",
                            "VIEW_SUPPLIERS", "CREATE_SUPPLIER",
                            "CREATE_INVOICE", "VIEW_INVOICES",
                            "CREATE_EXPENSE", "VIEW_EXPENSES",
                            "VIEW_DASHBOARD"
                        });
                        break;
                    case 3: // Cashier
                        roleName = "Cashier";
                        permissions.AddRange(new[] {
                            "VIEW_PRODUCTS",
                            "CREATE_INVOICE", "VIEW_INVOICES",
                            "VIEW_DASHBOARD"
                        });
                        break;
                    default:
                        permissions.Add("VIEW_DASHBOARD");
                        break;
                }
            }

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username ?? "",
                Email = user.Email ?? "",
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                RoleId = user.RoleId,
                RoleName = roleName,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Image = user.Image,
                Permissions = permissions
            };
        }
        catch (Exception ex)
        {
            // في حالة حدوث خطأ، أرجع UserDto أساسي
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username ?? "",
                Email = user.Email ?? "",
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                RoleId = user.RoleId,
                RoleName = "Admin", // افتراضي
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Image = user.Image,
                Permissions = new List<string> { "VIEW_DASHBOARD" }
            };
        }
    }

    private async Task ValidateCreateUserAsync(CreateUserDto dto)
    {
        // التحقق من وجود اسم المستخدم
        if (await IsUsernameExistsAsync(dto.Username))
            throw new ArgumentException($"اسم المستخدم '{dto.Username}' موجود بالفعل");

        // التحقق من وجود البريد الإلكتروني
        if (await IsEmailExistsAsync(dto.Email))
            throw new ArgumentException($"البريد الإلكتروني '{dto.Email}' موجود بالفعل");

        // التحقق من وجود الدور
        var role = await _unitOfWork.Roles.GetByIdAsync(dto.RoleId);
        if (role == null)
            throw new ArgumentException($"الدور بالمعرف {dto.RoleId} غير موجود");
    }

    private async Task ValidateUpdateUserAsync(UpdateUserDto dto, int userId)
    {
        // التحقق من وجود البريد الإلكتروني
        if (await IsEmailExistsAsync(dto.Email, userId))
            throw new ArgumentException($"البريد الإلكتروني '{dto.Email}' موجود بالفعل");

        // التحقق من وجود الدور
        var role = await _unitOfWork.Roles.GetByIdAsync(dto.RoleId);
        if (role == null)
            throw new ArgumentException($"الدور بالمعرف {dto.RoleId} غير موجود");
    }

    private List<UserRoleDistributionDto> GetRoleDistribution(IEnumerable<UserDto> users)
    {
        var totalUsers = users.Count();
        if (totalUsers == 0) return new List<UserRoleDistributionDto>();

        var roleGroups = users
            .GroupBy(u => u.RoleName)
            .Select(g => new UserRoleDistributionDto
            {
                RoleName = g.Key,
                UserCount = g.Count(),
                Percentage = Math.Round((decimal)g.Count() / totalUsers * 100, 2)
            })
            .OrderByDescending(r => r.UserCount)
            .ToList();

        return roleGroups;
    }
}
