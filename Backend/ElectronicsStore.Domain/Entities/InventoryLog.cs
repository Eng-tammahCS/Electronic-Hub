using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Domain.Entities;

public class InventoryLog : BaseEntity
{
    public int ProductId { get; set; }
    public MovementType MovementType { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string ReferenceTable { get; set; } = string.Empty;
    public int ReferenceId { get; set; }
    public string? Note { get; set; }
    public int UserId { get; set; }
    
    // Navigation Properties
    public virtual Product Product { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
