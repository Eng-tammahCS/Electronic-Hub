using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;

namespace ElectronicsStore.Application.Services;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await _unitOfWork.Products.GetAllAsync();
        var productDtos = new List<ProductDto>();

        foreach (var product in products)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
            var supplier = product.SupplierId.HasValue ? 
                await _unitOfWork.Suppliers.GetByIdAsync(product.SupplierId.Value) : null;

            // Calculate current quantity from inventory logs
            var inventoryLogs = await _unitOfWork.InventoryLogs.FindAsync(il => il.ProductId == product.Id);
            var currentQuantity = inventoryLogs.Sum(il => il.Quantity);

            productDtos.Add(new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Barcode = product.Barcode,
                CategoryId = product.CategoryId,
                CategoryName = category?.Name ?? "",
                SupplierId = product.SupplierId,
                SupplierName = supplier?.Name,
                DefaultCostPrice = product.DefaultCostPrice,
                DefaultSellingPrice = product.DefaultSellingPrice,
                MinSellingPrice = product.MinSellingPrice,
                Description = product.Description,
                CreatedAt = product.CreatedAt,
                CurrentQuantity = currentQuantity
            });
        }

        return productDtos;
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null) return null;

        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
        var supplier = product.SupplierId.HasValue ? 
            await _unitOfWork.Suppliers.GetByIdAsync(product.SupplierId.Value) : null;

        // Calculate current quantity from inventory logs
        var inventoryLogs = await _unitOfWork.InventoryLogs.FindAsync(il => il.ProductId == product.Id);
        var currentQuantity = inventoryLogs.Sum(il => il.Quantity);

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Barcode = product.Barcode,
            CategoryId = product.CategoryId,
            CategoryName = category?.Name ?? "",
            SupplierId = product.SupplierId,
            SupplierName = supplier?.Name,
            DefaultCostPrice = product.DefaultCostPrice,
            DefaultSellingPrice = product.DefaultSellingPrice,
            MinSellingPrice = product.MinSellingPrice,
            Description = product.Description,
            CreatedAt = product.CreatedAt,
            CurrentQuantity = currentQuantity
        };
    }

    public async Task<ProductDto?> GetProductByBarcodeAsync(string barcode)
    {
        var products = await _unitOfWork.Products.FindAsync(p => p.Barcode == barcode);
        var product = products.FirstOrDefault();
        
        if (product == null) return null;

        return await GetProductByIdAsync(product.Id);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
    {
        var product = new Product
        {
            Name = createProductDto.Name,
            Barcode = createProductDto.Barcode,
            CategoryId = createProductDto.CategoryId,
            SupplierId = createProductDto.SupplierId,
            DefaultCostPrice = createProductDto.DefaultCostPrice,
            DefaultSellingPrice = createProductDto.DefaultSellingPrice,
            MinSellingPrice = createProductDto.MinSellingPrice,
            Description = createProductDto.Description
        };

        var createdProduct = await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return await GetProductByIdAsync(createdProduct.Id) ?? throw new InvalidOperationException("Failed to retrieve created product");
    }

    public async Task<ProductDto> UpdateProductAsync(UpdateProductDto updateProductDto)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(updateProductDto.Id);
        if (product == null)
            throw new ArgumentException("Product not found");

        product.Name = updateProductDto.Name;
        product.Barcode = updateProductDto.Barcode;
        product.CategoryId = updateProductDto.CategoryId;
        product.SupplierId = updateProductDto.SupplierId;
        product.DefaultCostPrice = updateProductDto.DefaultCostPrice;
        product.DefaultSellingPrice = updateProductDto.DefaultSellingPrice;
        product.MinSellingPrice = updateProductDto.MinSellingPrice;
        product.Description = updateProductDto.Description;

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return await GetProductByIdAsync(product.Id) ?? throw new InvalidOperationException("Failed to retrieve updated product");
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null) return false;

        await _unitOfWork.Products.DeleteAsync(product);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ProductExistsAsync(int id)
    {
        return await _unitOfWork.Products.ExistsAsync(id);
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId)
    {
        var products = await _unitOfWork.Products.FindAsync(p => p.CategoryId == categoryId);
        var productDtos = new List<ProductDto>();

        foreach (var product in products)
        {
            var productDto = await GetProductByIdAsync(product.Id);
            if (productDto != null)
                productDtos.Add(productDto);
        }

        return productDtos;
    }

    public async Task<IEnumerable<ProductDto>> GetProductsBySupplierAsync(int supplierId)
    {
        var products = await _unitOfWork.Products.FindAsync(p => p.SupplierId == supplierId);
        var productDtos = new List<ProductDto>();

        foreach (var product in products)
        {
            var productDto = await GetProductByIdAsync(product.Id);
            if (productDto != null)
                productDtos.Add(productDto);
        }

        return productDtos;
    }
}
