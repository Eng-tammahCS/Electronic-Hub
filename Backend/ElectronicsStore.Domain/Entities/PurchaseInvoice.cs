namespace ElectronicsStore.Domain.Entities;

public class PurchaseInvoice : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    
    // Navigation Properties
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual User User { get; set; } = null!;
    public virtual ICollection<PurchaseInvoiceDetail> PurchaseInvoiceDetails { get; set; } = new List<PurchaseInvoiceDetail>();
    public virtual ICollection<PurchaseReturn> PurchaseReturns { get; set; } = new List<PurchaseReturn>();
}

public class PurchaseInvoiceDetail : BaseEntity
{
    public int PurchaseInvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal LineTotal => Quantity * UnitCost;
    
    // Navigation Properties
    public virtual PurchaseInvoice PurchaseInvoice { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
}
