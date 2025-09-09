using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly IProductService _productService;
    private readonly ISupplierService _supplierService;
    private readonly IInventoryService _inventoryService;

    public DashboardController(
        ICategoryService categoryService,
        IProductService productService,
        ISupplierService supplierService,
        IInventoryService inventoryService)
    {
        _categoryService = categoryService;
        _productService = productService;
        _supplierService = supplierService;
        _inventoryService = inventoryService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult> GetDashboardStats()
    {
        try
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            var products = await _productService.GetAllProductsAsync();
            var suppliers = await _supplierService.GetAllSuppliersAsync();
            var inventoryReport = await _inventoryService.GetInventoryReportAsync();

            var stats = new
            {
                TotalProducts = products.Count(),
                TotalCategories = categories.Count(),
                TotalSuppliers = suppliers.Count(),
                InventoryValue = inventoryReport.TotalInventoryValue,
                LowStockItems = inventoryReport.LowStockItems,
                OutOfStockItems = inventoryReport.OutOfStockItems
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل إحصائيات لوحة التحكم", error = ex.Message });
        }
    }

    [HttpGet("recent-activities")]
    public async Task<ActionResult> GetRecentActivities()
    {
        try
        {
            var recentMovements = await _inventoryService.GetAllInventoryMovementsAsync();
            var recent = recentMovements.Take(10).Select(m => new
            {
                m.Id,
                m.ProductName,
                m.MovementType,
                m.Quantity,
                m.CreatedAt,
                m.Username
            });

            return Ok(recent);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل الأنشطة الحديثة", error = ex.Message });
        }
    }

    [HttpGet("alerts")]
    public async Task<ActionResult> GetAlerts()
    {
        try
        {
            var lowStockItems = await _inventoryService.GetLowStockItemsAsync();
            var outOfStockItems = await _inventoryService.GetOutOfStockItemsAsync();

            var alerts = new
            {
                LowStock = lowStockItems.Select(i => new
                {
                    i.ProductId,
                    i.ProductName,
                    i.CurrentQuantity,
                    Type = "low_stock",
                    Message = $"المنتج {i.ProductName} قليل المخزون ({i.CurrentQuantity} قطعة)"
                }),
                OutOfStock = outOfStockItems.Select(i => new
                {
                    i.ProductId,
                    i.ProductName,
                    i.CurrentQuantity,
                    Type = "out_of_stock",
                    Message = $"المنتج {i.ProductName} منتهي من المخزون"
                })
            };

            return Ok(alerts);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل التنبيهات", error = ex.Message });
        }
    }
}
