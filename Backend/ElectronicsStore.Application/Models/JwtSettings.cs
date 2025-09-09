namespace ElectronicsStore.Application.Models;

/// <summary>
/// إعدادات JWT Token
/// </summary>
public class JwtSettings
{
    /// <summary>
    /// المفتاح السري لتشفير JWT Token
    /// </summary>
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>
    /// الجهة المصدرة للـ Token (Issuer)
    /// </summary>
    public string Issuer { get; set; } = string.Empty;

    /// <summary>
    /// الجمهور المستهدف للـ Token (Audience)
    /// </summary>
    public string Audience { get; set; } = string.Empty;

    /// <summary>
    /// مدة صلاحية JWT Token بالدقائق (افتراضي: 60 دقيقة)
    /// </summary>
    public int ExpirationInMinutes { get; set; } = 60;

    /// <summary>
    /// مدة صلاحية Refresh Token بالأيام (افتراضي: 7 أيام)
    /// </summary>
    public int RefreshTokenExpirationInDays { get; set; } = 7;

    /// <summary>
    /// هل يجب التحقق من الجهة المصدرة (Issuer)
    /// </summary>
    public bool ValidateIssuer { get; set; } = true;

    /// <summary>
    /// هل يجب التحقق من الجمهور المستهدف (Audience)
    /// </summary>
    public bool ValidateAudience { get; set; } = true;

    /// <summary>
    /// هل يجب التحقق من مدة الصلاحية
    /// </summary>
    public bool ValidateLifetime { get; set; } = true;

    /// <summary>
    /// هل يجب التحقق من المفتاح السري
    /// </summary>
    public bool ValidateIssuerSigningKey { get; set; } = true;

    /// <summary>
    /// هامش الوقت المسموح به لانتهاء الصلاحية بالثواني (افتراضي: 0)
    /// </summary>
    public int ClockSkewInSeconds { get; set; } = 0;
}
