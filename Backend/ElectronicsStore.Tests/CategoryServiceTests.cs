using Moq;
using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using ElectronicsStore.Application.Services;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Tests
{
    public class CategoryServiceTests
    {
        [Fact]
        public async Task GetAllCategoriesAsync_ReturnsAllCategories()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            var categories = new List<Category>
            {
                new Category { Id = 1, Name = "Electronics" },
                new Category { Id = 2, Name = "Clothing" }
            };
            
            mockCategoryRepository.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(categories);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act
            var result = await categoryService.GetAllCategoriesAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Equal("Electronics", result.First().Name);
        }

        [Fact]
        public async Task GetCategoryByIdAsync_ExistingCategory_ReturnsCategory()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            var category = new Category { Id = 1, Name = "Electronics" };
            
            mockCategoryRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(category);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act
            var result = await categoryService.GetCategoryByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Electronics", result.Name);
        }

        [Fact]
        public async Task GetCategoryByIdAsync_NonExistingCategory_ReturnsNull()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            mockCategoryRepository.Setup(repo => repo.GetByIdAsync(999))
                .ReturnsAsync((Category)null);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act
            var result = await categoryService.GetCategoryByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateCategoryAsync_ValidCategory_ReturnsCreatedCategory()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            var createCategoryDto = new CreateCategoryDto { Name = "Electronics" };
            var category = new Category { Id = 1, Name = "Electronics" };
            
            mockCategoryRepository.Setup(repo => repo.AddAsync(It.IsAny<Category>()))
                .ReturnsAsync(category);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act
            var result = await categoryService.CreateCategoryAsync(createCategoryDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Electronics", result.Name);
        }

        [Fact]
        public async Task UpdateCategoryAsync_ExistingCategory_ReturnsUpdatedCategory()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            var existingCategory = new Category { Id = 1, Name = "Electronics" };
            var updateCategoryDto = new UpdateCategoryDto { Id = 1, Name = "Updated Electronics" };
            var updatedCategory = new Category { Id = 1, Name = "Updated Electronics" };
            
            mockCategoryRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(existingCategory);
                
            mockCategoryRepository.Setup(repo => repo.UpdateAsync(It.IsAny<Category>()))
                .ReturnsAsync(updatedCategory);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act
            var result = await categoryService.UpdateCategoryAsync(updateCategoryDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Electronics", result.Name);
        }

        [Fact]
        public async Task UpdateCategoryAsync_NonExistingCategory_ThrowsArgumentException()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            var updateCategoryDto = new UpdateCategoryDto { Id = 999, Name = "Non-existing" };
            
            mockCategoryRepository.Setup(repo => repo.GetByIdAsync(999))
                .ReturnsAsync((Category)null);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act & Assert
            await Assert.ThrowsAsync<System.ArgumentException>(() => categoryService.UpdateCategoryAsync(updateCategoryDto));
        }

        [Fact]
        public async Task DeleteCategoryAsync_ExistingCategory_ReturnsTrue()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            var category = new Category { Id = 1, Name = "Electronics" };
            
            mockCategoryRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(category);
                
            mockCategoryRepository.Setup(repo => repo.DeleteAsync(category))
                .Returns(Task.CompletedTask);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act
            var result = await categoryService.DeleteCategoryAsync(1);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task DeleteCategoryAsync_NonExistingCategory_ReturnsFalse()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            mockCategoryRepository.Setup(repo => repo.GetByIdAsync(999))
                .ReturnsAsync((Category)null);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act
            var result = await categoryService.DeleteCategoryAsync(999);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task CategoryExistsAsync_ExistingCategory_ReturnsTrue()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            mockCategoryRepository.Setup(repo => repo.ExistsAsync(1))
                .ReturnsAsync(true);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act
            var result = await categoryService.CategoryExistsAsync(1);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task CategoryExistsAsync_NonExistingCategory_ReturnsFalse()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            mockCategoryRepository.Setup(repo => repo.ExistsAsync(999))
                .ReturnsAsync(false);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            var categoryService = new CategoryService(mockUnitOfWork.Object);

            // Act
            var result = await categoryService.CategoryExistsAsync(999);

            // Assert
            Assert.False(result);
        }
    }
}