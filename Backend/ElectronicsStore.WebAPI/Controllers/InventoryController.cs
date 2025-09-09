using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet("report")]
    public async Task<ActionResult<InventoryReportDto>> GetInventoryReport()
    {
        try
        {
            var report = await _inventoryService.GetInventoryReportAsync();
            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل تقرير المخزون", error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryDto>>> GetAllInventory()
    {
        try
        {
            var inventory = await _inventoryService.GetAllInventoryAsync();
            return Ok(inventory);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المخزون", error = ex.Message });
        }
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<InventoryDto>> GetProductInventory(int productId)
    {
        try
        {
            var inventory = await _inventoryService.GetProductInventoryAsync(productId);
            if (inventory == null)
            {
                return NotFound(new { message = "المنتج غير موجود" });
            }
            return Ok(inventory);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مخزون المنتج", error = ex.Message });
        }
    }

    [HttpGet("movements")]
    public async Task<ActionResult<IEnumerable<InventoryMovementDto>>> GetAllInventoryMovements()
    {
        try
        {
            var movements = await _inventoryService.GetAllInventoryMovementsAsync();
            return Ok(movements);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل حركات المخزون", error = ex.Message });
        }
    }

    [HttpGet("movements/product/{productId}")]
    public async Task<ActionResult<IEnumerable<InventoryMovementDto>>> GetInventoryMovements(int productId)
    {
        try
        {
            var movements = await _inventoryService.GetInventoryMovementsAsync(productId);
            return Ok(movements);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل حركات المنتج", error = ex.Message });
        }
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<InventoryDto>>> GetLowStockItems([FromQuery] int threshold = 10)
    {
        try
        {
            var items = await _inventoryService.GetLowStockItemsAsync(threshold);
            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المنتجات قليلة المخزون", error = ex.Message });
        }
    }

    [HttpGet("out-of-stock")]
    public async Task<ActionResult<IEnumerable<InventoryDto>>> GetOutOfStockItems()
    {
        try
        {
            var items = await _inventoryService.GetOutOfStockItemsAsync();
            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المنتجات المنتهية", error = ex.Message });
        }
    }

    [HttpPost("adjust")]
    public async Task<IActionResult> AdjustInventory(InventoryAdjustmentDto adjustmentDto)
    {
        try
        {
            // TODO: Get actual user ID from authentication
            int userId = 1; // Temporary hardcoded value
            
            var result = await _inventoryService.AdjustInventoryAsync(adjustmentDto, userId);
            if (!result)
            {
                return NotFound(new { message = "المنتج غير موجود" });
            }
            
            return Ok(new { message = "تم تعديل المخزون بنجاح" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "خطأ في تعديل المخزون", error = ex.Message });
        }
    }
}
