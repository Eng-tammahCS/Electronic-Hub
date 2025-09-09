using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

/// <summary>
/// واجهة خدمات JWT Token
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// إنشاء JWT Token للمستخدم
    /// </summary>
    /// <param name="user">بيانات المستخدم</param>
    /// <returns>JWT Token</returns>
    string GenerateToken(UserDto user);

    /// <summary>
    /// إنشاء Refresh Token
    /// </summary>
    /// <returns>Refresh Token</returns>
    string GenerateRefreshToken();

    /// <summary>
    /// التحقق من صحة JWT Token
    /// </summary>
    /// <param name="token">JWT Token</param>
    /// <returns>true إذا كان صحيح، false إذا لم يكن صحيح</returns>
    bool ValidateToken(string token);

    /// <summary>
    /// الحصول على معرف المستخدم من JWT Token
    /// </summary>
    /// <param name="token">JWT Token</param>
    /// <returns>معرف المستخدم أو null</returns>
    int? GetUserIdFromToken(string token);

    /// <summary>
    /// الحصول على اسم المستخدم من JWT Token
    /// </summary>
    /// <param name="token">JWT Token</param>
    /// <returns>اسم المستخدم أو null</returns>
    string? GetUsernameFromToken(string token);

    /// <summary>
    /// الحصول على دور المستخدم من JWT Token
    /// </summary>
    /// <param name="token">JWT Token</param>
    /// <returns>دور المستخدم أو null</returns>
    string? GetUserRoleFromToken(string token);

    /// <summary>
    /// الحصول على صلاحيات المستخدم من JWT Token
    /// </summary>
    /// <param name="token">JWT Token</param>
    /// <returns>قائمة الصلاحيات</returns>
    List<string> GetUserPermissionsFromToken(string token);

    /// <summary>
    /// التحقق من انتهاء صلاحية JWT Token
    /// </summary>
    /// <param name="token">JWT Token</param>
    /// <returns>true إذا انتهت الصلاحية، false إذا لم تنته</returns>
    bool IsTokenExpired(string token);

    /// <summary>
    /// الحصول على تاريخ انتهاء صلاحية JWT Token
    /// </summary>
    /// <param name="token">JWT Token</param>
    /// <returns>تاريخ انتهاء الصلاحية أو null</returns>
    DateTime? GetTokenExpirationDate(string token);

    /// <summary>
    /// تحديث JWT Token باستخدام Refresh Token
    /// </summary>
    /// <param name="refreshToken">Refresh Token</param>
    /// <returns>JWT Token جديد أو null</returns>
    Task<string?> RefreshTokenAsync(string refreshToken);
}
