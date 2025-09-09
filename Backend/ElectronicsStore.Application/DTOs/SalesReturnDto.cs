namespace ElectronicsStore.Application.DTOs;

/// <summary>
/// DTO لعرض بيانات مرتجع المبيعات
/// </summary>
public class SalesReturnDto
{
    public int Id { get; set; }
    public int SalesInvoiceId { get; set; }
    public string SalesInvoiceNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? Reason { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // معلومات إضافية للعرض
    public string? CustomerName { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalReturnAmount { get; set; }
}

/// <summary>
/// DTO لإنشاء مرتجع مبيعات جديد
/// </summary>
public class CreateSalesReturnDto
{
    public int SalesInvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// DTO لتحديث مرتجع المبيعات
/// </summary>
public class UpdateSalesReturnDto
{
    public int Quantity { get; set; }
    public string? Reason { get; set; }
}
