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
            Console.WriteLine("=== GetPurchaseInvoices START ===");
            Console.WriteLine("Starting to fetch purchase invoices...");
            
            var invoices = await _purchaseInvoiceService.GetAllPurchaseInvoicesAsync();
            Console.WriteLine($"Found {invoices?.Count() ?? 0} purchase invoices");
            
            if (invoices == null)
            {
                Console.WriteLine("Service returned null invoices");
                return Ok(new List<PurchaseInvoiceDto>());
            }
            
            Console.WriteLine("=== GetPurchaseInvoices SUCCESS ===");
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            Console.WriteLine("=== GetPurchaseInvoices ERROR ===");
            Console.WriteLine($"Error fetching purchase invoices: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = "خطأ في تحميل فواتير الشراء", error = ex.Message });
        }
    }

    [HttpGet("test")]
    public async Task<ActionResult<object>> TestPurchaseInvoices()
    {
        try
        {
            Console.WriteLine("Testing purchase invoices endpoint...");
            var invoices = await _purchaseInvoiceService.GetAllPurchaseInvoicesAsync();
            return Ok(new { 
                message = "Test successful", 
                count = invoices.Count(),
                invoices = invoices.Take(3) // Return first 3 invoices for testing
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Test error: {ex.Message}");
            return StatusCode(500, new { message = "Test failed", error = ex.Message });
        }
    }

    [HttpGet("simple")]
    public async Task<ActionResult<object>> GetSimplePurchaseInvoices()
    {
        try
        {
            Console.WriteLine("Getting simple purchase invoices...");
            return Ok(new { 
                message = "Simple endpoint works", 
                count = 0,
                invoices = new List<object>()
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Simple error: {ex.Message}");
            return StatusCode(500, new { message = "Simple failed", error = ex.Message });
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
            // Get user ID from authentication context
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return BadRequest(new { message = "خطأ في المصادقة: لم يتم العثور على معرف المستخدم" });
            }
            
            Console.WriteLine($"Creating purchase invoice for user ID: {userId}");
            Console.WriteLine($"Invoice data: {System.Text.Json.JsonSerializer.Serialize(createPurchaseInvoiceDto)}");
            
            var invoice = await _purchaseInvoiceService.CreatePurchaseInvoiceAsync(createPurchaseInvoiceDto, userId);
            return CreatedAtAction(nameof(GetPurchaseInvoice), new { id = invoice.Id }, invoice);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating purchase invoice: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { message = "خطأ في إنشاء فاتورة الشراء", error = ex.Message });
        }
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetPurchaseStats()
    {
        try
        {
            Console.WriteLine("Fetching purchase stats...");
            var invoices = await _purchaseInvoiceService.GetAllPurchaseInvoicesAsync();
            Console.WriteLine($"Found {invoices.Count()} invoices for stats");
            
            var today = DateTime.Today;
            var thisMonth = new DateTime(today.Year, today.Month, 1);
            
            var stats = new
            {
                TotalInvoices = invoices.Count(),
                TotalAmount = invoices.Sum(i => i.TotalAmount),
                CompletedInvoices = invoices.Count(i => i.InvoiceDate.Date < today.AddDays(-1)),
                PendingInvoices = invoices.Count(i => i.InvoiceDate.Date >= today.AddDays(-1)),
                AverageAmount = invoices.Any() ? invoices.Average(i => i.TotalAmount) : 0,
                ThisMonthInvoices = invoices.Count(i => i.InvoiceDate >= thisMonth),
                ThisMonthAmount = invoices.Where(i => i.InvoiceDate >= thisMonth).Sum(i => i.TotalAmount)
            };
            
            Console.WriteLine($"Stats calculated: {stats.TotalInvoices} total invoices");
            return Ok(stats);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching stats: {ex.Message}");
            return StatusCode(500, new { message = "خطأ في تحميل إحصائيات فواتير الشراء", error = ex.Message });
        }
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<object>> GetPurchaseInvoicesPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? supplierId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            Console.WriteLine("=== GetPurchaseInvoicesPaginated START ===");
            Console.WriteLine($"Parameters - Page: {page}, PageSize: {pageSize}, SearchTerm: {searchTerm}, SupplierId: {supplierId}");
            Console.WriteLine($"StartDate: {startDate}, EndDate: {endDate}");
            
            Console.WriteLine("Calling _purchaseInvoiceService.GetAllPurchaseInvoicesAsync()...");
            var invoices = await _purchaseInvoiceService.GetAllPurchaseInvoicesAsync();
            Console.WriteLine($"Service returned {invoices?.Count() ?? 0} invoices");
            
            if (invoices == null)
            {
                Console.WriteLine("ERROR: Service returned null invoices");
                return StatusCode(500, new { message = "Service returned null invoices" });
            }
            
            // If no invoices found, return empty result
            if (!invoices.Any())
            {
                Console.WriteLine("No invoices found, returning empty result");
                return Ok(new
                {
                    Data = new List<object>(),
                    TotalCount = 0,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = 0
                });
            }
            
            Console.WriteLine("Applying filters...");
            // Apply filters
            if (!string.IsNullOrEmpty(searchTerm))
            {
                Console.WriteLine($"Applying search filter: {searchTerm}");
                invoices = invoices.Where(i => 
                    i.InvoiceNumber.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    i.SupplierName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
                Console.WriteLine($"After search filter: {invoices.Count()} invoices");
            }
            
            if (supplierId.HasValue)
            {
                Console.WriteLine($"Applying supplier filter: {supplierId}");
                invoices = invoices.Where(i => i.SupplierId == supplierId.Value);
                Console.WriteLine($"After supplier filter: {invoices.Count()} invoices");
            }
            
            if (startDate.HasValue)
            {
                Console.WriteLine($"Applying start date filter: {startDate}");
                invoices = invoices.Where(i => i.InvoiceDate >= startDate.Value);
                Console.WriteLine($"After start date filter: {invoices.Count()} invoices");
            }
            
            if (endDate.HasValue)
            {
                Console.WriteLine($"Applying end date filter: {endDate}");
                invoices = invoices.Where(i => i.InvoiceDate <= endDate.Value);
                Console.WriteLine($"After end date filter: {invoices.Count()} invoices");
            }
            
            var totalCount = invoices.Count();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
            
            Console.WriteLine($"Total count after filters: {totalCount}");
            Console.WriteLine($"Total pages: {totalPages}");
            
            var paginatedInvoices = invoices
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
            Console.WriteLine($"Paginated invoices count: {paginatedInvoices.Count}");
            
            var result = new
            {
                Data = paginatedInvoices,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
            
            Console.WriteLine("=== GetPurchaseInvoicesPaginated SUCCESS ===");
            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GetPurchaseInvoicesPaginated ERROR ===");
            Console.WriteLine($"Error message: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = "خطأ في تحميل فواتير الشراء مع التصفح", error = ex.Message });
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<PurchaseInvoiceDto>>> SearchPurchaseInvoices([FromQuery] string searchTerm)
    {
        try
        {
            var invoices = await _purchaseInvoiceService.GetAllPurchaseInvoicesAsync();
            
            var filteredInvoices = invoices.Where(i => 
                i.InvoiceNumber.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                i.SupplierName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
            
            return Ok(filteredInvoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في البحث في فواتير الشراء", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PurchaseInvoiceDto>> UpdatePurchaseInvoice(int id, UpdatePurchaseInvoiceDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "بيانات غير صحيحة", errors = ModelState });
            }

            // TODO: Get actual user ID from authentication
            int userId = 1;

            var invoice = await _purchaseInvoiceService.UpdatePurchaseInvoiceAsync(id, dto, userId);
            if (invoice == null)
                return NotFound(new { message = "فاتورة الشراء غير موجودة" });

            return Ok(invoice);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحديث فاتورة الشراء", error = ex.Message });
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
