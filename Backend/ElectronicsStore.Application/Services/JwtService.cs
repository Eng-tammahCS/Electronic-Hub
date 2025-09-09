using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.Models;

namespace ElectronicsStore.Application.Services;

/// <summary>
/// خدمات JWT Token
/// </summary>
public class JwtService : IJwtService
{
    private readonly JwtSettings _jwtSettings;
    private readonly IUserService _userService;

    public JwtService(IOptions<JwtSettings> jwtSettings, IUserService userService)
    {
        _jwtSettings = jwtSettings.Value;
        _userService = userService;
    }

    public string GenerateToken(UserDto user)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

        // إنشاء Claims للمستخدم
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.RoleName),
            new("FullName", user.FullName ?? user.Username),
            new("IsActive", user.IsActive.ToString()),
            new("CreatedAt", user.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"))
        };

        // إضافة الصلاحيات كـ Claims
        if (user.Permissions != null && user.Permissions.Any())
        {
            foreach (var permission in user.Permissions)
            {
                claims.Add(new Claim("Permission", permission));
            }
        }

        // إنشاء Token Descriptor
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        // إنشاء وكتابة Token
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public bool ValidateToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return false;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = _jwtSettings.ValidateIssuer,
                ValidateAudience = _jwtSettings.ValidateAudience,
                ValidateLifetime = _jwtSettings.ValidateLifetime,
                ValidateIssuerSigningKey = _jwtSettings.ValidateIssuerSigningKey,
                ValidIssuer = _jwtSettings.Issuer,
                ValidAudience = _jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.FromSeconds(_jwtSettings.ClockSkewInSeconds)
            };

            tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public int? GetUserIdFromToken(string token)
    {
        var claims = GetClaimsFromToken(token);
        if (claims == null) return null;

        var userIdClaim = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }

        return null;
    }

    public string? GetUsernameFromToken(string token)
    {
        var claims = GetClaimsFromToken(token);
        if (claims == null) return null;

        var usernameClaim = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
        return usernameClaim?.Value;
    }

    public string? GetUserRoleFromToken(string token)
    {
        var claims = GetClaimsFromToken(token);
        if (claims == null) return null;

        var roleClaim = claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
        return roleClaim?.Value;
    }

    public List<string> GetUserPermissionsFromToken(string token)
    {
        var claims = GetClaimsFromToken(token);
        if (claims == null) return new List<string>();

        var permissionClaims = claims.Where(c => c.Type == "Permission");
        return permissionClaims.Select(c => c.Value).ToList();
    }

    public bool IsTokenExpired(string token)
    {
        var expirationDate = GetTokenExpirationDate(token);
        if (expirationDate == null) return true;

        return expirationDate.Value <= DateTime.UtcNow;
    }

    public DateTime? GetTokenExpirationDate(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            
            return jwtToken.ValidTo;
        }
        catch
        {
            return null;
        }
    }

    public async Task<string?> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return null;

        // TODO: تطبيق منطق Refresh Token مع قاعدة البيانات
        // هذا يتطلب جدول لحفظ Refresh Tokens
        // سيتم تطبيقه في مرحلة متقدمة

        return null;
    }

    #region Private Methods

    /// <summary>
    /// الحصول على Claims من JWT Token
    /// </summary>
    /// <param name="token">JWT Token</param>
    /// <returns>قائمة Claims أو null</returns>
    private IEnumerable<Claim>? GetClaimsFromToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = _jwtSettings.ValidateIssuer,
                ValidateAudience = _jwtSettings.ValidateAudience,
                ValidateLifetime = false, // لا نتحقق من انتهاء الصلاحية هنا
                ValidateIssuerSigningKey = _jwtSettings.ValidateIssuerSigningKey,
                ValidIssuer = _jwtSettings.Issuer,
                ValidAudience = _jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
            return principal.Claims;
        }
        catch
        {
            return null;
        }
    }

    #endregion
}
