using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.Strategies.PricingStrategies;

namespace ElectronicsStore.Application.Strategies.Facades;

/// <summary>
/// Facade للعمليات التجارية المعقدة
/// يوفر واجهة مبسطة للعمليات المعقدة في النظام
/// </summary>
public class BusinessOperationsFacade
{
    private readonly IProductService _productService;
    private readonly ISalesInvoiceService _salesInvoiceService;
    private readonly IInventoryService _inventoryService;
    private readonly PricingContext _pricingContext;

    public BusinessOperationsFacade(
        IProductService productService,
        ISalesInvoiceService salesInvoiceService,
        IInventoryService inventoryService,
        PricingContext pricingContext)
    {
        _productService = productService;
        _salesInvoiceService = salesInvoiceService;
        _inventoryService = inventoryService;
        _pricingContext = pricingContext;
    }

    /// <summary>
    /// إنشاء فاتورة مبيعات مع تطبيق الخصومات الذكية
    /// </summary>
    public async Task<SalesInvoiceDto> CreateSmartSalesInvoiceAsync(CreateSalesInvoiceDto invoiceDto)
    {
        // التحقق من توفر المنتجات في المخزون
        foreach (var item in invoiceDto.Details)
        {
            var product = await _productService.GetProductByIdAsync(item.ProductId);
            if (product == null)
            {
                throw new ArgumentException($"المنتج رقم {item.ProductId} غير موجود");
            }

            var inventoryStatus = await _inventoryService.GetProductInventoryAsync(item.ProductId);
            if (inventoryStatus?.CurrentQuantity < item.Quantity)
            {
                throw new InvalidOperationException(
                    $"الكمية المطلوبة من المنتج '{product.Name}' غير متوفرة في المخزون");
            }
        }

        // حساب الأسعار مع تطبيق الخصومات الذكية
        var totalWithDiscounts = await _pricingContext.CalculateTotalAsync(
            invoiceDto.Details, invoiceDto.CustomerName ?? "عميل غير محدد");

        // تعديل الفاتورة بالأسعار المحسوبة
        invoiceDto.DiscountTotal = (invoiceDto.Details.Sum(d => d.Quantity * d.UnitPrice) - totalWithDiscounts);

        // إنشاء الفاتورة (سيقوم بتحديث المخزون تلقائياً)
        var invoice = await _salesInvoiceService.CreateSalesInvoiceAsync(invoiceDto);

        // لا حاجة لتحديث المخزون مرة أخرى لأن SalesInvoiceService يقوم بذلك
        return invoice;
    }

    /// <summary>
    /// الحصول على تقرير شامل عن المنتجات والمبيعات
    /// </summary>
    public async Task<BusinessReportDto> GetBusinessReportAsync(DateTime startDate, DateTime endDate)
    {
        // الحصول على المنتجات الأكثر مبيعاً
        var topProducts = await GetTopSellingProductsAsync(startDate, endDate, 10);

        // الحصول على إحصائيات المبيعات
        var salesStats = await GetSalesStatisticsAsync(startDate, endDate);

        // الحصول على حالة المخزون
        var inventoryStatus = await GetInventoryStatusAsync();

        // الحصول على أداء العملاء
        var customerPerformance = await GetCustomerPerformanceAsync(startDate, endDate);

        return new BusinessReportDto
        {
            StartDate = startDate,
            EndDate = endDate,
            TopSellingProducts = topProducts,
            SalesStatistics = salesStats,
            InventoryStatus = inventoryStatus,
            CustomerPerformance = customerPerformance
        };
    }

    /// <summary>
    /// إدارة طلب المنتج مع التحقق من المخزون والأسعار
    /// </summary>
    public async Task<ProductOrderResultDto> ProcessProductOrderAsync(int productId, int quantity, string customerName)
    {
        var product = await _productService.GetProductByIdAsync(productId);
        if (product == null)
        {
            return new ProductOrderResultDto
            {
                Success = false,
                Message = "المنتج غير موجود"
            };
        }

        var inventoryStatus = await _inventoryService.GetProductInventoryAsync(productId);
        if (inventoryStatus?.CurrentQuantity < quantity)
        {
            return new ProductOrderResultDto
            {
                Success = false,
                Message = $"الكمية المطلوبة غير متوفرة. المتوفر: {inventoryStatus?.CurrentQuantity ?? 0}",
                AvailableQuantity = inventoryStatus?.CurrentQuantity ?? 0
            };
        }

        // حساب السعر مع الخصومات
        var finalPrice = await _pricingContext.CalculatePriceAsync(product.DefaultSellingPrice, customerName);
        var totalPrice = finalPrice * quantity;

        return new ProductOrderResultDto
        {
            Success = true,
            Message = "الطلب جاهز للتنفيذ",
            ProductId = productId,
            ProductName = product.Name,
            RequestedQuantity = quantity,
            AvailableQuantity = inventoryStatus?.CurrentQuantity ?? 0,
            UnitPrice = finalPrice,
            TotalPrice = totalPrice,
            AppliedDiscount = product.DefaultSellingPrice - finalPrice
        };
    }

    /// <summary>
    /// إدارة عملية الإرجاع مع تحديث المخزون والحسابات
    /// </summary>
    public async Task<ReturnResultDto> ProcessReturnAsync(int salesInvoiceId, List<ReturnItemDto> returnItems)
    {
        var invoice = await _salesInvoiceService.GetSalesInvoiceByIdAsync(salesInvoiceId);
        if (invoice == null)
        {
            return new ReturnResultDto
            {
                Success = false,
                Message = "فاتورة المبيعات غير موجودة"
            };
        }

        decimal totalRefund = 0;
        var processedItems = new List<ProcessedReturnItemDto>();

        foreach (var returnItem in returnItems)
        {
            var invoiceDetail = invoice.Details.FirstOrDefault(d => d.ProductId == returnItem.ProductId);
            if (invoiceDetail == null)
            {
                return new ReturnResultDto
                {
                    Success = false,
                    Message = $"المنتج {returnItem.ProductId} غير موجود في الفاتورة"
                };
            }

            if (returnItem.Quantity > invoiceDetail.Quantity)
            {
                return new ReturnResultDto
                {
                    Success = false,
                    Message = $"كمية الإرجاع أكبر من الكمية المباعة للمنتج {returnItem.ProductId}"
                };
            }

            // حساب مبلغ الاسترداد
            var refundAmount = (invoiceDetail.LineTotal / invoiceDetail.Quantity) * returnItem.Quantity;
            totalRefund += refundAmount;

            // تحديث المخزون
            await _inventoryService.UpdateStockAsync(returnItem.ProductId, returnItem.Quantity);

            processedItems.Add(new ProcessedReturnItemDto
            {
                ProductId = returnItem.ProductId,
                ProductName = invoiceDetail.ProductName,
                ReturnedQuantity = returnItem.Quantity,
                RefundAmount = refundAmount
            });
        }

        return new ReturnResultDto
        {
            Success = true,
            Message = "تمت معالجة الإرجاع بنجاح",
            TotalRefund = totalRefund,
            ProcessedItems = processedItems
        };
    }

    // الطرق المساعدة
    private async Task<List<TopSellingProductDto>> GetTopSellingProductsAsync(DateTime startDate, DateTime endDate, int count)
    {
        var invoices = await _salesInvoiceService.GetSalesInvoicesByDateRangeAsync(startDate, endDate);
        var productSales = new Dictionary<int, (string Name, int Quantity, decimal Revenue)>();

        foreach (var invoice in invoices)
        {
            foreach (var detail in invoice.Details)
            {
                if (productSales.ContainsKey(detail.ProductId))
                {
                    var current = productSales[detail.ProductId];
                    productSales[detail.ProductId] = (
                        current.Name,
                        current.Quantity + detail.Quantity,
                        current.Revenue + detail.LineTotal
                    );
                }
                else
                {
                    productSales[detail.ProductId] = (
                        detail.ProductName,
                        detail.Quantity,
                        detail.LineTotal
                    );
                }
            }
        }

        return productSales
            .OrderByDescending(p => p.Value.Quantity)
            .Take(count)
            .Select(p => new TopSellingProductDto
            {
                ProductId = p.Key,
                ProductName = p.Value.Name,
                TotalQuantity = p.Value.Quantity,
                TotalRevenue = p.Value.Revenue
            })
            .ToList();
    }

    private async Task<SalesStatisticsDto> GetSalesStatisticsAsync(DateTime startDate, DateTime endDate)
    {
        var invoices = await _salesInvoiceService.GetSalesInvoicesByDateRangeAsync(startDate, endDate);

        return new SalesStatisticsDto
        {
            TotalInvoices = invoices.Count(),
            TotalRevenue = invoices.Sum(i => i.TotalAmount),
            TotalDiscounts = invoices.Sum(i => i.DiscountTotal),
            AverageInvoiceValue = invoices.Any() ? invoices.Average(i => i.TotalAmount) : 0,
            PeriodDays = (endDate - startDate).Days + 1
        };
    }

    private async Task<InventoryStatusDto> GetInventoryStatusAsync()
    {
        var inventoryReport = await _inventoryService.GetInventoryReportAsync();

        return new InventoryStatusDto
        {
            TotalProducts = inventoryReport.TotalProducts,
            TotalValue = inventoryReport.TotalInventoryValue,
            LowStockItems = inventoryReport.LowStockItems,
            OutOfStockItems = inventoryReport.OutOfStockItems
        };
    }

    private async Task<List<CustomerPerformanceDto>> GetCustomerPerformanceAsync(DateTime startDate, DateTime endDate)
    {
        var invoices = await _salesInvoiceService.GetSalesInvoicesByDateRangeAsync(startDate, endDate);

        return invoices
            .Where(i => !string.IsNullOrEmpty(i.CustomerName))
            .GroupBy(i => i.CustomerName)
            .Select(g => new CustomerPerformanceDto
            {
                CustomerName = g.Key ?? "عميل غير محدد",
                TotalOrders = g.Count(),
                TotalSpent = g.Sum(i => i.TotalAmount),
                AverageOrderValue = g.Average(i => i.TotalAmount),
                LastOrderDate = g.Max(i => i.InvoiceDate)
            })
            .OrderByDescending(c => c.TotalSpent)
            .Take(10)
            .ToList();
    }
}

// DTOs المساعدة
public class BusinessReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<TopSellingProductDto> TopSellingProducts { get; set; } = new();
    public SalesStatisticsDto SalesStatistics { get; set; } = new();
    public InventoryStatusDto InventoryStatus { get; set; } = new();
    public List<CustomerPerformanceDto> CustomerPerformance { get; set; } = new();
}

public class TopSellingProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class SalesStatisticsDto
{
    public int TotalInvoices { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal AverageInvoiceValue { get; set; }
    public int PeriodDays { get; set; }
}

public class InventoryStatusDto
{
    public int TotalProducts { get; set; }
    public decimal TotalValue { get; set; }
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
}

public class CustomerPerformanceDto
{
    public string CustomerName { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal AverageOrderValue { get; set; }
    public DateTime LastOrderDate { get; set; }
}

public class ProductOrderResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int RequestedQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal AppliedDiscount { get; set; }
}

public class ReturnItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class ProcessedReturnItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int ReturnedQuantity { get; set; }
    public decimal RefundAmount { get; set; }
}

public class ReturnResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal TotalRefund { get; set; }
    public List<ProcessedReturnItemDto> ProcessedItems { get; set; } = new();
}
