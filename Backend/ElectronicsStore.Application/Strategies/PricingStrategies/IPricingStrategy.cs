using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Strategies.PricingStrategies;

/// <summary>
/// واجهة استراتيجية التسعير
/// </summary>
public interface IPricingStrategy
{
    /// <summary>
    /// حساب السعر النهائي للمنتج بناءً على نوع العميل
    /// </summary>
    /// <param name="basePrice">السعر الأساسي للمنتج</param>
    /// <param name="customerName">اسم العميل</param>
    /// <returns>السعر النهائي بعد التطبيق الخصومات</returns>
    Task<decimal> CalculatePriceAsync(decimal basePrice, string customerName);

    /// <summary>
    /// حساب إجمالي الفاتورة مع الخصومات
    /// </summary>
    /// <param name="items">عناصر الفاتورة</param>
    /// <param name="customerName">اسم العميل</param>
    /// <returns>إجمالي الفاتورة بعد الخصومات</returns>
    Task<decimal> CalculateTotalAsync(IEnumerable<CreateSalesInvoiceDetailDto> items, string customerName);

    /// <summary>
    /// اسم الاستراتيجية
    /// </summary>
    string StrategyName { get; }
}
