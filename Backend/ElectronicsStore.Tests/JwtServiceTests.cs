using Moq;
using System.IdentityModel.Tokens.Jwt;
using ElectronicsStore.Application.Services;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.Models;
using ElectronicsStore.Application.DTOs;
using Microsoft.Extensions.Options;

namespace ElectronicsStore.Tests
{
    public class JwtServiceTests
    {
        private readonly Mock<IOptions<JwtSettings>> _mockJwtSettings;
        private readonly Mock<IUserService> _mockUserService;
        private readonly JwtService _jwtService;

        public JwtServiceTests()
        {
            _mockJwtSettings = new Mock<IOptions<JwtSettings>>();
            _mockUserService = new Mock<IUserService>();
            
            var jwtSettings = new JwtSettings
            {
                SecretKey = "ElectronicsStore_SuperSecretKey_2024_MustBe32CharactersOrMore_ForSecurity",
                Issuer = "ElectronicsStore.API",
                Audience = "ElectronicsStore.Client",
                ExpirationInMinutes = 60
            };
            
            _mockJwtSettings.Setup(settings => settings.Value).Returns(jwtSettings);
            
            _jwtService = new JwtService(_mockJwtSettings.Object, _mockUserService.Object);
        }

        [Fact]
        public void GenerateToken_ValidUser_ReturnsJwtToken()
        {
            // Arrange
            var user = new UserDto
            {
                Id = 1,
                Username = "testuser",
                Email = "test@example.com",
                RoleName = "Admin",
                FullName = "Test User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Permissions = new List<string> { "read", "write" }
            };

            // Act
            string token = _jwtService.GenerateToken(user);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);
            
            // Verify it's a valid JWT token
            var handler = new JwtSecurityTokenHandler();
            Assert.True(handler.CanReadToken(token));
        }

        [Fact]
        public void GenerateRefreshToken_ReturnsRefreshToken()
        {
            // Act
            string refreshToken = _jwtService.GenerateRefreshToken();

            // Assert
            Assert.NotNull(refreshToken);
            Assert.NotEmpty(refreshToken);
        }

        [Fact]
        public void ValidateToken_ValidToken_ReturnsTrue()
        {
            // Arrange
            var user = new UserDto
            {
                Id = 1,
                Username = "testuser",
                Email = "test@example.com",
                RoleName = "Admin",
                FullName = "Test User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Permissions = new List<string> { "read", "write" }
            };
            
            string token = _jwtService.GenerateToken(user);

            // Act
            bool isValid = _jwtService.ValidateToken(token);

            // Assert
            Assert.True(isValid);
        }

        [Fact]
        public void ValidateToken_InvalidToken_ReturnsFalse()
        {
            // Arrange
            string invalidToken = "invalid.token.here";

            // Act
            bool isValid = _jwtService.ValidateToken(invalidToken);

            // Assert
            Assert.False(isValid);
        }

        [Fact]
        public void GetUserIdFromToken_ValidToken_ReturnsUserId()
        {
            // Arrange
            var user = new UserDto
            {
                Id = 123,
                Username = "testuser",
                Email = "test@example.com",
                RoleName = "Admin",
                FullName = "Test User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Permissions = new List<string> { "read", "write" }
            };
            
            string token = _jwtService.GenerateToken(user);

            // Act
            int? userId = _jwtService.GetUserIdFromToken(token);

            // Assert
            Assert.NotNull(userId);
            Assert.Equal(123, userId);
        }

        [Fact]
        public void GetUsernameFromToken_ValidToken_ReturnsUsername()
        {
            // Arrange
            var user = new UserDto
            {
                Id = 123,
                Username = "testuser",
                Email = "test@example.com",
                RoleName = "Admin",
                FullName = "Test User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Permissions = new List<string> { "read", "write" }
            };
            
            string token = _jwtService.GenerateToken(user);

            // Act
            string username = _jwtService.GetUsernameFromToken(token);

            // Assert
            Assert.NotNull(username);
            Assert.Equal("testuser", username);
        }

        [Fact]
        public void IsTokenExpired_ValidToken_ReturnsFalse()
        {
            // Arrange
            var user = new UserDto
            {
                Id = 123,
                Username = "testuser",
                Email = "test@example.com",
                RoleName = "Admin",
                FullName = "Test User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Permissions = new List<string> { "read", "write" }
            };
            
            string token = _jwtService.GenerateToken(user);

            // Act
            bool isExpired = _jwtService.IsTokenExpired(token);

            // Assert
            Assert.False(isExpired);
        }
    }
}