namespace ElectronicsStore.Application.DTOs;

/// <summary>
/// DTO لملخص المرتجعات
/// </summary>
public class ReturnsSummaryDto
{
    // إحصائيات مرتجعات المبيعات
    public int TotalSalesReturns { get; set; }
    public decimal TotalSalesReturnAmount { get; set; }
    public int TodaySalesReturns { get; set; }
    public decimal TodaySalesReturnAmount { get; set; }
    public int ThisMonthSalesReturns { get; set; }
    public decimal ThisMonthSalesReturnAmount { get; set; }
    
    // إحصائيات مرتجعات المشتريات
    public int TotalPurchaseReturns { get; set; }
    public decimal TotalPurchaseReturnAmount { get; set; }
    public int TodayPurchaseReturns { get; set; }
    public decimal TodayPurchaseReturnAmount { get; set; }
    public int ThisMonthPurchaseReturns { get; set; }
    public decimal ThisMonthPurchaseReturnAmount { get; set; }
    
    // أكثر المنتجات إرجاعاً
    public List<TopReturnedProductDto> TopReturnedProducts { get; set; } = new();
    
    // أكثر أسباب الإرجاع
    public List<TopReturnReasonDto> TopReturnReasons { get; set; } = new();
}

/// <summary>
/// DTO لأكثر المنتجات إرجاعاً
/// </summary>
public class TopReturnedProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalReturns { get; set; }
    public int SalesReturns { get; set; }
    public int PurchaseReturns { get; set; }
    public decimal TotalReturnAmount { get; set; }
}

/// <summary>
/// DTO لأكثر أسباب الإرجاع
/// </summary>
public class TopReturnReasonDto
{
    public string Reason { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}
