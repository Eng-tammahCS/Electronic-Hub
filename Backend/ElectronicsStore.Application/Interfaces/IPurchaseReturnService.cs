using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

/// <summary>
/// واجهة خدمات مرتجعات المشتريات
/// </summary>
public interface IPurchaseReturnService
{
    /// <summary>
    /// الحصول على جميع مرتجعات المشتريات
    /// </summary>
    /// <returns>قائمة بجميع مرتجعات المشتريات</returns>
    Task<IEnumerable<PurchaseReturnDto>> GetAllPurchaseReturnsAsync();

    /// <summary>
    /// الحصول على مرتجع مشتريات محدد بالمعرف
    /// </summary>
    /// <param name="id">معرف المرتجع</param>
    /// <returns>بيانات المرتجع أو null إذا لم يوجد</returns>
    Task<PurchaseReturnDto?> GetPurchaseReturnByIdAsync(int id);

    /// <summary>
    /// إنشاء مرتجع مشتريات جديد
    /// </summary>
    /// <param name="dto">بيانات المرتجع الجديد</param>
    /// <param name="userId">معرف المستخدم الذي ينشئ المرتجع</param>
    /// <returns>بيانات المرتجع المنشأ</returns>
    Task<PurchaseReturnDto> CreatePurchaseReturnAsync(CreatePurchaseReturnDto dto, int userId);

    /// <summary>
    /// تحديث مرتجع مشتريات موجود
    /// </summary>
    /// <param name="id">معرف المرتجع</param>
    /// <param name="dto">البيانات المحدثة</param>
    /// <returns>بيانات المرتجع المحدث</returns>
    Task<PurchaseReturnDto> UpdatePurchaseReturnAsync(int id, UpdatePurchaseReturnDto dto);

    /// <summary>
    /// حذف مرتجع مشتريات
    /// </summary>
    /// <param name="id">معرف المرتجع</param>
    Task DeletePurchaseReturnAsync(int id);

    /// <summary>
    /// الحصول على مرتجعات فاتورة شراء محددة
    /// </summary>
    /// <param name="purchaseInvoiceId">معرف فاتورة الشراء</param>
    /// <returns>قائمة بمرتجعات الفاتورة</returns>
    Task<IEnumerable<PurchaseReturnDto>> GetReturnsByPurchaseInvoiceAsync(int purchaseInvoiceId);

    /// <summary>
    /// الحصول على مرتجعات منتج محدد
    /// </summary>
    /// <param name="productId">معرف المنتج</param>
    /// <returns>قائمة بمرتجعات المنتج</returns>
    Task<IEnumerable<PurchaseReturnDto>> GetReturnsByProductAsync(int productId);

    /// <summary>
    /// الحصول على مرتجعات مورد محدد
    /// </summary>
    /// <param name="supplierId">معرف المورد</param>
    /// <returns>قائمة بمرتجعات المورد</returns>
    Task<IEnumerable<PurchaseReturnDto>> GetReturnsBySupplierAsync(int supplierId);

    /// <summary>
    /// الحصول على مرتجعات في فترة زمنية محددة
    /// </summary>
    /// <param name="startDate">تاريخ البداية</param>
    /// <param name="endDate">تاريخ النهاية</param>
    /// <returns>قائمة بالمرتجعات في الفترة المحددة</returns>
    Task<IEnumerable<PurchaseReturnDto>> GetReturnsByDateRangeAsync(DateTime? startDate, DateTime? endDate);
}
