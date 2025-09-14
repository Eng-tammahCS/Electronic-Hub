using Moq;
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
    public class ProductServiceTests
    {
        [Fact]
        public async Task GetAllProductsAsync_ReturnsAllProducts()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockProductRepository = new Mock<IGenericRepository<Product>>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            var mockInventoryLogRepository = new Mock<IGenericRepository<InventoryLog>>();
            var mockSupplierRepository = new Mock<IGenericRepository<Supplier>>();
            
            var products = new List<Product>
            {
                new Product { Id = 1, Name = "Laptop", CategoryId = 1, DefaultSellingPrice = 1000 },
                new Product { Id = 2, Name = "Phone", CategoryId = 1, DefaultSellingPrice = 500 }
            };
            
            mockProductRepository.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(products);
                
            mockInventoryLogRepository.Setup(repo => repo.FindAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<InventoryLog, bool>>>()))
                .ReturnsAsync(new List<InventoryLog>());
                
            mockUnitOfWork.Setup(uow => uow.Products)
                .Returns(mockProductRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.InventoryLogs)
                .Returns(mockInventoryLogRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.Suppliers)
                .Returns(mockSupplierRepository.Object);
                
            var productService = new ProductService(mockUnitOfWork.Object);

            // Act
            var result = await productService.GetAllProductsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Equal("Laptop", result.First().Name);
        }

        [Fact]
        public async Task GetProductByIdAsync_ExistingProduct_ReturnsProduct()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockProductRepository = new Mock<IGenericRepository<Product>>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            var mockInventoryLogRepository = new Mock<IGenericRepository<InventoryLog>>();
            var mockSupplierRepository = new Mock<IGenericRepository<Supplier>>();
            
            var product = new Product { Id = 1, Name = "Laptop", CategoryId = 1, DefaultSellingPrice = 1000 };
            var category = new Category { Id = 1, Name = "Electronics" };
            
            mockProductRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(product);
                
            mockCategoryRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(category);
                
            mockInventoryLogRepository.Setup(repo => repo.FindAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<InventoryLog, bool>>>()))
                .ReturnsAsync(new List<InventoryLog>());
                
            mockUnitOfWork.Setup(uow => uow.Products)
                .Returns(mockProductRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.InventoryLogs)
                .Returns(mockInventoryLogRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.Suppliers)
                .Returns(mockSupplierRepository.Object);
                
            var productService = new ProductService(mockUnitOfWork.Object);

            // Act
            var result = await productService.GetProductByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Laptop", result.Name);
            Assert.Equal(1000, result.DefaultSellingPrice);
        }

        [Fact]
        public async Task CreateProductAsync_ValidProduct_ReturnsCreatedProduct()
        {
            // Arrange
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var mockProductRepository = new Mock<IGenericRepository<Product>>();
            var mockCategoryRepository = new Mock<IGenericRepository<Category>>();
            var mockInventoryLogRepository = new Mock<IGenericRepository<InventoryLog>>();
            var mockSupplierRepository = new Mock<IGenericRepository<Supplier>>();
            
            var createProductDto = new CreateProductDto 
            { 
                Name = "Laptop", 
                CategoryId = 1, 
                DefaultSellingPrice = 1000 
            };
            
            var product = new Product 
            { 
                Id = 1, 
                Name = "Laptop", 
                CategoryId = 1, 
                DefaultSellingPrice = 1000 
            };
            
            var category = new Category { Id = 1, Name = "Electronics" };
            
            mockProductRepository.Setup(repo => repo.AddAsync(It.IsAny<Product>()))
                .ReturnsAsync(product);
                
            mockProductRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(product);
                
            mockCategoryRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(category);
                
            mockInventoryLogRepository.Setup(repo => repo.FindAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<InventoryLog, bool>>>()))
                .ReturnsAsync(new List<InventoryLog>());
                
            mockUnitOfWork.Setup(uow => uow.Products)
                .Returns(mockProductRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.Categories)
                .Returns(mockCategoryRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.InventoryLogs)
                .Returns(mockInventoryLogRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.Suppliers)
                .Returns(mockSupplierRepository.Object);
                
            mockUnitOfWork.Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);
                
            var productService = new ProductService(mockUnitOfWork.Object);

            // Act
            var result = await productService.CreateProductAsync(createProductDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Laptop", result.Name);
            Assert.Equal(1000, result.DefaultSellingPrice);
        }
    }
}