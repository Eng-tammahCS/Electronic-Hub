using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

/// <summary>
/// واجهة خدمات مرتجعات المبيعات
/// </summary>
public interface ISalesReturnService
{
    /// <summary>
    /// الحصول على جميع مرتجعات المبيعات
    /// </summary>
    /// <returns>قائمة بجميع مرتجعات المبيعات</returns>
    Task<IEnumerable<SalesReturnDto>> GetAllSalesReturnsAsync();

    /// <summary>
    /// الحصول على مرتجع مبيعات محدد بالمعرف
    /// </summary>
    /// <param name="id">معرف المرتجع</param>
    /// <returns>بيانات المرتجع أو null إذا لم يوجد</returns>
    Task<SalesReturnDto?> GetSalesReturnByIdAsync(int id);

    /// <summary>
    /// إنشاء مرتجع مبيعات جديد
    /// </summary>
    /// <param name="dto">بيانات المرتجع الجديد</param>
    /// <param name="userId">معرف المستخدم الذي ينشئ المرتجع</param>
    /// <returns>بيانات المرتجع المنشأ</returns>
    Task<SalesReturnDto> CreateSalesReturnAsync(CreateSalesReturnDto dto, int userId);

    /// <summary>
    /// تحديث مرتجع مبيعات موجود
    /// </summary>
    /// <param name="id">معرف المرتجع</param>
    /// <param name="dto">البيانات المحدثة</param>
    /// <returns>بيانات المرتجع المحدث</returns>
    Task<SalesReturnDto> UpdateSalesReturnAsync(int id, UpdateSalesReturnDto dto);

    /// <summary>
    /// حذف مرتجع مبيعات
    /// </summary>
    /// <param name="id">معرف المرتجع</param>
    Task DeleteSalesReturnAsync(int id);

    /// <summary>
    /// الحصول على مرتجعات فاتورة بيع محددة
    /// </summary>
    /// <param name="salesInvoiceId">معرف فاتورة البيع</param>
    /// <returns>قائمة بمرتجعات الفاتورة</returns>
    Task<IEnumerable<SalesReturnDto>> GetReturnsBySalesInvoiceAsync(int salesInvoiceId);

    /// <summary>
    /// الحصول على مرتجعات منتج محدد
    /// </summary>
    /// <param name="productId">معرف المنتج</param>
    /// <returns>قائمة بمرتجعات المنتج</returns>
    Task<IEnumerable<SalesReturnDto>> GetReturnsByProductAsync(int productId);

    /// <summary>
    /// الحصول على مرتجعات عميل محدد
    /// </summary>
    /// <param name="customerName">اسم العميل</param>
    /// <returns>قائمة بمرتجعات العميل</returns>
    Task<IEnumerable<SalesReturnDto>> GetReturnsByCustomerAsync(string customerName);

    /// <summary>
    /// الحصول على مرتجعات في فترة زمنية محددة
    /// </summary>
    /// <param name="startDate">تاريخ البداية</param>
    /// <param name="endDate">تاريخ النهاية</param>
    /// <returns>قائمة بالمرتجعات في الفترة المحددة</returns>
    Task<IEnumerable<SalesReturnDto>> GetReturnsByDateRangeAsync(DateTime? startDate, DateTime? endDate);
}
