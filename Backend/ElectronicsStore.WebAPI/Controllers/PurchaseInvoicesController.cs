using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseInvoicesController : ControllerBase
{
    private readonly IPurchaseInvoiceService _purchaseInvoiceService;

    public PurchaseInvoicesController(IPurchaseInvoiceService purchaseInvoiceService)
    {
        _purchaseInvoiceService = purchaseInvoiceService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseInvoiceDto>>> GetPurchaseInvoices()
    {
        try
        {
            var invoices = await _purchaseInvoiceService.GetAllPurchaseInvoicesAsync();
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل فواتير الشراء", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseInvoiceDto>> GetPurchaseInvoice(int id)
    {
        try
        {
            var invoice = await _purchaseInvoiceService.GetPurchaseInvoiceByIdAsync(id);
            if (invoice == null)
            {
                return NotFound(new { message = "فاتورة الشراء غير موجودة" });
            }
            return Ok(invoice);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل فاتورة الشراء", error = ex.Message });
        }
    }

    [HttpGet("supplier/{supplierId}")]
    public async Task<ActionResult<IEnumerable<PurchaseInvoiceDto>>> GetPurchaseInvoicesBySupplier(int supplierId)
    {
        try
        {
            var invoices = await _purchaseInvoiceService.GetPurchaseInvoicesBySupplierAsync(supplierId);
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل فواتير المورد", error = ex.Message });
        }
    }

    [HttpGet("date-range")]
    public async Task<ActionResult<IEnumerable<PurchaseInvoiceDto>>> GetPurchaseInvoicesByDateRange(
        [FromQuery] DateTime startDate, 
        [FromQuery] DateTime endDate)
    {
        try
        {
            var invoices = await _purchaseInvoiceService.GetPurchaseInvoicesByDateRangeAsync(startDate, endDate);
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل فواتير الفترة المحددة", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseInvoiceDto>> CreatePurchaseInvoice(CreatePurchaseInvoiceDto createPurchaseInvoiceDto)
    {
        try
        {
            // TODO: Get actual user ID from authentication
            int userId = 1; // Temporary hardcoded value
            
            var invoice = await _purchaseInvoiceService.CreatePurchaseInvoiceAsync(createPurchaseInvoiceDto, userId);
            return CreatedAtAction(nameof(GetPurchaseInvoice), new { id = invoice.Id }, invoice);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "خطأ في إنشاء فاتورة الشراء", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePurchaseInvoice(int id)
    {
        try
        {
            var result = await _purchaseInvoiceService.DeletePurchaseInvoiceAsync(id);
            if (!result)
            {
                return NotFound(new { message = "فاتورة الشراء غير موجودة" });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في حذف فاتورة الشراء", error = ex.Message });
        }
    }
}
