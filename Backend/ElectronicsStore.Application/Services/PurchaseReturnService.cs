using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Application.Services;

/// <summary>
/// خدمات مرتجعات المشتريات
/// </summary>
public class PurchaseReturnService : IPurchaseReturnService
{
    private readonly IUnitOfWork _unitOfWork;

    public PurchaseReturnService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<PurchaseReturnDto>> GetAllPurchaseReturnsAsync()
    {
        var returns = await _unitOfWork.PurchaseReturns.GetAllAsync();
        var result = new List<PurchaseReturnDto>();

        foreach (var returnItem in returns)
        {
            var dto = await MapToPurchaseReturnDtoAsync(returnItem);
            result.Add(dto);
        }

        return result.OrderByDescending(r => r.CreatedAt);
    }

    public async Task<PurchaseReturnDto?> GetPurchaseReturnByIdAsync(int id)
    {
        var returnItem = await _unitOfWork.PurchaseReturns.GetByIdAsync(id);
        if (returnItem == null) return null;

        return await MapToPurchaseReturnDtoAsync(returnItem);
    }

    public async Task<PurchaseReturnDto> CreatePurchaseReturnAsync(CreatePurchaseReturnDto dto, int userId)
    {
        // التحقق من صحة البيانات
        await ValidateCreatePurchaseReturnAsync(dto);

        // إنشاء المرتجع
        var purchaseReturn = new PurchaseReturn
        {
            PurchaseInvoiceId = dto.PurchaseInvoiceId,
            ProductId = dto.ProductId,
            Quantity = dto.Quantity,
            Reason = dto.Reason,
            UserId = userId,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.PurchaseReturns.AddAsync(purchaseReturn);

        // تحديث المخزون (إزالة الكمية المرتجعة)
        await UpdateInventoryForPurchaseReturnAsync(dto.ProductId, dto.Quantity, userId);

        await _unitOfWork.SaveChangesAsync();

        return await GetPurchaseReturnByIdAsync(purchaseReturn.Id) 
               ?? throw new Exception("Failed to retrieve created purchase return");
    }

    public async Task<PurchaseReturnDto> UpdatePurchaseReturnAsync(int id, UpdatePurchaseReturnDto dto)
    {
        var existingReturn = await _unitOfWork.PurchaseReturns.GetByIdAsync(id);
        if (existingReturn == null)
            throw new KeyNotFoundException($"Purchase return with ID {id} not found");

        // حفظ الكمية القديمة لتعديل المخزون
        var oldQuantity = existingReturn.Quantity;

        // تحديث البيانات
        existingReturn.Quantity = dto.Quantity;
        existingReturn.Reason = dto.Reason;

        await _unitOfWork.PurchaseReturns.UpdateAsync(existingReturn);

        // تعديل المخزون إذا تغيرت الكمية
        if (oldQuantity != dto.Quantity)
        {
            var quantityDifference = dto.Quantity - oldQuantity;
            await UpdateInventoryForPurchaseReturnAsync(existingReturn.ProductId, quantityDifference, existingReturn.UserId);
        }

        await _unitOfWork.SaveChangesAsync();

        return await GetPurchaseReturnByIdAsync(id) 
               ?? throw new Exception("Failed to retrieve updated purchase return");
    }

    public async Task DeletePurchaseReturnAsync(int id)
    {
        var returnItem = await _unitOfWork.PurchaseReturns.GetByIdAsync(id);
        if (returnItem == null)
            throw new KeyNotFoundException($"Purchase return with ID {id} not found");

        // إضافة الكمية للمخزون (عكس العملية)
        await UpdateInventoryForPurchaseReturnAsync(returnItem.ProductId, -returnItem.Quantity, returnItem.UserId);

        await _unitOfWork.PurchaseReturns.DeleteAsync(returnItem);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<PurchaseReturnDto>> GetReturnsByPurchaseInvoiceAsync(int purchaseInvoiceId)
    {
        var returns = await _unitOfWork.PurchaseReturns.FindAsync(r => r.PurchaseInvoiceId == purchaseInvoiceId);
        var result = new List<PurchaseReturnDto>();

        foreach (var returnItem in returns)
        {
            var dto = await MapToPurchaseReturnDtoAsync(returnItem);
            result.Add(dto);
        }

        return result.OrderByDescending(r => r.CreatedAt);
    }

    public async Task<IEnumerable<PurchaseReturnDto>> GetReturnsByProductAsync(int productId)
    {
        var returns = await _unitOfWork.PurchaseReturns.FindAsync(r => r.ProductId == productId);
        var result = new List<PurchaseReturnDto>();

        foreach (var returnItem in returns)
        {
            var dto = await MapToPurchaseReturnDtoAsync(returnItem);
            result.Add(dto);
        }

        return result.OrderByDescending(r => r.CreatedAt);
    }

    public async Task<IEnumerable<PurchaseReturnDto>> GetReturnsBySupplierAsync(int supplierId)
    {
        var allReturns = await GetAllPurchaseReturnsAsync();
        return allReturns.Where(r => r.SupplierId == supplierId);
    }

    public async Task<IEnumerable<PurchaseReturnDto>> GetReturnsByDateRangeAsync(DateTime? startDate, DateTime? endDate)
    {
        var allReturns = await GetAllPurchaseReturnsAsync();
        var filteredReturns = allReturns.AsEnumerable();

        if (startDate.HasValue)
            filteredReturns = filteredReturns.Where(r => r.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            filteredReturns = filteredReturns.Where(r => r.CreatedAt <= endDate.Value);

        return filteredReturns.OrderByDescending(r => r.CreatedAt);
    }

    private async Task<PurchaseReturnDto> MapToPurchaseReturnDtoAsync(PurchaseReturn purchaseReturn)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(purchaseReturn.ProductId);
        var user = await _unitOfWork.Users.GetByIdAsync(purchaseReturn.UserId);
        var purchaseInvoice = await _unitOfWork.PurchaseInvoices.GetByIdAsync(purchaseReturn.PurchaseInvoiceId);

        // حساب تكلفة الوحدة والمبلغ الإجمالي للمرتجع
        decimal unitCost = 0;
        int supplierId = 0;
        string supplierName = string.Empty;

        if (purchaseInvoice != null)
        {
            supplierId = purchaseInvoice.SupplierId;
            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(supplierId);
            supplierName = supplier?.Name ?? "Unknown Supplier";
            
            // البحث عن تفاصيل الفاتورة للحصول على التكلفة
            var invoiceDetails = await _unitOfWork.PurchaseInvoiceDetails.FindAsync(d => 
                d.PurchaseInvoiceId == purchaseReturn.PurchaseInvoiceId && d.ProductId == purchaseReturn.ProductId);
            
            var detail = invoiceDetails.FirstOrDefault();
            if (detail != null)
            {
                unitCost = detail.UnitCost;
            }
        }

        return new PurchaseReturnDto
        {
            Id = purchaseReturn.Id,
            PurchaseInvoiceId = purchaseReturn.PurchaseInvoiceId,
            PurchaseInvoiceNumber = purchaseInvoice?.InvoiceNumber ?? "Unknown",
            ProductId = purchaseReturn.ProductId,
            ProductName = product?.Name ?? "Unknown Product",
            Quantity = purchaseReturn.Quantity,
            Reason = purchaseReturn.Reason,
            UserId = purchaseReturn.UserId,
            Username = user?.FullName ?? user?.Username ?? "Unknown User",
            CreatedAt = purchaseReturn.CreatedAt,
            SupplierId = supplierId,
            SupplierName = supplierName,
            UnitCost = unitCost,
            TotalReturnAmount = unitCost * purchaseReturn.Quantity
        };
    }

    private async Task ValidateCreatePurchaseReturnAsync(CreatePurchaseReturnDto dto)
    {
        // التحقق من وجود فاتورة الشراء
        var purchaseInvoice = await _unitOfWork.PurchaseInvoices.GetByIdAsync(dto.PurchaseInvoiceId);
        if (purchaseInvoice == null)
            throw new ArgumentException($"Purchase invoice with ID {dto.PurchaseInvoiceId} not found");

        // التحقق من وجود المنتج
        var product = await _unitOfWork.Products.GetByIdAsync(dto.ProductId);
        if (product == null)
            throw new ArgumentException($"Product with ID {dto.ProductId} not found");

        // التحقق من أن المنتج موجود في الفاتورة
        var invoiceDetails = await _unitOfWork.PurchaseInvoiceDetails.FindAsync(d => 
            d.PurchaseInvoiceId == dto.PurchaseInvoiceId && d.ProductId == dto.ProductId);
        
        var detail = invoiceDetails.FirstOrDefault();
        if (detail == null)
            throw new ArgumentException($"Product {product.Name} is not found in purchase invoice {purchaseInvoice.InvoiceNumber}");

        // التحقق من أن الكمية المرتجعة لا تتجاوز الكمية المشتراة
        var existingReturns = await _unitOfWork.PurchaseReturns.FindAsync(r => 
            r.PurchaseInvoiceId == dto.PurchaseInvoiceId && r.ProductId == dto.ProductId);
        
        var totalReturnedQuantity = existingReturns.Sum(r => r.Quantity);
        var availableQuantity = detail.Quantity - totalReturnedQuantity;

        if (dto.Quantity > availableQuantity)
            throw new ArgumentException($"Cannot return {dto.Quantity} items. Only {availableQuantity} items available for return");

        // التحقق من أن الكمية أكبر من صفر
        if (dto.Quantity <= 0)
            throw new ArgumentException("Return quantity must be greater than zero");
    }

    private async Task UpdateInventoryForPurchaseReturnAsync(int productId, int quantity, int userId)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId);
        if (product != null)
        {
            var inventoryLog = new InventoryLog
            {
                ProductId = productId,
                MovementType = MovementType.ReturnPurchase,
                Quantity = -quantity, // سالب لأنه إزالة من المخزون
                UnitCost = 0, // سيتم تحديده لاحقاً من متوسط التكلفة
                ReferenceTable = "purchase_returns",
                ReferenceId = 0, // سيتم تحديده بعد حفظ المرتجع
                Note = $"Purchase return - {quantity} items returned to supplier",
                UserId = userId
            };

            await _unitOfWork.InventoryLogs.AddAsync(inventoryLog);
        }
    }
}
