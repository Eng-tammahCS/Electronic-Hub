using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

public interface IInventoryService
{
    Task<InventoryReportDto> GetInventoryReportAsync();
    Task<IEnumerable<InventoryDto>> GetAllInventoryAsync();
    Task<InventoryDto?> GetProductInventoryAsync(int productId);
    Task<IEnumerable<InventoryMovementDto>> GetInventoryMovementsAsync(int productId);
    Task<IEnumerable<InventoryMovementDto>> GetAllInventoryMovementsAsync();
    Task<bool> AdjustInventoryAsync(InventoryAdjustmentDto adjustmentDto, int userId);
    Task<IEnumerable<InventoryDto>> GetLowStockItemsAsync(int threshold = 10);
    Task<IEnumerable<InventoryDto>> GetOutOfStockItemsAsync();
    Task UpdateStockAsync(int productId, int quantityChange);
}
