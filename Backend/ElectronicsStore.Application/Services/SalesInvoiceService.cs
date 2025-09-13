using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Application.Services;

public class SalesInvoiceService : ISalesInvoiceService
{
    private readonly IUnitOfWork _unitOfWork;

    public SalesInvoiceService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SalesInvoiceDto>> GetAllSalesInvoicesAsync()
    {
        var invoices = await _unitOfWork.SalesInvoices.GetAllAsync();
        var result = new List<SalesInvoiceDto>();

        foreach (var invoice in invoices)
        {
            var details = await _unitOfWork.SalesInvoiceDetails.FindAsync(d => d.SalesInvoiceId == invoice.Id);
            var user = await _unitOfWork.Users.GetByIdAsync(invoice.UserId);
            
            User? overrideUser = null;
            if (invoice.OverrideByUserId.HasValue)
            {
                overrideUser = await _unitOfWork.Users.GetByIdAsync(invoice.OverrideByUserId.Value);
            }

            result.Add(new SalesInvoiceDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                CustomerName = invoice.CustomerName,
                InvoiceDate = invoice.InvoiceDate,
                DiscountTotal = invoice.DiscountTotal,
                TotalAmount = invoice.TotalAmount,
                PaymentMethod = invoice.PaymentMethod,
                OverrideByUserId = invoice.OverrideByUserId,
                OverrideByUsername = overrideUser?.FullName ?? overrideUser?.Username,
                OverrideDate = invoice.OverrideDate,
                UserId = invoice.UserId,
                Username = user?.FullName ?? user?.Username ?? "Unknown",
                CreatedAt = invoice.CreatedAt,
                Details = await GetInvoiceDetailsAsync(details)
            });
        }

        return result.OrderByDescending(i => i.CreatedAt);
    }

    public async Task<SalesInvoiceDto?> GetSalesInvoiceByIdAsync(int id)
    {
        var invoice = await _unitOfWork.SalesInvoices.GetByIdAsync(id);
        if (invoice == null) return null;

        var details = await _unitOfWork.SalesInvoiceDetails.FindAsync(d => d.SalesInvoiceId == invoice.Id);
        var user = await _unitOfWork.Users.GetByIdAsync(invoice.UserId);
        
        User? overrideUser = null;
        if (invoice.OverrideByUserId.HasValue)
        {
            overrideUser = await _unitOfWork.Users.GetByIdAsync(invoice.OverrideByUserId.Value);
        }

        return new SalesInvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerName = invoice.CustomerName,
            InvoiceDate = invoice.InvoiceDate,
            DiscountTotal = invoice.DiscountTotal,
            TotalAmount = invoice.TotalAmount,
            PaymentMethod = invoice.PaymentMethod,
            OverrideByUserId = invoice.OverrideByUserId,
            OverrideByUsername = overrideUser?.FullName ?? overrideUser?.Username,
            OverrideDate = invoice.OverrideDate,
            UserId = invoice.UserId,
            Username = user?.FullName ?? user?.Username ?? "Unknown",
            CreatedAt = invoice.CreatedAt,
            Details = await GetInvoiceDetailsAsync(details)
        };
    }

    public async Task<SalesInvoiceDto> CreateSalesInvoiceAsync(CreateSalesInvoiceDto dto, int userId)
    {
        await _unitOfWork.BeginTransactionAsync();
        
        try
        {
            // Validate products and check minimum prices
            var validationResult = await ValidateInvoiceDetailsAsync(dto.Details, userId);
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(validationResult.ErrorMessage);
            }

            // Create invoice
            var invoice = new SalesInvoice
            {
                InvoiceNumber = dto.InvoiceNumber,
                CustomerName = dto.CustomerName,
                InvoiceDate = dto.InvoiceDate,
                DiscountTotal = dto.DiscountTotal,
                PaymentMethod = dto.PaymentMethod,
                UserId = userId,
                OverrideByUserId = validationResult.RequiresOverride ? userId : null,
                OverrideDate = validationResult.RequiresOverride ? DateTime.Now : null,
                CreatedAt = DateTime.Now
            };

            // Calculate total amount
            decimal totalAmount = 0;
            var invoiceDetails = new List<SalesInvoiceDetail>();

            foreach (var detailDto in dto.Details)
            {
                var lineTotal = (detailDto.UnitPrice * detailDto.Quantity) - detailDto.DiscountAmount;
                totalAmount += lineTotal;

                invoiceDetails.Add(new SalesInvoiceDetail
                {
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitPrice = detailDto.UnitPrice,
                    DiscountAmount = detailDto.DiscountAmount,
                    // إزالة LineTotal - سيتم حسابه تلقائياً في قاعدة البيانات
                });
            }

            invoice.TotalAmount = totalAmount - dto.DiscountTotal;

            // Save invoice
            await _unitOfWork.SalesInvoices.AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();

            // Save details
            foreach (var detail in invoiceDetails)
            {
                detail.SalesInvoiceId = invoice.Id;
                await _unitOfWork.SalesInvoiceDetails.AddAsync(detail);
                Console.WriteLine($"Added detail: ProductId={detail.ProductId}, Quantity={detail.Quantity}, UnitPrice={detail.UnitPrice}");
            }

            // Update inventory (reduce quantities)
            await UpdateInventoryAsync(dto.Details, MovementType.Sale);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();
            
            // Log saved details for debugging
            Console.WriteLine($"Saved {invoiceDetails.Count} invoice details for invoice {invoice.Id}");
            
            // Verify details were saved
            var savedDetails = await _unitOfWork.SalesInvoiceDetails.FindAsync(d => d.SalesInvoiceId == invoice.Id);
            Console.WriteLine($"Verified: Found {savedDetails.Count()} details in database for invoice {invoice.Id}");

            return await GetSalesInvoiceByIdAsync(invoice.Id) ?? throw new Exception("Failed to retrieve created invoice");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            Console.WriteLine($"Error creating sales invoice: {ex.Message}");
            throw;
        }
    }

    public async Task DeleteSalesInvoiceAsync(int id)
    {
        var invoice = await _unitOfWork.SalesInvoices.GetByIdAsync(id);
        if (invoice == null)
            throw new KeyNotFoundException($"Sales invoice with ID {id} not found");

        var details = await _unitOfWork.SalesInvoiceDetails.FindAsync(d => d.SalesInvoiceId == id);

        // Restore inventory (add back quantities)
        var restoreDetails = details.Select(d => new CreateSalesInvoiceDetailDto
        {
            ProductId = d.ProductId,
            Quantity = d.Quantity,
            UnitPrice = d.UnitPrice,
            DiscountAmount = d.DiscountAmount
        }).ToList();

        await UpdateInventoryAsync(restoreDetails, MovementType.ReturnSale);

        // Delete details first
        foreach (var detail in details)
        {
            await _unitOfWork.SalesInvoiceDetails.DeleteAsync(detail);
        }

        // Delete invoice
        await _unitOfWork.SalesInvoices.DeleteAsync(invoice);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task<List<SalesInvoiceDetailDto>> GetInvoiceDetailsAsync(IEnumerable<SalesInvoiceDetail> details)
    {
        var result = new List<SalesInvoiceDetailDto>();
        Console.WriteLine($"GetInvoiceDetailsAsync: Processing {details.Count()} details");

        foreach (var detail in details)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(detail.ProductId);
            Console.WriteLine($"Processing detail: Id={detail.Id}, ProductId={detail.ProductId}, ProductName={product?.Name ?? "Unknown"}, Quantity={detail.Quantity}");
            result.Add(new SalesInvoiceDetailDto
            {
                Id = detail.Id,
                ProductId = detail.ProductId,
                ProductName = product?.Name ?? "Unknown Product",
                Quantity = detail.Quantity,
                UnitPrice = detail.UnitPrice,
                DiscountAmount = detail.DiscountAmount
                // LineTotal will be calculated automatically by the DTO property
            });
        }

        Console.WriteLine($"GetInvoiceDetailsAsync: Returning {result.Count} details");
        return result;
    }

    private async Task<ValidationResult> ValidateInvoiceDetailsAsync(List<CreateSalesInvoiceDetailDto> details, int userId)
    {
        bool requiresOverride = false;
        var errors = new List<string>();

        foreach (var detail in details)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(detail.ProductId);
            if (product == null)
            {
                errors.Add($"المنتج برقم {detail.ProductId} غير موجود");
                continue;
            }

            // Check if price is below minimum
            if (detail.UnitPrice < product.MinSellingPrice)
            {
                requiresOverride = true;
                Console.WriteLine($"Warning: Price {detail.UnitPrice} for product {product.Name} is below minimum {product.MinSellingPrice}. Override required.");
            }

            // Check inventory availability
            var inventoryLogs = await _unitOfWork.InventoryLogs.FindAsync(l => l.ProductId == detail.ProductId);
            var currentStock = inventoryLogs.Sum(l => l.MovementType == MovementType.Purchase ? l.Quantity : -l.Quantity);
            
            if (currentStock < detail.Quantity)
            {
                errors.Add($"المخزون غير كافي للمنتج '{product.Name}'. المتوفر: {currentStock}, المطلوب: {detail.Quantity}");
            }

            // Additional validations
            if (detail.Quantity <= 0)
            {
                errors.Add($"الكمية يجب أن تكون أكبر من صفر للمنتج '{product.Name}'");
            }

            if (detail.UnitPrice < 0)
            {
                errors.Add($"سعر الوحدة يجب أن يكون أكبر من أو يساوي صفر للمنتج '{product.Name}'");
            }

            if (detail.DiscountAmount < 0)
            {
                errors.Add($"مبلغ الخصم يجب أن يكون أكبر من أو يساوي صفر للمنتج '{product.Name}'");
            }
        }

        return new ValidationResult
        {
            IsValid = errors.Count == 0,
            RequiresOverride = requiresOverride,
            ErrorMessage = errors.Count > 0 ? string.Join("; ", errors) : string.Empty
        };
    }

    private async Task UpdateInventoryAsync(List<CreateSalesInvoiceDetailDto> details, MovementType movementType)
    {
        foreach (var detail in details)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(detail.ProductId);
            if (product != null)
            {
                // تحديد الكمية بناءً على نوع الحركة
                int quantity = movementType == MovementType.Sale ? -detail.Quantity : detail.Quantity;

                var inventoryLog = new InventoryLog
                {
                    ProductId = detail.ProductId,
                    MovementType = movementType,
                    Quantity = quantity,
                    UnitCost = detail.UnitPrice,
                    ReferenceTable = "sales_invoices",
                    ReferenceId = 0, // Will be updated after invoice creation
                    Note = $"فاتورة مبيعات - {movementType}",
                    UserId = 1 // TODO: Get actual user ID
                };

                await _unitOfWork.InventoryLogs.AddAsync(inventoryLog);
                Console.WriteLine($"Added inventory log: ProductId={detail.ProductId}, Quantity={quantity}, MovementType={movementType}");
            }
        }
    }

    private class ValidationResult
    {
        public bool IsValid { get; set; }
        public bool RequiresOverride { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public async Task<SalesInvoiceDto?> GetSalesInvoiceAsync(int id)
    {
        return await GetSalesInvoiceByIdAsync(id);
    }

    public async Task<IEnumerable<SalesInvoiceDto>> GetSalesInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var invoices = await _unitOfWork.SalesInvoices.FindAsync(i =>
            i.InvoiceDate >= startDate && i.InvoiceDate <= endDate);

        var result = new List<SalesInvoiceDto>();

        foreach (var invoice in invoices)
        {
            var details = await _unitOfWork.SalesInvoiceDetails.FindAsync(d => d.SalesInvoiceId == invoice.Id);
            var user = await _unitOfWork.Users.GetByIdAsync(invoice.UserId);

            User? overrideUser = null;
            if (invoice.OverrideByUserId.HasValue)
            {
                overrideUser = await _unitOfWork.Users.GetByIdAsync(invoice.OverrideByUserId.Value);
            }

            result.Add(new SalesInvoiceDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                CustomerName = invoice.CustomerName,
                InvoiceDate = invoice.InvoiceDate,
                DiscountTotal = invoice.DiscountTotal,
                TotalAmount = invoice.TotalAmount,
                PaymentMethod = invoice.PaymentMethod,
                OverrideByUserId = invoice.OverrideByUserId,
                OverrideByUsername = overrideUser?.FullName ?? overrideUser?.Username,
                OverrideDate = invoice.OverrideDate,
                UserId = invoice.UserId,
                Username = user?.FullName ?? user?.Username ?? "Unknown",
                CreatedAt = invoice.CreatedAt,
                Details = await GetInvoiceDetailsAsync(details)
            });
        }

        return result.OrderByDescending(i => i.CreatedAt);
    }

    public async Task<SalesInvoiceDto> CreateSalesInvoiceAsync(CreateSalesInvoiceDto dto)
    {
        // استخدام userId افتراضي أو الحصول عليه من السياق
        return await CreateSalesInvoiceAsync(dto, 1); // TODO: Get actual user ID from context
    }


    // Return functionality will be added later
    /*
    public async Task<IEnumerable<SalesInvoiceDto>> GetReturnedInvoicesAsync()
    {
        // Implementation will be added later
        throw new NotImplementedException("Return functionality will be added later");
    }
    */

    public async Task<SalesInvoiceDto?> UpdateSalesInvoiceAsync(int id, UpdateSalesInvoiceDto dto, int userId)
    {
        var existingInvoice = await _unitOfWork.SalesInvoices.GetByIdAsync(id);
        if (existingInvoice == null)
            return null;

        // TODO: Implement update logic
        // This is a placeholder implementation
        throw new NotImplementedException("Update functionality not yet implemented");
    }
}

