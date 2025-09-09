using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Domain.Enums;
using ElectronicsStore.WebAPI.Extensions;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;

    public AuthController(IUserService userService, IPasswordService passwordService, IJwtService jwtService)
    {
        _userService = userService;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }

    #region Authentication

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // البحث عن المستخدم بواسطة اسم المستخدم أو البريد الإلكتروني
            UserDto? user = null;
            
            // التحقق إذا كان المدخل بريد إلكتروني
            if (dto.Username.Contains("@"))
            {
                user = await _userService.GetUserByEmailAsync(dto.Username);
            }
            else
            {
                user = await _userService.GetUserByUsernameAsync(dto.Username);
            }

            if (user == null)
                return BadRequest(new { message = "اسم المستخدم أو كلمة المرور غير صحيحة" });

            // التحقق من حالة المستخدم
            if (!user.IsActive)
                return BadRequest(new { message = "حسابك غير مفعل، يرجى التواصل مع الإدارة" });

            // الحصول على كلمة المرور المشفرة من قاعدة البيانات
            var userEntity = await GetUserEntityAsync(user.Id);
            if (userEntity == null)
                return BadRequest(new { message = "خطأ في النظام" });

            // التحقق من كلمة المرور
            if (!_passwordService.VerifyPassword(dto.Password, userEntity.Password))
                return BadRequest(new { message = "اسم المستخدم أو كلمة المرور غير صحيحة" });

            // تحديث تاريخ آخر تسجيل دخول
            await _userService.UpdateLastLoginAsync(user.Id);

            // إنشاء JWT Token
            var token = _jwtService.GenerateToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();

            var response = new
            {
                message = "تم تسجيل الدخول بنجاح",
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.FullName,
                    user.RoleName,
                    user.Permissions
                },
                token = token,
                refreshToken = refreshToken,
                expiresAt = DateTime.UtcNow.AddMinutes(60) // من إعدادات JWT
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تسجيل الدخول", error = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // تحويل RegisterDto إلى CreateUserDto
            var createUserDto = new CreateUserDto
            {
                Username = dto.Username,
                Email = dto.Email,
                Password = dto.Password,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                RoleId = 2, // دور المستخدم العادي افتراضياً - سيتم تحسينه لاحقاً
                IsActive = true,
                Image = dto.Image
            };

            var user = await _userService.CreateUserAsync(createUserDto);

            var response = new
            {
                message = "تم إنشاء الحساب بنجاح",
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.FullName,
                    user.RoleName
                }
            };

            return CreatedAtAction(nameof(Login), response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في إنشاء الحساب", error = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public ActionResult Logout()
    {
        try
        {
            // الحصول على معلومات المستخدم من JWT Token
            var username = User.GetCurrentUsername();
            var userId = User.GetCurrentUserId();

            // TODO: إضافة Token إلى blacklist في المستقبل
            // يمكن حفظ Token في قاعدة البيانات كـ blacklisted tokens

            return Ok(new {
                message = "تم تسجيل الخروج بنجاح",
                username = username,
                logoutTime = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تسجيل الخروج", error = ex.Message });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult> RefreshToken([FromBody] string refreshToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return BadRequest(new { message = "Refresh token مطلوب" });

            var newToken = await _jwtService.RefreshTokenAsync(refreshToken);
            if (newToken == null)
                return BadRequest(new { message = "Refresh token غير صحيح أو منتهي الصلاحية" });

            return Ok(new {
                token = newToken,
                expiresAt = DateTime.UtcNow.AddMinutes(60)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحديث Token", error = ex.Message });
        }
    }

    [HttpPost("validate-token")]
    public ActionResult ValidateToken([FromBody] string token)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest(new { message = "Token مطلوب" });

            var isValid = _jwtService.ValidateToken(token);
            var isExpired = _jwtService.IsTokenExpired(token);
            var expirationDate = _jwtService.GetTokenExpirationDate(token);

            return Ok(new {
                isValid = isValid,
                isExpired = isExpired,
                expirationDate = expirationDate,
                message = isValid ? (isExpired ? "Token منتهي الصلاحية" : "Token صحيح") : "Token غير صحيح"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في التحقق من Token", error = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult> GetCurrentUser()
    {
        try
        {
            var userId = User.GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "غير مصرح لك بالوصول" });

            var user = await _userService.GetUserByIdAsync(userId.Value);
            if (user == null)
                return NotFound(new { message = "المستخدم غير موجود" });

            return Ok(new {
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.FullName,
                    user.RoleName,
                    user.Permissions,
                    user.IsActive,
                    user.LastLoginAt
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في الحصول على بيانات المستخدم", error = ex.Message });
        }
    }

    #endregion

    #region Password Management

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword(ChangePasswordDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // الحصول على User ID من JWT Token
            var userId = User.GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "غير مصرح لك بالوصول" });

            await _userService.ChangePasswordAsync(userId.Value, dto);

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

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword(ResetPasswordDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // البحث عن المستخدم بالبريد الإلكتروني
            var user = await _userService.GetUserByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest(new { message = "البريد الإلكتروني غير موجود" });

            // TODO: إنشاء reset token وإرسال بريد إلكتروني
            // هذا سيتم تطبيقه في مرحلة متقدمة

            return Ok(new { message = "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في إعادة تعيين كلمة المرور", error = ex.Message });
        }
    }

    [HttpPost("confirm-reset-password")]
    public async Task<ActionResult> ConfirmResetPassword(ConfirmResetPasswordDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: التحقق من reset token وتحديث كلمة المرور
            // هذا سيتم تطبيقه في مرحلة متقدمة

            return Ok(new { message = "تم تحديث كلمة المرور بنجاح" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تأكيد إعادة تعيين كلمة المرور", error = ex.Message });
        }
    }

    #endregion

    #region Validation & Utilities

    [HttpPost("check-username")]
    public async Task<ActionResult> CheckUsername([FromBody] string username)
    {
        try
        {
            var exists = await _userService.IsUsernameExistsAsync(username);
            return Ok(new { exists, message = exists ? "اسم المستخدم موجود" : "اسم المستخدم متاح" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في التحقق من اسم المستخدم", error = ex.Message });
        }
    }

    [HttpPost("check-email")]
    public async Task<ActionResult> CheckEmail([FromBody] string email)
    {
        try
        {
            var exists = await _userService.IsEmailExistsAsync(email);
            return Ok(new { exists, message = exists ? "البريد الإلكتروني موجود" : "البريد الإلكتروني متاح" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في التحقق من البريد الإلكتروني", error = ex.Message });
        }
    }

    [HttpPost("check-password-strength")]
    public ActionResult CheckPasswordStrength([FromBody] string password)
    {
        try
        {
            var strength = _passwordService.CheckPasswordStrength(password);
            return Ok(new { 
                strength = strength.ToString(), 
                message = GetPasswordStrengthMessage(strength) 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في فحص قوة كلمة المرور", error = ex.Message });
        }
    }

    #endregion

    #region Helper Methods

    private async Task<Domain.Entities.User?> GetUserEntityAsync(int userId)
    {
        // الحصول على User Entity من قاعدة البيانات للوصول لكلمة المرور المشفرة
        // هذا مؤقت - سيتم تحسينه لاحقاً
        var unitOfWork = HttpContext.RequestServices.GetRequiredService<Domain.Interfaces.IUnitOfWork>();
        return await unitOfWork.Users.GetByIdAsync(userId);
    }

    private static string GetPasswordStrengthMessage(PasswordStrength strength)
    {
        return strength switch
        {
            PasswordStrength.VeryWeak => "كلمة المرور ضعيفة جداً",
            PasswordStrength.Weak => "كلمة المرور ضعيفة",
            PasswordStrength.Medium => "كلمة المرور متوسطة",
            PasswordStrength.Strong => "كلمة المرور قوية",
            PasswordStrength.VeryStrong => "كلمة المرور قوية جداً",
            _ => "غير محدد"
        };
    }

    #endregion
}
