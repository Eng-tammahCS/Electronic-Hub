namespace ElectronicsStore.Application.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public decimal DefaultCostPrice { get; set; }
    public decimal DefaultSellingPrice { get; set; }
    public decimal MinSellingPrice { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CurrentQuantity { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int CategoryId { get; set; }
    public int? SupplierId { get; set; }
    public decimal DefaultCostPrice { get; set; }
    public decimal DefaultSellingPrice { get; set; }
    public decimal MinSellingPrice { get; set; }
    public string? Description { get; set; }
}

public class UpdateProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int CategoryId { get; set; }
    public int? SupplierId { get; set; }
    public decimal DefaultCostPrice { get; set; }
    public decimal DefaultSellingPrice { get; set; }
    public decimal MinSellingPrice { get; set; }
    public string? Description { get; set; }
}
