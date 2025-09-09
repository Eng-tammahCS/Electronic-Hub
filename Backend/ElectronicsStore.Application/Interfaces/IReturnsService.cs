using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

/// <summary>
/// واجهة خدمات المرتجعات المشتركة والتقارير
/// </summary>
public interface IReturnsService
{
    /// <summary>
    /// الحصول على ملخص شامل للمرتجعات
    /// </summary>
    /// <returns>ملخص المرتجعات مع الإحصائيات</returns>
    Task<ReturnsSummaryDto> GetReturnsSummaryAsync();

    /// <summary>
    /// الحصول على أكثر المنتجات إرجاعاً
    /// </summary>
    /// <param name="topCount">عدد المنتجات المطلوب عرضها (افتراضي: 10)</param>
    /// <returns>قائمة بأكثر المنتجات إرجاعاً</returns>
    Task<IEnumerable<TopReturnedProductDto>> GetTopReturnedProductsAsync(int topCount = 10);

    /// <summary>
    /// الحصول على أكثر أسباب الإرجاع
    /// </summary>
    /// <param name="topCount">عدد الأسباب المطلوب عرضها (افتراضي: 10)</param>
    /// <returns>قائمة بأكثر أسباب الإرجاع</returns>
    Task<IEnumerable<TopReturnReasonDto>> GetTopReturnReasonsAsync(int topCount = 10);

    /// <summary>
    /// الحصول على إحصائيات المرتجعات لفترة زمنية محددة
    /// </summary>
    /// <param name="startDate">تاريخ البداية</param>
    /// <param name="endDate">تاريخ النهاية</param>
    /// <returns>إحصائيات المرتجعات للفترة المحددة</returns>
    Task<object> GetReturnsStatsByDateRangeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// التحقق من إمكانية إرجاع منتج من فاتورة بيع
    /// </summary>
    /// <param name="salesInvoiceId">معرف فاتورة البيع</param>
    /// <param name="productId">معرف المنتج</param>
    /// <param name="quantity">الكمية المطلوب إرجاعها</param>
    /// <returns>true إذا كان الإرجاع ممكناً، false إذا لم يكن ممكناً</returns>
    Task<bool> CanReturnSalesItemAsync(int salesInvoiceId, int productId, int quantity);

    /// <summary>
    /// التحقق من إمكانية إرجاع منتج من فاتورة شراء
    /// </summary>
    /// <param name="purchaseInvoiceId">معرف فاتورة الشراء</param>
    /// <param name="productId">معرف المنتج</param>
    /// <param name="quantity">الكمية المطلوب إرجاعها</param>
    /// <returns>true إذا كان الإرجاع ممكناً، false إذا لم يكن ممكناً</returns>
    Task<bool> CanReturnPurchaseItemAsync(int purchaseInvoiceId, int productId, int quantity);
}
