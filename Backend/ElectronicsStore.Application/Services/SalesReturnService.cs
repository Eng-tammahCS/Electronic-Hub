using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Application.Services;

/// <summary>
/// خدمات مرتجعات المبيعات
/// </summary>
public class SalesReturnService : ISalesReturnService
{
    private readonly IUnitOfWork _unitOfWork;

    public SalesReturnService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SalesReturnDto>> GetAllSalesReturnsAsync()
    {
        var returns = await _unitOfWork.SalesReturns.GetAllAsync();
        var result = new List<SalesReturnDto>();

        foreach (var returnItem in returns)
        {
            var dto = await MapToSalesReturnDtoAsync(returnItem);
            result.Add(dto);
        }

        return result.OrderByDescending(r => r.CreatedAt);
    }

    public async Task<SalesReturnDto?> GetSalesReturnByIdAsync(int id)
    {
        var returnItem = await _unitOfWork.SalesReturns.GetByIdAsync(id);
        if (returnItem == null) return null;

        return await MapToSalesReturnDtoAsync(returnItem);
    }

    public async Task<SalesReturnDto> CreateSalesReturnAsync(CreateSalesReturnDto dto, int userId)
    {
        // التحقق من صحة البيانات
        await ValidateCreateSalesReturnAsync(dto);

        // إنشاء المرتجع
        var salesReturn = new SalesReturn
        {
            SalesInvoiceId = dto.SalesInvoiceId,
            ProductId = dto.ProductId,
            Quantity = dto.Quantity,
            Reason = dto.Reason,
            UserId = userId,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.SalesReturns.AddAsync(salesReturn);

        // تحديث المخزون (إضافة الكمية المرتجعة)
        await UpdateInventoryForSalesReturnAsync(dto.ProductId, dto.Quantity, userId);

        await _unitOfWork.SaveChangesAsync();

        return await GetSalesReturnByIdAsync(salesReturn.Id) 
               ?? throw new Exception("Failed to retrieve created sales return");
    }

    public async Task<SalesReturnDto> UpdateSalesReturnAsync(int id, UpdateSalesReturnDto dto)
    {
        var existingReturn = await _unitOfWork.SalesReturns.GetByIdAsync(id);
        if (existingReturn == null)
            throw new KeyNotFoundException($"Sales return with ID {id} not found");

        // حفظ الكمية القديمة لتعديل المخزون
        var oldQuantity = existingReturn.Quantity;

        // تحديث البيانات
        existingReturn.Quantity = dto.Quantity;
        existingReturn.Reason = dto.Reason;

        await _unitOfWork.SalesReturns.UpdateAsync(existingReturn);

        // تعديل المخزون إذا تغيرت الكمية
        if (oldQuantity != dto.Quantity)
        {
            var quantityDifference = dto.Quantity - oldQuantity;
            await UpdateInventoryForSalesReturnAsync(existingReturn.ProductId, quantityDifference, existingReturn.UserId);
        }

        await _unitOfWork.SaveChangesAsync();

        return await GetSalesReturnByIdAsync(id) 
               ?? throw new Exception("Failed to retrieve updated sales return");
    }

    public async Task DeleteSalesReturnAsync(int id)
    {
        var returnItem = await _unitOfWork.SalesReturns.GetByIdAsync(id);
        if (returnItem == null)
            throw new KeyNotFoundException($"Sales return with ID {id} not found");

        // إزالة الكمية من المخزون (عكس العملية)
        await UpdateInventoryForSalesReturnAsync(returnItem.ProductId, -returnItem.Quantity, returnItem.UserId);

        await _unitOfWork.SalesReturns.DeleteAsync(returnItem);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<SalesReturnDto>> GetReturnsBySalesInvoiceAsync(int salesInvoiceId)
    {
        var returns = await _unitOfWork.SalesReturns.FindAsync(r => r.SalesInvoiceId == salesInvoiceId);
        var result = new List<SalesReturnDto>();

        foreach (var returnItem in returns)
        {
            var dto = await MapToSalesReturnDtoAsync(returnItem);
            result.Add(dto);
        }

        return result.OrderByDescending(r => r.CreatedAt);
    }

    public async Task<IEnumerable<SalesReturnDto>> GetReturnsByProductAsync(int productId)
    {
        var returns = await _unitOfWork.SalesReturns.FindAsync(r => r.ProductId == productId);
        var result = new List<SalesReturnDto>();

        foreach (var returnItem in returns)
        {
            var dto = await MapToSalesReturnDtoAsync(returnItem);
            result.Add(dto);
        }

        return result.OrderByDescending(r => r.CreatedAt);
    }

    public async Task<IEnumerable<SalesReturnDto>> GetReturnsByCustomerAsync(string customerName)
    {
        var allReturns = await GetAllSalesReturnsAsync();
        return allReturns.Where(r => 
            !string.IsNullOrEmpty(r.CustomerName) && 
            r.CustomerName.Contains(customerName, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IEnumerable<SalesReturnDto>> GetReturnsByDateRangeAsync(DateTime? startDate, DateTime? endDate)
    {
        var allReturns = await GetAllSalesReturnsAsync();
        var filteredReturns = allReturns.AsEnumerable();

        if (startDate.HasValue)
            filteredReturns = filteredReturns.Where(r => r.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            filteredReturns = filteredReturns.Where(r => r.CreatedAt <= endDate.Value);

        return filteredReturns.OrderByDescending(r => r.CreatedAt);
    }

    private async Task<SalesReturnDto> MapToSalesReturnDtoAsync(SalesReturn salesReturn)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(salesReturn.ProductId);
        var user = await _unitOfWork.Users.GetByIdAsync(salesReturn.UserId);
        var salesInvoice = await _unitOfWork.SalesInvoices.GetByIdAsync(salesReturn.SalesInvoiceId);

        // حساب سعر الوحدة والمبلغ الإجمالي للمرتجع
        decimal unitPrice = 0;
        string customerName = string.Empty;

        if (salesInvoice != null)
        {
            customerName = salesInvoice.CustomerName ?? string.Empty;
            
            // البحث عن تفاصيل الفاتورة للحصول على السعر
            var invoiceDetails = await _unitOfWork.SalesInvoiceDetails.FindAsync(d => 
                d.SalesInvoiceId == salesReturn.SalesInvoiceId && d.ProductId == salesReturn.ProductId);
            
            var detail = invoiceDetails.FirstOrDefault();
            if (detail != null)
            {
                unitPrice = detail.UnitPrice;
            }
        }

        return new SalesReturnDto
        {
            Id = salesReturn.Id,
            SalesInvoiceId = salesReturn.SalesInvoiceId,
            SalesInvoiceNumber = salesInvoice?.InvoiceNumber ?? "Unknown",
            ProductId = salesReturn.ProductId,
            ProductName = product?.Name ?? "Unknown Product",
            Quantity = salesReturn.Quantity,
            Reason = salesReturn.Reason,
            UserId = salesReturn.UserId,
            Username = user?.FullName ?? user?.Username ?? "Unknown User",
            CreatedAt = salesReturn.CreatedAt,
            CustomerName = customerName,
            UnitPrice = unitPrice,
            TotalReturnAmount = unitPrice * salesReturn.Quantity
        };
    }

    private async Task ValidateCreateSalesReturnAsync(CreateSalesReturnDto dto)
    {
        // التحقق من وجود فاتورة البيع
        var salesInvoice = await _unitOfWork.SalesInvoices.GetByIdAsync(dto.SalesInvoiceId);
        if (salesInvoice == null)
            throw new ArgumentException($"Sales invoice with ID {dto.SalesInvoiceId} not found");

        // التحقق من وجود المنتج
        var product = await _unitOfWork.Products.GetByIdAsync(dto.ProductId);
        if (product == null)
            throw new ArgumentException($"Product with ID {dto.ProductId} not found");

        // التحقق من أن المنتج موجود في الفاتورة
        var invoiceDetails = await _unitOfWork.SalesInvoiceDetails.FindAsync(d => 
            d.SalesInvoiceId == dto.SalesInvoiceId && d.ProductId == dto.ProductId);
        
        var detail = invoiceDetails.FirstOrDefault();
        if (detail == null)
            throw new ArgumentException($"Product {product.Name} is not found in sales invoice {salesInvoice.InvoiceNumber}");

        // التحقق من أن الكمية المرتجعة لا تتجاوز الكمية المباعة
        var existingReturns = await _unitOfWork.SalesReturns.FindAsync(r => 
            r.SalesInvoiceId == dto.SalesInvoiceId && r.ProductId == dto.ProductId);
        
        var totalReturnedQuantity = existingReturns.Sum(r => r.Quantity);
        var availableQuantity = detail.Quantity - totalReturnedQuantity;

        if (dto.Quantity > availableQuantity)
            throw new ArgumentException($"Cannot return {dto.Quantity} items. Only {availableQuantity} items available for return");

        // التحقق من أن الكمية أكبر من صفر
        if (dto.Quantity <= 0)
            throw new ArgumentException("Return quantity must be greater than zero");
    }

    private async Task UpdateInventoryForSalesReturnAsync(int productId, int quantity, int userId)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId);
        if (product != null)
        {
            var inventoryLog = new InventoryLog
            {
                ProductId = productId,
                MovementType = MovementType.ReturnSale,
                Quantity = quantity,
                UnitCost = 0, // سيتم تحديده لاحقاً من متوسط التكلفة
                ReferenceTable = "sales_returns",
                ReferenceId = 0, // سيتم تحديده بعد حفظ المرتجع
                Note = $"Sales return - {quantity} items returned",
                UserId = userId
            };

            await _unitOfWork.InventoryLogs.AddAsync(inventoryLog);
        }
    }
}
