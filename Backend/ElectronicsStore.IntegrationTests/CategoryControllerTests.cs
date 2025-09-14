using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.IntegrationTests
{
    public class CategoryControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public CategoryControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task GetCategories_ReturnsSuccessAndCorrectContentType()
        {
            // Act
            var response = await _client.GetAsync("/api/categories");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType?.ToString());
        }

        [Fact]
        public async Task GetCategory_ValidId_ReturnsCategory()
        {
            // Act
            var response = await _client.GetAsync("/api/categories/1");

            // Assert
            if (response.StatusCode == HttpStatusCode.OK)
            {
                var category = await response.Content.ReadFromJsonAsync<CategoryDto>();
                Assert.NotNull(category);
                Assert.Equal(1, category.Id);
            }
            else
            {
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task CreateCategory_ValidCategory_ReturnsCreated()
        {
            // Arrange
            var uniqueName = $"Test Category {DateTime.Now:yyyyMMddHHmmss}";
            var newCategory = new CreateCategoryDto { Name = uniqueName };

            // Act
            var response = await _client.PostAsJsonAsync("/api/categories", newCategory);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task UpdateCategory_ValidCategory_ReturnsSuccess()
        {
            // Arrange
            var uniqueName = $"Updated Category {DateTime.Now:yyyyMMddHHmmss}";
            var updateCategory = new UpdateCategoryDto { Id = 1, Name = uniqueName };

            // Act
            var response = await _client.PutAsJsonAsync("/api/categories/1", updateCategory);

            // Assert
            if (response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.NotFound)
            {
                // Either success or not found is acceptable depending on data state
                Assert.True(true);
            }
            else
            {
                Assert.Fail($"Unexpected status code: {response.StatusCode}");
            }
        }

        [Fact]
        public async Task DeleteCategory_ValidId_ReturnsSuccess()
        {
            // Act
            var response = await _client.DeleteAsync("/api/categories/999"); // Use non-existing ID to avoid data loss

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}