using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.Strategies.PricingStrategies;
using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.WebAPI.Controllers;

/// <summary>
/// Controller لاختبار استراتيجيات التسعير
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PricingController : ControllerBase
{
    private readonly PricingContext _pricingContext;

    public PricingController(PricingContext pricingContext)
    {
        _pricingContext = pricingContext;
    }

    /// <summary>
    /// حساب السعر النهائي لمنتج معين لعميل معين
    /// </summary>
    [HttpGet("calculate-price")]
    public async Task<IActionResult> CalculatePrice(
        [FromQuery] decimal basePrice,
        [FromQuery] string customerName)
    {
        try
        {
            var finalPrice = await _pricingContext.CalculatePriceAsync(basePrice, customerName);
            var strategyName = _pricingContext.GetCurrentStrategyName();

            return Ok(new
            {
                success = true,
                data = new
                {
                    basePrice = basePrice,
                    finalPrice = finalPrice,
                    appliedDiscount = basePrice - finalPrice,
                    strategyUsed = strategyName,
                    customerName = customerName
                }
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
    /// حساب إجمالي الفاتورة مع الخصومات
    /// </summary>
    [HttpPost("calculate-total")]
    public async Task<IActionResult> CalculateTotal([FromBody] CalculateTotalRequest request)
    {
        try
        {
            var total = await _pricingContext.CalculateTotalAsync(request.Items, request.CustomerName);
            var strategyName = _pricingContext.GetCurrentStrategyName();

            return Ok(new
            {
                success = true,
                data = new
                {
                    originalTotal = request.Items.Sum(i => i.Quantity * i.UnitPrice),
                    finalTotal = total,
                    totalDiscount = request.Items.Sum(i => i.Quantity * i.UnitPrice) - total,
                    strategyUsed = strategyName,
                    customerName = request.CustomerName,
                    itemCount = request.Items.Count()
                }
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
    /// الحصول على معلومات العميل واستراتيجيته
    /// </summary>
    [HttpGet("customer-info")]
    public async Task<IActionResult> GetCustomerInfo([FromQuery] string customerName)
    {
        try
        {
            // محاولة حساب سعر وهمي لتحديد الاستراتيجية
            await _pricingContext.CalculatePriceAsync(100, customerName);
            var strategyName = _pricingContext.GetCurrentStrategyName();

            return Ok(new
            {
                success = true,
                data = new
                {
                    customerName = customerName,
                    strategyUsed = strategyName,
                    description = GetStrategyDescription(strategyName)
                }
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
    /// الحصول على جميع الاستراتيجيات المتاحة
    /// </summary>
    [HttpGet("strategies")]
    public IActionResult GetAvailableStrategies()
    {
        var strategies = new[]
        {
            new { name = "Regular", description = "العملاء العاديين - سعر كامل" },
            new { name = "VIP", description = "العملاء المميزين - خصم 15%" },
            new { name = "Wholesale", description = "العملاء بالجملة - خصم 25%" },
            new { name = "New Customer", description = "العملاء الجدد - خصم 10%" }
        };

        return Ok(new
        {
            success = true,
            data = strategies
        });
    }

    private string GetStrategyDescription(string strategyName)
    {
        return strategyName switch
        {
            "Regular" => "استراتيجية العملاء العاديين - يدفعون السعر الكامل",
            "VIP" => "استراتيجية العملاء المميزين - يحصلون على خصم 15%",
            "Wholesale" => "استراتيجية العملاء بالجملة - يحصلون على خصم 25%",
            "New Customer" => "استراتيجية العملاء الجدد - يحصلون على خصم 10%",
            _ => "استراتيجية غير محددة"
        };
    }
}

// DTO للطلبات
public class CalculateTotalRequest
{
    public IEnumerable<CreateSalesInvoiceDetailDto> Items { get; set; } = new List<CreateSalesInvoiceDetailDto>();
    public string CustomerName { get; set; } = string.Empty;
}
