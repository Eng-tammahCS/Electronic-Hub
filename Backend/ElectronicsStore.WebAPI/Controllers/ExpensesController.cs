using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.WebAPI.Extensions;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    #region CRUD Operations

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetAllExpenses()
    {
        try
        {
            var expenses = await _expenseService.GetAllExpensesAsync();
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المصروفات", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
    {
        try
        {
            var expense = await _expenseService.GetExpenseByIdAsync(id);
            if (expense == null)
                return NotFound(new { message = "المصروف غير موجود" });

            return Ok(expense);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المصروف", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense(CreateExpenseDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // الحصول على User ID من JWT Token
            var userId = User.GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "غير مصرح لك بالوصول" });

            var expense = await _expenseService.CreateExpenseAsync(dto, userId.Value);
            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في إنشاء المصروف", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, UpdateExpenseDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var expense = await _expenseService.UpdateExpenseAsync(id, dto);
            return Ok(expense);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحديث المصروف", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteExpense(int id)
    {
        try
        {
            await _expenseService.DeleteExpenseAsync(id);
            return Ok(new { message = "تم حذف المصروف بنجاح" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في حذف المصروف", error = ex.Message });
        }
    }

    #endregion

    #region Search & Filter

    [HttpGet("type/{expenseType}")]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpensesByType(string expenseType)
    {
        try
        {
            var expenses = await _expenseService.GetExpensesByTypeAsync(expenseType);
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المصروفات حسب النوع", error = ex.Message });
        }
    }

    [HttpGet("date-range")]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpensesByDateRange(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        try
        {
            var expenses = await _expenseService.GetExpensesByDateRangeAsync(startDate, endDate);
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المصروفات بالتاريخ", error = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpensesByUser(int userId)
    {
        try
        {
            var expenses = await _expenseService.GetExpensesByUserAsync(userId);
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مصروفات المستخدم", error = ex.Message });
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> SearchExpenses([FromQuery] string searchTerm)
    {
        try
        {
            var expenses = await _expenseService.SearchExpensesAsync(searchTerm);
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في البحث في المصروفات", error = ex.Message });
        }
    }

    #endregion

    #region Reports & Analytics

    [HttpGet("summary")]
    public async Task<ActionResult<ExpensesSummaryDto>> GetExpensesSummary()
    {
        try
        {
            var summary = await _expenseService.GetExpensesSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل ملخص المصروفات", error = ex.Message });
        }
    }

    [HttpGet("top-types")]
    public async Task<ActionResult<IEnumerable<TopExpenseTypeDto>>> GetTopExpenseTypes([FromQuery] int count = 10)
    {
        try
        {
            var topTypes = await _expenseService.GetTopExpenseTypesAsync(count);
            return Ok(topTypes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل أكثر أنواع المصروفات", error = ex.Message });
        }
    }

    [HttpGet("stats")]
    public async Task<ActionResult> GetExpensesStatsByDateRange(
        [FromQuery] DateTime startDate, 
        [FromQuery] DateTime endDate)
    {
        try
        {
            var stats = await _expenseService.GetExpensesStatsByDateRangeAsync(startDate, endDate);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل إحصائيات المصروفات", error = ex.Message });
        }
    }

    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<string>>> GetExpenseTypes()
    {
        try
        {
            var types = await _expenseService.GetExpenseTypesAsync();
            return Ok(types);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل أنواع المصروفات", error = ex.Message });
        }
    }

    #endregion
}
