namespace ElectronicsStore.Application.DTOs;

/// <summary>
/// DTO لعرض بيانات مرتجع المشتريات
/// </summary>
public class PurchaseReturnDto
{
    public int Id { get; set; }
    public int PurchaseInvoiceId { get; set; }
    public string PurchaseInvoiceNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? Reason { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // معلومات إضافية للعرض
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public decimal TotalReturnAmount { get; set; }
}

/// <summary>
/// DTO لإنشاء مرتجع مشتريات جديد
/// </summary>
public class CreatePurchaseReturnDto
{
    public int PurchaseInvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// DTO لتحديث مرتجع المشتريات
/// </summary>
public class UpdatePurchaseReturnDto
{
    public int Quantity { get; set; }
    public string? Reason { get; set; }
}
