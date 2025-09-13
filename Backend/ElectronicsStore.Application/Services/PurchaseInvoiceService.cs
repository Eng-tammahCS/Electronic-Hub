using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Application.Services;

public class PurchaseInvoiceService : IPurchaseInvoiceService
{
    private readonly IUnitOfWork _unitOfWork;

    public PurchaseInvoiceService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<PurchaseInvoiceDto>> GetAllPurchaseInvoicesAsync()
    {
        var invoices = await _unitOfWork.PurchaseInvoices.GetAllAsync();
        var invoiceDtos = new List<PurchaseInvoiceDto>();

        if (!invoices.Any())
        {
            return invoiceDtos;
        }

        // جلب جميع الموردين مرة واحدة
        var supplierIds = invoices.Select(i => i.SupplierId).Distinct().ToList();
        var suppliers = new Dictionary<int, Supplier>();
        foreach (var supplierId in supplierIds)
        {
            var supplier = await _unitOfWork.Suppliers.GetByIdAsync(supplierId);
            if (supplier != null)
            {
                suppliers[supplierId] = supplier;
            }
        }

        // جلب جميع المستخدمين مرة واحدة
        var userIds = invoices.Select(i => i.UserId).Distinct().ToList();
        var users = new Dictionary<int, User>();
        foreach (var userId in userIds)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user != null)
            {
                users[userId] = user;
            }
        }

        // جلب جميع التفاصيل مرة واحدة
        var invoiceIds = invoices.Select(i => i.Id).ToList();
        var allDetails = await _unitOfWork.PurchaseInvoiceDetails.FindAsync(d => invoiceIds.Contains(d.PurchaseInvoiceId));

        // جلب جميع المنتجات مرة واحدة
        var productIds = allDetails.Select(d => d.ProductId).Distinct().ToList();
        var products = new Dictionary<int, Product>();
        foreach (var productId in productIds)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(productId);
            if (product != null)
            {
                products[productId] = product;
            }
        }

        // تجميع البيانات
        foreach (var invoice in invoices)
        {
            var supplier = suppliers.GetValueOrDefault(invoice.SupplierId);
            var user = users.GetValueOrDefault(invoice.UserId);
            var details = allDetails.Where(d => d.PurchaseInvoiceId == invoice.Id).ToList();

            var detailDtos = new List<PurchaseInvoiceDetailDto>();
            foreach (var detail in details)
            {
                var product = products.GetValueOrDefault(detail.ProductId);
                detailDtos.Add(new PurchaseInvoiceDetailDto
                {
                    Id = detail.Id,
                    ProductId = detail.ProductId,
                    ProductName = product?.Name ?? "",
                    Quantity = detail.Quantity,
                    UnitCost = detail.UnitCost,
                    LineTotal = detail.Quantity * detail.UnitCost
                });
            }

            invoiceDtos.Add(new PurchaseInvoiceDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                SupplierId = invoice.SupplierId,
                SupplierName = supplier?.Name ?? "",
                InvoiceDate = invoice.InvoiceDate,
                UserId = invoice.UserId,
                Username = user?.FullName ?? user?.Username ?? "",
                TotalAmount = invoice.TotalAmount,
                CreatedAt = invoice.CreatedAt,
                Details = detailDtos
            });
        }

        return invoiceDtos;
    }

    public async Task<PurchaseInvoiceDto?> GetPurchaseInvoiceByIdAsync(int id)
    {
        var invoice = await _unitOfWork.PurchaseInvoices.GetByIdAsync(id);
        if (invoice == null) return null;

        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(invoice.SupplierId);
        var user = await _unitOfWork.Users.GetByIdAsync(invoice.UserId);
        var details = await _unitOfWork.PurchaseInvoiceDetails.FindAsync(d => d.PurchaseInvoiceId == invoice.Id);

        var detailDtos = new List<PurchaseInvoiceDetailDto>();
        foreach (var detail in details)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(detail.ProductId);
            detailDtos.Add(new PurchaseInvoiceDetailDto
            {
                Id = detail.Id,
                ProductId = detail.ProductId,
                ProductName = product?.Name ?? "",
                Quantity = detail.Quantity,
                UnitCost = detail.UnitCost,
                LineTotal = detail.Quantity * detail.UnitCost
            });
        }

        return new PurchaseInvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            SupplierId = invoice.SupplierId,
            SupplierName = supplier?.Name ?? "",
            InvoiceDate = invoice.InvoiceDate,
            UserId = invoice.UserId,
            Username = user?.FullName ?? user?.Username ?? "",
            TotalAmount = invoice.TotalAmount,
            CreatedAt = invoice.CreatedAt,
            Details = detailDtos
        };
    }

    public async Task<PurchaseInvoiceDto> CreatePurchaseInvoiceAsync(CreatePurchaseInvoiceDto createDto, int userId)
    {
        await _unitOfWork.BeginTransactionAsync();
        
        try
        {
            // Create invoice
            var invoice = new PurchaseInvoice
            {
                InvoiceNumber = createDto.InvoiceNumber,
                SupplierId = createDto.SupplierId,
                InvoiceDate = createDto.InvoiceDate,
                UserId = userId,
                TotalAmount = createDto.Details.Sum(d => d.Quantity * d.UnitCost)
            };

            var createdInvoice = await _unitOfWork.PurchaseInvoices.AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();

            // Create invoice details and update inventory
            foreach (var detailDto in createDto.Details)
            {
                var detail = new PurchaseInvoiceDetail
                {
                    PurchaseInvoiceId = createdInvoice.Id,
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitCost = detailDto.UnitCost
                };

                await _unitOfWork.PurchaseInvoiceDetails.AddAsync(detail);

                // Add to inventory
                var inventoryLog = new InventoryLog
                {
                    ProductId = detailDto.ProductId,
                    MovementType = MovementType.Purchase,
                    Quantity = detailDto.Quantity,
                    UnitCost = detailDto.UnitCost,
                    ReferenceTable = "purchase_invoice",
                    ReferenceId = createdInvoice.Id,
                    UserId = userId,
                    Note = $"شراء - فاتورة رقم {createDto.InvoiceNumber}"
                };

                await _unitOfWork.InventoryLogs.AddAsync(inventoryLog);
            }

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return await GetPurchaseInvoiceByIdAsync(createdInvoice.Id) ?? 
                   throw new InvalidOperationException("Failed to retrieve created invoice");
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<bool> DeletePurchaseInvoiceAsync(int id)
    {
        var invoice = await _unitOfWork.PurchaseInvoices.GetByIdAsync(id);
        if (invoice == null) return false;

        await _unitOfWork.BeginTransactionAsync();
        
        try
        {
            // Remove inventory logs
            var inventoryLogs = await _unitOfWork.InventoryLogs.FindAsync(
                il => il.ReferenceTable == "purchase_invoice" && il.ReferenceId == id);
            
            foreach (var log in inventoryLogs)
            {
                await _unitOfWork.InventoryLogs.DeleteAsync(log);
            }

            // Remove invoice details
            var details = await _unitOfWork.PurchaseInvoiceDetails.FindAsync(d => d.PurchaseInvoiceId == id);
            foreach (var detail in details)
            {
                await _unitOfWork.PurchaseInvoiceDetails.DeleteAsync(detail);
            }

            // Remove invoice
            await _unitOfWork.PurchaseInvoices.DeleteAsync(invoice);
            
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();
            
            return true;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<IEnumerable<PurchaseInvoiceDto>> GetPurchaseInvoicesBySupplierAsync(int supplierId)
    {
        var invoices = await _unitOfWork.PurchaseInvoices.FindAsync(pi => pi.SupplierId == supplierId);
        var invoiceDtos = new List<PurchaseInvoiceDto>();

        foreach (var invoice in invoices)
        {
            var invoiceDto = await GetPurchaseInvoiceByIdAsync(invoice.Id);
            if (invoiceDto != null)
                invoiceDtos.Add(invoiceDto);
        }

        return invoiceDtos;
    }

    public async Task<IEnumerable<PurchaseInvoiceDto>> GetPurchaseInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var invoices = await _unitOfWork.PurchaseInvoices.FindAsync(
            pi => pi.InvoiceDate >= startDate && pi.InvoiceDate <= endDate);
        
        var invoiceDtos = new List<PurchaseInvoiceDto>();

        foreach (var invoice in invoices)
        {
            var invoiceDto = await GetPurchaseInvoiceByIdAsync(invoice.Id);
            if (invoiceDto != null)
                invoiceDtos.Add(invoiceDto);
        }

        return invoiceDtos;
    }

    public async Task<PurchaseInvoiceDto> UpdatePurchaseInvoiceAsync(UpdatePurchaseInvoiceDto updatePurchaseInvoiceDto)
    {
        var invoice = await _unitOfWork.PurchaseInvoices.GetByIdAsync(updatePurchaseInvoiceDto.Id);
        if (invoice == null)
            throw new ArgumentException("فاتورة الشراء غير موجودة");

        // Update basic invoice information
        invoice.InvoiceNumber = updatePurchaseInvoiceDto.InvoiceNumber;
        invoice.SupplierId = updatePurchaseInvoiceDto.SupplierId;
        invoice.InvoiceDate = updatePurchaseInvoiceDto.InvoiceDate;
        invoice.TotalAmount = updatePurchaseInvoiceDto.TotalAmount;

        // Update invoice details
        var existingDetails = await _unitOfWork.PurchaseInvoiceDetails.GetAllAsync();
        var currentDetails = existingDetails.Where(d => d.PurchaseInvoiceId == invoice.Id).ToList();

        // Remove existing details
        foreach (var detail in currentDetails)
        {
            await _unitOfWork.PurchaseInvoiceDetails.DeleteAsync(detail);
        }

        // Add new details
        foreach (var detailDto in updatePurchaseInvoiceDto.Details)
        {
            var detail = new PurchaseInvoiceDetail
            {
                PurchaseInvoiceId = invoice.Id,
                ProductId = detailDto.ProductId,
                Quantity = detailDto.Quantity,
                UnitCost = detailDto.UnitCost
            };
            await _unitOfWork.PurchaseInvoiceDetails.AddAsync(detail);
        }

        await _unitOfWork.PurchaseInvoices.UpdateAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        return await GetPurchaseInvoiceByIdAsync(invoice.Id);
    }
}
