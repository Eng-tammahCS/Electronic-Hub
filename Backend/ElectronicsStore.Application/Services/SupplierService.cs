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
        // Validation
        if (string.IsNullOrWhiteSpace(createSupplierDto.Name))
        {
            throw new ArgumentException("اسم المورد مطلوب");
        }

        // Check if supplier name already exists
        var existingSupplier = await _unitOfWork.Suppliers.GetAllAsync();
        var duplicateSupplier = existingSupplier.FirstOrDefault(s => s.Name == createSupplierDto.Name);
        if (duplicateSupplier != null)
        {
            throw new InvalidOperationException("يوجد مورد بنفس الاسم بالفعل");
        }

        var supplier = new Supplier
        {
            Name = createSupplierDto.Name.Trim(),
            Phone = createSupplierDto.Phone?.Trim(),
            Email = createSupplierDto.Email?.Trim(),
            Address = createSupplierDto.Address?.Trim()
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
            throw new ArgumentException("المورد غير موجود");

        // Validation
        if (string.IsNullOrWhiteSpace(updateSupplierDto.Name))
        {
            throw new ArgumentException("اسم المورد مطلوب");
        }

        // Check if supplier name already exists (excluding current supplier)
        var allSuppliers = await _unitOfWork.Suppliers.GetAllAsync();
        var existingSupplier = allSuppliers.FirstOrDefault(s => s.Name == updateSupplierDto.Name && s.Id != updateSupplierDto.Id);
        if (existingSupplier != null)
        {
            throw new InvalidOperationException("يوجد مورد بنفس الاسم بالفعل");
        }

        supplier.Name = updateSupplierDto.Name.Trim();
        supplier.Phone = updateSupplierDto.Phone?.Trim();
        supplier.Email = updateSupplierDto.Email?.Trim();
        supplier.Address = updateSupplierDto.Address?.Trim();

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

        // Check if supplier has references in products
        var allProducts = await _unitOfWork.Products.GetAllAsync();
        var hasProducts = allProducts.Any(p => p.SupplierId == id);
        if (hasProducts)
        {
            throw new InvalidOperationException("لا يمكن حذف هذا المورد لأنه مرتبط بمنتجات موجودة");
        }

        // Check if supplier has references in purchase invoices
        var allPurchaseInvoices = await _unitOfWork.PurchaseInvoices.GetAllAsync();
        var hasPurchaseInvoices = allPurchaseInvoices.Any(pi => pi.SupplierId == id);
        if (hasPurchaseInvoices)
        {
            throw new InvalidOperationException("لا يمكن حذف هذا المورد لأنه مرتبط بفواتير شراء موجودة");
        }

        await _unitOfWork.Suppliers.DeleteAsync(supplier);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SupplierExistsAsync(int id)
    {
        return await _unitOfWork.Suppliers.ExistsAsync(id);
    }
}
