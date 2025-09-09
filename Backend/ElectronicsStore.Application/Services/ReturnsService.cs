using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Interfaces;

namespace ElectronicsStore.Application.Services;

/// <summary>
/// خدمات المرتجعات المشتركة والتقارير
/// </summary>
public class ReturnsService : IReturnsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISalesReturnService _salesReturnService;
    private readonly IPurchaseReturnService _purchaseReturnService;

    public ReturnsService(
        IUnitOfWork unitOfWork,
        ISalesReturnService salesReturnService,
        IPurchaseReturnService purchaseReturnService)
    {
        _unitOfWork = unitOfWork;
        _salesReturnService = salesReturnService;
        _purchaseReturnService = purchaseReturnService;
    }

    public async Task<ReturnsSummaryDto> GetReturnsSummaryAsync()
    {
        var salesReturns = await _salesReturnService.GetAllSalesReturnsAsync();
        var purchaseReturns = await _purchaseReturnService.GetAllPurchaseReturnsAsync();

        var today = DateTime.Today;
        var thisMonth = new DateTime(today.Year, today.Month, 1);

        // إحصائيات مرتجعات المبيعات
        var todaySalesReturns = salesReturns.Where(r => r.CreatedAt.Date == today);
        var thisMonthSalesReturns = salesReturns.Where(r => r.CreatedAt >= thisMonth);

        // إحصائيات مرتجعات المشتريات
        var todayPurchaseReturns = purchaseReturns.Where(r => r.CreatedAt.Date == today);
        var thisMonthPurchaseReturns = purchaseReturns.Where(r => r.CreatedAt >= thisMonth);

        var summary = new ReturnsSummaryDto
        {
            // مرتجعات المبيعات
            TotalSalesReturns = salesReturns.Count(),
            TotalSalesReturnAmount = salesReturns.Sum(r => r.TotalReturnAmount),
            TodaySalesReturns = todaySalesReturns.Count(),
            TodaySalesReturnAmount = todaySalesReturns.Sum(r => r.TotalReturnAmount),
            ThisMonthSalesReturns = thisMonthSalesReturns.Count(),
            ThisMonthSalesReturnAmount = thisMonthSalesReturns.Sum(r => r.TotalReturnAmount),

            // مرتجعات المشتريات
            TotalPurchaseReturns = purchaseReturns.Count(),
            TotalPurchaseReturnAmount = purchaseReturns.Sum(r => r.TotalReturnAmount),
            TodayPurchaseReturns = todayPurchaseReturns.Count(),
            TodayPurchaseReturnAmount = todayPurchaseReturns.Sum(r => r.TotalReturnAmount),
            ThisMonthPurchaseReturns = thisMonthPurchaseReturns.Count(),
            ThisMonthPurchaseReturnAmount = thisMonthPurchaseReturns.Sum(r => r.TotalReturnAmount),

            // أكثر المنتجات إرجاعاً
            TopReturnedProducts = (await GetTopReturnedProductsAsync(5)).ToList(),

            // أكثر أسباب الإرجاع
            TopReturnReasons = (await GetTopReturnReasonsAsync(5)).ToList()
        };

        return summary;
    }

    public async Task<IEnumerable<TopReturnedProductDto>> GetTopReturnedProductsAsync(int topCount = 10)
    {
        var salesReturns = await _salesReturnService.GetAllSalesReturnsAsync();
        var purchaseReturns = await _purchaseReturnService.GetAllPurchaseReturnsAsync();

        // تجميع المرتجعات حسب المنتج
        var productReturns = new Dictionary<int, TopReturnedProductDto>();

        // إضافة مرتجعات المبيعات
        foreach (var salesReturn in salesReturns)
        {
            if (!productReturns.ContainsKey(salesReturn.ProductId))
            {
                productReturns[salesReturn.ProductId] = new TopReturnedProductDto
                {
                    ProductId = salesReturn.ProductId,
                    ProductName = salesReturn.ProductName,
                    TotalReturns = 0,
                    SalesReturns = 0,
                    PurchaseReturns = 0,
                    TotalReturnAmount = 0
                };
            }

            var product = productReturns[salesReturn.ProductId];
            product.TotalReturns += salesReturn.Quantity;
            product.SalesReturns += salesReturn.Quantity;
            product.TotalReturnAmount += salesReturn.TotalReturnAmount;
        }

        // إضافة مرتجعات المشتريات
        foreach (var purchaseReturn in purchaseReturns)
        {
            if (!productReturns.ContainsKey(purchaseReturn.ProductId))
            {
                productReturns[purchaseReturn.ProductId] = new TopReturnedProductDto
                {
                    ProductId = purchaseReturn.ProductId,
                    ProductName = purchaseReturn.ProductName,
                    TotalReturns = 0,
                    SalesReturns = 0,
                    PurchaseReturns = 0,
                    TotalReturnAmount = 0
                };
            }

            var product = productReturns[purchaseReturn.ProductId];
            product.TotalReturns += purchaseReturn.Quantity;
            product.PurchaseReturns += purchaseReturn.Quantity;
            product.TotalReturnAmount += purchaseReturn.TotalReturnAmount;
        }

        return productReturns.Values
            .OrderByDescending(p => p.TotalReturns)
            .Take(topCount);
    }

    public async Task<IEnumerable<TopReturnReasonDto>> GetTopReturnReasonsAsync(int topCount = 10)
    {
        var salesReturns = await _salesReturnService.GetAllSalesReturnsAsync();
        var purchaseReturns = await _purchaseReturnService.GetAllPurchaseReturnsAsync();

        // تجميع جميع الأسباب
        var allReasons = new List<string>();
        allReasons.AddRange(salesReturns.Where(r => !string.IsNullOrEmpty(r.Reason)).Select(r => r.Reason!));
        allReasons.AddRange(purchaseReturns.Where(r => !string.IsNullOrEmpty(r.Reason)).Select(r => r.Reason!));

        if (!allReasons.Any())
            return new List<TopReturnReasonDto>();

        var totalCount = allReasons.Count;
        var reasonGroups = allReasons
            .GroupBy(r => r, StringComparer.OrdinalIgnoreCase)
            .Select(g => new TopReturnReasonDto
            {
                Reason = g.Key,
                Count = g.Count(),
                Percentage = Math.Round((decimal)g.Count() / totalCount * 100, 2)
            })
            .OrderByDescending(r => r.Count)
            .Take(topCount);

        return reasonGroups;
    }

    public async Task<object> GetReturnsStatsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var salesReturns = await _salesReturnService.GetReturnsByDateRangeAsync(startDate, endDate);
        var purchaseReturns = await _purchaseReturnService.GetReturnsByDateRangeAsync(startDate, endDate);

        return new
        {
            DateRange = new { StartDate = startDate, EndDate = endDate },
            SalesReturns = new
            {
                Count = salesReturns.Count(),
                TotalAmount = salesReturns.Sum(r => r.TotalReturnAmount),
                TotalQuantity = salesReturns.Sum(r => r.Quantity)
            },
            PurchaseReturns = new
            {
                Count = purchaseReturns.Count(),
                TotalAmount = purchaseReturns.Sum(r => r.TotalReturnAmount),
                TotalQuantity = purchaseReturns.Sum(r => r.Quantity)
            },
            Combined = new
            {
                TotalReturns = salesReturns.Count() + purchaseReturns.Count(),
                TotalAmount = salesReturns.Sum(r => r.TotalReturnAmount) + purchaseReturns.Sum(r => r.TotalReturnAmount),
                TotalQuantity = salesReturns.Sum(r => r.Quantity) + purchaseReturns.Sum(r => r.Quantity)
            }
        };
    }

    public async Task<bool> CanReturnSalesItemAsync(int salesInvoiceId, int productId, int quantity)
    {
        try
        {
            // التحقق من وجود الفاتورة والمنتج
            var salesInvoice = await _unitOfWork.SalesInvoices.GetByIdAsync(salesInvoiceId);
            if (salesInvoice == null) return false;

            var product = await _unitOfWork.Products.GetByIdAsync(productId);
            if (product == null) return false;

            // التحقق من وجود المنتج في الفاتورة
            var invoiceDetails = await _unitOfWork.SalesInvoiceDetails.FindAsync(d => 
                d.SalesInvoiceId == salesInvoiceId && d.ProductId == productId);
            
            var detail = invoiceDetails.FirstOrDefault();
            if (detail == null) return false;

            // حساب الكمية المتاحة للإرجاع
            var existingReturns = await _unitOfWork.SalesReturns.FindAsync(r => 
                r.SalesInvoiceId == salesInvoiceId && r.ProductId == productId);
            
            var totalReturnedQuantity = existingReturns.Sum(r => r.Quantity);
            var availableQuantity = detail.Quantity - totalReturnedQuantity;

            return quantity > 0 && quantity <= availableQuantity;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> CanReturnPurchaseItemAsync(int purchaseInvoiceId, int productId, int quantity)
    {
        try
        {
            // التحقق من وجود الفاتورة والمنتج
            var purchaseInvoice = await _unitOfWork.PurchaseInvoices.GetByIdAsync(purchaseInvoiceId);
            if (purchaseInvoice == null) return false;

            var product = await _unitOfWork.Products.GetByIdAsync(productId);
            if (product == null) return false;

            // التحقق من وجود المنتج في الفاتورة
            var invoiceDetails = await _unitOfWork.PurchaseInvoiceDetails.FindAsync(d => 
                d.PurchaseInvoiceId == purchaseInvoiceId && d.ProductId == productId);
            
            var detail = invoiceDetails.FirstOrDefault();
            if (detail == null) return false;

            // حساب الكمية المتاحة للإرجاع
            var existingReturns = await _unitOfWork.PurchaseReturns.FindAsync(r => 
                r.PurchaseInvoiceId == purchaseInvoiceId && r.ProductId == productId);
            
            var totalReturnedQuantity = existingReturns.Sum(r => r.Quantity);
            var availableQuantity = detail.Quantity - totalReturnedQuantity;

            return quantity > 0 && quantity <= availableQuantity;
        }
        catch
        {
            return false;
        }
    }
}
