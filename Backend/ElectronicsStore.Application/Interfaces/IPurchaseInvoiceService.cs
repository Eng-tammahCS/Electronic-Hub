using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

public interface IPurchaseInvoiceService
{
    Task<IEnumerable<PurchaseInvoiceDto>> GetAllPurchaseInvoicesAsync();
    Task<PurchaseInvoiceDto?> GetPurchaseInvoiceByIdAsync(int id);
    Task<PurchaseInvoiceDto> CreatePurchaseInvoiceAsync(CreatePurchaseInvoiceDto createPurchaseInvoiceDto, int userId);
    Task<bool> DeletePurchaseInvoiceAsync(int id);
    Task<IEnumerable<PurchaseInvoiceDto>> GetPurchaseInvoicesBySupplierAsync(int supplierId);
    Task<IEnumerable<PurchaseInvoiceDto>> GetPurchaseInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate);
}
