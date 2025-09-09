namespace ElectronicsStore.Application.DTOs;

public class PurchaseInvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PurchaseInvoiceDetailDto> Details { get; set; } = new();
}

public class PurchaseInvoiceDetailDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal LineTotal { get; set; }
}

public class CreatePurchaseInvoiceDto
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public List<CreatePurchaseInvoiceDetailDto> Details { get; set; } = new();
}

public class CreatePurchaseInvoiceDetailDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
}
