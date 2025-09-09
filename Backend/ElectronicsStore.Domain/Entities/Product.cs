namespace ElectronicsStore.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int CategoryId { get; set; }
    public int? SupplierId { get; set; }
    public decimal DefaultCostPrice { get; set; }
    public decimal DefaultSellingPrice { get; set; }
    public decimal MinSellingPrice { get; set; }
    public string? Description { get; set; }
    
    // Navigation Properties
    public virtual Category Category { get; set; } = null!;
    public virtual Supplier? Supplier { get; set; }
    public virtual ICollection<PurchaseInvoiceDetail> PurchaseInvoiceDetails { get; set; } = new List<PurchaseInvoiceDetail>();
    public virtual ICollection<SalesInvoiceDetail> SalesInvoiceDetails { get; set; } = new List<SalesInvoiceDetail>();
    public virtual ICollection<InventoryLog> InventoryLogs { get; set; } = new List<InventoryLog>();
    public virtual ICollection<SalesReturn> SalesReturns { get; set; } = new List<SalesReturn>();
    public virtual ICollection<PurchaseReturn> PurchaseReturns { get; set; } = new List<PurchaseReturn>();
}
