using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

public interface ISalesInvoiceService
{
    Task<IEnumerable<SalesInvoiceDto>> GetAllSalesInvoicesAsync();
    Task<SalesInvoiceDto?> GetSalesInvoiceByIdAsync(int id);
    Task<SalesInvoiceDto?> GetSalesInvoiceAsync(int id);
    Task<IEnumerable<SalesInvoiceDto>> GetSalesInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<SalesInvoiceDto> CreateSalesInvoiceAsync(CreateSalesInvoiceDto dto, int userId);
    Task<SalesInvoiceDto> CreateSalesInvoiceAsync(CreateSalesInvoiceDto dto);
    Task DeleteSalesInvoiceAsync(int id);
}
