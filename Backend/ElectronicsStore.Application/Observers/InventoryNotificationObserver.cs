using ElectronicsStore.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ElectronicsStore.Application.Observers;

/// <summary>
/// مراقب إشعارات المخزون - Observer Pattern Implementation
/// </summary>
public class InventoryNotificationObserver : IInventoryObserver
{
    private readonly ILogger<InventoryNotificationObserver> _logger;

    public InventoryNotificationObserver(ILogger<InventoryNotificationObserver> logger)
    {
        _logger = logger;
    }

    public async Task OnQuantityChangedAsync(Product product, int oldQuantity, int newQuantity, string reason)
    {
        _logger.LogInformation(
            "تم تغيير كمية المنتج {ProductName} من {OldQuantity} إلى {NewQuantity}. السبب: {Reason}",
            product.Name, oldQuantity, newQuantity, reason);

        // يمكن إضافة منطق إرسال إشعارات هنا
        // مثل: إرسال بريد إلكتروني، إشعار push، إلخ
        
        await Task.CompletedTask;
    }

    public async Task OnProductOutOfStockAsync(Product product)
    {
        _logger.LogWarning(
            "تحذير: نفد المنتج {ProductName} (ID: {ProductId}) من المخزون!",
            product.Name, product.Id);

        // منطق إشعار نفاد المخزون
        // يمكن إرسال إشعار عاجل للمدير
        
        await Task.CompletedTask;
    }

    public async Task OnLowStockWarningAsync(Product product, int currentQuantity, int minimumQuantity)
    {
        _logger.LogWarning(
            "تحذير: المنتج {ProductName} يقترب من النفاد. الكمية الحالية: {CurrentQuantity}, الحد الأدنى: {MinimumQuantity}",
            product.Name, currentQuantity, minimumQuantity);

        // منطق تحذير انخفاض المخزون
        // يمكن إرسال تذكير لإعادة الطلب
        
        await Task.CompletedTask;
    }
}