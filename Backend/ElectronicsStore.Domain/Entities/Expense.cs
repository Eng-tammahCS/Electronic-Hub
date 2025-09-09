namespace ElectronicsStore.Domain.Entities;

public class Expense : BaseEntity
{
    public string ExpenseType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Note { get; set; }
    public int UserId { get; set; }
    
    // Navigation Properties
    public virtual User User { get; set; } = null!;
}
