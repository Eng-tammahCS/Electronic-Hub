using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.Application.Strategies.PricingStrategies;

/// <summary>
/// استراتيجية تسعير العملاء بالجملة
/// </summary>
public class WholesalePricingStrategy : IPricingStrategy
{
    private readonly ISalesInvoiceService _salesInvoiceService;

    public WholesalePricingStrategy(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
    }

    public string StrategyName => "Wholesale";

    public Task<decimal> CalculatePriceAsync(decimal basePrice, string customerName)
    {
        // العملاء بالجملة يحصلون على خصم 25%
        var discount = basePrice * 0.25m;
        return Task.FromResult(basePrice - discount);
    }

    public Task<decimal> CalculateTotalAsync(IEnumerable<CreateSalesInvoiceDetailDto> items, string customerName)
    {
        decimal total = 0;

        foreach (var item in items)
        {
            var lineTotal = item.Quantity * item.UnitPrice;
            // تطبيق خصم إضافي 25% على السعر الأساسي
            var wholesaleDiscount = (item.UnitPrice * item.Quantity) * 0.25m;
            total += lineTotal - item.DiscountAmount - wholesaleDiscount;
        }

        return Task.FromResult(total);
    }
}
