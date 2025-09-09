using ElectronicsStore.Domain.Entities;

namespace ElectronicsStore.Application.Observers;

/// <summary>
/// واجهة موضوع المخزون - Subject في Observer Pattern
/// </summary>
public interface IInventorySubject
{
    /// <summary>
    /// إضافة مراقب للمخزون
    /// </summary>
    void Subscribe(IInventoryObserver observer);
    
    /// <summary>
    /// إزالة مراقب من المخزون
    /// </summary>
    void Unsubscribe(IInventoryObserver observer);
    
    /// <summary>
    /// إشعار جميع المراقبين بتغيير الكمية
    /// </summary>
    Task NotifyQuantityChangedAsync(Product product, int oldQuantity, int newQuantity, string reason);
    
    /// <summary>
    /// إشعار جميع المراقبين بنفاد المنتج
    /// </summary>
    Task NotifyProductOutOfStockAsync(Product product);
    
    /// <summary>
    /// إشعار جميع المراقبين بانخفاض المخزون
    /// </summary>
    Task NotifyLowStockWarningAsync(Product product, int currentQuantity, int minimumQuantity);
}