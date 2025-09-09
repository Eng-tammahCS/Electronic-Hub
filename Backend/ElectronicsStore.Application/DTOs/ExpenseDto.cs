using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Application.DTOs;

/// <summary>
/// DTO لعرض بيانات المصروف
/// </summary>
public class ExpenseDto
{
    /// <summary>
    /// معرف المصروف
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// نوع المصروف
    /// </summary>
    public string ExpenseType { get; set; } = string.Empty;

    /// <summary>
    /// مبلغ المصروف
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// ملاحظات حول المصروف
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// معرف المستخدم الذي أدخل المصروف
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// اسم المستخدم الذي أدخل المصروف
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// تاريخ إنشاء المصروف
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO لإنشاء مصروف جديد
/// </summary>
public class CreateExpenseDto
{
    /// <summary>
    /// نوع المصروف
    /// </summary>
    [Required(ErrorMessage = "نوع المصروف مطلوب")]
    [StringLength(100, ErrorMessage = "نوع المصروف يجب أن يكون أقل من 100 حرف")]
    public string ExpenseType { get; set; } = string.Empty;

    /// <summary>
    /// مبلغ المصروف
    /// </summary>
    [Required(ErrorMessage = "مبلغ المصروف مطلوب")]
    [Range(0.01, double.MaxValue, ErrorMessage = "مبلغ المصروف يجب أن يكون أكبر من صفر")]
    public decimal Amount { get; set; }

    /// <summary>
    /// ملاحظات حول المصروف
    /// </summary>
    [StringLength(200, ErrorMessage = "الملاحظات يجب أن تكون أقل من 200 حرف")]
    public string? Note { get; set; }
}

/// <summary>
/// DTO لتحديث مصروف موجود
/// </summary>
public class UpdateExpenseDto
{
    /// <summary>
    /// نوع المصروف
    /// </summary>
    [Required(ErrorMessage = "نوع المصروف مطلوب")]
    [StringLength(100, ErrorMessage = "نوع المصروف يجب أن يكون أقل من 100 حرف")]
    public string ExpenseType { get; set; } = string.Empty;

    /// <summary>
    /// مبلغ المصروف
    /// </summary>
    [Required(ErrorMessage = "مبلغ المصروف مطلوب")]
    [Range(0.01, double.MaxValue, ErrorMessage = "مبلغ المصروف يجب أن يكون أكبر من صفر")]
    public decimal Amount { get; set; }

    /// <summary>
    /// ملاحظات حول المصروف
    /// </summary>
    [StringLength(200, ErrorMessage = "الملاحظات يجب أن تكون أقل من 200 حرف")]
    public string? Note { get; set; }
}

/// <summary>
/// DTO لملخص المصروفات
/// </summary>
public class ExpensesSummaryDto
{
    /// <summary>
    /// إجمالي عدد المصروفات
    /// </summary>
    public int TotalExpenses { get; set; }

    /// <summary>
    /// إجمالي مبلغ المصروفات
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// عدد مصروفات اليوم
    /// </summary>
    public int TodayExpenses { get; set; }

    /// <summary>
    /// مبلغ مصروفات اليوم
    /// </summary>
    public decimal TodayAmount { get; set; }

    /// <summary>
    /// عدد مصروفات هذا الشهر
    /// </summary>
    public int ThisMonthExpenses { get; set; }

    /// <summary>
    /// مبلغ مصروفات هذا الشهر
    /// </summary>
    public decimal ThisMonthAmount { get; set; }

    /// <summary>
    /// متوسط المصروف اليومي
    /// </summary>
    public decimal AverageDailyExpense { get; set; }

    /// <summary>
    /// أكثر أنواع المصروفات
    /// </summary>
    public List<TopExpenseTypeDto> TopExpenseTypes { get; set; } = new();
}

/// <summary>
/// DTO لأكثر أنواع المصروفات
/// </summary>
public class TopExpenseTypeDto
{
    /// <summary>
    /// نوع المصروف
    /// </summary>
    public string ExpenseType { get; set; } = string.Empty;

    /// <summary>
    /// عدد المصروفات من هذا النوع
    /// </summary>
    public int Count { get; set; }

    /// <summary>
    /// إجمالي المبلغ لهذا النوع
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// النسبة المئوية من إجمالي المصروفات
    /// </summary>
    public decimal Percentage { get; set; }
}
