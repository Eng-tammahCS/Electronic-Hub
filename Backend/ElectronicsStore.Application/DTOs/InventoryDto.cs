namespace ElectronicsStore.Application.DTOs;

public class InventoryDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int CurrentQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal AverageCost { get; set; }
    public decimal LastCost { get; set; }
    public DateTime LastMovementDate { get; set; }
}

public class InventoryMovementDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string MovementType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string ReferenceTable { get; set; } = string.Empty;
    public int ReferenceId { get; set; }
    public string? Note { get; set; }
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class InventoryAdjustmentDto
{
    public int ProductId { get; set; }
    public int NewQuantity { get; set; }
    public decimal UnitCost { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class InventoryReportDto
{
    public List<InventoryDto> Items { get; set; } = new();
    public decimal TotalInventoryValue { get; set; }
    public int TotalProducts { get; set; }
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
}
