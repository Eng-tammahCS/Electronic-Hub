namespace ElectronicsStore.Application.DTOs;

/// <summary>
/// DTO لنتيجة إرجاع الفاتورة
/// </summary>
public class ReturnInvoiceResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal TotalRefundAmount { get; set; }
    public List<ReturnedItemDto> ReturnedItems { get; set; } = new();
    public DateTime ReturnDate { get; set; }
}

/// <summary>
/// DTO للعنصر المرتجع
/// </summary>
public class ReturnedItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal RefundAmount { get; set; }
}
