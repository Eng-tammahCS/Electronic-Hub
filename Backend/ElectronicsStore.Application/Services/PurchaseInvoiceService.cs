using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Data;

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
        try
        {
            Console.WriteLine("=== PurchaseInvoiceService.GetAllPurchaseInvoicesAsync START ===");
            Console.WriteLine("PurchaseInvoiceService - Starting to fetch all purchase invoices...");
            
            // Get all invoices with related data in one query
            var invoices = await _unitOfWork.PurchaseInvoices.GetAllAsync();
            Console.WriteLine($"PurchaseInvoiceService - Found {invoices?.Count() ?? 0} invoices from database");
            
            if (invoices == null || !invoices.Any())
            {
                Console.WriteLine("No invoices found, returning empty list");
                return new List<PurchaseInvoiceDto>();
            }
            
            // Get all suppliers and users in one query to avoid N+1 problem
            var supplierIds = invoices.Select(i => i.SupplierId).Distinct().ToList();
            var userIds = invoices.Select(i => i.UserId).Distinct().ToList();
            
            var suppliers = await _unitOfWork.Suppliers.FindAsync(s => supplierIds.Contains(s.Id));
            var users = await _unitOfWork.Users.FindAsync(u => userIds.Contains(u.Id));
            
            // Create lookup dictionaries for faster access
            var supplierLookup = suppliers.ToDictionary(s => s.Id, s => s);
            var userLookup = users.ToDictionary(u => u.Id, u => u);
            
            var invoiceDtos = new List<PurchaseInvoiceDto>();
            
            foreach (var invoice in invoices)
            {
                try
                {
                    Console.WriteLine($"Processing invoice {invoice.Id} (InvoiceNumber: {invoice.InvoiceNumber})");
                    
                    // Get supplier and user from lookup
                    var supplier = supplierLookup.GetValueOrDefault(invoice.SupplierId);
                    var user = userLookup.GetValueOrDefault(invoice.UserId);
                    
                    Console.WriteLine($"Supplier found: {supplier?.Name ?? "NULL"}");
                    Console.WriteLine($"User found: {user?.FullName ?? user?.Username ?? "NULL"}");
                    
                    // Get invoice details
                    var details = await _unitOfWork.PurchaseInvoiceDetails.FindAsync(d => d.PurchaseInvoiceId == invoice.Id);
                    Console.WriteLine($"Found {details?.Count() ?? 0} details");

                    var detailDtos = new List<PurchaseInvoiceDetailDto>();
                    if (details != null && details.Any())
                    {
                        // Get all products for details in one query
                        var productIds = details.Select(d => d.ProductId).Distinct().ToList();
                        var products = await _unitOfWork.Products.FindAsync(p => productIds.Contains(p.Id));
                        var productLookup = products.ToDictionary(p => p.Id, p => p);
                        
                        foreach (var detail in details)
                        {
                            var product = productLookup.GetValueOrDefault(detail.ProductId);
                            detailDtos.Add(new PurchaseInvoiceDetailDto
                            {
                                Id = detail.Id,
                                ProductId = detail.ProductId,
                                ProductName = product?.Name ?? "منتج غير موجود",
                                Quantity = detail.Quantity,
                                UnitCost = detail.UnitCost,
                                LineTotal = detail.LineTotal
                            });
                        }
                    }

                    var invoiceDto = new PurchaseInvoiceDto
                    {
                        Id = invoice.Id,
                        InvoiceNumber = invoice.InvoiceNumber,
                        SupplierId = invoice.SupplierId,
                        SupplierName = supplier?.Name ?? "مورد غير موجود",
                        InvoiceDate = invoice.InvoiceDate,
                        UserId = invoice.UserId,
                        Username = user?.FullName ?? user?.Username ?? "مستخدم غير موجود",
                        TotalAmount = invoice.TotalAmount,
                        CreatedAt = invoice.CreatedAt,
                        Details = detailDtos
                    };
                    
                    invoiceDtos.Add(invoiceDto);
                    Console.WriteLine($"Successfully processed invoice {invoice.Id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"ERROR processing invoice {invoice.Id}: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    // Continue processing other invoices
                }
            }

            Console.WriteLine($"PurchaseInvoiceService - Successfully processed {invoiceDtos.Count} invoices");
            Console.WriteLine("=== PurchaseInvoiceService.GetAllPurchaseInvoicesAsync SUCCESS ===");
            return invoiceDtos;
        }
        catch (Exception ex)
        {
            Console.WriteLine("=== PurchaseInvoiceService.GetAllPurchaseInvoicesAsync ERROR ===");
            Console.WriteLine($"PurchaseInvoiceService - Error: {ex.Message}");
            Console.WriteLine($"PurchaseInvoiceService - Stack trace: {ex.StackTrace}");
            throw;
        }
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
                LineTotal = detail.LineTotal
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
        Console.WriteLine("=== CreatePurchaseInvoiceAsync - Using Entity Framework with special configuration ===");
        
        try
        {
            // Calculate total amount
            var totalAmount = createDto.Details.Sum(d => d.Quantity * d.UnitCost);
            Console.WriteLine($"Total amount calculated: {totalAmount}");
            
            // Create invoice using Entity Framework
            var invoice = new PurchaseInvoice
            {
                InvoiceNumber = createDto.InvoiceNumber,
                SupplierId = createDto.SupplierId,
                InvoiceDate = createDto.InvoiceDate,
                UserId = userId,
                TotalAmount = totalAmount
            };

            Console.WriteLine($"Creating invoice: {invoice.InvoiceNumber}, Supplier: {invoice.SupplierId}, User: {userId}");
            
            // Add invoice
            await _unitOfWork.PurchaseInvoices.AddAsync(invoice);
            
            // Save invoice first to get the ID
            await _unitOfWork.SaveChangesAsync();
            Console.WriteLine($"Successfully created invoice with ID: {invoice.Id}");
            
            // Create invoice details
            foreach (var detailDto in createDto.Details)
            {
                var detail = new PurchaseInvoiceDetail
                {
                    PurchaseInvoiceId = invoice.Id,
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitCost = detailDto.UnitCost
                };

                await _unitOfWork.PurchaseInvoiceDetails.AddAsync(detail);

                // Add to inventory log
                var inventoryLog = new InventoryLog
                {
                    ProductId = detailDto.ProductId,
                    MovementType = MovementType.Purchase,
                    Quantity = detailDto.Quantity,
                    UnitCost = detailDto.UnitCost,
                    ReferenceTable = "purchase_invoice",
                    ReferenceId = invoice.Id,
                    UserId = userId,
                    Note = $"شراء - فاتورة رقم {createDto.InvoiceNumber}"
                };

                await _unitOfWork.InventoryLogs.AddAsync(inventoryLog);
            }

            // Save all changes
            await _unitOfWork.SaveChangesAsync();

            return await GetPurchaseInvoiceByIdAsync(invoice.Id) ?? 
                   throw new InvalidOperationException("Failed to retrieve created invoice");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== CreatePurchaseInvoiceAsync - ERROR: {ex.Message} ===");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
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

    public async Task<PurchaseInvoiceDto> UpdatePurchaseInvoiceAsync(int id, UpdatePurchaseInvoiceDto updateDto, int userId)
    {
        Console.WriteLine("=== UpdatePurchaseInvoiceAsync - START ===");
        Console.WriteLine($"Updating invoice ID: {id}");
        Console.WriteLine($"Update data: InvoiceNumber={updateDto.InvoiceNumber}, SupplierId={updateDto.SupplierId}");
        Console.WriteLine($"Details count: {updateDto.Details.Count}");
        
        try
        {
            // Get existing invoice
            var existingInvoice = await _unitOfWork.PurchaseInvoices.GetByIdAsync(id);
            if (existingInvoice == null)
            {
                throw new KeyNotFoundException($"فاتورة الشراء رقم {id} غير موجودة");
            }

            // Calculate total amount
            var totalAmount = updateDto.Details.Sum(d => d.Quantity * d.UnitCost);
            Console.WriteLine($"Total amount calculated: {totalAmount}");

            // Update invoice
            existingInvoice.InvoiceNumber = updateDto.InvoiceNumber;
            existingInvoice.SupplierId = updateDto.SupplierId;
            existingInvoice.InvoiceDate = updateDto.InvoiceDate;
            existingInvoice.TotalAmount = totalAmount;

            Console.WriteLine($"Updated invoice: {existingInvoice.InvoiceNumber}");

            // Delete existing details
            var existingDetails = await _unitOfWork.PurchaseInvoiceDetails.FindAsync(d => d.PurchaseInvoiceId == id);
            foreach (var detail in existingDetails)
            {
                await _unitOfWork.PurchaseInvoiceDetails.DeleteAsync(detail);
            }

            // Add new details
            foreach (var detailDto in updateDto.Details)
            {
                Console.WriteLine($"Creating detail for product {detailDto.ProductId}, quantity {detailDto.Quantity}");
                
                var detail = new PurchaseInvoiceDetail
                {
                    PurchaseInvoiceId = id,
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitCost = detailDto.UnitCost
                };

                await _unitOfWork.PurchaseInvoiceDetails.AddAsync(detail);
            }

            // Update inventory logs
            foreach (var detailDto in updateDto.Details)
            {
                var inventoryLog = new InventoryLog
                {
                    ProductId = detailDto.ProductId,
                    MovementType = MovementType.Purchase,
                    Quantity = detailDto.Quantity,
                    UnitCost = detailDto.UnitCost,
                    ReferenceTable = "purchase_invoice_details",
                    ReferenceId = id,
                    UserId = userId,
                    Note = $"تحديث شراء - فاتورة رقم {updateDto.InvoiceNumber}"
                };

                await _unitOfWork.InventoryLogs.AddAsync(inventoryLog);
            }

            // Save all changes
            await _unitOfWork.SaveChangesAsync();
            Console.WriteLine("=== UpdatePurchaseInvoiceAsync - SUCCESS ===");

            return await GetPurchaseInvoiceByIdAsync(id) ?? 
                   throw new InvalidOperationException("Failed to retrieve updated invoice");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== UpdatePurchaseInvoiceAsync - ERROR: {ex.Message} ===");
            Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }
}
