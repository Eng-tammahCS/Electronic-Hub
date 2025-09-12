using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Enums;
using ElectronicsStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsStore.WebAPI;

public static class AddSampleData
{
    public static async Task AddSamplePurchaseInvoices(ElectronicsStoreDbContext context)
    {
        // Check if we already have sample data
        var existingCount = await context.PurchaseInvoices.CountAsync();
        if (existingCount >= 8)
        {
            Console.WriteLine($"Sample data already exists ({existingCount} invoices), skipping...");
            return;
        }
        
        // Clear existing sample data if less than 8
        if (existingCount > 0)
        {
            Console.WriteLine($"Clearing existing data ({existingCount} invoices)...");
            var existingInvoices = await context.PurchaseInvoices.ToListAsync();
            context.PurchaseInvoices.RemoveRange(existingInvoices);
            await context.SaveChangesAsync();
        }

        Console.WriteLine("Adding sample purchase invoice data...");

        // Get first supplier and user
        var supplier = await context.Suppliers.FirstOrDefaultAsync();
        var user = await context.Users.FirstOrDefaultAsync();
        
        if (supplier == null || user == null)
        {
            Console.WriteLine("No supplier or user found, cannot add sample data");
            return;
        }

        // Get some products
        var products = await context.Products.Take(5).ToListAsync();
        if (products.Count == 0)
        {
            Console.WriteLine("No products found, cannot add sample data");
            return;
        }

        // Create sample purchase invoices with clear status distinction
        var today = DateTime.Today;
        var sampleInvoices = new List<PurchaseInvoice>
        {
            // Completed invoices (older than 2 days)
            new PurchaseInvoice
            {
                InvoiceNumber = "PI-2024-001",
                SupplierId = supplier.Id,
                InvoiceDate = today.AddDays(-30),
                UserId = user.Id,
                TotalAmount = 15000.00m,
                CreatedAt = today.AddDays(-30)
            },
            new PurchaseInvoice
            {
                InvoiceNumber = "PI-2024-002",
                SupplierId = supplier.Id,
                InvoiceDate = today.AddDays(-25),
                UserId = user.Id,
                TotalAmount = 8500.00m,
                CreatedAt = today.AddDays(-25)
            },
            new PurchaseInvoice
            {
                InvoiceNumber = "PI-2024-003",
                SupplierId = supplier.Id,
                InvoiceDate = today.AddDays(-20),
                UserId = user.Id,
                TotalAmount = 12000.00m,
                CreatedAt = today.AddDays(-20)
            },
            new PurchaseInvoice
            {
                InvoiceNumber = "PI-2024-004",
                SupplierId = supplier.Id,
                InvoiceDate = today.AddDays(-15),
                UserId = user.Id,
                TotalAmount = 9500.00m,
                CreatedAt = today.AddDays(-15)
            },
            new PurchaseInvoice
            {
                InvoiceNumber = "PI-2024-005",
                SupplierId = supplier.Id,
                InvoiceDate = today.AddDays(-10),
                UserId = user.Id,
                TotalAmount = 18000.00m,
                CreatedAt = today.AddDays(-10)
            },
            new PurchaseInvoice
            {
                InvoiceNumber = "PI-2024-006",
                SupplierId = supplier.Id,
                InvoiceDate = today.AddDays(-5),
                UserId = user.Id,
                TotalAmount = 7500.00m,
                CreatedAt = today.AddDays(-5)
            },
            // Pending invoices (last 2 days)
            new PurchaseInvoice
            {
                InvoiceNumber = "PI-2024-007",
                SupplierId = supplier.Id,
                InvoiceDate = today.AddDays(-1),
                UserId = user.Id,
                TotalAmount = 11000.00m,
                CreatedAt = today.AddDays(-1)
            },
            new PurchaseInvoice
            {
                InvoiceNumber = "PI-2024-008",
                SupplierId = supplier.Id,
                InvoiceDate = today,
                UserId = user.Id,
                TotalAmount = 13500.00m,
                CreatedAt = today
            }
        };

        context.PurchaseInvoices.AddRange(sampleInvoices);
        await context.SaveChangesAsync();

        // Add sample invoice details
        var addedInvoices = await context.PurchaseInvoices.ToListAsync();
        var sampleDetails = new List<PurchaseInvoiceDetail>();

        foreach (var invoice in addedInvoices)
        {
            // Add 2-4 products per invoice
            var random = new Random();
            var numProducts = random.Next(2, 5);
            var selectedProducts = products.OrderBy(x => random.Next()).Take(numProducts).ToList();

            foreach (var product in selectedProducts)
            {
                var quantity = random.Next(1, 10);
                var unitCost = (decimal)(random.NextDouble() * 1000 + 100); // 100-1100
                var lineTotal = quantity * unitCost;

                sampleDetails.Add(new PurchaseInvoiceDetail
                {
                    PurchaseInvoiceId = invoice.Id,
                    ProductId = product.Id,
                    Quantity = quantity,
                    UnitCost = unitCost
                });
            }
        }

        context.PurchaseInvoiceDetails.AddRange(sampleDetails);
        await context.SaveChangesAsync();

        // Add inventory logs
        var inventoryLogs = new List<InventoryLog>();
        foreach (var detail in sampleDetails)
        {
            inventoryLogs.Add(new InventoryLog
            {
                ProductId = detail.ProductId,
                MovementType = MovementType.Purchase,
                Quantity = detail.Quantity,
                UnitCost = detail.UnitCost,
                ReferenceTable = "purchase_invoice_details",
                ReferenceId = detail.PurchaseInvoiceId,
                UserId = user.Id,
                Note = $"شراء - فاتورة رقم {addedInvoices.First(i => i.Id == detail.PurchaseInvoiceId).InvoiceNumber}"
            });
        }

        context.InventoryLogs.AddRange(inventoryLogs);
        await context.SaveChangesAsync();

        Console.WriteLine($"Added {sampleInvoices.Count} sample purchase invoices with details and inventory logs");
    }
}
