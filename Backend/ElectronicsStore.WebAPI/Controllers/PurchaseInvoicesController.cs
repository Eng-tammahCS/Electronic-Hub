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

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetPurchaseStatistics()
    {
        try
        {
            var invoices = await _purchaseInvoiceService.GetAllPurchaseInvoicesAsync();
            var invoiceList = invoices.ToList();

            var totalInvoices = invoiceList.Count;
            var totalAmount = invoiceList.Sum(i => i.TotalAmount);
            var completedInvoices = invoiceList.Count(i => (DateTime.Now - i.InvoiceDate).TotalDays > 1);
            var pendingInvoices = totalInvoices - completedInvoices;
            var averageAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0;

            // This month statistics
            var thisMonth = DateTime.Now.Month;
            var thisYear = DateTime.Now.Year;
            var thisMonthInvoices = invoiceList.Where(i => i.InvoiceDate.Month == thisMonth && i.InvoiceDate.Year == thisYear).ToList();
            var thisMonthCount = thisMonthInvoices.Count;
            var thisMonthAmount = thisMonthInvoices.Sum(i => i.TotalAmount);

            return Ok(new
            {
                totalInvoices,
                totalAmount,
                completedInvoices,
                pendingInvoices,
                averageAmount,
                thisMonthCount,
                thisMonthAmount
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل الإحصائيات", error = ex.Message });
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

    [HttpPut("{id}")]
    public async Task<ActionResult<PurchaseInvoiceDto>> UpdatePurchaseInvoice(int id, UpdatePurchaseInvoiceDto updatePurchaseInvoiceDto)
    {
        try
        {
            // Set the ID from the URL parameter to ensure consistency
            updatePurchaseInvoiceDto.Id = id;
            
            var invoice = await _purchaseInvoiceService.UpdatePurchaseInvoiceAsync(updatePurchaseInvoiceDto);
            return Ok(invoice);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "خطأ في تحديث فاتورة الشراء", error = ex.Message });
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
