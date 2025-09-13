using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Domain.Enums;
using System.Text;
using OfficeOpenXml;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;

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
            return Ok(new { success = true, data = invoices });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "خطأ في تحميل فواتير البيع", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SalesInvoiceDto>> GetSalesInvoice(int id)
    {
        try
        {
            var invoice = await _salesInvoiceService.GetSalesInvoiceByIdAsync(id);
            if (invoice == null)
                return NotFound(new { success = false, message = "فاتورة البيع غير موجودة" });

            return Ok(new { success = true, data = invoice });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "خطأ في تحميل فاتورة البيع", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<SalesInvoiceDto>> CreateSalesInvoice(CreateSalesInvoiceDto dto)
    {
        try
        {
            // Log the received data for debugging
            Console.WriteLine($"Received DTO: InvoiceNumber={dto.InvoiceNumber}, CustomerName={dto.CustomerName}, PaymentMethod={dto.PaymentMethod}, DetailsCount={dto.Details?.Count ?? 0}");
            Console.WriteLine($"PaymentMethod type: {dto.PaymentMethod.GetType()}, Value: {dto.PaymentMethod}");
            Console.WriteLine($"CustomerName bytes: {System.Text.Encoding.UTF8.GetBytes(dto.CustomerName ?? "")}");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine($"ModelState errors: {string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))}");
                return BadRequest(new { message = "بيانات غير صحيحة", errors = ModelState });
            }

            // TODO: Get actual user ID from authentication
            int userId = 1;

            var invoice = await _salesInvoiceService.CreateSalesInvoiceAsync(dto, userId);
            return CreatedAtAction(nameof(GetSalesInvoice), new { id = invoice.Id }, invoice);
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"ArgumentException: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
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

    [HttpPut("{id}")]
    public async Task<ActionResult<SalesInvoiceDto>> UpdateSalesInvoice(int id, UpdateSalesInvoiceDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "بيانات غير صحيحة", errors = ModelState });
            }

            // TODO: Get actual user ID from authentication
            int userId = 1;

            var invoice = await _salesInvoiceService.UpdateSalesInvoiceAsync(id, dto, userId);
            if (invoice == null)
                return NotFound(new { message = "فاتورة البيع غير موجودة" });

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
            return StatusCode(500, new { message = "خطأ في تحديث فاتورة البيع", error = ex.Message });
        }
    }

    [HttpGet("{id}/details")]
    public async Task<ActionResult<SalesInvoiceDto>> GetSalesInvoiceDetails(int id)
    {
        try
        {
            var invoice = await _salesInvoiceService.GetSalesInvoiceByIdAsync(id);
            if (invoice == null)
                return NotFound(new { success = false, message = "فاتورة البيع غير موجودة" });

            return Ok(new { success = true, data = invoice });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "خطأ في تحميل تفاصيل فاتورة البيع", error = ex.Message });
        }
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? customerName,
        [FromQuery] int? paymentMethod)
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();

            // Apply filters
            if (startDate.HasValue)
                invoices = invoices.Where(i => i.InvoiceDate >= startDate.Value);
            
            if (endDate.HasValue)
                invoices = invoices.Where(i => i.InvoiceDate <= endDate.Value);
            
            if (!string.IsNullOrEmpty(customerName))
                invoices = invoices.Where(i => i.CustomerName != null && 
                    i.CustomerName.Contains(customerName, StringComparison.OrdinalIgnoreCase));
            
            if (paymentMethod.HasValue)
                invoices = invoices.Where(i => (int)i.PaymentMethod == paymentMethod.Value);

            // Create Excel package
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("فواتير المبيعات");

            // Add headers
            worksheet.Cells[1, 1].Value = "رقم الفاتورة";
            worksheet.Cells[1, 2].Value = "اسم العميل";
            worksheet.Cells[1, 3].Value = "تاريخ الفاتورة";
            worksheet.Cells[1, 4].Value = "طريقة الدفع";
            worksheet.Cells[1, 5].Value = "إجمالي الخصم";
            worksheet.Cells[1, 6].Value = "إجمالي المبلغ";
            worksheet.Cells[1, 7].Value = "اسم المستخدم";
            worksheet.Cells[1, 8].Value = "تاريخ الإنشاء";

            // Add data
            int row = 2;
            foreach (var invoice in invoices)
            {
                worksheet.Cells[row, 1].Value = invoice.InvoiceNumber;
                worksheet.Cells[row, 2].Value = invoice.CustomerName ?? "غير محدد";
                worksheet.Cells[row, 3].Value = invoice.InvoiceDate.ToString("yyyy-MM-dd");
                worksheet.Cells[row, 4].Value = GetPaymentMethodText(invoice.PaymentMethod);
                worksheet.Cells[row, 5].Value = invoice.DiscountTotal;
                worksheet.Cells[row, 6].Value = invoice.TotalAmount;
                worksheet.Cells[row, 7].Value = invoice.Username;
                worksheet.Cells[row, 8].Value = invoice.CreatedAt.ToString("yyyy-MM-dd HH:mm");
                row++;
            }

            // Auto-fit columns
            worksheet.Cells.AutoFitColumns();

            var stream = new MemoryStream();
            await package.SaveAsAsync(stream);
            stream.Position = 0;

            var fileName = $"فواتير_المبيعات_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(stream.ToArray(), 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تصدير البيانات", error = ex.Message });
        }
    }

    [HttpGet("export/pdf/{id}")]
    public async Task<IActionResult> ExportToPdf(int id)
    {
        try
        {
            var invoice = await _salesInvoiceService.GetSalesInvoiceByIdAsync(id);
            if (invoice == null)
                return NotFound(new { message = "فاتورة البيع غير موجودة" });

            using var stream = new MemoryStream();
            var writer = new PdfWriter(stream);
            var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

            // Title
            var title = new Paragraph("فاتورة مبيعات")
                .SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER)
                .SetFontSize(16)
                .SetBold();
            document.Add(title);

            document.Add(new Paragraph(" ")); // Empty line

            // Invoice details
            var invoiceInfo = new Paragraph()
                .Add("رقم الفاتورة: ").Add(invoice.InvoiceNumber)
                .Add("\nاسم العميل: ").Add(invoice.CustomerName ?? "غير محدد")
                .Add("\nتاريخ الفاتورة: ").Add(invoice.InvoiceDate.ToString("yyyy-MM-dd"))
                .Add("\nطريقة الدفع: ").Add(GetPaymentMethodText(invoice.PaymentMethod));
            document.Add(invoiceInfo);

            document.Add(new Paragraph(" ")); // Empty line

            // Items table
            var table = new Table(5);
            table.SetWidth(UnitValue.CreatePercentValue(100));

            // Table headers
            table.AddHeaderCell(new Cell().Add(new Paragraph("المنتج").SetBold()).SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER));
            table.AddHeaderCell(new Cell().Add(new Paragraph("الكمية").SetBold()).SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER));
            table.AddHeaderCell(new Cell().Add(new Paragraph("سعر الوحدة").SetBold()).SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER));
            table.AddHeaderCell(new Cell().Add(new Paragraph("الخصم").SetBold()).SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER));
            table.AddHeaderCell(new Cell().Add(new Paragraph("المجموع").SetBold()).SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER));

            // Table data
            foreach (var detail in invoice.Details)
            {
                table.AddCell(new Cell().Add(new Paragraph(detail.ProductName)));
                table.AddCell(new Cell().Add(new Paragraph(detail.Quantity.ToString())).SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER));
                table.AddCell(new Cell().Add(new Paragraph(detail.UnitPrice.ToString("F2"))).SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER));
                table.AddCell(new Cell().Add(new Paragraph(detail.DiscountAmount.ToString("F2"))).SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER));
                table.AddCell(new Cell().Add(new Paragraph(detail.LineTotal.ToString("F2"))).SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER));
            }

            document.Add(table);

            document.Add(new Paragraph(" ")); // Empty line

            // Totals
            var totals = new Paragraph()
                .Add("إجمالي الخصم: ").Add(invoice.DiscountTotal.ToString("F2"))
                .Add("\nإجمالي المبلغ: ").Add(invoice.TotalAmount.ToString("F2"));
            document.Add(totals);

            document.Close();

            var fileName = $"فاتورة_مبيعات_{invoice.InvoiceNumber}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
            return File(stream.ToArray(), "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تصدير الفاتورة", error = ex.Message });
        }
    }

    [HttpGet("paged")]
    public async Task<ActionResult<object>> GetPagedSalesInvoices(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null,
        [FromQuery] int? paymentMethod = null,
        [FromQuery] string? sortBy = "InvoiceDate",
        [FromQuery] string? sortDirection = "desc")
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();

            // Apply search filter
            if (!string.IsNullOrEmpty(searchTerm))
            {
                invoices = invoices.Where(i => 
                    i.InvoiceNumber.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    (i.CustomerName != null && i.CustomerName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)) ||
                    i.Username.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
            }

            // Apply date filters
            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var startDateParsed))
                invoices = invoices.Where(i => i.InvoiceDate >= startDateParsed);
            
            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var endDateParsed))
                invoices = invoices.Where(i => i.InvoiceDate <= endDateParsed);

            // Apply payment method filter
            if (paymentMethod.HasValue)
                invoices = invoices.Where(i => (int)i.PaymentMethod == paymentMethod.Value);

            // Apply sorting
            invoices = sortBy.ToLower() switch
            {
                "invoicenumber" => sortDirection.ToLower() == "asc" 
                    ? invoices.OrderBy(i => i.InvoiceNumber)
                    : invoices.OrderByDescending(i => i.InvoiceNumber),
                "customername" => sortDirection.ToLower() == "asc"
                    ? invoices.OrderBy(i => i.CustomerName ?? "")
                    : invoices.OrderByDescending(i => i.CustomerName ?? ""),
                "totalamount" => sortDirection.ToLower() == "asc"
                    ? invoices.OrderBy(i => i.TotalAmount)
                    : invoices.OrderByDescending(i => i.TotalAmount),
                "paymentmethod" => sortDirection.ToLower() == "asc"
                    ? invoices.OrderBy(i => i.PaymentMethod)
                    : invoices.OrderByDescending(i => i.PaymentMethod),
                _ => sortDirection.ToLower() == "asc"
                    ? invoices.OrderBy(i => i.InvoiceDate)
                    : invoices.OrderByDescending(i => i.InvoiceDate)
            };

            // Calculate pagination
            var totalCount = invoices.Count();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
            var pagedInvoices = invoices.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var result = new
            {
                Data = pagedInvoices,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                HasNextPage = page < totalPages,
                HasPreviousPage = page > 1
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل فواتير المبيعات", error = ex.Message });
        }
    }

    // Return functionality will be added later
    // Endpoints will be added when return feature is implemented

    private string GetPaymentMethodText(PaymentMethod paymentMethod)
    {
        return paymentMethod switch
        {
            PaymentMethod.Cash => "نقدي",
            PaymentMethod.Card => "بطاقة ائتمان",
            PaymentMethod.Deferred => "آجل",
            _ => "غير محدد"
        };
    }
}

// DTO for return invoice request
public class ReturnInvoiceRequestDto
{
    public string? Reason { get; set; }
}
