namespace ElectronicsStore.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    
    // Navigation Properties
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
