using ElectronicsStore.Domain.Enums;

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
}

public class SalesInvoiceDetailDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal LineTotal { get; set; }
}

public class CreateSalesInvoiceDto
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public DateTime InvoiceDate { get; set; }
    public decimal DiscountTotal { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public List<CreateSalesInvoiceDetailDto> Details { get; set; } = new();
}

public class CreateSalesInvoiceDetailDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
}
