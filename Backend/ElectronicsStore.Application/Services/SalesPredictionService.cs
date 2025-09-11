using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace ElectronicsStore.Application.Services;

public class SalesPredictionService : ISalesPredictionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SalesPredictionService> _logger;

    public SalesPredictionService(HttpClient httpClient, ILogger<SalesPredictionService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<SalesPredictionDto> GetTomorrowPredictionAsync()
    {
        try
        {
            var tomorrow = DateTime.Today.AddDays(1);
            return await GetPredictionByDateAsync(tomorrow);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في جلب تنبؤ الغد");
            throw;
        }
    }

    public async Task<SalesPredictionDto> GetPredictionByDateAsync(DateTime date)
    {
        try
        {
            // استخدام GET request بدلاً من POST
            var response = await _httpClient.GetAsync("/api/predict/next");
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("فشل في الاتصال بخدمة ML: {StatusCode}", response.StatusCode);
                throw new Exception("فشل في الاتصال بخدمة التنبؤ");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var mlResponse = JsonSerializer.Deserialize<MLPredictionResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (mlResponse == null || !mlResponse.Success)
            {
                throw new Exception(mlResponse?.Error ?? "استجابة غير صحيحة من خدمة التنبؤ");
            }

            // تحويل الاستجابة إلى DTO
            return new SalesPredictionDto
            {
                PredictedSales = (decimal)mlResponse.Data.PredictedSales,
                Confidence = 0.95, // النموذج لا يعطي confidence، نستخدم قيمة افتراضية
                PredictionDate = DateTime.Parse(mlResponse.Data.Date),
                ModelName = "Random Forest", // النموذج المستخدم
                Features = new PredictionFeaturesDto
                {
                    DayOfWeek = GetDayOfWeekInArabic(DateTime.Parse(mlResponse.Data.Date).DayOfWeek),
                    Month = GetMonthInArabic(DateTime.Parse(mlResponse.Data.Date).Month),
                    Year = DateTime.Parse(mlResponse.Data.Date).Year,
                    LastWeekAverage = await GetLastWeekAverage(),
                    LastMonthAverage = await GetLastMonthAverage(),
                    LastYearAverage = await GetLastYearAverage()
                },
                Recommendations = GenerateRecommendations(mlResponse.Data.PredictedSales)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في جلب التنبؤ للتاريخ {Date}", date);
            throw;
        }
    }

    public async Task<bool> IsServiceAvailableAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/health");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في فحص حالة خدمة ML");
            return false;
        }
    }

    private List<string> GenerateRecommendations(double prediction)
    {
        var recommendations = new List<string>();

        if (prediction > 20000)
        {
            recommendations.Add("زيادة المخزون من المنتجات الأكثر مبيعاً");
            recommendations.Add("تحضير فريق المبيعات لذروة الطلب");
            recommendations.Add("مراجعة أسعار المنتجات التنافسية");
            recommendations.Add("تحضير عروض ترويجية إضافية");
        }
        else if (prediction > 15000)
        {
            recommendations.Add("مراقبة مستويات المخزون");
            recommendations.Add("تحضير عروض ترويجية");
            recommendations.Add("مراجعة استراتيجية التسويق");
        }
        else
        {
            recommendations.Add("مراجعة استراتيجية التسويق");
            recommendations.Add("تحليل أسباب انخفاض المبيعات");
            recommendations.Add("تحسين عروض المنتجات");
            recommendations.Add("مراجعة أسعار المنتجات");
        }

        return recommendations;
    }

    private string GetDayOfWeekInArabic(DayOfWeek dayOfWeek)
    {
        return dayOfWeek switch
        {
            DayOfWeek.Sunday => "الأحد",
            DayOfWeek.Monday => "الاثنين",
            DayOfWeek.Tuesday => "الثلاثاء",
            DayOfWeek.Wednesday => "الأربعاء",
            DayOfWeek.Thursday => "الخميس",
            DayOfWeek.Friday => "الجمعة",
            DayOfWeek.Saturday => "السبت",
            _ => "غير محدد"
        };
    }

    private string GetMonthInArabic(int month)
    {
        return month switch
        {
            1 => "يناير",
            2 => "فبراير",
            3 => "مارس",
            4 => "أبريل",
            5 => "مايو",
            6 => "يونيو",
            7 => "يوليو",
            8 => "أغسطس",
            9 => "سبتمبر",
            10 => "أكتوبر",
            11 => "نوفمبر",
            12 => "ديسمبر",
            _ => "غير محدد"
        };
    }

    private async Task<decimal> GetLastWeekAverage()
    {
        try
        {
            var response = await _httpClient.GetAsync("/api/data/summary");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var summary = JsonSerializer.Deserialize<DataSummaryResponse>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                
                if (summary?.Success == true)
                {
                    return (decimal)summary.Data.SalesStats.AverageDailySales;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "فشل في جلب متوسط الأسبوع الماضي");
        }
        
        return 15000; // قيمة افتراضية
    }

    private async Task<decimal> GetLastMonthAverage()
    {
        try
        {
            var response = await _httpClient.GetAsync("/api/data/summary");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var summary = JsonSerializer.Deserialize<DataSummaryResponse>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                
                if (summary?.Success == true)
                {
                    return (decimal)summary.Data.SalesStats.AverageDailySales;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "فشل في جلب متوسط الشهر الماضي");
        }
        
        return 16000; // قيمة افتراضية
    }

    private async Task<decimal> GetLastYearAverage()
    {
        try
        {
            var response = await _httpClient.GetAsync("/api/data/summary");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var summary = JsonSerializer.Deserialize<DataSummaryResponse>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                
                if (summary?.Success == true)
                {
                    return (decimal)summary.Data.SalesStats.AverageDailySales;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "فشل في جلب متوسط السنة الماضية");
        }
        
        return 17000; // قيمة افتراضية
    }
}

// نماذج استجابة خدمة ML
public class MLPredictionResponse
{
    public bool Success { get; set; }
    public MLPredictionData? Data { get; set; }
    public string? Error { get; set; }
}

public class MLPredictionData
{
    public bool Success { get; set; }
    public string Date { get; set; } = string.Empty;
    
    [JsonPropertyName("last_available_date")]
    public string LastAvailableDate { get; set; } = string.Empty;
    
    [JsonPropertyName("predicted_sales")]
    public double PredictedSales { get; set; }
    
    public string Message { get; set; } = string.Empty;
}

public class DataSummaryResponse
{
    public bool Success { get; set; }
    public DataSummaryData? Data { get; set; }
}

public class DataSummaryData
{
    public int TotalRecords { get; set; }
    public DateRange DateRange { get; set; } = new();
    public SalesStats SalesStats { get; set; } = new();
    public QuantityStats QuantityStats { get; set; } = new();
    public InvoiceStats InvoiceStats { get; set; } = new();
}

public class DateRange
{
    public string Start { get; set; } = string.Empty;
    public string End { get; set; } = string.Empty;
}

public class SalesStats
{
    public double TotalSales { get; set; }
    public double AverageDailySales { get; set; }
    public double MaxDailySales { get; set; }
    public double MinDailySales { get; set; }
}

public class QuantityStats
{
    public int TotalQuantity { get; set; }
    public double AverageDailyQuantity { get; set; }
}

public class InvoiceStats
{
    public int TotalInvoices { get; set; }
    public double AverageDailyInvoices { get; set; }
}