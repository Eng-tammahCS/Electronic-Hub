namespace ElectronicsStore.Domain.Entities;

public class User : BaseEntity
{
    /// <summary>
    /// اسم المستخدم (فريد)
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// البريد الإلكتروني (فريد)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// كلمة المرور المشفرة
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// الاسم الكامل
    /// </summary>
    public string? FullName { get; set; }

    /// <summary>
    /// رقم الهاتف
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// معرف الدور
    /// </summary>
    public int RoleId { get; set; }

    /// <summary>
    /// حالة المستخدم (نشط/غير نشط)
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// صورة المستخدم (مسار الصورة أو Base64)
    /// </summary>
    public string? Image { get; set; }

    /// <summary>
    /// تاريخ آخر تسجيل دخول
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    // Navigation Properties
    public virtual Role Role { get; set; } = null!;
    public virtual ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();
    public virtual ICollection<SalesInvoice> SalesInvoices { get; set; } = new List<SalesInvoice>();
    public virtual ICollection<SalesInvoice> OverriddenSalesInvoices { get; set; } = new List<SalesInvoice>();
    public virtual ICollection<InventoryLog> InventoryLogs { get; set; } = new List<InventoryLog>();
    public virtual ICollection<SalesReturn> SalesReturns { get; set; } = new List<SalesReturn>();
    public virtual ICollection<PurchaseReturn> PurchaseReturns { get; set; } = new List<PurchaseReturn>();
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
