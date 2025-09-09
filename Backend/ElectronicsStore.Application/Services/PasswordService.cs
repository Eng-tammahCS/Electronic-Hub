using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Application.Services;

/// <summary>
/// خدمات كلمات المرور والتشفير
/// </summary>
public class PasswordService : IPasswordService
{
    private const int SaltSize = 16; // 128 bits
    private const int HashSize = 32; // 256 bits
    private const int Iterations = 10000; // PBKDF2 iterations

    public string HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("كلمة المرور لا يمكن أن تكون فارغة", nameof(password));

        // توليد salt عشوائي
        using var rng = RandomNumberGenerator.Create();
        var salt = new byte[SaltSize];
        rng.GetBytes(salt);

        // تشفير كلمة المرور باستخدام PBKDF2
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        var hash = pbkdf2.GetBytes(HashSize);

        // دمج salt و hash
        var hashBytes = new byte[SaltSize + HashSize];
        Array.Copy(salt, 0, hashBytes, 0, SaltSize);
        Array.Copy(hash, 0, hashBytes, SaltSize, HashSize);

        // تحويل إلى Base64
        return Convert.ToBase64String(hashBytes);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(password))
            return false;

        if (string.IsNullOrWhiteSpace(hashedPassword))
            return false;

        try
        {
            // تحويل من Base64
            var hashBytes = Convert.FromBase64String(hashedPassword);

            if (hashBytes.Length != SaltSize + HashSize)
                return false;

            // استخراج salt
            var salt = new byte[SaltSize];
            Array.Copy(hashBytes, 0, salt, 0, SaltSize);

            // استخراج hash
            var storedHash = new byte[HashSize];
            Array.Copy(hashBytes, SaltSize, storedHash, 0, HashSize);

            // تشفير كلمة المرور المدخلة بنفس salt
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            var computedHash = pbkdf2.GetBytes(HashSize);

            // مقارنة النتائج
            return CryptographicOperations.FixedTimeEquals(storedHash, computedHash);
        }
        catch
        {
            return false;
        }
    }

    public string GenerateRandomPassword(int length = 12)
    {
        if (length < 4)
            throw new ArgumentException("طول كلمة المرور يجب أن يكون 4 أحرف على الأقل", nameof(length));

        const string lowercase = "abcdefghijklmnopqrstuvwxyz";
        const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string digits = "0123456789";
        const string specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        var allChars = lowercase + uppercase + digits + specialChars;
        var password = new StringBuilder();

        using var rng = RandomNumberGenerator.Create();

        // ضمان وجود حرف واحد على الأقل من كل نوع
        password.Append(GetRandomChar(lowercase, rng));
        password.Append(GetRandomChar(uppercase, rng));
        password.Append(GetRandomChar(digits, rng));
        password.Append(GetRandomChar(specialChars, rng));

        // إكمال باقي الأحرف عشوائياً
        for (int i = 4; i < length; i++)
        {
            password.Append(GetRandomChar(allChars, rng));
        }

        // خلط الأحرف
        return ShuffleString(password.ToString(), rng);
    }

    public PasswordStrength CheckPasswordStrength(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return PasswordStrength.VeryWeak;

        int score = 0;

        // طول كلمة المرور
        if (password.Length >= 8) score++;
        if (password.Length >= 12) score++;
        if (password.Length >= 16) score++;

        // وجود أحرف صغيرة
        if (Regex.IsMatch(password, @"[a-z]")) score++;

        // وجود أحرف كبيرة
        if (Regex.IsMatch(password, @"[A-Z]")) score++;

        // وجود أرقام
        if (Regex.IsMatch(password, @"[0-9]")) score++;

        // وجود رموز خاصة
        if (Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]")) score++;

        // عدم وجود تكرار
        if (!HasRepeatingCharacters(password)) score++;

        // عدم وجود تسلسل
        if (!HasSequentialCharacters(password)) score++;

        return score switch
        {
            <= 2 => PasswordStrength.VeryWeak,
            3 or 4 => PasswordStrength.Weak,
            5 or 6 => PasswordStrength.Medium,
            7 or 8 => PasswordStrength.Strong,
            _ => PasswordStrength.VeryStrong
        };
    }

    private static char GetRandomChar(string chars, RandomNumberGenerator rng)
    {
        var randomBytes = new byte[4];
        rng.GetBytes(randomBytes);
        var randomIndex = Math.Abs(BitConverter.ToInt32(randomBytes, 0)) % chars.Length;
        return chars[randomIndex];
    }

    private static string ShuffleString(string input, RandomNumberGenerator rng)
    {
        var array = input.ToCharArray();
        for (int i = array.Length - 1; i > 0; i--)
        {
            var randomBytes = new byte[4];
            rng.GetBytes(randomBytes);
            var j = Math.Abs(BitConverter.ToInt32(randomBytes, 0)) % (i + 1);
            (array[i], array[j]) = (array[j], array[i]);
        }
        return new string(array);
    }

    private static bool HasRepeatingCharacters(string password)
    {
        for (int i = 0; i < password.Length - 2; i++)
        {
            if (password[i] == password[i + 1] && password[i + 1] == password[i + 2])
                return true;
        }
        return false;
    }

    private static bool HasSequentialCharacters(string password)
    {
        for (int i = 0; i < password.Length - 2; i++)
        {
            var char1 = password[i];
            var char2 = password[i + 1];
            var char3 = password[i + 2];

            if (char2 == char1 + 1 && char3 == char2 + 1)
                return true;

            if (char2 == char1 - 1 && char3 == char2 - 1)
                return true;
        }
        return false;
    }
}
