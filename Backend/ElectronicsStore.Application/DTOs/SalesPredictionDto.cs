namespace ElectronicsStore.Application.DTOs;

/// <summary>
/// نموذج بيانات التنبؤ بالمبيعات
/// </summary>
public class SalesPredictionDto
{
    /// <summary>
    /// قيمة المبيعات المتوقعة
    /// </summary>
    public decimal PredictedSales { get; set; }

    /// <summary>
    /// مستوى الثقة في التنبؤ (0-1)
    /// </summary>
    public double Confidence { get; set; }

    /// <summary>
    /// تاريخ التنبؤ
    /// </summary>
    public DateTime PredictionDate { get; set; }

    /// <summary>
    /// اسم النموذج المستخدم
    /// </summary>
    public string ModelName { get; set; } = string.Empty;

    /// <summary>
    /// الميزات المستخدمة في التنبؤ
    /// </summary>
    public PredictionFeaturesDto Features { get; set; } = new();

    /// <summary>
    /// التوصيات الذكية
    /// </summary>
    public List<string> Recommendations { get; set; } = new();

    /// <summary>
    /// معلومات إضافية عن التنبؤ
    /// </summary>
    public PredictionMetadataDto Metadata { get; set; } = new();
}

/// <summary>
/// نموذج ميزات التنبؤ
/// </summary>
public class PredictionFeaturesDto
{
    /// <summary>
    /// يوم الأسبوع
    /// </summary>
    public string DayOfWeek { get; set; } = string.Empty;

    /// <summary>
    /// الشهر
    /// </summary>
    public string Month { get; set; } = string.Empty;

    /// <summary>
    /// السنة
    /// </summary>
    public int Year { get; set; }

    /// <summary>
    /// متوسط مبيعات الأسبوع الماضي
    /// </summary>
    public decimal LastWeekAverage { get; set; }

    /// <summary>
    /// متوسط مبيعات الشهر الماضي
    /// </summary>
    public decimal LastMonthAverage { get; set; }

    /// <summary>
    /// متوسط مبيعات السنة الماضية
    /// </summary>
    public decimal LastYearAverage { get; set; }

    /// <summary>
    /// مبيعات الأمس
    /// </summary>
    public decimal YesterdaySales { get; set; }

    /// <summary>
    /// عدد الفواتير المتوقع
    /// </summary>
    public int ExpectedInvoices { get; set; }

    /// <summary>
    /// الكمية المتوقعة
    /// </summary>
    public int ExpectedQuantity { get; set; }
}

/// <summary>
/// نموذج البيانات الوصفية للتنبؤ
/// </summary>
public class PredictionMetadataDto
{
    /// <summary>
    /// آخر تاريخ متاح في البيانات
    /// </summary>
    public DateTime LastAvailableDate { get; set; }

    /// <summary>
    /// عدد الميزات المستخدمة
    /// </summary>
    public int FeaturesCount { get; set; }

    /// <summary>
    /// نوع النموذج
    /// </summary>
    public string ModelType { get; set; } = string.Empty;

    /// <summary>
    /// دقة النموذج
    /// </summary>
    public string ModelAccuracy { get; set; } = string.Empty;

    /// <summary>
    /// وقت إنشاء التنبؤ
    /// </summary>
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// رسالة التنبؤ
    /// </summary>
    public string Message { get; set; } = string.Empty;
}