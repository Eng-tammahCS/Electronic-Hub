using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Application.DTOs;

/// <summary>
/// DTO لتسجيل الدخول
/// </summary>
public class LoginDto
{
    /// <summary>
    /// اسم المستخدم أو البريد الإلكتروني
    /// </summary>
    [Required(ErrorMessage = "اسم المستخدم مطلوب")]
    [StringLength(100, ErrorMessage = "اسم المستخدم يجب أن يكون أقل من 100 حرف")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// كلمة المرور
    /// </summary>
    [Required(ErrorMessage = "كلمة المرور مطلوبة")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "كلمة المرور يجب أن تكون بين 6 و 100 حرف")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// تذكرني (للبقاء مسجل الدخول)
    /// </summary>
    public bool RememberMe { get; set; } = false;
}

/// <summary>
/// DTO لتسجيل مستخدم جديد
/// </summary>
public class RegisterDto
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
    /// تأكيد كلمة المرور
    /// </summary>
    [Required(ErrorMessage = "تأكيد كلمة المرور مطلوب")]
    [Compare("Password", ErrorMessage = "كلمة المرور وتأكيدها غير متطابقتين")]
    public string ConfirmPassword { get; set; } = string.Empty;

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
    /// صورة المستخدم (مسار الصورة أو Base64)
    /// </summary>
    [StringLength(500, ErrorMessage = "مسار الصورة يجب أن يكون أقل من 500 حرف")]
    public string? Image { get; set; }
}

/// <summary>
/// DTO لتغيير كلمة المرور
/// </summary>
public class ChangePasswordDto
{
    /// <summary>
    /// كلمة المرور الحالية
    /// </summary>
    [Required(ErrorMessage = "كلمة المرور الحالية مطلوبة")]
    public string CurrentPassword { get; set; } = string.Empty;

    /// <summary>
    /// كلمة المرور الجديدة
    /// </summary>
    [Required(ErrorMessage = "كلمة المرور الجديدة مطلوبة")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "كلمة المرور يجب أن تكون بين 6 و 100 حرف")]
    public string NewPassword { get; set; } = string.Empty;

    /// <summary>
    /// تأكيد كلمة المرور الجديدة
    /// </summary>
    [Required(ErrorMessage = "تأكيد كلمة المرور الجديدة مطلوب")]
    [Compare("NewPassword", ErrorMessage = "كلمة المرور الجديدة وتأكيدها غير متطابقتين")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}

/// <summary>
/// DTO لإعادة تعيين كلمة المرور
/// </summary>
public class ResetPasswordDto
{
    /// <summary>
    /// البريد الإلكتروني
    /// </summary>
    [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
    [EmailAddress(ErrorMessage = "البريد الإلكتروني غير صحيح")]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// DTO لتأكيد إعادة تعيين كلمة المرور
/// </summary>
public class ConfirmResetPasswordDto
{
    /// <summary>
    /// البريد الإلكتروني
    /// </summary>
    [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
    [EmailAddress(ErrorMessage = "البريد الإلكتروني غير صحيح")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// رمز التأكيد
    /// </summary>
    [Required(ErrorMessage = "رمز التأكيد مطلوب")]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// كلمة المرور الجديدة
    /// </summary>
    [Required(ErrorMessage = "كلمة المرور الجديدة مطلوبة")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "كلمة المرور يجب أن تكون بين 6 و 100 حرف")]
    public string NewPassword { get; set; } = string.Empty;

    /// <summary>
    /// تأكيد كلمة المرور الجديدة
    /// </summary>
    [Required(ErrorMessage = "تأكيد كلمة المرور الجديدة مطلوب")]
    [Compare("NewPassword", ErrorMessage = "كلمة المرور الجديدة وتأكيدها غير متطابقتين")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}
