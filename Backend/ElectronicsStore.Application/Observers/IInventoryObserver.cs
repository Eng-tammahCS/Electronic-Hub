using ElectronicsStore.Domain.Entities;

namespace ElectronicsStore.Application.Observers;

/// <summary>
/// واجهة مراقب المخزون - Observer Pattern
/// </summary>
public interface IInventoryObserver
{
    /// <summary>
    /// إشعار عند تغيير كمية المنتج
    /// </summary>
    Task OnQuantityChangedAsync(Product product, int oldQuantity, int newQuantity, string reason);
    
    /// <summary>
    /// إشعار عند نفاد المنتج
    /// </summary>
    Task OnProductOutOfStockAsync(Product product);
    
    /// <summary>
    /// إشعار عند انخفاض المخزون
    /// </summary>
    Task OnLowStockWarningAsync(Product product, int currentQuantity, int minimumQuantity);
}