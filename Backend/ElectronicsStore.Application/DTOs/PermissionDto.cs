using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Application.DTOs;

/// <summary>
/// DTO لعرض بيانات الصلاحية
/// </summary>
public class PermissionDto
{
    /// <summary>
    /// معرف الصلاحية
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// اسم الصلاحية
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// وصف الصلاحية
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// تاريخ الإنشاء
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO لإنشاء صلاحية جديدة
/// </summary>
public class CreatePermissionDto
{
    /// <summary>
    /// اسم الصلاحية
    /// </summary>
    [Required(ErrorMessage = "اسم الصلاحية مطلوب")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "اسم الصلاحية يجب أن يكون بين 3 و 100 حرف")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// وصف الصلاحية
    /// </summary>
    [StringLength(200, ErrorMessage = "وصف الصلاحية يجب أن يكون أقل من 200 حرف")]
    public string? Description { get; set; }
}

/// <summary>
/// DTO لتحديث صلاحية
/// </summary>
public class UpdatePermissionDto
{
    /// <summary>
    /// معرف الصلاحية
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// اسم الصلاحية
    /// </summary>
    [Required(ErrorMessage = "اسم الصلاحية مطلوب")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "اسم الصلاحية يجب أن يكون بين 3 و 100 حرف")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// وصف الصلاحية
    /// </summary>
    [StringLength(200, ErrorMessage = "وصف الصلاحية يجب أن يكون أقل من 200 حرف")]
    public string? Description { get; set; }
}

/// <summary>
/// DTO لملخص الصلاحيات
/// </summary>
public class PermissionsSummaryDto
{
    /// <summary>
    /// إجمالي عدد الصلاحيات
    /// </summary>
    public int TotalPermissions { get; set; }

    /// <summary>
    /// عدد الصلاحيات المستخدمة
    /// </summary>
    public int UsedPermissions { get; set; }

    /// <summary>
    /// عدد الصلاحيات غير المستخدمة
    /// </summary>
    public int UnusedPermissions { get; set; }
}

/// <summary>
/// DTO لاستخدام الصلاحية
/// </summary>
public class PermissionUsageDto
{
    /// <summary>
    /// معرف الصلاحية
    /// </summary>
    public int PermissionId { get; set; }

    /// <summary>
    /// اسم الصلاحية
    /// </summary>
    public string PermissionName { get; set; } = string.Empty;

    /// <summary>
    /// عدد المرات المستخدمة
    /// </summary>
    public int UsageCount { get; set; }

    /// <summary>
    /// قائمة الأدوار التي تستخدم هذه الصلاحية
    /// </summary>
    public List<string> UsedByRoles { get; set; } = new();
}

/// <summary>
/// DTO لربط صلاحية بدور
/// </summary>
public class AssignPermissionToRoleDto
{
    /// <summary>
    /// معرف الدور
    /// </summary>
    [Required(ErrorMessage = "معرف الدور مطلوب")]
    public int RoleId { get; set; }

    /// <summary>
    /// معرف الصلاحية
    /// </summary>
    [Required(ErrorMessage = "معرف الصلاحية مطلوب")]
    public int PermissionId { get; set; }
}

/// <summary>
/// DTO لربط عدة صلاحيات بدور
/// </summary>
public class AssignMultiplePermissionsDto
{
    /// <summary>
    /// معرف الدور
    /// </summary>
    [Required(ErrorMessage = "معرف الدور مطلوب")]
    public int RoleId { get; set; }

    /// <summary>
    /// قائمة معرفات الصلاحيات
    /// </summary>
    [Required(ErrorMessage = "قائمة الصلاحيات مطلوبة")]
    public List<int> PermissionIds { get; set; } = new();
}

/// <summary>
/// DTO لعرض بيانات الدور
/// </summary>
public class RoleDto
{
    /// <summary>
    /// معرف الدور
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// اسم الدور
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// تاريخ الإنشاء
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// قائمة الصلاحيات
    /// </summary>
    public List<PermissionDto> Permissions { get; set; } = new();
}
