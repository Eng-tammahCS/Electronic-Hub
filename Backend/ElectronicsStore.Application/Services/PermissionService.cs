using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;

namespace ElectronicsStore.Application.Services;

/// <summary>
/// خدمات إدارة الصلاحيات
/// </summary>
public class PermissionService : IPermissionService
{
    private readonly IUnitOfWork _unitOfWork;

    public PermissionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync()
    {
        var permissions = await _unitOfWork.Permissions.GetAllAsync();
        return permissions.Select(MapToPermissionDto).OrderBy(p => p.Name);
    }

    public async Task<PermissionDto?> GetPermissionAsync(int id)
    {
        var permission = await _unitOfWork.Permissions.GetByIdAsync(id);
        return permission != null ? MapToPermissionDto(permission) : null;
    }

    public async Task<PermissionDto?> GetPermissionByIdAsync(int id)
    {
        return await GetPermissionAsync(id);
    }

    public async Task<PermissionDto?> GetPermissionByNameAsync(string name)
    {
        var permissions = await _unitOfWork.Permissions.FindAsync(p => p.Name == name.Trim());
        var permission = permissions.FirstOrDefault();
        return permission != null ? MapToPermissionDto(permission) : null;
    }

    public async Task<PermissionDto> CreatePermissionAsync(CreatePermissionDto dto)
    {
        // التحقق من صحة البيانات
        await ValidateCreatePermissionAsync(dto);

        var permission = new Permission
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Permissions.AddAsync(permission);
        await _unitOfWork.SaveChangesAsync();

        return MapToPermissionDto(permission);
    }

    public async Task<PermissionDto> UpdatePermissionAsync(int id, UpdatePermissionDto dto)
    {
        var permission = await _unitOfWork.Permissions.GetByIdAsync(id);
        if (permission == null)
            throw new KeyNotFoundException($"Permission with ID {id} not found");

        // التحقق من صحة البيانات
        await ValidateUpdatePermissionAsync(dto, id);

        permission.Name = dto.Name.Trim();
        permission.Description = dto.Description?.Trim();

        await _unitOfWork.Permissions.UpdateAsync(permission);
        await _unitOfWork.SaveChangesAsync();

        return MapToPermissionDto(permission);
    }

    public async Task<bool> DeletePermissionAsync(int id)
    {
        var permission = await _unitOfWork.Permissions.GetByIdAsync(id);
        if (permission == null)
            return false;

        // التحقق من عدم استخدام الصلاحية في أي دور
        var roles = await GetRolesByPermissionAsync(id);
        if (roles.Any())
            throw new InvalidOperationException("Cannot delete permission that is assigned to roles");

        await _unitOfWork.Permissions.DeleteAsync(permission);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<PermissionsSummaryDto> GetPermissionsSummaryAsync()
    {
        var allPermissions = await GetAllPermissionsAsync();
        var permissionsList = allPermissions.ToList();

        // حساب الصلاحيات المستخدمة (مربوطة بأدوار)
        var usedPermissions = 0;
        foreach (var permission in permissionsList)
        {
            var roles = await GetRolesByPermissionAsync(permission.Id);
            if (roles.Any())
                usedPermissions++;
        }

        return new PermissionsSummaryDto
        {
            TotalPermissions = permissionsList.Count,
            UsedPermissions = usedPermissions,
            UnusedPermissions = permissionsList.Count - usedPermissions
        };
    }

    public async Task<IEnumerable<PermissionUsageDto>> GetPermissionUsageAsync()
    {
        var permissions = await GetAllPermissionsAsync();
        var result = new List<PermissionUsageDto>();

        foreach (var permission in permissions)
        {
            var roles = await GetRolesByPermissionAsync(permission.Id);
            var roleNames = roles.Select(r => r.Name).ToList();

            result.Add(new PermissionUsageDto
            {
                PermissionId = permission.Id,
                PermissionName = permission.Name,
                UsageCount = roleNames.Count,
                UsedByRoles = roleNames
            });
        }

        return result.OrderByDescending(p => p.UsageCount);
    }

    public async Task AssignPermissionToRoleAsync(AssignPermissionToRoleDto dto)
    {
        // التحقق من وجود الدور
        var role = await _unitOfWork.Roles.GetByIdAsync(dto.RoleId);
        if (role == null)
            throw new KeyNotFoundException($"Role with ID {dto.RoleId} not found");

        // التحقق من وجود الصلاحية
        var permission = await _unitOfWork.Permissions.GetByIdAsync(dto.PermissionId);
        if (permission == null)
            throw new KeyNotFoundException($"Permission with ID {dto.PermissionId} not found");

        // التحقق من عدم وجود الربط مسبقاً
        var existingRolePermission = role.RolePermissions.FirstOrDefault(rp => rp.PermissionId == dto.PermissionId);
        if (existingRolePermission != null)
            throw new InvalidOperationException("Permission is already assigned to this role");

        var rolePermission = new RolePermission
        {
            RoleId = dto.RoleId,
            PermissionId = dto.PermissionId
        };

        role.RolePermissions.Add(rolePermission);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RemovePermissionFromRoleAsync(int roleId, int permissionId)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
        if (role == null)
            throw new KeyNotFoundException($"Role with ID {roleId} not found");

        var rolePermission = role.RolePermissions.FirstOrDefault(rp => rp.PermissionId == permissionId);
        if (rolePermission == null)
            throw new KeyNotFoundException("Permission is not assigned to this role");

        role.RolePermissions.Remove(rolePermission);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task AssignMultiplePermissionsToRoleAsync(AssignMultiplePermissionsDto dto)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(dto.RoleId);
        if (role == null)
            throw new KeyNotFoundException($"Role with ID {dto.RoleId} not found");

        foreach (var permissionId in dto.PermissionIds)
        {
            var permission = await _unitOfWork.Permissions.GetByIdAsync(permissionId);
            if (permission == null)
                throw new KeyNotFoundException($"Permission with ID {permissionId} not found");

            // تجاهل إذا كانت الصلاحية موجودة مسبقاً
            if (!role.RolePermissions.Any(rp => rp.PermissionId == permissionId))
            {
                var rolePermission = new RolePermission
                {
                    RoleId = dto.RoleId,
                    PermissionId = permissionId
                };
                role.RolePermissions.Add(rolePermission);
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RemoveMultiplePermissionsFromRoleAsync(int roleId, List<int> permissionIds)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
        if (role == null)
            throw new KeyNotFoundException($"Role with ID {roleId} not found");

        foreach (var permissionId in permissionIds)
        {
            var rolePermission = role.RolePermissions.FirstOrDefault(rp => rp.PermissionId == permissionId);
            if (rolePermission != null)
            {
                role.RolePermissions.Remove(rolePermission);
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<PermissionDto>> GetPermissionsByRoleAsync(int roleId)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
        if (role == null)
            return new List<PermissionDto>();

        return role.RolePermissions.Select(rp => MapToPermissionDto(rp.Permission)).OrderBy(p => p.Name);
    }

    public async Task<IEnumerable<RoleDto>> GetRolesByPermissionAsync(int permissionId)
    {
        var permission = await _unitOfWork.Permissions.GetByIdAsync(permissionId);
        if (permission == null)
            return new List<RoleDto>();

        var roles = permission.RolePermissions.Select(rp => rp.Role).ToList();
        return roles.Select(MapToRoleDto).OrderBy(r => r.Name);
    }

    public async Task<bool> IsPermissionExistsAsync(string name, int? excludeId = null)
    {
        var permissions = await _unitOfWork.Permissions.FindAsync(p => p.Name == name.Trim());
        var existingPermission = permissions.FirstOrDefault();

        if (existingPermission == null) return false;
        if (excludeId.HasValue && existingPermission.Id == excludeId.Value) return false;

        return true;
    }

    public async Task<bool> PermissionExistsByNameAsync(string name, int? excludeId = null)
    {
        return await IsPermissionExistsAsync(name, excludeId);
    }

    public async Task<bool> CanDeletePermissionAsync(int id)
    {
        var roles = await GetRolesByPermissionAsync(id);
        return !roles.Any();
    }

    public async Task<IEnumerable<PermissionDto>> SearchPermissionsAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return await GetAllPermissionsAsync();

        var searchTermLower = searchTerm.ToLower();
        var allPermissions = await GetAllPermissionsAsync();

        return allPermissions.Where(p => 
            p.Name.ToLower().Contains(searchTermLower) ||
            (!string.IsNullOrEmpty(p.Description) && p.Description.ToLower().Contains(searchTermLower)));
    }

    public async Task<IEnumerable<PermissionDto>> GetMostUsedPermissionsAsync(int count = 10)
    {
        var usage = await GetPermissionUsageAsync();
        return usage.OrderByDescending(u => u.UsageCount)
                   .Take(count)
                   .Select(u => new PermissionDto
                   {
                       Id = u.PermissionId,
                       Name = u.PermissionName,
                       Description = "",
                       CreatedAt = DateTime.Now
                   });
    }

    public async Task<IEnumerable<PermissionDto>> GetUnusedPermissionsAsync()
    {
        var usage = await GetPermissionUsageAsync();
        var unusedIds = usage.Where(u => u.UsageCount == 0).Select(u => u.PermissionId);
        
        var allPermissions = await GetAllPermissionsAsync();
        return allPermissions.Where(p => unusedIds.Contains(p.Id));
    }

    public async Task<IEnumerable<PermissionDto>> GetRolePermissionsAsync(int roleId)
    {
        return await GetPermissionsByRoleAsync(roleId);
    }

    public async Task<IEnumerable<PermissionDto>> GetAvailablePermissionsForRoleAsync(int roleId)
    {
        var allPermissions = await GetAllPermissionsAsync();
        var rolePermissions = await GetPermissionsByRoleAsync(roleId);
        var rolePermissionIds = rolePermissions.Select(p => p.Id);
        
        return allPermissions.Where(p => !rolePermissionIds.Contains(p.Id));
    }

    public async Task<bool> AssignPermissionToRoleAsync(int roleId, int permissionId)
    {
        try
        {
            var dto = new AssignPermissionToRoleDto
            {
                RoleId = roleId,
                PermissionId = permissionId
            };
            await AssignPermissionToRoleAsync(dto);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> RevokePermissionFromRoleAsync(int roleId, int permissionId)
    {
        try
        {
            await RemovePermissionFromRoleAsync(roleId, permissionId);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> AssignMultiplePermissionsToRoleAsync(int roleId, List<int> permissionIds)
    {
        try
        {
            var dto = new AssignMultiplePermissionsDto
            {
                RoleId = roleId,
                PermissionIds = permissionIds
            };
            await AssignMultiplePermissionsToRoleAsync(dto);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> RevokeAllPermissionsFromRoleAsync(int roleId)
    {
        try
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
            if (role == null)
                return false;

            role.RolePermissions.Clear();
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> CreateSystemPermissionsAsync()
    {
        try
        {
            var systemPermissions = await GetSystemPermissionNames();
            
            foreach (var permissionName in systemPermissions)
            {
                if (!await IsPermissionExistsAsync(permissionName))
                {
                    var dto = new CreatePermissionDto
                    {
                        Name = permissionName,
                        Description = $"صلاحية النظام: {permissionName}"
                    };
                    await CreatePermissionAsync(dto);
                }
            }
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<IEnumerable<string>> GetSystemPermissionNames()
    {
        return new List<string>
        {
            "VIEW_DASHBOARD",
            "CREATE_USER", "UPDATE_USER", "DELETE_USER", "VIEW_USERS",
            "CREATE_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT", "VIEW_PRODUCTS",
            "CREATE_CATEGORY", "UPDATE_CATEGORY", "DELETE_CATEGORY", "VIEW_CATEGORIES",
            "CREATE_SUPPLIER", "UPDATE_SUPPLIER", "DELETE_SUPPLIER", "VIEW_SUPPLIERS",
            "CREATE_INVOICE", "UPDATE_INVOICE", "DELETE_INVOICE", "VIEW_INVOICES",
            "CREATE_EXPENSE", "UPDATE_EXPENSE", "DELETE_EXPENSE", "VIEW_EXPENSES",
            "VIEW_REPORTS", "VIEW_DASHBOARD"
        };
    }

    private PermissionDto MapToPermissionDto(Permission permission)
    {
        return new PermissionDto
        {
            Id = permission.Id,
            Name = permission.Name,
            Description = permission.Description,
            CreatedAt = permission.CreatedAt
        };
    }

    private RoleDto MapToRoleDto(Role role)
    {
        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            CreatedAt = role.CreatedAt,
            Permissions = role.RolePermissions.Select(rp => MapToPermissionDto(rp.Permission)).OrderBy(p => p.Name).ToList()
        };
    }

    private async Task ValidateCreatePermissionAsync(CreatePermissionDto dto)
    {
        if (await IsPermissionExistsAsync(dto.Name))
            throw new ArgumentException($"Permission with name '{dto.Name}' already exists");
    }

    private async Task ValidateUpdatePermissionAsync(UpdatePermissionDto dto, int permissionId)
    {
        if (await IsPermissionExistsAsync(dto.Name, permissionId))
            throw new ArgumentException($"Permission with name '{dto.Name}' already exists");
    }

    public async Task<bool> RoleHasPermissionAsync(int roleId, int permissionId)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
        if (role == null) return false;

        return role.RolePermissions.Any(rp => rp.PermissionId == permissionId);
    }
}
