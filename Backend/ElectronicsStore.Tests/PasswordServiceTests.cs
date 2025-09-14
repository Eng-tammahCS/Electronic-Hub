using ElectronicsStore.Application.Services;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Enums;

namespace ElectronicsStore.Tests
{
    public class PasswordServiceTests
    {
        private readonly IPasswordService _passwordService;

        public PasswordServiceTests()
        {
            _passwordService = new PasswordService();
        }

        [Fact]
        public void HashPassword_ReturnsHashedPassword()
        {
            // Arrange
            string password = "MySecurePassword123!";

            // Act
            string hashedPassword = _passwordService.HashPassword(password);

            // Assert
            Assert.NotNull(hashedPassword);
            Assert.NotEmpty(hashedPassword);
            Assert.NotEqual(password, hashedPassword);
        }

        [Fact]
        public void VerifyPassword_CorrectPassword_ReturnsTrue()
        {
            // Arrange
            string password = "MySecurePassword123!";
            string hashedPassword = _passwordService.HashPassword(password);

            // Act
            bool result = _passwordService.VerifyPassword(password, hashedPassword);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPassword_IncorrectPassword_ReturnsFalse()
        {
            // Arrange
            string password = "MySecurePassword123!";
            string wrongPassword = "WrongPassword123!";
            string hashedPassword = _passwordService.HashPassword(password);

            // Act
            bool result = _passwordService.VerifyPassword(wrongPassword, hashedPassword);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void GenerateRandomPassword_ReturnsPasswordWithDefaultLength()
        {
            // Act
            string password = _passwordService.GenerateRandomPassword();

            // Assert
            Assert.NotNull(password);
            Assert.Equal(12, password.Length);
        }

        [Fact]
        public void GenerateRandomPassword_ReturnsPasswordWithSpecifiedLength()
        {
            // Arrange
            int length = 16;

            // Act
            string password = _passwordService.GenerateRandomPassword(length);

            // Assert
            Assert.NotNull(password);
            Assert.Equal(length, password.Length);
        }

        [Fact]
        public void CheckPasswordStrength_VeryWeakPassword_ReturnsVeryWeak()
        {
            // Arrange
            string password = "123";

            // Act
            PasswordStrength strength = _passwordService.CheckPasswordStrength(password);

            // Assert
            Assert.Equal(PasswordStrength.VeryWeak, strength);
        }

        [Fact]
        public void CheckPasswordStrength_WeakPassword_ReturnsWeak()
        {
            // Arrange
            string password = "password123";

            // Act
            PasswordStrength strength = _passwordService.CheckPasswordStrength(password);

            // Assert
            Assert.Equal(PasswordStrength.Weak, strength);
        }

        [Fact]
        public void CheckPasswordStrength_MediumPassword_ReturnsMedium()
        {
            // Arrange
            string password = "Password123";

            // Act
            PasswordStrength strength = _passwordService.CheckPasswordStrength(password);

            // Assert
            Assert.Equal(PasswordStrength.Medium, strength);
        }

        [Fact]
        public void CheckPasswordStrength_StrongPassword_ReturnsStrong()
        {
            // Arrange
            string password = "Password123!";

            // Act
            PasswordStrength strength = _passwordService.CheckPasswordStrength(password);

            // Assert
            Assert.Equal(PasswordStrength.Strong, strength);
        }

        [Fact]
        public void CheckPasswordStrength_VeryStrongPassword_ReturnsVeryStrong()
        {
            // Arrange
            string password = "MyVeryStrongPassword123!@#$%^&*()_+-=[]{}|;:,.<>?ZYXWVU987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?ZYXWVU987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?ZYXWVU987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?ZYXWVU987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?ZYXWVU987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?ZYXWVU987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?ZYXWVU987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?ZYXWVU987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?ZYXWVU987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?";

            // Act
            PasswordStrength strength = _passwordService.CheckPasswordStrength(password);

            // Assert
            Assert.Equal(PasswordStrength.Strong, strength);
        }
    }
}