using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.Strategies.Facades;
using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.WebAPI.Controllers;

/// <summary>
/// Controller للعمليات التجارية المعقدة باستخدام Facade Pattern
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BusinessController : ControllerBase
{
    private readonly BusinessOperationsFacade _businessFacade;

    public BusinessController(BusinessOperationsFacade businessFacade)
    {
        _businessFacade = businessFacade;
    }

    /// <summary>
    /// إنشاء فاتورة مبيعات ذكية مع تطبيق الخصومات التلقائية
    /// </summary>
    [HttpPost("smart-invoice")]
    public async Task<IActionResult> CreateSmartInvoice([FromBody] CreateSalesInvoiceDto invoiceDto)
    {
        try
        {
            var invoice = await _businessFacade.CreateSmartSalesInvoiceAsync(invoiceDto);
            return Ok(new
            {
                success = true,
                message = "تم إنشاء الفاتورة بنجاح مع تطبيق الخصومات الذكية",
                data = invoice
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// الحصول على تقرير أعمال شامل
    /// </summary>
    [HttpGet("report")]
    public async Task<IActionResult> GetBusinessReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            var report = await _businessFacade.GetBusinessReportAsync(startDate, endDate);
            return Ok(new
            {
                success = true,
                data = report
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// معالجة طلب منتج مع التحقق من المخزون والأسعار
    /// </summary>
    [HttpPost("process-order")]
    public async Task<IActionResult> ProcessProductOrder([FromBody] ProcessOrderRequest request)
    {
        try
        {
            var result = await _businessFacade.ProcessProductOrderAsync(
                request.ProductId,
                request.Quantity,
                request.CustomerName);

            return Ok(new
            {
                success = true,
                data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// معالجة عملية إرجاع
    /// </summary>
    [HttpPost("process-return")]
    public async Task<IActionResult> ProcessReturn([FromBody] ProcessReturnRequest request)
    {
        try
        {
            var result = await _businessFacade.ProcessReturnAsync(
                request.SalesInvoiceId,
                request.ReturnItems);

            return Ok(new
            {
                success = true,
                data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }
}

// DTOs للطلبات
public class ProcessOrderRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string CustomerName { get; set; } = string.Empty;
}

public class ProcessReturnRequest
{
    public int SalesInvoiceId { get; set; }
    public List<ReturnItemDto> ReturnItems { get; set; } = new();
}
