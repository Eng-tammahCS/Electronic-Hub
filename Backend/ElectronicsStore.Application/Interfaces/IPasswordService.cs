using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Application.Interfaces;

/// <summary>
/// واجهة خدمات كلمات المرور والتشفير
/// </summary>
public interface IPasswordService
{
    /// <summary>
    /// تشفير كلمة المرور
    /// </summary>
    /// <param name="password">كلمة المرور الأصلية</param>
    /// <returns>كلمة المرور المشفرة</returns>
    string HashPassword(string password);

    /// <summary>
    /// التحقق من كلمة المرور
    /// </summary>
    /// <param name="password">كلمة المرور الأصلية</param>
    /// <param name="hashedPassword">كلمة المرور المشفرة</param>
    /// <returns>true إذا كانت كلمة المرور صحيحة، false إذا لم تكن صحيحة</returns>
    bool VerifyPassword(string password, string hashedPassword);

    /// <summary>
    /// توليد كلمة مرور عشوائية
    /// </summary>
    /// <param name="length">طول كلمة المرور (افتراضي: 12)</param>
    /// <returns>كلمة مرور عشوائية</returns>
    string GenerateRandomPassword(int length = 12);

    /// <summary>
    /// التحقق من قوة كلمة المرور
    /// </summary>
    /// <param name="password">كلمة المرور</param>
    /// <returns>مستوى قوة كلمة المرور</returns>
    PasswordStrength CheckPasswordStrength(string password);
}


