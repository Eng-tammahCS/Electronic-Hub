using ElectronicsStore.Domain.Entities;

namespace ElectronicsStore.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<Supplier> Suppliers { get; }
    IGenericRepository<Product> Products { get; }
    IGenericRepository<User> Users { get; }
    IGenericRepository<Role> Roles { get; }
    IGenericRepository<Permission> Permissions { get; }
    IGenericRepository<PurchaseInvoice> PurchaseInvoices { get; }
    IGenericRepository<PurchaseInvoiceDetail> PurchaseInvoiceDetails { get; }
    IGenericRepository<SalesInvoice> SalesInvoices { get; }
    IGenericRepository<SalesInvoiceDetail> SalesInvoiceDetails { get; }
    IGenericRepository<InventoryLog> InventoryLogs { get; }
    IGenericRepository<SalesReturn> SalesReturns { get; }
    IGenericRepository<PurchaseReturn> PurchaseReturns { get; }
    IGenericRepository<Expense> Expenses { get; }
    
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
