using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

public interface ISupplierService
{
    Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync();
    Task<SupplierDto?> GetSupplierByIdAsync(int id);
    Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto createSupplierDto);
    Task<SupplierDto> UpdateSupplierAsync(UpdateSupplierDto updateSupplierDto);
    Task<bool> DeleteSupplierAsync(int id);
    Task<bool> SupplierExistsAsync(int id);
}
