using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;

namespace ElectronicsStore.Application.Services;

public class SupplierService : ISupplierService
{
    private readonly IUnitOfWork _unitOfWork;

    public SupplierService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync()
    {
        var suppliers = await _unitOfWork.Suppliers.GetAllAsync();
        return suppliers.Select(s => new SupplierDto
        {
            Id = s.Id,
            Name = s.Name,
            Phone = s.Phone,
            Email = s.Email,
            Address = s.Address,
            CreatedAt = s.CreatedAt
        });
    }

    public async Task<SupplierDto?> GetSupplierByIdAsync(int id)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id);
        if (supplier == null) return null;

        return new SupplierDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            Phone = supplier.Phone,
            Email = supplier.Email,
            Address = supplier.Address,
            CreatedAt = supplier.CreatedAt
        };
    }

    public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto createSupplierDto)
    {
        var supplier = new Supplier
        {
            Name = createSupplierDto.Name,
            Phone = createSupplierDto.Phone,
            Email = createSupplierDto.Email,
            Address = createSupplierDto.Address
        };

        var createdSupplier = await _unitOfWork.Suppliers.AddAsync(supplier);
        await _unitOfWork.SaveChangesAsync();

        return new SupplierDto
        {
            Id = createdSupplier.Id,
            Name = createdSupplier.Name,
            Phone = createdSupplier.Phone,
            Email = createdSupplier.Email,
            Address = createdSupplier.Address,
            CreatedAt = createdSupplier.CreatedAt
        };
    }

    public async Task<SupplierDto> UpdateSupplierAsync(UpdateSupplierDto updateSupplierDto)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(updateSupplierDto.Id);
        if (supplier == null)
            throw new ArgumentException("Supplier not found");

        supplier.Name = updateSupplierDto.Name;
        supplier.Phone = updateSupplierDto.Phone;
        supplier.Email = updateSupplierDto.Email;
        supplier.Address = updateSupplierDto.Address;

        var updatedSupplier = await _unitOfWork.Suppliers.UpdateAsync(supplier);
        await _unitOfWork.SaveChangesAsync();

        return new SupplierDto
        {
            Id = updatedSupplier.Id,
            Name = updatedSupplier.Name,
            Phone = updatedSupplier.Phone,
            Email = updatedSupplier.Email,
            Address = updatedSupplier.Address,
            CreatedAt = updatedSupplier.CreatedAt
        };
    }

    public async Task<bool> DeleteSupplierAsync(int id)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id);
        if (supplier == null) return false;

        await _unitOfWork.Suppliers.DeleteAsync(supplier);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SupplierExistsAsync(int id)
    {
        return await _unitOfWork.Suppliers.ExistsAsync(id);
    }
}
