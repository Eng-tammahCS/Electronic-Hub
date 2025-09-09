using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Domain.Entities;

public class SalesInvoice : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public decimal DiscountTotal { get; set; }
    public decimal TotalAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public int? OverrideByUserId { get; set; }
    public DateTime? OverrideDate { get; set; }
    public int UserId { get; set; }
    
    // Navigation Properties
    public virtual User? OverrideByUser { get; set; }
    public virtual User User { get; set; } = null!;
    public virtual ICollection<SalesInvoiceDetail> SalesInvoiceDetails { get; set; } = new List<SalesInvoiceDetail>();
    public virtual ICollection<SalesReturn> SalesReturns { get; set; } = new List<SalesReturn>();
}

public class SalesInvoiceDetail : BaseEntity
{
    public int SalesInvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal LineTotal { get; set; }
    
    // Navigation Properties
    public virtual SalesInvoice SalesInvoice { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
}
