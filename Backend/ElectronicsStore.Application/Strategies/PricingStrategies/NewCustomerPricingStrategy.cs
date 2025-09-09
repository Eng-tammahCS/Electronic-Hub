using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.Application.Strategies.PricingStrategies;

/// <summary>
/// استراتيجية تسعير العملاء الجدد
/// </summary>
public class NewCustomerPricingStrategy : IPricingStrategy
{
    private readonly ISalesInvoiceService _salesInvoiceService;

    public NewCustomerPricingStrategy(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
    }

    public string StrategyName => "New Customer";

    public Task<decimal> CalculatePriceAsync(decimal basePrice, string customerName)
    {
        // العملاء الجدد يحصلون على خصم 10%
        var discount = basePrice * 0.10m;
        return Task.FromResult(basePrice - discount);
    }

    public Task<decimal> CalculateTotalAsync(IEnumerable<CreateSalesInvoiceDetailDto> items, string customerName)
    {
        decimal total = 0;

        foreach (var item in items)
        {
            var lineTotal = item.Quantity * item.UnitPrice;
            // تطبيق خصم إضافي 10% على السعر الأساسي
            var newCustomerDiscount = (item.UnitPrice * item.Quantity) * 0.10m;
            total += lineTotal - item.DiscountAmount - newCustomerDiscount;
        }

        return Task.FromResult(total);
    }
}
