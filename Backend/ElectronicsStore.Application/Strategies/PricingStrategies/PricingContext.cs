using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.Application.Strategies.PricingStrategies;

/// <summary>
/// سياق التسعير - يختار الاستراتيجية المناسبة لكل عميل
/// </summary>
public class PricingContext
{
    private readonly ISalesInvoiceService _salesInvoiceService;
    private IPricingStrategy _currentStrategy;

    public PricingContext(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
        _currentStrategy = new RegularPricingStrategy(salesInvoiceService);
    }

    /// <summary>
    /// تعيين الاستراتيجية الحالية
    /// </summary>
    public void SetStrategy(IPricingStrategy strategy)
    {
        _currentStrategy = strategy;
    }

    /// <summary>
    /// حساب السعر باستخدام الاستراتيجية الحالية
    /// </summary>
    public async Task<decimal> CalculatePriceAsync(decimal basePrice, string customerName)
    {
        var strategy = await GetStrategyForCustomerAsync(customerName);
        return await strategy.CalculatePriceAsync(basePrice, customerName);
    }

    /// <summary>
    /// حساب إجمالي الفاتورة باستخدام الاستراتيجية الحالية
    /// </summary>
    public async Task<decimal> CalculateTotalAsync(IEnumerable<CreateSalesInvoiceDetailDto> items, string customerName)
    {
        var strategy = await GetStrategyForCustomerAsync(customerName);
        return await strategy.CalculateTotalAsync(items, customerName);
    }

    /// <summary>
    /// تحديد الاستراتيجية المناسبة للعميل بناءً على سجله
    /// </summary>
    private async Task<IPricingStrategy> GetStrategyForCustomerAsync(string customerName)
    {
        if (string.IsNullOrWhiteSpace(customerName))
        {
            return new RegularPricingStrategy(_salesInvoiceService);
        }

        try
        {
            // الحصول على جميع فواتير العميل
            var allInvoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();
            var customerInvoices = allInvoices.Where(i =>
                !string.IsNullOrEmpty(i.CustomerName) &&
                i.CustomerName.Trim().Equals(customerName.Trim(), StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (!customerInvoices.Any())
            {
                // عميل جديد
                return new NewCustomerPricingStrategy(_salesInvoiceService);
            }

            // حساب إحصائيات العميل
            var totalSpent = customerInvoices.Sum(i => i.TotalAmount);
            var totalOrders = customerInvoices.Count;
            var firstOrderDate = customerInvoices.Min(i => i.InvoiceDate);
            var lastOrderDate = customerInvoices.Max(i => i.InvoiceDate);
            var daysSinceFirstOrder = (DateTime.Now - firstOrderDate).TotalDays;
            var averageOrderValue = totalSpent / totalOrders;

            // منطق تحديد نوع العميل
            if (totalSpent >= 100000) // إنفاق أكثر من 100,000
            {
                return new VipPricingStrategy(_salesInvoiceService);
            }
            else if (totalOrders >= 20 && averageOrderValue >= 5000) // 20 طلب أو أكثر بمتوسط 5,000
            {
                return new WholesalePricingStrategy(_salesInvoiceService);
            }
            else if (totalSpent >= 50000) // إنفاق أكثر من 50,000
            {
                return new VipPricingStrategy(_salesInvoiceService);
            }
            else if (daysSinceFirstOrder <= 30) // عميل جديد (أقل من شهر)
            {
                return new NewCustomerPricingStrategy(_salesInvoiceService);
            }
            else
            {
                return new RegularPricingStrategy(_salesInvoiceService);
            }
        }
        catch (Exception)
        {
            // في حالة الخطأ، نعود للاستراتيجية العادية
            return new RegularPricingStrategy(_salesInvoiceService);
        }
    }

    /// <summary>
    /// الحصول على اسم الاستراتيجية الحالية
    /// </summary>
    public string GetCurrentStrategyName()
    {
        return _currentStrategy.StrategyName;
    }
}
