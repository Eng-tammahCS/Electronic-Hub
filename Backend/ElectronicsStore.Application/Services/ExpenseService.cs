using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;

namespace ElectronicsStore.Application.Services;

/// <summary>
/// خدمات المصروفات
/// </summary>
public class ExpenseService : IExpenseService
{
    private readonly IUnitOfWork _unitOfWork;

    public ExpenseService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync()
    {
        var expenses = await _unitOfWork.Expenses.GetAllAsync();
        var result = new List<ExpenseDto>();

        foreach (var expense in expenses)
        {
            var dto = await MapToExpenseDtoAsync(expense);
            result.Add(dto);
        }

        return result.OrderByDescending(e => e.CreatedAt);
    }

    public async Task<ExpenseDto?> GetExpenseByIdAsync(int id)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(id);
        if (expense == null) return null;

        return await MapToExpenseDtoAsync(expense);
    }

    public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto, int userId)
    {
        // التحقق من صحة البيانات
        ValidateCreateExpense(dto);

        // إنشاء المصروف
        var expense = new Expense
        {
            ExpenseType = dto.ExpenseType.Trim(),
            Amount = dto.Amount,
            Note = dto.Note?.Trim(),
            UserId = userId,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Expenses.AddAsync(expense);
        await _unitOfWork.SaveChangesAsync();

        return await GetExpenseByIdAsync(expense.Id) 
               ?? throw new Exception("Failed to retrieve created expense");
    }

    public async Task<ExpenseDto> UpdateExpenseAsync(int id, UpdateExpenseDto dto)
    {
        var existingExpense = await _unitOfWork.Expenses.GetByIdAsync(id);
        if (existingExpense == null)
            throw new KeyNotFoundException($"Expense with ID {id} not found");

        // التحقق من صحة البيانات
        ValidateUpdateExpense(dto);

        // تحديث البيانات
        existingExpense.ExpenseType = dto.ExpenseType.Trim();
        existingExpense.Amount = dto.Amount;
        existingExpense.Note = dto.Note?.Trim();

        await _unitOfWork.Expenses.UpdateAsync(existingExpense);
        await _unitOfWork.SaveChangesAsync();

        return await GetExpenseByIdAsync(id) 
               ?? throw new Exception("Failed to retrieve updated expense");
    }

    public async Task DeleteExpenseAsync(int id)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(id);
        if (expense == null)
            throw new KeyNotFoundException($"Expense with ID {id} not found");

        await _unitOfWork.Expenses.DeleteAsync(expense);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesByTypeAsync(string expenseType)
    {
        var expenses = await _unitOfWork.Expenses.FindAsync(e => 
            e.ExpenseType.ToLower().Contains(expenseType.ToLower()));
        
        var result = new List<ExpenseDto>();

        foreach (var expense in expenses)
        {
            var dto = await MapToExpenseDtoAsync(expense);
            result.Add(dto);
        }

        return result.OrderByDescending(e => e.CreatedAt);
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesByDateRangeAsync(DateTime? startDate, DateTime? endDate)
    {
        var allExpenses = await GetAllExpensesAsync();
        var filteredExpenses = allExpenses.AsEnumerable();

        if (startDate.HasValue)
            filteredExpenses = filteredExpenses.Where(e => e.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            filteredExpenses = filteredExpenses.Where(e => e.CreatedAt <= endDate.Value);

        return filteredExpenses.OrderByDescending(e => e.CreatedAt);
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesByUserAsync(int userId)
    {
        var expenses = await _unitOfWork.Expenses.FindAsync(e => e.UserId == userId);
        var result = new List<ExpenseDto>();

        foreach (var expense in expenses)
        {
            var dto = await MapToExpenseDtoAsync(expense);
            result.Add(dto);
        }

        return result.OrderByDescending(e => e.CreatedAt);
    }

    public async Task<ExpensesSummaryDto> GetExpensesSummaryAsync()
    {
        var allExpenses = await GetAllExpensesAsync();
        
        var today = DateTime.Today;
        var thisMonth = new DateTime(today.Year, today.Month, 1);

        // إحصائيات اليوم
        var todayExpenses = allExpenses.Where(e => e.CreatedAt.Date == today);
        
        // إحصائيات هذا الشهر
        var thisMonthExpenses = allExpenses.Where(e => e.CreatedAt >= thisMonth);

        // حساب متوسط المصروف اليومي
        var daysCount = allExpenses.Any() ? 
            (DateTime.Now - allExpenses.Min(e => e.CreatedAt)).Days + 1 : 1;
        var averageDailyExpense = daysCount > 0 ? 
            allExpenses.Sum(e => e.Amount) / daysCount : 0;

        var summary = new ExpensesSummaryDto
        {
            TotalExpenses = allExpenses.Count(),
            TotalAmount = allExpenses.Sum(e => e.Amount),
            TodayExpenses = todayExpenses.Count(),
            TodayAmount = todayExpenses.Sum(e => e.Amount),
            ThisMonthExpenses = thisMonthExpenses.Count(),
            ThisMonthAmount = thisMonthExpenses.Sum(e => e.Amount),
            AverageDailyExpense = Math.Round(averageDailyExpense, 2),
            TopExpenseTypes = (await GetTopExpenseTypesAsync(5)).ToList()
        };

        return summary;
    }

    public async Task<IEnumerable<TopExpenseTypeDto>> GetTopExpenseTypesAsync(int topCount = 10)
    {
        var allExpenses = await GetAllExpensesAsync();
        
        if (!allExpenses.Any())
            return new List<TopExpenseTypeDto>();

        var totalAmount = allExpenses.Sum(e => e.Amount);
        
        var expenseGroups = allExpenses
            .GroupBy(e => e.ExpenseType, StringComparer.OrdinalIgnoreCase)
            .Select(g => new TopExpenseTypeDto
            {
                ExpenseType = g.Key,
                Count = g.Count(),
                TotalAmount = g.Sum(e => e.Amount),
                Percentage = totalAmount > 0 ? Math.Round((g.Sum(e => e.Amount) / totalAmount) * 100, 2) : 0
            })
            .OrderByDescending(t => t.TotalAmount)
            .Take(topCount);

        return expenseGroups;
    }

    public async Task<object> GetExpensesStatsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var expenses = await GetExpensesByDateRangeAsync(startDate, endDate);
        var expensesList = expenses.ToList();

        // تجميع حسب النوع
        var expensesByType = expensesList
            .GroupBy(e => e.ExpenseType, StringComparer.OrdinalIgnoreCase)
            .Select(g => new
            {
                ExpenseType = g.Key,
                Count = g.Count(),
                TotalAmount = g.Sum(e => e.Amount),
                AverageAmount = Math.Round(g.Average(e => e.Amount), 2)
            })
            .OrderByDescending(x => x.TotalAmount);

        // تجميع حسب التاريخ (يومي)
        var expensesByDate = expensesList
            .GroupBy(e => e.CreatedAt.Date)
            .Select(g => new
            {
                Date = g.Key,
                Count = g.Count(),
                TotalAmount = g.Sum(e => e.Amount)
            })
            .OrderBy(x => x.Date);

        return new
        {
            DateRange = new { StartDate = startDate, EndDate = endDate },
            Summary = new
            {
                TotalExpenses = expensesList.Count,
                TotalAmount = expensesList.Sum(e => e.Amount),
                AverageExpense = expensesList.Any() ? Math.Round(expensesList.Average(e => e.Amount), 2) : 0,
                DaysCount = (endDate - startDate).Days + 1
            },
            ExpensesByType = expensesByType,
            ExpensesByDate = expensesByDate
        };
    }

    public async Task<IEnumerable<ExpenseDto>> SearchExpensesAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return await GetAllExpensesAsync();

        var searchTermLower = searchTerm.ToLower();
        var allExpenses = await GetAllExpensesAsync();

        return allExpenses.Where(e => 
            e.ExpenseType.ToLower().Contains(searchTermLower) ||
            (!string.IsNullOrEmpty(e.Note) && e.Note.ToLower().Contains(searchTermLower)) ||
            e.Username.ToLower().Contains(searchTermLower));
    }

    public async Task<IEnumerable<string>> GetExpenseTypesAsync()
    {
        var expenses = await _unitOfWork.Expenses.GetAllAsync();
        return expenses
            .Select(e => e.ExpenseType)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(t => t);
    }

    private async Task<ExpenseDto> MapToExpenseDtoAsync(Expense expense)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(expense.UserId);

        return new ExpenseDto
        {
            Id = expense.Id,
            ExpenseType = expense.ExpenseType,
            Amount = expense.Amount,
            Note = expense.Note,
            UserId = expense.UserId,
            Username = user?.FullName ?? user?.Username ?? "Unknown User",
            CreatedAt = expense.CreatedAt
        };
    }

    private static void ValidateCreateExpense(CreateExpenseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ExpenseType))
            throw new ArgumentException("نوع المصروف مطلوب");

        if (dto.Amount <= 0)
            throw new ArgumentException("مبلغ المصروف يجب أن يكون أكبر من صفر");
    }

    private static void ValidateUpdateExpense(UpdateExpenseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ExpenseType))
            throw new ArgumentException("نوع المصروف مطلوب");

        if (dto.Amount <= 0)
            throw new ArgumentException("مبلغ المصروف يجب أن يكون أكبر من صفر");
    }
}
