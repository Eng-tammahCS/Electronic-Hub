using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesInvoicesController : ControllerBase
{
    private readonly ISalesInvoiceService _salesInvoiceService;

    public SalesInvoicesController(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesInvoiceDto>>> GetAllSalesInvoices()
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل فواتير البيع", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SalesInvoiceDto>> GetSalesInvoice(int id)
    {
        try
        {
            var invoice = await _salesInvoiceService.GetSalesInvoiceByIdAsync(id);
            if (invoice == null)
                return NotFound(new { message = "فاتورة البيع غير موجودة" });

            return Ok(invoice);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل فاتورة البيع", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<SalesInvoiceDto>> CreateSalesInvoice(CreateSalesInvoiceDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: Get actual user ID from authentication
            int userId = 1;

            var invoice = await _salesInvoiceService.CreateSalesInvoiceAsync(dto, userId);
            return CreatedAtAction(nameof(GetSalesInvoice), new { id = invoice.Id }, invoice);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في إنشاء فاتورة البيع", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSalesInvoice(int id)
    {
        try
        {
            await _salesInvoiceService.DeleteSalesInvoiceAsync(id);
            return Ok(new { message = "تم حذف فاتورة البيع بنجاح" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في حذف فاتورة البيع", error = ex.Message });
        }
    }

    [HttpGet("by-customer/{customerName}")]
    public async Task<ActionResult<IEnumerable<SalesInvoiceDto>>> GetSalesInvoicesByCustomer(string customerName)
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();
            var filteredInvoices = invoices.Where(i => 
                !string.IsNullOrEmpty(i.CustomerName) && 
                i.CustomerName.Contains(customerName, StringComparison.OrdinalIgnoreCase));
            
            return Ok(filteredInvoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في البحث عن فواتير العميل", error = ex.Message });
        }
    }

    [HttpGet("by-date")]
    public async Task<ActionResult<IEnumerable<SalesInvoiceDto>>> GetSalesInvoicesByDateRange(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();
            
            if (startDate.HasValue)
                invoices = invoices.Where(i => i.InvoiceDate >= startDate.Value);
            
            if (endDate.HasValue)
                invoices = invoices.Where(i => i.InvoiceDate <= endDate.Value);
            
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في البحث عن الفواتير بالتاريخ", error = ex.Message });
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult> GetSalesSummary()
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();
            
            var today = DateTime.Today;
            var thisMonth = new DateTime(today.Year, today.Month, 1);
            
            var summary = new
            {
                TotalInvoices = invoices.Count(),
                TotalSalesAmount = invoices.Sum(i => i.TotalAmount),
                TodaySales = invoices.Where(i => i.InvoiceDate.Date == today).Sum(i => i.TotalAmount),
                ThisMonthSales = invoices.Where(i => i.InvoiceDate >= thisMonth).Sum(i => i.TotalAmount),
                AverageInvoiceAmount = invoices.Any() ? invoices.Average(i => i.TotalAmount) : 0,
                TotalCustomers = invoices.Where(i => !string.IsNullOrEmpty(i.CustomerName))
                                       .Select(i => i.CustomerName).Distinct().Count()
            };
            
            return Ok(summary);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل ملخص المبيعات", error = ex.Message });
        }
    }

    [HttpGet("Statistics")]
    public async Task<ActionResult<object>> GetSalesStatistics()
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();
            
            var statistics = new
            {
                TotalInvoices = invoices.Count(),
                TotalSales = invoices.Sum(i => i.TotalAmount),
                TotalDiscounts = invoices.Sum(i => i.DiscountTotal)
            };
            
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل إحصائيات المبيعات", error = ex.Message });
        }
    }
}
