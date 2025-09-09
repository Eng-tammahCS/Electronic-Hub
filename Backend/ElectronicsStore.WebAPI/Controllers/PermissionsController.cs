using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.WebAPI.Extensions;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(IPermissionService permissionService, ILogger<PermissionsController> logger)
    {
        _permissionService = permissionService;
        _logger = logger;
    }

    #region CRUD Operations

    /// <summary>
    /// الحصول على جميع الصلاحيات
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAllPermissions()
    {
        try
        {
            var permissions = await _permissionService.GetAllPermissionsAsync();
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل الصلاحيات");
            return StatusCode(500, new { message = "خطأ في تحميل الصلاحيات", error = ex.Message });
        }
    }

    /// <summary>
    /// الحصول على صلاحية محددة بالمعرف
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<PermissionDto>> GetPermission(int id)
    {
        try
        {
            var permission = await _permissionService.GetPermissionByIdAsync(id);
            if (permission == null)
                return NotFound(new { message = $"الصلاحية بالمعرف {id} غير موجودة" });

            return Ok(permission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل الصلاحية {PermissionId}", id);
            return StatusCode(500, new { message = "خطأ في تحميل الصلاحية", error = ex.Message });
        }
    }

    /// <summary>
    /// الحصول على صلاحية محددة بالاسم
    /// </summary>
    [HttpGet("by-name/{name}")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<PermissionDto>> GetPermissionByName(string name)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest(new { message = "اسم الصلاحية مطلوب" });

            var permission = await _permissionService.GetPermissionByNameAsync(name);
            if (permission == null)
                return NotFound(new { message = $"الصلاحية بالاسم '{name}' غير موجودة" });

            return Ok(permission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل الصلاحية بالاسم {PermissionName}", name);
            return StatusCode(500, new { message = "خطأ في تحميل الصلاحية", error = ex.Message });
        }
    }

    /// <summary>
    /// إنشاء صلاحية جديدة
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequirePermission:CREATE_PERMISSION")]
    public async Task<ActionResult<PermissionDto>> CreatePermission(CreatePermissionDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var permission = await _permissionService.CreatePermissionAsync(dto);
            return CreatedAtAction(nameof(GetPermission), new { id = permission.Id }, permission);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في إنشاء الصلاحية");
            return StatusCode(500, new { message = "خطأ في إنشاء الصلاحية", error = ex.Message });
        }
    }

    /// <summary>
    /// تحديث صلاحية موجودة
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "RequirePermission:UPDATE_PERMISSION")]
    public async Task<ActionResult<PermissionDto>> UpdatePermission(int id, UpdatePermissionDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.Id)
                return BadRequest(new { message = "معرف الصلاحية في الرابط لا يطابق معرف الصلاحية في البيانات" });

            var permission = await _permissionService.UpdatePermissionAsync(id, dto);
            return Ok(permission);
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
            _logger.LogError(ex, "خطأ في تحديث الصلاحية {PermissionId}", id);
            return StatusCode(500, new { message = "خطأ في تحديث الصلاحية", error = ex.Message });
        }
    }

    /// <summary>
    /// حذف صلاحية
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "RequirePermission:DELETE_PERMISSION")]
    public async Task<ActionResult> DeletePermission(int id)
    {
        try
        {
            var result = await _permissionService.DeletePermissionAsync(id);
            if (!result)
                return NotFound(new { message = $"الصلاحية بالمعرف {id} غير موجودة" });

            return Ok(new { message = "تم حذف الصلاحية بنجاح" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في حذف الصلاحية {PermissionId}", id);
            return StatusCode(500, new { message = "خطأ في حذف الصلاحية", error = ex.Message });
        }
    }

    #endregion

    #region Permission Validation

    /// <summary>
    /// التحقق من وجود صلاحية بالاسم
    /// </summary>
    [HttpPost("check-name")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult> CheckPermissionName([FromBody] string name)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest(new { message = "اسم الصلاحية مطلوب" });

            var exists = await _permissionService.PermissionExistsByNameAsync(name);
            return Ok(new { exists, message = exists ? "اسم الصلاحية موجود مسبقاً" : "اسم الصلاحية متاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في التحقق من اسم الصلاحية");
            return StatusCode(500, new { message = "خطأ في التحقق من اسم الصلاحية", error = ex.Message });
        }
    }

    /// <summary>
    /// التحقق من إمكانية حذف الصلاحية
    /// </summary>
    [HttpGet("{id}/can-delete")]
    [Authorize(Policy = "RequirePermission:DELETE_PERMISSION")]
    public async Task<ActionResult> CanDeletePermission(int id)
    {
        try
        {
            var canDelete = await _permissionService.CanDeletePermissionAsync(id);
            return Ok(new { 
                canDelete, 
                message = canDelete ? "يمكن حذف الصلاحية" : "لا يمكن حذف الصلاحية لأنها مرتبطة بأدوار" 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في التحقق من إمكانية حذف الصلاحية {PermissionId}", id);
            return StatusCode(500, new { message = "خطأ في التحقق من إمكانية حذف الصلاحية", error = ex.Message });
        }
    }

    #endregion

    #region Permission Statistics

    /// <summary>
    /// الحصول على ملخص الصلاحيات
    /// </summary>
    [HttpGet("summary")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<PermissionsSummaryDto>> GetPermissionsSummary()
    {
        try
        {
            var summary = await _permissionService.GetPermissionsSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل ملخص الصلاحيات");
            return StatusCode(500, new { message = "خطأ في تحميل ملخص الصلاحيات", error = ex.Message });
        }
    }

    /// <summary>
    /// الحصول على الصلاحيات الأكثر استخداماً
    /// </summary>
    [HttpGet("most-used")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<IEnumerable<PermissionUsageDto>>> GetMostUsedPermissions([FromQuery] int count = 10)
    {
        try
        {
            if (count <= 0 || count > 50)
                return BadRequest(new { message = "العدد يجب أن يكون بين 1 و 50" });

            var permissions = await _permissionService.GetMostUsedPermissionsAsync(count);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل الصلاحيات الأكثر استخداماً");
            return StatusCode(500, new { message = "خطأ في تحميل الصلاحيات الأكثر استخداماً", error = ex.Message });
        }
    }

    /// <summary>
    /// الحصول على الصلاحيات غير المستخدمة
    /// </summary>
    [HttpGet("unused")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetUnusedPermissions()
    {
        try
        {
            var permissions = await _permissionService.GetUnusedPermissionsAsync();
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل الصلاحيات غير المستخدمة");
            return StatusCode(500, new { message = "خطأ في تحميل الصلاحيات غير المستخدمة", error = ex.Message });
        }
    }

    #endregion

    #region Role-Permission Management

    /// <summary>
    /// الحصول على صلاحيات دور محدد
    /// </summary>
    [HttpGet("role/{roleId}")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetRolePermissions(int roleId)
    {
        try
        {
            var permissions = await _permissionService.GetRolePermissionsAsync(roleId);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل صلاحيات الدور {RoleId}", roleId);
            return StatusCode(500, new { message = "خطأ في تحميل صلاحيات الدور", error = ex.Message });
        }
    }

    /// <summary>
    /// ربط صلاحية بدور
    /// </summary>
    [HttpPost("assign")]
    [Authorize(Policy = "RequirePermission:ASSIGN_PERMISSIONS")]
    public async Task<ActionResult> AssignPermissionToRole(AssignPermissionToRoleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _permissionService.AssignPermissionToRoleAsync(dto.RoleId, dto.PermissionId);
            if (!result)
                return BadRequest(new { message = "فشل في ربط الصلاحية بالدور" });

            return Ok(new { message = "تم ربط الصلاحية بالدور بنجاح" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في ربط الصلاحية {PermissionId} بالدور {RoleId}", dto.PermissionId, dto.RoleId);
            return StatusCode(500, new { message = "خطأ في ربط الصلاحية بالدور", error = ex.Message });
        }
    }

    /// <summary>
    /// إلغاء ربط صلاحية من دور
    /// </summary>
    [HttpPost("revoke")]
    [Authorize(Policy = "RequirePermission:ASSIGN_PERMISSIONS")]
    public async Task<ActionResult> RevokePermissionFromRole(AssignPermissionToRoleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _permissionService.RevokePermissionFromRoleAsync(dto.RoleId, dto.PermissionId);
            if (!result)
                return NotFound(new { message = "الصلاحية غير مرتبطة بالدور" });

            return Ok(new { message = "تم إلغاء ربط الصلاحية من الدور بنجاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في إلغاء ربط الصلاحية {PermissionId} من الدور {RoleId}", dto.PermissionId, dto.RoleId);
            return StatusCode(500, new { message = "خطأ في إلغاء ربط الصلاحية من الدور", error = ex.Message });
        }
    }

    /// <summary>
    /// ربط عدة صلاحيات بدور واحد
    /// </summary>
    [HttpPost("assign-multiple")]
    [Authorize(Policy = "RequirePermission:ASSIGN_PERMISSIONS")]
    public async Task<ActionResult> AssignMultiplePermissionsToRole(AssignMultiplePermissionsDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var assignedCount = await _permissionService.AssignMultiplePermissionsToRoleAsync(dto.RoleId, dto.PermissionIds);
            return Ok(new {
                message = $"تم ربط {assignedCount} صلاحية بالدور بنجاح",
                assignedCount = assignedCount,
                totalRequested = dto.PermissionIds.Count
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في ربط عدة صلاحيات بالدور {RoleId}", dto.RoleId);
            return StatusCode(500, new { message = "خطأ في ربط عدة صلاحيات بالدور", error = ex.Message });
        }
    }

    /// <summary>
    /// إلغاء ربط جميع صلاحيات دور محدد
    /// </summary>
    [HttpDelete("role/{roleId}/revoke-all")]
    [Authorize(Policy = "RequirePermission:ASSIGN_PERMISSIONS")]
    public async Task<ActionResult> RevokeAllPermissionsFromRole(int roleId)
    {
        try
        {
            var revokedCount = await _permissionService.RevokeAllPermissionsFromRoleAsync(roleId);
            return Ok(new {
                message = $"تم إلغاء ربط {revokedCount} صلاحية من الدور",
                revokedCount = revokedCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في إلغاء ربط جميع صلاحيات الدور {RoleId}", roleId);
            return StatusCode(500, new { message = "خطأ في إلغاء ربط جميع صلاحيات الدور", error = ex.Message });
        }
    }

    /// <summary>
    /// التحقق من وجود صلاحية في دور
    /// </summary>
    [HttpGet("role/{roleId}/permission/{permissionId}/check")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult> CheckRoleHasPermission(int roleId, int permissionId)
    {
        try
        {
            var hasPermission = await _permissionService.RoleHasPermissionAsync(roleId, permissionId);
            return Ok(new {
                hasPermission,
                message = hasPermission ? "الدور يملك الصلاحية" : "الدور لا يملك الصلاحية"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في التحقق من صلاحية الدور");
            return StatusCode(500, new { message = "خطأ في التحقق من صلاحية الدور", error = ex.Message });
        }
    }

    #endregion

    #region Search & Filter

    /// <summary>
    /// البحث في الصلاحيات
    /// </summary>
    [HttpGet("search")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> SearchPermissions([FromQuery] string searchTerm)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { message = "مصطلح البحث مطلوب" });

            var permissions = await _permissionService.SearchPermissionsAsync(searchTerm);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في البحث في الصلاحيات");
            return StatusCode(500, new { message = "خطأ في البحث في الصلاحيات", error = ex.Message });
        }
    }

    /// <summary>
    /// الحصول على الصلاحيات المتاحة لدور محدد (غير المرتبطة به)
    /// </summary>
    [HttpGet("available-for-role/{roleId}")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAvailablePermissionsForRole(int roleId)
    {
        try
        {
            var permissions = await _permissionService.GetAvailablePermissionsForRoleAsync(roleId);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل الصلاحيات المتاحة للدور {RoleId}", roleId);
            return StatusCode(500, new { message = "خطأ في تحميل الصلاحيات المتاحة للدور", error = ex.Message });
        }
    }

    /// <summary>
    /// الحصول على الأدوار التي تحتوي على صلاحية محددة
    /// </summary>
    [HttpGet("{permissionId}/roles")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetRolesByPermission(int permissionId)
    {
        try
        {
            var roles = await _permissionService.GetRolesByPermissionAsync(permissionId);
            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل الأدوار حسب الصلاحية {PermissionId}", permissionId);
            return StatusCode(500, new { message = "خطأ في تحميل الأدوار حسب الصلاحية", error = ex.Message });
        }
    }

    #endregion

    #region System Permissions

    /// <summary>
    /// إنشاء الصلاحيات الأساسية للنظام
    /// </summary>
    [HttpPost("create-system-permissions")]
    [Authorize(Policy = "RequirePermission:CREATE_PERMISSION")]
    public async Task<ActionResult> CreateSystemPermissions()
    {
        try
        {
            var createdCount = await _permissionService.CreateSystemPermissionsAsync();
            return Ok(new {
                message = $"تم إنشاء {createdCount} صلاحية أساسية للنظام",
                createdCount = createdCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في إنشاء الصلاحيات الأساسية للنظام");
            return StatusCode(500, new { message = "خطأ في إنشاء الصلاحيات الأساسية للنظام", error = ex.Message });
        }
    }

    /// <summary>
    /// الحصول على قائمة الصلاحيات الأساسية للنظام
    /// </summary>
    [HttpGet("system-permissions")]
    [Authorize(Policy = "RequirePermission:VIEW_PERMISSIONS")]
    public async Task<ActionResult<List<string>>> GetSystemPermissionNames()
    {
        try
        {
            var systemPermissions = _permissionService.GetSystemPermissionNames();
            return Ok(systemPermissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في تحميل قائمة الصلاحيات الأساسية");
            return StatusCode(500, new { message = "خطأ في تحميل قائمة الصلاحيات الأساسية", error = ex.Message });
        }
    }

    #endregion
}
