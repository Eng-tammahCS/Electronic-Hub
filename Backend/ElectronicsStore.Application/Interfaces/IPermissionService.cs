using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

/// <summary>
/// واجهة خدمات إدارة الصلاحيات
/// </summary>
public interface IPermissionService
{
    /// <summary>
    /// الحصول على جميع الصلاحيات
    /// </summary>
    /// <returns>قائمة بجميع الصلاحيات</returns>
    Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync();

    /// <summary>
    /// الحصول على صلاحية محددة بالمعرف
    /// </summary>
    /// <param name="id">معرف الصلاحية</param>
    /// <returns>بيانات الصلاحية أو null إذا لم توجد</returns>
    Task<PermissionDto?> GetPermissionByIdAsync(int id);

    /// <summary>
    /// الحصول على صلاحية بالاسم
    /// </summary>
    /// <param name="name">اسم الصلاحية</param>
    /// <returns>بيانات الصلاحية أو null إذا لم توجد</returns>
    Task<PermissionDto?> GetPermissionByNameAsync(string name);

    /// <summary>
    /// إنشاء صلاحية جديدة
    /// </summary>
    /// <param name="dto">بيانات الصلاحية الجديدة</param>
    /// <returns>بيانات الصلاحية المنشأة</returns>
    Task<PermissionDto> CreatePermissionAsync(CreatePermissionDto dto);

    /// <summary>
    /// تحديث بيانات صلاحية موجودة
    /// </summary>
    /// <param name="id">معرف الصلاحية</param>
    /// <param name="dto">البيانات المحدثة</param>
    /// <returns>بيانات الصلاحية المحدثة</returns>
    Task<PermissionDto> UpdatePermissionAsync(int id, UpdatePermissionDto dto);

    /// <summary>
    /// حذف صلاحية
    /// </summary>
    /// <param name="id">معرف الصلاحية</param>
    /// <returns>true إذا تم الحذف بنجاح، false إذا لم يتم العثور على الصلاحية</returns>
    Task<bool> DeletePermissionAsync(int id);

    /// <summary>
    /// التحقق من وجود صلاحية بالاسم
    /// </summary>
    /// <param name="name">اسم الصلاحية</param>
    /// <param name="excludeId">معرف الصلاحية المستثنى من التحقق</param>
    /// <returns>true إذا كانت موجودة، false إذا لم تكن موجودة</returns>
    Task<bool> PermissionExistsByNameAsync(string name, int? excludeId = null);

    /// <summary>
    /// التحقق من إمكانية حذف الصلاحية
    /// </summary>
    /// <param name="id">معرف الصلاحية</param>
    /// <returns>true إذا كان بالإمكان الحذف، false إذا لم يكن</returns>
    Task<bool> CanDeletePermissionAsync(int id);

    /// <summary>
    /// البحث في الصلاحيات
    /// </summary>
    /// <param name="searchTerm">مصطلح البحث</param>
    /// <returns>قائمة بالصلاحيات المطابقة</returns>
    Task<IEnumerable<PermissionDto>> SearchPermissionsAsync(string searchTerm);

    /// <summary>
    /// الحصول على الصلاحيات الأكثر استخداماً
    /// </summary>
    /// <param name="count">عدد الصلاحيات المطلوبة</param>
    /// <returns>قائمة بالصلاحيات الأكثر استخداماً</returns>
    Task<IEnumerable<PermissionDto>> GetMostUsedPermissionsAsync(int count = 10);

    /// <summary>
    /// الحصول على الصلاحيات غير المستخدمة
    /// </summary>
    /// <returns>قائمة بالصلاحيات غير المستخدمة</returns>
    Task<IEnumerable<PermissionDto>> GetUnusedPermissionsAsync();

    /// <summary>
    /// الحصول على ملخص الصلاحيات
    /// </summary>
    /// <returns>ملخص الصلاحيات مع الإحصائيات</returns>
    Task<PermissionsSummaryDto> GetPermissionsSummaryAsync();

    /// <summary>
    /// الحصول على استخدام الصلاحيات
    /// </summary>
    /// <returns>قائمة باستخدام كل صلاحية</returns>
    Task<IEnumerable<PermissionUsageDto>> GetPermissionUsageAsync();

    /// <summary>
    /// الحصول على صلاحيات دور محدد
    /// </summary>
    /// <param name="roleId">معرف الدور</param>
    /// <returns>قائمة بالصلاحيات</returns>
    Task<IEnumerable<PermissionDto>> GetRolePermissionsAsync(int roleId);

    /// <summary>
    /// الحصول على الصلاحيات المتاحة لدور محدد
    /// </summary>
    /// <param name="roleId">معرف الدور</param>
    /// <returns>قائمة بالصلاحيات المتاحة</returns>
    Task<IEnumerable<PermissionDto>> GetAvailablePermissionsForRoleAsync(int roleId);

    /// <summary>
    /// ربط صلاحية بدور
    /// </summary>
    /// <param name="roleId">معرف الدور</param>
    /// <param name="permissionId">معرف الصلاحية</param>
    /// <returns>true إذا تم الربط بنجاح، false إذا فشل</returns>
    Task<bool> AssignPermissionToRoleAsync(int roleId, int permissionId);

    /// <summary>
    /// إزالة صلاحية من دور
    /// </summary>
    /// <param name="roleId">معرف الدور</param>
    /// <param name="permissionId">معرف الصلاحية</param>
    /// <returns>true إذا تم الإزالة بنجاح، false إذا فشل</returns>
    Task<bool> RevokePermissionFromRoleAsync(int roleId, int permissionId);

    /// <summary>
    /// ربط عدة صلاحيات بدور
    /// </summary>
    /// <param name="roleId">معرف الدور</param>
    /// <param name="permissionIds">قائمة معرفات الصلاحيات</param>
    /// <returns>true إذا تم الربط بنجاح، false إذا فشل</returns>
    Task<bool> AssignMultiplePermissionsToRoleAsync(int roleId, List<int> permissionIds);

    /// <summary>
    /// إزالة جميع صلاحيات دور
    /// </summary>
    /// <param name="roleId">معرف الدور</param>
    /// <returns>true إذا تم الإزالة بنجاح، false إذا فشل</returns>
    Task<bool> RevokeAllPermissionsFromRoleAsync(int roleId);

    /// <summary>
    /// التحقق من وجود صلاحية لدور
    /// </summary>
    /// <param name="roleId">معرف الدور</param>
    /// <param name="permissionId">معرف الصلاحية</param>
    /// <returns>true إذا كانت موجودة، false إذا لم تكن</returns>
    Task<bool> RoleHasPermissionAsync(int roleId, int permissionId);

    /// <summary>
    /// الحصول على أسماء الصلاحيات النظامية
    /// </summary>
    /// <returns>قائمة بأسماء الصلاحيات النظامية</returns>
    Task<IEnumerable<string>> GetSystemPermissionNames();

    /// <summary>
    /// إنشاء الصلاحيات النظامية
    /// </summary>
    /// <returns>true إذا تم الإنشاء بنجاح، false إذا فشل</returns>
    Task<bool> CreateSystemPermissionsAsync();

    /// <summary>
    /// الحصول على الأدوار التي تستخدم صلاحية محددة
    /// </summary>
    /// <param name="permissionId">معرف الصلاحية</param>
    /// <returns>قائمة بالأدوار</returns>
    Task<IEnumerable<RoleDto>> GetRolesByPermissionAsync(int permissionId);
}
