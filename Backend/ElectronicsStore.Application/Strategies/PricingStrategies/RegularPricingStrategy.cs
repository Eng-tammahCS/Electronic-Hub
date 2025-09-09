using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.Application.Strategies.PricingStrategies;

/// <summary>
/// استراتيجية تسعير العملاء العاديين
/// </summary>
public class RegularPricingStrategy : IPricingStrategy
{
    private readonly ISalesInvoiceService _salesInvoiceService;

    public RegularPricingStrategy(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
    }

    public string StrategyName => "Regular";

    public Task<decimal> CalculatePriceAsync(decimal basePrice, string customerName)
    {
        // العملاء العاديين يدفعون السعر الكامل
        return Task.FromResult(basePrice);
    }

    public Task<decimal> CalculateTotalAsync(IEnumerable<CreateSalesInvoiceDetailDto> items, string customerName)
    {
        decimal total = 0;

        foreach (var item in items)
        {
            var lineTotal = item.Quantity * item.UnitPrice;
            total += lineTotal - item.DiscountAmount;
        }

        return Task.FromResult(total);
    }
}
