using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public InventoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<InventoryReportDto> GetInventoryReportAsync()
    {
        var inventoryItems = await GetAllInventoryAsync();
        var items = inventoryItems.ToList();

        return new InventoryReportDto
        {
            Items = items,
            TotalInventoryValue = items.Sum(i => i.TotalValue),
            TotalProducts = items.Count,
            LowStockItems = items.Count(i => i.CurrentQuantity <= 10 && i.CurrentQuantity > 0),
            OutOfStockItems = items.Count(i => i.CurrentQuantity <= 0)
        };
    }

    public async Task<IEnumerable<InventoryDto>> GetAllInventoryAsync()
    {
        var products = await _unitOfWork.Products.GetAllAsync();
        var inventoryItems = new List<InventoryDto>();

        foreach (var product in products)
        {
            var inventory = await GetProductInventoryAsync(product.Id);
            if (inventory != null)
            {
                inventoryItems.Add(inventory);
            }
        }

        return inventoryItems;
    }

    public async Task<InventoryDto?> GetProductInventoryAsync(int productId)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId);
        if (product == null) return null;

        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
        var movements = await _unitOfWork.InventoryLogs.FindAsync(il => il.ProductId == productId);
        var movementsList = movements.ToList();

        var currentQuantity = movementsList.Sum(m => m.Quantity);
        var totalValue = movementsList.Where(m => m.Quantity > 0).Sum(m => m.Quantity * m.UnitCost);
        var totalQuantityIn = movementsList.Where(m => m.Quantity > 0).Sum(m => m.Quantity);
        var averageCost = totalQuantityIn > 0 ? totalValue / totalQuantityIn : 0;
        var lastMovement = movementsList.OrderByDescending(m => m.CreatedAt).FirstOrDefault();

        return new InventoryDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            CategoryName = category?.Name ?? "",
            CurrentQuantity = currentQuantity,
            TotalValue = currentQuantity * averageCost,
            AverageCost = averageCost,
            LastCost = lastMovement?.UnitCost ?? 0,
            LastMovementDate = lastMovement?.CreatedAt ?? product.CreatedAt
        };
    }

    public async Task<IEnumerable<InventoryMovementDto>> GetInventoryMovementsAsync(int productId)
    {
        var movements = await _unitOfWork.InventoryLogs.FindAsync(il => il.ProductId == productId);
        var movementDtos = new List<InventoryMovementDto>();

        foreach (var movement in movements.OrderByDescending(m => m.CreatedAt))
        {
            var product = await _unitOfWork.Products.GetByIdAsync(movement.ProductId);
            var user = await _unitOfWork.Users.GetByIdAsync(movement.UserId);

            movementDtos.Add(new InventoryMovementDto
            {
                Id = movement.Id,
                ProductId = movement.ProductId,
                ProductName = product?.Name ?? "",
                MovementType = movement.MovementType.ToString(),
                Quantity = movement.Quantity,
                UnitCost = movement.UnitCost,
                ReferenceTable = movement.ReferenceTable,
                ReferenceId = movement.ReferenceId,
                Note = movement.Note,
                Username = user?.FullName ?? user?.Username ?? "",
                CreatedAt = movement.CreatedAt
            });
        }

        return movementDtos;
    }

    public async Task<IEnumerable<InventoryMovementDto>> GetAllInventoryMovementsAsync()
    {
        var movements = await _unitOfWork.InventoryLogs.GetAllAsync();
        var movementDtos = new List<InventoryMovementDto>();

        foreach (var movement in movements.OrderByDescending(m => m.CreatedAt))
        {
            var product = await _unitOfWork.Products.GetByIdAsync(movement.ProductId);
            var user = await _unitOfWork.Users.GetByIdAsync(movement.UserId);

            movementDtos.Add(new InventoryMovementDto
            {
                Id = movement.Id,
                ProductId = movement.ProductId,
                ProductName = product?.Name ?? "",
                MovementType = movement.MovementType.ToString(),
                Quantity = movement.Quantity,
                UnitCost = movement.UnitCost,
                ReferenceTable = movement.ReferenceTable,
                ReferenceId = movement.ReferenceId,
                Note = movement.Note,
                Username = user?.FullName ?? user?.Username ?? "",
                CreatedAt = movement.CreatedAt
            });
        }

        return movementDtos;
    }

    public async Task<bool> AdjustInventoryAsync(InventoryAdjustmentDto adjustmentDto, int userId)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(adjustmentDto.ProductId);
        if (product == null) return false;

        // Calculate current quantity
        var movements = await _unitOfWork.InventoryLogs.FindAsync(il => il.ProductId == adjustmentDto.ProductId);
        var currentQuantity = movements.Sum(m => m.Quantity);

        // Calculate adjustment quantity
        var adjustmentQuantity = adjustmentDto.NewQuantity - currentQuantity;

        if (adjustmentQuantity == 0) return true; // No adjustment needed

        // Create inventory log for adjustment
        var inventoryLog = new InventoryLog
        {
            ProductId = adjustmentDto.ProductId,
            MovementType = MovementType.Adjust,
            Quantity = adjustmentQuantity,
            UnitCost = adjustmentDto.UnitCost,
            ReferenceTable = "inventory_adjustment",
            ReferenceId = 0, // No specific reference for adjustments
            Note = $"تسوية مخزون: {adjustmentDto.Reason}",
            UserId = userId
        };

        await _unitOfWork.InventoryLogs.AddAsync(inventoryLog);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<InventoryDto>> GetLowStockItemsAsync(int threshold = 10)
    {
        var allInventory = await GetAllInventoryAsync();
        return allInventory.Where(i => i.CurrentQuantity <= threshold && i.CurrentQuantity > 0);
    }

    public async Task<IEnumerable<InventoryDto>> GetOutOfStockItemsAsync()
    {
        var allInventory = await GetAllInventoryAsync();
        return allInventory.Where(i => i.CurrentQuantity <= 0);
    }

    public async Task UpdateStockAsync(int productId, int quantityChange)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId);
        if (product == null)
        {
            throw new ArgumentException($"Product with ID {productId} not found");
        }

        // تحديد نوع الحركة بناءً على الكمية
        var movementType = quantityChange > 0 ? MovementType.Purchase : MovementType.Sale;

        // إنشاء سجل حركة المخزون
        var inventoryLog = new InventoryLog
        {
            ProductId = productId,
            MovementType = movementType,
            Quantity = Math.Abs(quantityChange),
            UnitCost = product.DefaultCostPrice,
            ReferenceTable = "stock_update",
            ReferenceId = 0,
            Note = $"تحديث المخزون: {quantityChange}",
            UserId = 1 // TODO: Get actual user ID
        };

        await _unitOfWork.InventoryLogs.AddAsync(inventoryLog);
        await _unitOfWork.SaveChangesAsync();
    }
}
