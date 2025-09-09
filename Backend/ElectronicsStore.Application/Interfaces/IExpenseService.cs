using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

/// <summary>
/// واجهة خدمات المصروفات
/// </summary>
public interface IExpenseService
{
    /// <summary>
    /// الحصول على جميع المصروفات
    /// </summary>
    /// <returns>قائمة بجميع المصروفات</returns>
    Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync();

    /// <summary>
    /// الحصول على مصروف محدد بالمعرف
    /// </summary>
    /// <param name="id">معرف المصروف</param>
    /// <returns>بيانات المصروف أو null إذا لم يوجد</returns>
    Task<ExpenseDto?> GetExpenseByIdAsync(int id);

    /// <summary>
    /// إنشاء مصروف جديد
    /// </summary>
    /// <param name="dto">بيانات المصروف الجديد</param>
    /// <param name="userId">معرف المستخدم الذي ينشئ المصروف</param>
    /// <returns>بيانات المصروف المنشأ</returns>
    Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto, int userId);

    /// <summary>
    /// تحديث مصروف موجود
    /// </summary>
    /// <param name="id">معرف المصروف</param>
    /// <param name="dto">البيانات المحدثة</param>
    /// <returns>بيانات المصروف المحدث</returns>
    Task<ExpenseDto> UpdateExpenseAsync(int id, UpdateExpenseDto dto);

    /// <summary>
    /// حذف مصروف
    /// </summary>
    /// <param name="id">معرف المصروف</param>
    Task DeleteExpenseAsync(int id);

    /// <summary>
    /// الحصول على المصروفات حسب النوع
    /// </summary>
    /// <param name="expenseType">نوع المصروف</param>
    /// <returns>قائمة بالمصروفات من النوع المحدد</returns>
    Task<IEnumerable<ExpenseDto>> GetExpensesByTypeAsync(string expenseType);

    /// <summary>
    /// الحصول على المصروفات في فترة زمنية محددة
    /// </summary>
    /// <param name="startDate">تاريخ البداية</param>
    /// <param name="endDate">تاريخ النهاية</param>
    /// <returns>قائمة بالمصروفات في الفترة المحددة</returns>
    Task<IEnumerable<ExpenseDto>> GetExpensesByDateRangeAsync(DateTime? startDate, DateTime? endDate);

    /// <summary>
    /// الحصول على المصروفات حسب المستخدم
    /// </summary>
    /// <param name="userId">معرف المستخدم</param>
    /// <returns>قائمة بمصروفات المستخدم</returns>
    Task<IEnumerable<ExpenseDto>> GetExpensesByUserAsync(int userId);

    /// <summary>
    /// الحصول على ملخص المصروفات
    /// </summary>
    /// <returns>ملخص المصروفات مع الإحصائيات</returns>
    Task<ExpensesSummaryDto> GetExpensesSummaryAsync();

    /// <summary>
    /// الحصول على أكثر أنواع المصروفات
    /// </summary>
    /// <param name="topCount">عدد الأنواع المطلوب عرضها (افتراضي: 10)</param>
    /// <returns>قائمة بأكثر أنواع المصروفات</returns>
    Task<IEnumerable<TopExpenseTypeDto>> GetTopExpenseTypesAsync(int topCount = 10);

    /// <summary>
    /// الحصول على إحصائيات المصروفات لفترة زمنية محددة
    /// </summary>
    /// <param name="startDate">تاريخ البداية</param>
    /// <param name="endDate">تاريخ النهاية</param>
    /// <returns>إحصائيات المصروفات للفترة المحددة</returns>
    Task<object> GetExpensesStatsByDateRangeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// البحث في المصروفات
    /// </summary>
    /// <param name="searchTerm">مصطلح البحث</param>
    /// <returns>قائمة بالمصروفات التي تحتوي على مصطلح البحث</returns>
    Task<IEnumerable<ExpenseDto>> SearchExpensesAsync(string searchTerm);

    /// <summary>
    /// الحصول على أنواع المصروفات المختلفة
    /// </summary>
    /// <returns>قائمة بأنواع المصروفات الموجودة</returns>
    Task<IEnumerable<string>> GetExpenseTypesAsync();
}
