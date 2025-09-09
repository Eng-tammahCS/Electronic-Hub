using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.Application.Strategies.PricingStrategies;

/// <summary>
/// استراتيجية تسعير العملاء المميزين (VIP)
/// </summary>
public class VipPricingStrategy : IPricingStrategy
{
    private readonly ISalesInvoiceService _salesInvoiceService;

    public VipPricingStrategy(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
    }

    public string StrategyName => "VIP";

    public Task<decimal> CalculatePriceAsync(decimal basePrice, string customerName)
    {
        // العملاء المميزين يحصلون على خصم 15%
        var discount = basePrice * 0.15m;
        return Task.FromResult(basePrice - discount);
    }

    public Task<decimal> CalculateTotalAsync(IEnumerable<CreateSalesInvoiceDetailDto> items, string customerName)
    {
        decimal total = 0;

        foreach (var item in items)
        {
            var lineTotal = item.Quantity * item.UnitPrice;
            // تطبيق خصم إضافي 15% على السعر الأساسي
            var vipDiscount = (item.UnitPrice * item.Quantity) * 0.15m;
            total += lineTotal - item.DiscountAmount - vipDiscount;
        }

        return Task.FromResult(total);
    }
}
