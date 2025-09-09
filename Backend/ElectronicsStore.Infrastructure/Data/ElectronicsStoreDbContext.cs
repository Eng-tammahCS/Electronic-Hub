using Microsoft.EntityFrameworkCore;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Infrastructure.Data;

public class ElectronicsStoreDbContext : DbContext
{
    public ElectronicsStoreDbContext(DbContextOptions<ElectronicsStoreDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<Category> Categories { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
    public DbSet<PurchaseInvoiceDetail> PurchaseInvoiceDetails { get; set; }
    public DbSet<SalesInvoice> SalesInvoices { get; set; }
    public DbSet<SalesInvoiceDetail> SalesInvoiceDetails { get; set; }
    public DbSet<InventoryLog> InventoryLogs { get; set; }
    public DbSet<SalesReturn> SalesReturns { get; set; }
    public DbSet<PurchaseReturn> PurchaseReturns { get; set; }
    public DbSet<Expense> Expenses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure table names to match database schema
        modelBuilder.Entity<Category>().ToTable("categories");
        modelBuilder.Entity<Supplier>().ToTable("suppliers");
        modelBuilder.Entity<Product>().ToTable("products");
        modelBuilder.Entity<Role>().ToTable("roles");
        modelBuilder.Entity<Permission>().ToTable("permissions");
        modelBuilder.Entity<RolePermission>().ToTable("role_permissions");
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<PurchaseInvoice>().ToTable("purchase_invoices");
        modelBuilder.Entity<PurchaseInvoiceDetail>().ToTable("purchase_invoice_details");
        modelBuilder.Entity<SalesInvoice>().ToTable("sales_invoices");
        modelBuilder.Entity<SalesInvoiceDetail>().ToTable("sales_invoice_details");
        modelBuilder.Entity<InventoryLog>().ToTable("inventory_logs");
        modelBuilder.Entity<SalesReturn>().ToTable("sales_returns");
        modelBuilder.Entity<PurchaseReturn>().ToTable("purchase_returns");
        modelBuilder.Entity<Expense>().ToTable("expenses");

        // Configure primary keys and column names
        ConfigureEntities(modelBuilder);
        
        // Configure relationships
        ConfigureRelationships(modelBuilder);
        
        // Configure enums
        ConfigureEnums(modelBuilder);
    }

    private void ConfigureEntities(ModelBuilder modelBuilder)
    {
        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Ignore(e => e.CreatedAt); // Ignore CreatedAt since it doesn't exist in DB
        });

        // Supplier
        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Phone).HasColumnName("phone").HasMaxLength(20);
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(100);
            entity.Property(e => e.Address).HasColumnName("address").HasMaxLength(200);
            entity.Ignore(e => e.CreatedAt); // Ignore CreatedAt since it doesn't exist in DB
        });

        // Product
        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
            entity.Property(e => e.Barcode).HasColumnName("barcode").HasMaxLength(50);
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id");
            entity.Property(e => e.DefaultCostPrice).HasColumnName("default_cost_price").HasColumnType("decimal(10,2)");
            entity.Property(e => e.DefaultSellingPrice).HasColumnName("default_selling_price").HasColumnType("decimal(10,2)");
            entity.Property(e => e.MinSellingPrice).HasColumnName("min_selling_price").HasColumnType("decimal(10,2)");
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
        });

        // Role
        modelBuilder.Entity<Role>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(50).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
        });

        // Permission
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
        });

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Username).HasColumnName("username").HasMaxLength(50).IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Password).HasColumnName("password").HasMaxLength(255).IsRequired();
            entity.Property(e => e.FullName).HasColumnName("full_name").HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasColumnName("phone_number").HasMaxLength(20);
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.LastLoginAt).HasColumnName("last_login_at");
            entity.Property(e => e.Image).HasColumnName("image").HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");

            // Unique constraints
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // PurchaseInvoice
        modelBuilder.Entity<PurchaseInvoice>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.InvoiceNumber).HasColumnName("invoice_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id");
            entity.Property(e => e.InvoiceDate).HasColumnName("invoice_date").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("decimal(14,2)");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
        });

        // PurchaseInvoiceDetail
        modelBuilder.Entity<PurchaseInvoiceDetail>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PurchaseInvoiceId).HasColumnName("purchase_invoice_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UnitCost).HasColumnName("unit_cost").HasColumnType("decimal(10,2)");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
            entity.Ignore(e => e.LineTotal); // Computed column
        });

        // SalesInvoice
        modelBuilder.Entity<SalesInvoice>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.InvoiceNumber).HasColumnName("invoice_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.CustomerName).HasColumnName("customer_name").HasMaxLength(100);
            entity.Property(e => e.InvoiceDate).HasColumnName("invoice_date").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.DiscountTotal).HasColumnName("discount_total").HasColumnType("decimal(12,2)");
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("decimal(14,2)");
            entity.Property(e => e.OverrideByUserId).HasColumnName("override_by_user_id");
            entity.Property(e => e.OverrideDate).HasColumnName("override_date");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Ignore(e => e.CreatedAt); // Not in DB schema
        });

        // SalesInvoiceDetail
        modelBuilder.Entity<SalesInvoiceDetail>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SalesInvoiceId).HasColumnName("sales_invoice_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasColumnType("decimal(10,2)");
            entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasColumnType("decimal(10,2)");
            entity.Property(e => e.LineTotal).HasColumnName("line_total").HasColumnType("decimal(12,2)");
            entity.Ignore(e => e.CreatedAt); // Not in DB schema
        });

        // InventoryLog
        modelBuilder.Entity<InventoryLog>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UnitCost).HasColumnName("unit_cost").HasColumnType("decimal(10,2)");
            entity.Property(e => e.ReferenceTable).HasColumnName("reference_tbl").HasMaxLength(50);
            entity.Property(e => e.ReferenceId).HasColumnName("reference_id");
            entity.Property(e => e.Note).HasColumnName("note").HasMaxLength(200);
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
        });

        // SalesReturn
        modelBuilder.Entity<SalesReturn>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SalesInvoiceId).HasColumnName("sales_invoice_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Reason).HasColumnName("reason").HasMaxLength(200);
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
        });

        // PurchaseReturn
        modelBuilder.Entity<PurchaseReturn>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PurchaseInvoiceId).HasColumnName("purchase_invoice_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Reason).HasColumnName("reason").HasMaxLength(200);
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
        });

        // Expense
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ExpenseType).HasColumnName("expense_type").HasMaxLength(100);
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("decimal(12,2)");
            entity.Property(e => e.Note).HasColumnName("note").HasMaxLength(200);
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
        });
    }

    private void ConfigureRelationships(ModelBuilder modelBuilder)
    {
        // RolePermission - Many to Many
        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<RolePermission>()
            .Property(rp => rp.RoleId).HasColumnName("role_id");

        modelBuilder.Entity<RolePermission>()
            .Property(rp => rp.PermissionId).HasColumnName("permission_id");

        // Product relationships
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Supplier)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.SupplierId);

        // User relationships
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId);

        // PurchaseInvoice relationships
        modelBuilder.Entity<PurchaseInvoice>()
            .HasOne(pi => pi.Supplier)
            .WithMany(s => s.PurchaseInvoices)
            .HasForeignKey(pi => pi.SupplierId);

        modelBuilder.Entity<PurchaseInvoice>()
            .HasOne(pi => pi.User)
            .WithMany(u => u.PurchaseInvoices)
            .HasForeignKey(pi => pi.UserId);

        // PurchaseInvoiceDetail relationships
        modelBuilder.Entity<PurchaseInvoiceDetail>()
            .HasOne(pid => pid.PurchaseInvoice)
            .WithMany(pi => pi.PurchaseInvoiceDetails)
            .HasForeignKey(pid => pid.PurchaseInvoiceId);

        modelBuilder.Entity<PurchaseInvoiceDetail>()
            .HasOne(pid => pid.Product)
            .WithMany(p => p.PurchaseInvoiceDetails)
            .HasForeignKey(pid => pid.ProductId);

        // SalesInvoice relationships
        modelBuilder.Entity<SalesInvoice>()
            .HasOne(si => si.User)
            .WithMany(u => u.SalesInvoices)
            .HasForeignKey(si => si.UserId);

        modelBuilder.Entity<SalesInvoice>()
            .HasOne(si => si.OverrideByUser)
            .WithMany(u => u.OverriddenSalesInvoices)
            .HasForeignKey(si => si.OverrideByUserId);

        // SalesInvoiceDetail relationships
        modelBuilder.Entity<SalesInvoiceDetail>()
            .HasOne(sid => sid.SalesInvoice)
            .WithMany(si => si.SalesInvoiceDetails)
            .HasForeignKey(sid => sid.SalesInvoiceId);

        modelBuilder.Entity<SalesInvoiceDetail>()
            .HasOne(sid => sid.Product)
            .WithMany(p => p.SalesInvoiceDetails)
            .HasForeignKey(sid => sid.ProductId);

        // InventoryLog relationships
        modelBuilder.Entity<InventoryLog>()
            .HasOne(il => il.Product)
            .WithMany(p => p.InventoryLogs)
            .HasForeignKey(il => il.ProductId);

        modelBuilder.Entity<InventoryLog>()
            .HasOne(il => il.User)
            .WithMany(u => u.InventoryLogs)
            .HasForeignKey(il => il.UserId);

        // Returns relationships
        modelBuilder.Entity<SalesReturn>()
            .HasOne(sr => sr.SalesInvoice)
            .WithMany(si => si.SalesReturns)
            .HasForeignKey(sr => sr.SalesInvoiceId);

        modelBuilder.Entity<SalesReturn>()
            .HasOne(sr => sr.Product)
            .WithMany(p => p.SalesReturns)
            .HasForeignKey(sr => sr.ProductId);

        modelBuilder.Entity<SalesReturn>()
            .HasOne(sr => sr.User)
            .WithMany(u => u.SalesReturns)
            .HasForeignKey(sr => sr.UserId);

        modelBuilder.Entity<PurchaseReturn>()
            .HasOne(pr => pr.PurchaseInvoice)
            .WithMany(pi => pi.PurchaseReturns)
            .HasForeignKey(pr => pr.PurchaseInvoiceId);

        modelBuilder.Entity<PurchaseReturn>()
            .HasOne(pr => pr.Product)
            .WithMany(p => p.PurchaseReturns)
            .HasForeignKey(pr => pr.ProductId);

        modelBuilder.Entity<PurchaseReturn>()
            .HasOne(pr => pr.User)
            .WithMany(u => u.PurchaseReturns)
            .HasForeignKey(pr => pr.UserId);

        // Expense relationships
        modelBuilder.Entity<Expense>()
            .HasOne(e => e.User)
            .WithMany(u => u.Expenses)
            .HasForeignKey(e => e.UserId);
    }

    private void ConfigureEnums(ModelBuilder modelBuilder)
    {
        // PaymentMethod enum
        modelBuilder.Entity<SalesInvoice>()
            .Property(e => e.PaymentMethod)
            .HasColumnName("payment_method")
            .HasConversion(
                v => v.ToString().ToLower(),
                v => (PaymentMethod)Enum.Parse(typeof(PaymentMethod), v, true));

        // MovementType enum
        modelBuilder.Entity<InventoryLog>()
            .Property(e => e.MovementType)
            .HasColumnName("movement_type")
            .HasConversion(
                v => v.ToString().ToLower(),
                v => (MovementType)Enum.Parse(typeof(MovementType), v, true));
    }
}
