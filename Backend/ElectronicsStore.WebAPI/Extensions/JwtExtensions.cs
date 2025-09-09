using System.Security.Claims;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.WebAPI.Extensions;

/// <summary>
/// امتدادات مساعدة لـ JWT
/// </summary>
public static class JwtExtensions
{
    /// <summary>
    /// الحصول على معرف المستخدم الحالي من JWT Token
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <returns>معرف المستخدم أو null</returns>
    public static int? GetCurrentUserId(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            return null;

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }

        return null;
    }

    /// <summary>
    /// الحصول على اسم المستخدم الحالي من JWT Token
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <returns>اسم المستخدم أو null</returns>
    public static string? GetCurrentUsername(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            return null;

        var usernameClaim = user.FindFirst(ClaimTypes.Name);
        return usernameClaim?.Value;
    }

    /// <summary>
    /// الحصول على البريد الإلكتروني للمستخدم الحالي من JWT Token
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <returns>البريد الإلكتروني أو null</returns>
    public static string? GetCurrentUserEmail(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            return null;

        var emailClaim = user.FindFirst(ClaimTypes.Email);
        return emailClaim?.Value;
    }

    /// <summary>
    /// الحصول على دور المستخدم الحالي من JWT Token
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <returns>دور المستخدم أو null</returns>
    public static string? GetCurrentUserRole(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            return null;

        var roleClaim = user.FindFirst(ClaimTypes.Role);
        return roleClaim?.Value;
    }

    /// <summary>
    /// الحصول على الاسم الكامل للمستخدم الحالي من JWT Token
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <returns>الاسم الكامل أو null</returns>
    public static string? GetCurrentUserFullName(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            return null;

        var fullNameClaim = user.FindFirst("FullName");
        return fullNameClaim?.Value;
    }

    /// <summary>
    /// الحصول على صلاحيات المستخدم الحالي من JWT Token
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <returns>قائمة الصلاحيات</returns>
    public static List<string> GetCurrentUserPermissions(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            return new List<string>();

        var permissionClaims = user.FindAll("Permission");
        return permissionClaims.Select(c => c.Value).ToList();
    }

    /// <summary>
    /// التحقق من وجود صلاحية معينة للمستخدم الحالي
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <param name="permission">اسم الصلاحية</param>
    /// <returns>true إذا كانت الصلاحية موجودة، false إذا لم تكن موجودة</returns>
    public static bool HasPermission(this ClaimsPrincipal user, string permission)
    {
        if (user?.Identity?.IsAuthenticated != true || string.IsNullOrWhiteSpace(permission))
            return false;

        var permissions = user.GetCurrentUserPermissions();
        return permissions.Contains(permission, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// التحقق من وجود أي من الصلاحيات المحددة للمستخدم الحالي
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <param name="permissions">قائمة الصلاحيات</param>
    /// <returns>true إذا كانت أي من الصلاحيات موجودة، false إذا لم تكن موجودة</returns>
    public static bool HasAnyPermission(this ClaimsPrincipal user, params string[] permissions)
    {
        if (user?.Identity?.IsAuthenticated != true || permissions == null || permissions.Length == 0)
            return false;

        var userPermissions = user.GetCurrentUserPermissions();
        return permissions.Any(p => userPermissions.Contains(p, StringComparer.OrdinalIgnoreCase));
    }

    /// <summary>
    /// التحقق من وجود جميع الصلاحيات المحددة للمستخدم الحالي
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <param name="permissions">قائمة الصلاحيات</param>
    /// <returns>true إذا كانت جميع الصلاحيات موجودة، false إذا لم تكن موجودة</returns>
    public static bool HasAllPermissions(this ClaimsPrincipal user, params string[] permissions)
    {
        if (user?.Identity?.IsAuthenticated != true || permissions == null || permissions.Length == 0)
            return false;

        var userPermissions = user.GetCurrentUserPermissions();
        return permissions.All(p => userPermissions.Contains(p, StringComparer.OrdinalIgnoreCase));
    }

    /// <summary>
    /// التحقق من أن المستخدم الحالي في دور معين
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <param name="role">اسم الدور</param>
    /// <returns>true إذا كان المستخدم في الدور، false إذا لم يكن</returns>
    public static bool IsInRole(this ClaimsPrincipal user, string role)
    {
        if (user?.Identity?.IsAuthenticated != true || string.IsNullOrWhiteSpace(role))
            return false;

        var userRole = user.GetCurrentUserRole();
        return string.Equals(userRole, role, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// التحقق من أن المستخدم الحالي في أي من الأدوار المحددة
    /// </summary>
    /// <param name="user">ClaimsPrincipal</param>
    /// <param name="roles">قائمة الأدوار</param>
    /// <returns>true إذا كان المستخدم في أي من الأدوار، false إذا لم يكن</returns>
    public static bool IsInAnyRole(this ClaimsPrincipal user, params string[] roles)
    {
        if (user?.Identity?.IsAuthenticated != true || roles == null || roles.Length == 0)
            return false;

        var userRole = user.GetCurrentUserRole();
        return roles.Any(r => string.Equals(userRole, r, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// الحصول على JWT Token من Authorization Header
    /// </summary>
    /// <param name="request">HttpRequest</param>
    /// <returns>JWT Token أو null</returns>
    public static string? GetJwtToken(this HttpRequest request)
    {
        var authHeader = request.Headers.Authorization.FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return authHeader.Substring("Bearer ".Length).Trim();
        }

        return null;
    }
}
