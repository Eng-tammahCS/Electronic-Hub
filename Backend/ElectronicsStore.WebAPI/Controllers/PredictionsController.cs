using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PredictionsController : ControllerBase
{
    private readonly ISalesPredictionService _predictionService;
    private readonly ILogger<PredictionsController> _logger;

    public PredictionsController(
        ISalesPredictionService predictionService,
        ILogger<PredictionsController> logger)
    {
        _predictionService = predictionService;
        _logger = logger;
    }

    /// <summary>
    /// الحصول على تنبؤ مبيعات الغد
    /// </summary>
    /// <returns>تنبؤ مبيعات الغد</returns>
    [HttpGet("tomorrow")]
    [ProducesResponseType(typeof(SalesPredictionDto), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<SalesPredictionDto>> GetTomorrowPrediction()
    {
        try
        {
            _logger.LogInformation("طلب تنبؤ مبيعات الغد من المستخدم: {UserId}", GetCurrentUserId());
            
            var prediction = await _predictionService.GetTomorrowPredictionAsync();
            
            _logger.LogInformation("تم جلب تنبؤ الغد بنجاح - القيمة: {PredictedSales}", prediction.PredictedSales);
            
            return Ok(prediction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في جلب تنبؤ الغد");
            return StatusCode(500, new { 
                error = "حدث خطأ في جلب التنبؤ",
                details = ex.Message 
            });
        }
    }

    /// <summary>
    /// الحصول على تنبؤ مبيعات تاريخ محدد
    /// </summary>
    /// <param name="date">التاريخ المطلوب التنبؤ له</param>
    /// <returns>تنبؤ مبيعات التاريخ المحدد</returns>
    [HttpGet("date/{date}")]
    [ProducesResponseType(typeof(SalesPredictionDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<SalesPredictionDto>> GetPredictionByDate(DateTime date)
    {
        try
        {
            if (date < DateTime.Today)
            {
                return BadRequest(new { error = "لا يمكن التنبؤ بالتواريخ الماضية" });
            }

            _logger.LogInformation("طلب تنبؤ مبيعات للتاريخ {Date} من المستخدم: {UserId}", date, GetCurrentUserId());
            
            var prediction = await _predictionService.GetPredictionByDateAsync(date);
            
            _logger.LogInformation("تم جلب التنبؤ للتاريخ {Date} بنجاح - القيمة: {PredictedSales}", date, prediction.PredictedSales);
            
            return Ok(prediction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في جلب التنبؤ للتاريخ {Date}", date);
            return StatusCode(500, new { 
                error = "حدث خطأ في جلب التنبؤ",
                details = ex.Message 
            });
        }
    }

    /// <summary>
    /// فحص حالة خدمة التنبؤ
    /// </summary>
    /// <returns>حالة الخدمة</returns>
    [HttpGet("status")]
    [ProducesResponseType(typeof(object), 200)]
    public async Task<ActionResult<object>> GetServiceStatus()
    {
        try
        {
            var isAvailable = await _predictionService.IsServiceAvailableAsync();
            
            return Ok(new {
                isAvailable = isAvailable,
                message = isAvailable ? "خدمة التنبؤ متاحة" : "خدمة التنبؤ غير متاحة",
                timestamp = DateTime.UtcNow,
                mlServiceUrl = "http://localhost:5000"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في فحص حالة الخدمة");
            return Ok(new {
                isAvailable = false,
                message = "خطأ في فحص حالة الخدمة",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// الحصول على معلومات النموذج
    /// </summary>
    /// <returns>معلومات النموذج</returns>
    [HttpGet("model-info")]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<object>> GetModelInfo()
    {
        try
        {
            // يمكن إضافة endpoint في Python ML للحصول على معلومات النموذج
            return Ok(new {
                modelName = "Random Forest",
                accuracy = "95%",
                features = 45,
                trainingData = "427 يوم (2023-2024)",
                lastTraining = "2024-03-31",
                predictionType = "اليوم التالي فقط"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في جلب معلومات النموذج");
            return StatusCode(500, new { error = "خطأ في جلب معلومات النموذج" });
        }
    }

    private string? GetCurrentUserId()
    {
        // يمكن إضافة منطق للحصول على معرف المستخدم الحالي
        return User?.Identity?.Name ?? "Unknown";
    }
}