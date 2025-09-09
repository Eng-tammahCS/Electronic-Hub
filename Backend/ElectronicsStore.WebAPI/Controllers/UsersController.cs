using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.WebAPI.Extensions;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    #region CRUD Operations

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المستخدمين", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "المستخدم غير موجود" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المستخدم", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في إنشاء المستخدم", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, UpdateUserDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userService.UpdateUserAsync(id, dto);
            return Ok(user);
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
            return StatusCode(500, new { message = "خطأ في تحديث المستخدم", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        try
        {
            await _userService.DeleteUserAsync(id);
            return Ok(new { message = "تم حذف المستخدم بنجاح" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في حذف المستخدم", error = ex.Message });
        }
    }

    #endregion

    #region User Management

    [HttpPut("{id}/activate")]
    public async Task<ActionResult> ActivateUser(int id)
    {
        try
        {
            await _userService.ActivateUserAsync(id);
            return Ok(new { message = "تم تفعيل المستخدم بنجاح" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تفعيل المستخدم", error = ex.Message });
        }
    }

    [HttpPut("{id}/deactivate")]
    public async Task<ActionResult> DeactivateUser(int id)
    {
        try
        {
            await _userService.DeactivateUserAsync(id);
            return Ok(new { message = "تم إلغاء تفعيل المستخدم بنجاح" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في إلغاء تفعيل المستخدم", error = ex.Message });
        }
    }

    [HttpPut("{id}/change-password")]
    public async Task<ActionResult> ChangePassword(int id, ChangePasswordDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _userService.ChangePasswordAsync(id, dto);
            return Ok(new { message = "تم تغيير كلمة المرور بنجاح" });
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
            return StatusCode(500, new { message = "خطأ في تغيير كلمة المرور", error = ex.Message });
        }
    }

    [HttpPut("{id}/reset-password")]
    public async Task<ActionResult> ResetPassword(int id)
    {
        try
        {
            await _userService.ResetPasswordAsync(id);
            return Ok(new { message = "تم إعادة تعيين كلمة المرور بنجاح" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في إعادة تعيين كلمة المرور", error = ex.Message });
        }
    }

    #endregion

    #region Search & Filter

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string searchTerm)
    {
        try
        {
            var users = await _userService.SearchUsersAsync(searchTerm);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في البحث في المستخدمين", error = ex.Message });
        }
    }

    [HttpGet("role/{roleId}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersByRole(int roleId)
    {
        try
        {
            var users = await _userService.GetUsersByRoleAsync(roleId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مستخدمي الدور", error = ex.Message });
        }
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetActiveUsers()
    {
        try
        {
            var users = await _userService.GetActiveUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المستخدمين النشطين", error = ex.Message });
        }
    }

    [HttpGet("inactive")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetInactiveUsers()
    {
        try
        {
            var users = await _userService.GetInactiveUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المستخدمين غير النشطين", error = ex.Message });
        }
    }

    #endregion

    #region Reports & Analytics

    [HttpGet("summary")]
    public async Task<ActionResult<UsersSummaryDto>> GetUsersSummary()
    {
        try
        {
            var summary = await _userService.GetUsersSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل ملخص المستخدمين", error = ex.Message });
        }
    }

    #endregion
}
