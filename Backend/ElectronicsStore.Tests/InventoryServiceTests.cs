using Moq;
using System.Threading.Tasks;
using System.Collections.Generic;
using ElectronicsStore.Application.Services;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Tests
{
    public class InventoryServiceTests
    {
        [Fact]
        public async Task GetProductInventoryAsync_ExistingProduct_ReturnsInventoryDto()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockInventoryLogRepository = new Mock<IGenericRepository<InventoryLog>>();
            var mockProductRepository = new Mock<IGenericRepository<Product>>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            
            var product = new Product { Id = 1, Name = "Laptop", CategoryId = 1, DefaultSellingPrice = 1000 };
            var category = new Category { Id = 1, Name = "Electronics" };
            
            var inventoryLogs = new List<InventoryLog>
            {
                new InventoryLog { Id = 1, ProductId = 1, Quantity = 10, Note = "Initial stock" },
                new InventoryLog { Id = 2, ProductId = 1, Quantity = -2, Note = "Sale" },
                new InventoryLog { Id = 3, ProductId = 1, Quantity = 5, Note = "Restock" }
            };
            
            mockProductRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(product);
                
            mockCategoryRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(category);
                
            mockInventoryLogRepository.Setup(repo => repo.FindAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<InventoryLog, bool>>>()))
                .ReturnsAsync(inventoryLogs);
                
            mockUnitOfWork.Setup(uow => uow.Products)
                .Returns(mockProductRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.InventoryLogs)
                .Returns(mockInventoryLogRepository.Object);
                
            var inventoryService = new InventoryService(mockUnitOfWork.Object);

            // Act
            var result = await inventoryService.GetProductInventoryAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.ProductId);
            Assert.Equal(13, result.CurrentQuantity);
        }

        [Fact]
        public async Task GetProductInventoryAsync_NonExistingProduct_ReturnsNull()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockInventoryLogRepository = new Mock<IGenericRepository<InventoryLog>>();
            var mockProductRepository = new Mock<IGenericRepository<Product>>();
            
            var inventoryLogs = new List<InventoryLog>();
            
            mockProductRepository.Setup(repo => repo.GetByIdAsync(999))
                .ReturnsAsync((Product)null);
                
            mockInventoryLogRepository.Setup(repo => repo.FindAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<InventoryLog, bool>>>()))
                .ReturnsAsync(inventoryLogs);
                
            mockUnitOfWork.Setup(uow => uow.Products)
                .Returns(mockProductRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.InventoryLogs)
                .Returns(mockInventoryLogRepository.Object);
                
            var inventoryService = new InventoryService(mockUnitOfWork.Object);

            // Act
            var result = await inventoryService.GetProductInventoryAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateStockAsync_ValidUpdate_UpdatesInventory()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockInventoryLogRepository = new Mock<IGenericRepository<InventoryLog>>();
            var mockProductRepository = new Mock<IGenericRepository<Product>>();
            
            var product = new Product { Id = 1, Name = "Laptop", CategoryId = 1, DefaultSellingPrice = 1000, DefaultCostPrice = 800 };
            
            mockProductRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(product);
                
            mockInventoryLogRepository.Setup(repo => repo.AddAsync(It.IsAny<InventoryLog>()))
                .ReturnsAsync(new InventoryLog());
                
            mockUnitOfWork.Setup(uow => uow.Products)
                .Returns(mockProductRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.InventoryLogs)
                .Returns(mockInventoryLogRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);
                
            var inventoryService = new InventoryService(mockUnitOfWork.Object);

            // Act
            await inventoryService.UpdateStockAsync(1, 5);

            // Assert
            mockInventoryLogRepository.Verify(repo => repo.AddAsync(It.IsAny<InventoryLog>()), Times.Once);
            mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
        }
    }
}