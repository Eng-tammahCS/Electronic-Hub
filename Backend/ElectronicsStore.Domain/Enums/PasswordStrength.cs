namespace ElectronicsStore.Domain.Enums;

/// <summary>
/// مستويات قوة كلمة المرور
/// </summary>
public enum PasswordStrength
{
    /// <summary>
    /// ضعيف جداً
    /// </summary>
    VeryWeak = 1,

    /// <summary>
    /// ضعيف
    /// </summary>
    Weak = 2,

    /// <summary>
    /// متوسط
    /// </summary>
    Medium = 3,

    /// <summary>
    /// قوي
    /// </summary>
    Strong = 4,

    /// <summary>
    /// قوي جداً
    /// </summary>
    VeryStrong = 5
}
