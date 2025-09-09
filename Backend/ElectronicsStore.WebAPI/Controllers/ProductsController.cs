using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        try
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المنتجات", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        try
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "المنتج غير موجود" });
            }
            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المنتج", error = ex.Message });
        }
    }

    [HttpGet("barcode/{barcode}")]
    public async Task<ActionResult<ProductDto>> GetProductByBarcode(string barcode)
    {
        try
        {
            var product = await _productService.GetProductByBarcodeAsync(barcode);
            if (product == null)
            {
                return NotFound(new { message = "المنتج غير موجود" });
            }
            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في البحث عن المنتج", error = ex.Message });
        }
    }

    [HttpGet("category/{categoryId}")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByCategory(int categoryId)
    {
        try
        {
            var products = await _productService.GetProductsByCategoryAsync(categoryId);
            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل منتجات الصنف", error = ex.Message });
        }
    }

    [HttpGet("supplier/{supplierId}")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsBySupplier(int supplierId)
    {
        try
        {
            var products = await _productService.GetProductsBySupplierAsync(supplierId);
            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل منتجات المورد", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto createProductDto)
    {
        try
        {
            var product = await _productService.CreateProductAsync(createProductDto);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "خطأ في إنشاء المنتج", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, UpdateProductDto updateProductDto)
    {
        if (id != updateProductDto.Id)
        {
            return BadRequest(new { message = "معرف المنتج غير متطابق" });
        }

        try
        {
            var product = await _productService.UpdateProductAsync(updateProductDto);
            return Ok(product);
        }
        catch (ArgumentException)
        {
            return NotFound(new { message = "المنتج غير موجود" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "خطأ في تحديث المنتج", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        try
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result)
            {
                return NotFound(new { message = "المنتج غير موجود" });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في حذف المنتج", error = ex.Message });
        }
    }
}
