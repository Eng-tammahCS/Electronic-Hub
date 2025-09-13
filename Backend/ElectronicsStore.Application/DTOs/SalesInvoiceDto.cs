using ElectronicsStore.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Application.DTOs;

public class SalesInvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public DateTime InvoiceDate { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal TotalAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public int? OverrideByUserId { get; set; }
    public string? OverrideByUsername { get; set; }
    public DateTime? OverrideDate { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<SalesInvoiceDetailDto> Details { get; set; } = new();
    public bool IsReturned { get; set; }
    public DateTime? ReturnDate { get; set; }
    public string? ReturnReason { get; set; }
}

public class SalesInvoiceDetailDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    // LineTotal will be calculated on the fly: (UnitPrice * Quantity) - DiscountAmount
    public decimal LineTotal => (UnitPrice * Quantity) - DiscountAmount;
}

public class CreateSalesInvoiceDto
{
    [Required(ErrorMessage = "رقم الفاتورة مطلوب")]
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public DateTime InvoiceDate { get; set; }
    public decimal DiscountTotal { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    [Required(ErrorMessage = "تفاصيل الفاتورة مطلوبة")]
    public List<CreateSalesInvoiceDetailDto> Details { get; set; } = new();
}

public class CreateSalesInvoiceDetailDto
{
    [Required(ErrorMessage = "معرف المنتج مطلوب")]
    public int ProductId { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "الكمية يجب أن تكون أكبر من صفر")]
    public int Quantity { get; set; }
    [Range(0, double.MaxValue, ErrorMessage = "سعر الوحدة يجب أن يكون أكبر من أو يساوي صفر")]
    public decimal UnitPrice { get; set; }
    [Range(0, double.MaxValue, ErrorMessage = "مبلغ الخصم يجب أن يكون أكبر من أو يساوي صفر")]
    public decimal DiscountAmount { get; set; }
}

public class UpdateSalesInvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public DateTime InvoiceDate { get; set; }
    public decimal DiscountTotal { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public List<CreateSalesInvoiceDetailDto> Details { get; set; } = new();
}
