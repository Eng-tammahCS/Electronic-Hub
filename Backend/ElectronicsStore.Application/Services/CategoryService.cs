using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Domain.Entities;
using ElectronicsStore.Domain.Interfaces;

namespace ElectronicsStore.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _unitOfWork.Categories.GetAllAsync();
        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            CreatedAt = DateTime.Now // Use current time since DB doesn't have this field
        });
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return null;

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            CreatedAt = DateTime.Now // Use current time since DB doesn't have this field
        };
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
    {
        var category = new Category
        {
            Name = createCategoryDto.Name
        };

        var createdCategory = await _unitOfWork.Categories.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return new CategoryDto
        {
            Id = createdCategory.Id,
            Name = createdCategory.Name,
            CreatedAt = createdCategory.CreatedAt
        };
    }

    public async Task<CategoryDto> UpdateCategoryAsync(UpdateCategoryDto updateCategoryDto)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(updateCategoryDto.Id);
        if (category == null)
            throw new ArgumentException("Category not found");

        category.Name = updateCategoryDto.Name;

        var updatedCategory = await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return new CategoryDto
        {
            Id = updatedCategory.Id,
            Name = updatedCategory.Name,
            CreatedAt = updatedCategory.CreatedAt
        };
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return false;

        await _unitOfWork.Categories.DeleteAsync(category);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CategoryExistsAsync(int id)
    {
        return await _unitOfWork.Categories.ExistsAsync(id);
    }
}
