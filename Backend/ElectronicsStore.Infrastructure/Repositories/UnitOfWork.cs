using Microsoft.EntityFrameworkCore.Storage;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Infrastructure.Data;

namespace ElectronicsStore.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ElectronicsStoreDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(ElectronicsStoreDbContext context)
    {
        _context = context;
        
        Categories = new GenericRepository<Category>(_context);
        Suppliers = new GenericRepository<Supplier>(_context);
        Products = new GenericRepository<Product>(_context);
        Users = new GenericRepository<User>(_context);
        Roles = new GenericRepository<Role>(_context);
        Permissions = new GenericRepository<Permission>(_context);
        PurchaseInvoices = new GenericRepository<PurchaseInvoice>(_context);
        PurchaseInvoiceDetails = new GenericRepository<PurchaseInvoiceDetail>(_context);
        SalesInvoices = new GenericRepository<SalesInvoice>(_context);
        SalesInvoiceDetails = new GenericRepository<SalesInvoiceDetail>(_context);
        InventoryLogs = new GenericRepository<InventoryLog>(_context);
        SalesReturns = new GenericRepository<SalesReturn>(_context);
        PurchaseReturns = new GenericRepository<PurchaseReturn>(_context);
        Expenses = new GenericRepository<Expense>(_context);
    }

    public IGenericRepository<Category> Categories { get; }
    public IGenericRepository<Supplier> Suppliers { get; }
    public IGenericRepository<Product> Products { get; }
    public IGenericRepository<User> Users { get; }
    public IGenericRepository<Role> Roles { get; }
    public IGenericRepository<Permission> Permissions { get; }
    public IGenericRepository<PurchaseInvoice> PurchaseInvoices { get; }
    public IGenericRepository<PurchaseInvoiceDetail> PurchaseInvoiceDetails { get; }
    public IGenericRepository<SalesInvoice> SalesInvoices { get; }
    public IGenericRepository<SalesInvoiceDetail> SalesInvoiceDetails { get; }
    public IGenericRepository<InventoryLog> InventoryLogs { get; }
    public IGenericRepository<SalesReturn> SalesReturns { get; }
    public IGenericRepository<PurchaseReturn> PurchaseReturns { get; }
    public IGenericRepository<Expense> Expenses { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
