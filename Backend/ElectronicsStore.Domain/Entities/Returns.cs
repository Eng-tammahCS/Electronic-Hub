namespace ElectronicsStore.Domain.Entities;

public class SalesReturn : BaseEntity
{
    public int SalesInvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Reason { get; set; }
    public int UserId { get; set; }
    
    // Navigation Properties
    public virtual SalesInvoice SalesInvoice { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

public class PurchaseReturn : BaseEntity
{
    public int PurchaseInvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Reason { get; set; }
    public int UserId { get; set; }
    
    // Navigation Properties
    public virtual PurchaseInvoice PurchaseInvoice { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
