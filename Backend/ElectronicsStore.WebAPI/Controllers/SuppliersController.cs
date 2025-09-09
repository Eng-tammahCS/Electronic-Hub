using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.DTOs;
using ElectronicsStore.Application.Interfaces;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;

    public SuppliersController(ISupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupplierDto>>> GetSuppliers()
    {
        try
        {
            var suppliers = await _supplierService.GetAllSuppliersAsync();
            return Ok(suppliers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل الموردين", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierDto>> GetSupplier(int id)
    {
        try
        {
            var supplier = await _supplierService.GetSupplierByIdAsync(id);
            if (supplier == null)
            {
                return NotFound(new { message = "المورد غير موجود" });
            }
            return Ok(supplier);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل المورد", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<SupplierDto>> CreateSupplier(CreateSupplierDto createSupplierDto)
    {
        try
        {
            var supplier = await _supplierService.CreateSupplierAsync(createSupplierDto);
            return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "خطأ في إنشاء المورد", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SupplierDto>> UpdateSupplier(int id, UpdateSupplierDto updateSupplierDto)
    {
        if (id != updateSupplierDto.Id)
        {
            return BadRequest(new { message = "معرف المورد غير متطابق" });
        }

        try
        {
            var supplier = await _supplierService.UpdateSupplierAsync(updateSupplierDto);
            return Ok(supplier);
        }
        catch (ArgumentException)
        {
            return NotFound(new { message = "المورد غير موجود" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "خطأ في تحديث المورد", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        try
        {
            var result = await _supplierService.DeleteSupplierAsync(id);
            if (!result)
            {
                return NotFound(new { message = "المورد غير موجود" });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في حذف المورد", error = ex.Message });
        }
    }
}
