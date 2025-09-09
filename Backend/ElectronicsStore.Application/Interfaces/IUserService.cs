using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

/// <summary>
/// واجهة خدمات إدارة المستخدمين
/// </summary>
public interface IUserService
{
    /// <summary>
    /// الحصول على جميع المستخدمين
    /// </summary>
    /// <returns>قائمة بجميع المستخدمين</returns>
    Task<IEnumerable<UserDto>> GetAllUsersAsync();

    /// <summary>
    /// الحصول على مستخدم محدد بالمعرف
    /// </summary>
    /// <param name="id">معرف المستخدم</param>
    /// <returns>بيانات المستخدم أو null إذا لم يوجد</returns>
    Task<UserDto?> GetUserByIdAsync(int id);

    /// <summary>
    /// الحصول على مستخدم بواسطة اسم المستخدم
    /// </summary>
    /// <param name="username">اسم المستخدم</param>
    /// <returns>بيانات المستخدم أو null إذا لم يوجد</returns>
    Task<UserDto?> GetUserByUsernameAsync(string username);

    /// <summary>
    /// الحصول على مستخدم بواسطة البريد الإلكتروني
    /// </summary>
    /// <param name="email">البريد الإلكتروني</param>
    /// <returns>بيانات المستخدم أو null إذا لم يوجد</returns>
    Task<UserDto?> GetUserByEmailAsync(string email);

    /// <summary>
    /// إنشاء مستخدم جديد
    /// </summary>
    /// <param name="dto">بيانات المستخدم الجديد</param>
    /// <returns>بيانات المستخدم المنشأ</returns>
    Task<UserDto> CreateUserAsync(CreateUserDto dto);

    /// <summary>
    /// تحديث بيانات مستخدم موجود
    /// </summary>
    /// <param name="id">معرف المستخدم</param>
    /// <param name="dto">البيانات المحدثة</param>
    /// <returns>بيانات المستخدم المحدث</returns>
    Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto);

    /// <summary>
    /// حذف مستخدم
    /// </summary>
    /// <param name="id">معرف المستخدم</param>
    Task DeleteUserAsync(int id);

    /// <summary>
    /// تفعيل مستخدم
    /// </summary>
    /// <param name="id">معرف المستخدم</param>
    Task ActivateUserAsync(int id);

    /// <summary>
    /// إلغاء تفعيل مستخدم
    /// </summary>
    /// <param name="id">معرف المستخدم</param>
    Task DeactivateUserAsync(int id);

    /// <summary>
    /// تغيير كلمة مرور المستخدم
    /// </summary>
    /// <param name="id">معرف المستخدم</param>
    /// <param name="dto">بيانات تغيير كلمة المرور</param>
    Task ChangePasswordAsync(int id, ChangePasswordDto dto);

    /// <summary>
    /// إعادة تعيين كلمة مرور المستخدم
    /// </summary>
    /// <param name="id">معرف المستخدم</param>
    Task ResetPasswordAsync(int id);

    /// <summary>
    /// البحث في المستخدمين
    /// </summary>
    /// <param name="searchTerm">مصطلح البحث</param>
    /// <returns>قائمة بالمستخدمين المطابقين</returns>
    Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm);

    /// <summary>
    /// الحصول على المستخدمين حسب الدور
    /// </summary>
    /// <param name="roleId">معرف الدور</param>
    /// <returns>قائمة بمستخدمي الدور</returns>
    Task<IEnumerable<UserDto>> GetUsersByRoleAsync(int roleId);

    /// <summary>
    /// الحصول على المستخدمين النشطين
    /// </summary>
    /// <returns>قائمة بالمستخدمين النشطين</returns>
    Task<IEnumerable<UserDto>> GetActiveUsersAsync();

    /// <summary>
    /// الحصول على المستخدمين غير النشطين
    /// </summary>
    /// <returns>قائمة بالمستخدمين غير النشطين</returns>
    Task<IEnumerable<UserDto>> GetInactiveUsersAsync();

    /// <summary>
    /// الحصول على ملخص المستخدمين
    /// </summary>
    /// <returns>ملخص المستخدمين مع الإحصائيات</returns>
    Task<UsersSummaryDto> GetUsersSummaryAsync();

    /// <summary>
    /// التحقق من وجود اسم المستخدم
    /// </summary>
    /// <param name="username">اسم المستخدم</param>
    /// <param name="excludeUserId">معرف المستخدم المستثنى من التحقق (للتحديث)</param>
    /// <returns>true إذا كان موجود، false إذا لم يكن موجود</returns>
    Task<bool> IsUsernameExistsAsync(string username, int? excludeUserId = null);

    /// <summary>
    /// التحقق من وجود البريد الإلكتروني
    /// </summary>
    /// <param name="email">البريد الإلكتروني</param>
    /// <param name="excludeUserId">معرف المستخدم المستثنى من التحقق (للتحديث)</param>
    /// <returns>true إذا كان موجود، false إذا لم يكن موجود</returns>
    Task<bool> IsEmailExistsAsync(string email, int? excludeUserId = null);

    /// <summary>
    /// تحديث تاريخ آخر تسجيل دخول
    /// </summary>
    /// <param name="userId">معرف المستخدم</param>
    Task UpdateLastLoginAsync(int userId);
}
