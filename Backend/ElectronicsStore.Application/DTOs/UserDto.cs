using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Application.DTOs;

/// <summary>
/// DTO لعرض بيانات المستخدم
/// </summary>
public class UserDto
{
    /// <summary>
    /// معرف المستخدم
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// اسم المستخدم
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// البريد الإلكتروني
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// الاسم الكامل
    /// </summary>
    public string? FullName { get; set; }

    /// <summary>
    /// رقم الهاتف
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// معرف الدور
    /// </summary>
    public int RoleId { get; set; }

    /// <summary>
    /// اسم الدور
    /// </summary>
    public string RoleName { get; set; } = string.Empty;

    /// <summary>
    /// حالة المستخدم (نشط/غير نشط)
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// تاريخ إنشاء المستخدم
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// تاريخ آخر تسجيل دخول
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// صورة المستخدم (مسار الصورة أو Base64)
    /// </summary>
    public string? Image { get; set; }

    /// <summary>
    /// قائمة الأذونات
    /// </summary>
    public List<string> Permissions { get; set; } = new();
}

/// <summary>
/// DTO لإنشاء مستخدم جديد
/// </summary>
public class CreateUserDto
{
    /// <summary>
    /// اسم المستخدم
    /// </summary>
    [Required(ErrorMessage = "اسم المستخدم مطلوب")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "اسم المستخدم يجب أن يكون بين 3 و 50 حرف")]
    [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "اسم المستخدم يجب أن يحتوي على أحرف وأرقام و _ فقط")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// البريد الإلكتروني
    /// </summary>
    [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
    [EmailAddress(ErrorMessage = "البريد الإلكتروني غير صحيح")]
    [StringLength(100, ErrorMessage = "البريد الإلكتروني يجب أن يكون أقل من 100 حرف")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// كلمة المرور
    /// </summary>
    [Required(ErrorMessage = "كلمة المرور مطلوبة")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "كلمة المرور يجب أن تكون بين 6 و 100 حرف")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// الاسم الكامل
    /// </summary>
    [StringLength(100, ErrorMessage = "الاسم الكامل يجب أن يكون أقل من 100 حرف")]
    public string? FullName { get; set; }

    /// <summary>
    /// رقم الهاتف
    /// </summary>
    [Phone(ErrorMessage = "رقم الهاتف غير صحيح")]
    [StringLength(20, ErrorMessage = "رقم الهاتف يجب أن يكون أقل من 20 حرف")]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// معرف الدور
    /// </summary>
    [Required(ErrorMessage = "الدور مطلوب")]
    [Range(1, int.MaxValue, ErrorMessage = "يجب اختيار دور صحيح")]
    public int RoleId { get; set; }

    /// <summary>
    /// حالة المستخدم (نشط/غير نشط)
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// صورة المستخدم (مسار الصورة أو Base64)
    /// </summary>
    [StringLength(500, ErrorMessage = "مسار الصورة يجب أن يكون أقل من 500 حرف")]
    public string? Image { get; set; }
}

/// <summary>
/// DTO لتحديث بيانات المستخدم
/// </summary>
public class UpdateUserDto
{
    /// <summary>
    /// البريد الإلكتروني
    /// </summary>
    [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
    [EmailAddress(ErrorMessage = "البريد الإلكتروني غير صحيح")]
    [StringLength(100, ErrorMessage = "البريد الإلكتروني يجب أن يكون أقل من 100 حرف")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// الاسم الكامل
    /// </summary>
    [StringLength(100, ErrorMessage = "الاسم الكامل يجب أن يكون أقل من 100 حرف")]
    public string? FullName { get; set; }

    /// <summary>
    /// رقم الهاتف
    /// </summary>
    [Phone(ErrorMessage = "رقم الهاتف غير صحيح")]
    [StringLength(20, ErrorMessage = "رقم الهاتف يجب أن يكون أقل من 20 حرف")]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// معرف الدور
    /// </summary>
    [Required(ErrorMessage = "الدور مطلوب")]
    [Range(1, int.MaxValue, ErrorMessage = "يجب اختيار دور صحيح")]
    public int RoleId { get; set; }

    /// <summary>
    /// حالة المستخدم (نشط/غير نشط)
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// صورة المستخدم (مسار الصورة أو Base64)
    /// </summary>
    [StringLength(500, ErrorMessage = "مسار الصورة يجب أن يكون أقل من 500 حرف")]
    public string? Image { get; set; }
}

/// <summary>
/// DTO لملخص المستخدمين
/// </summary>
public class UsersSummaryDto
{
    /// <summary>
    /// إجمالي عدد المستخدمين
    /// </summary>
    public int TotalUsers { get; set; }

    /// <summary>
    /// عدد المستخدمين النشطين
    /// </summary>
    public int ActiveUsers { get; set; }

    /// <summary>
    /// عدد المستخدمين غير النشطين
    /// </summary>
    public int InactiveUsers { get; set; }

    /// <summary>
    /// عدد المستخدمين الجدد هذا الشهر
    /// </summary>
    public int NewUsersThisMonth { get; set; }

    /// <summary>
    /// عدد المستخدمين الذين سجلوا دخول اليوم
    /// </summary>
    public int UsersLoggedInToday { get; set; }

    /// <summary>
    /// توزيع المستخدمين حسب الأدوار
    /// </summary>
    public List<UserRoleDistributionDto> RoleDistribution { get; set; } = new();
}

/// <summary>
/// DTO لتوزيع المستخدمين حسب الأدوار
/// </summary>
public class UserRoleDistributionDto
{
    /// <summary>
    /// اسم الدور
    /// </summary>
    public string RoleName { get; set; } = string.Empty;

    /// <summary>
    /// عدد المستخدمين في هذا الدور
    /// </summary>
    public int UserCount { get; set; }

    /// <summary>
    /// النسبة المئوية
    /// </summary>
    public decimal Percentage { get; set; }
}
