using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReturnsController : ControllerBase
{
    private readonly ISalesReturnService _salesReturnService;
    private readonly IPurchaseReturnService _purchaseReturnService;
    private readonly IReturnsService _returnsService;

    public ReturnsController(
        ISalesReturnService salesReturnService,
        IPurchaseReturnService purchaseReturnService,
        IReturnsService returnsService)
    {
        _salesReturnService = salesReturnService;
        _purchaseReturnService = purchaseReturnService;
        _returnsService = returnsService;
    }

    #region Sales Returns

    [HttpGet("sales")]
    public async Task<ActionResult<IEnumerable<SalesReturnDto>>> GetAllSalesReturns()
    {
        try
        {
            var returns = await _salesReturnService.GetAllSalesReturnsAsync();
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات المبيعات", error = ex.Message });
        }
    }

    [HttpGet("sales/{id}")]
    public async Task<ActionResult<SalesReturnDto>> GetSalesReturn(int id)
    {
        try
        {
            var returnItem = await _salesReturnService.GetSalesReturnByIdAsync(id);
            if (returnItem == null)
                return NotFound(new { message = "مرتجع المبيعات غير موجود" });

            return Ok(returnItem);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجع المبيعات", error = ex.Message });
        }
    }

    [HttpPost("sales")]
    public async Task<ActionResult<SalesReturnDto>> CreateSalesReturn(CreateSalesReturnDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: Get actual user ID from authentication
            int userId = 1;

            var returnItem = await _salesReturnService.CreateSalesReturnAsync(dto, userId);
            return CreatedAtAction(nameof(GetSalesReturn), new { id = returnItem.Id }, returnItem);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في إنشاء مرتجع المبيعات", error = ex.Message });
        }
    }

    [HttpPut("sales/{id}")]
    public async Task<ActionResult<SalesReturnDto>> UpdateSalesReturn(int id, UpdateSalesReturnDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var returnItem = await _salesReturnService.UpdateSalesReturnAsync(id, dto);
            return Ok(returnItem);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحديث مرتجع المبيعات", error = ex.Message });
        }
    }

    [HttpDelete("sales/{id}")]
    public async Task<ActionResult> DeleteSalesReturn(int id)
    {
        try
        {
            await _salesReturnService.DeleteSalesReturnAsync(id);
            return Ok(new { message = "تم حذف مرتجع المبيعات بنجاح" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في حذف مرتجع المبيعات", error = ex.Message });
        }
    }

    [HttpGet("sales/invoice/{salesInvoiceId}")]
    public async Task<ActionResult<IEnumerable<SalesReturnDto>>> GetSalesReturnsByInvoice(int salesInvoiceId)
    {
        try
        {
            var returns = await _salesReturnService.GetReturnsBySalesInvoiceAsync(salesInvoiceId);
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات الفاتورة", error = ex.Message });
        }
    }

    [HttpGet("sales/product/{productId}")]
    public async Task<ActionResult<IEnumerable<SalesReturnDto>>> GetSalesReturnsByProduct(int productId)
    {
        try
        {
            var returns = await _salesReturnService.GetReturnsByProductAsync(productId);
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات المنتج", error = ex.Message });
        }
    }

    [HttpGet("sales/customer/{customerName}")]
    public async Task<ActionResult<IEnumerable<SalesReturnDto>>> GetSalesReturnsByCustomer(string customerName)
    {
        try
        {
            var returns = await _salesReturnService.GetReturnsByCustomerAsync(customerName);
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات العميل", error = ex.Message });
        }
    }

    [HttpGet("sales/date-range")]
    public async Task<ActionResult<IEnumerable<SalesReturnDto>>> GetSalesReturnsByDateRange(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        try
        {
            var returns = await _salesReturnService.GetReturnsByDateRangeAsync(startDate, endDate);
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات المبيعات بالتاريخ", error = ex.Message });
        }
    }

    #endregion

    #region Purchase Returns

    [HttpGet("purchases")]
    public async Task<ActionResult<IEnumerable<PurchaseReturnDto>>> GetAllPurchaseReturns()
    {
        try
        {
            var returns = await _purchaseReturnService.GetAllPurchaseReturnsAsync();
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات المشتريات", error = ex.Message });
        }
    }

    [HttpGet("purchases/{id}")]
    public async Task<ActionResult<PurchaseReturnDto>> GetPurchaseReturn(int id)
    {
        try
        {
            var returnItem = await _purchaseReturnService.GetPurchaseReturnByIdAsync(id);
            if (returnItem == null)
                return NotFound(new { message = "مرتجع المشتريات غير موجود" });

            return Ok(returnItem);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجع المشتريات", error = ex.Message });
        }
    }

    [HttpPost("purchases")]
    public async Task<ActionResult<PurchaseReturnDto>> CreatePurchaseReturn(CreatePurchaseReturnDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: Get actual user ID from authentication
            int userId = 1;

            var returnItem = await _purchaseReturnService.CreatePurchaseReturnAsync(dto, userId);
            return CreatedAtAction(nameof(GetPurchaseReturn), new { id = returnItem.Id }, returnItem);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في إنشاء مرتجع المشتريات", error = ex.Message });
        }
    }

    [HttpPut("purchases/{id}")]
    public async Task<ActionResult<PurchaseReturnDto>> UpdatePurchaseReturn(int id, UpdatePurchaseReturnDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var returnItem = await _purchaseReturnService.UpdatePurchaseReturnAsync(id, dto);
            return Ok(returnItem);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحديث مرتجع المشتريات", error = ex.Message });
        }
    }

    [HttpDelete("purchases/{id}")]
    public async Task<ActionResult> DeletePurchaseReturn(int id)
    {
        try
        {
            await _purchaseReturnService.DeletePurchaseReturnAsync(id);
            return Ok(new { message = "تم حذف مرتجع المشتريات بنجاح" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في حذف مرتجع المشتريات", error = ex.Message });
        }
    }

    [HttpGet("purchases/invoice/{purchaseInvoiceId}")]
    public async Task<ActionResult<IEnumerable<PurchaseReturnDto>>> GetPurchaseReturnsByInvoice(int purchaseInvoiceId)
    {
        try
        {
            var returns = await _purchaseReturnService.GetReturnsByPurchaseInvoiceAsync(purchaseInvoiceId);
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات الفاتورة", error = ex.Message });
        }
    }

    [HttpGet("purchases/product/{productId}")]
    public async Task<ActionResult<IEnumerable<PurchaseReturnDto>>> GetPurchaseReturnsByProduct(int productId)
    {
        try
        {
            var returns = await _purchaseReturnService.GetReturnsByProductAsync(productId);
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات المنتج", error = ex.Message });
        }
    }

    [HttpGet("purchases/supplier/{supplierId}")]
    public async Task<ActionResult<IEnumerable<PurchaseReturnDto>>> GetPurchaseReturnsBySupplier(int supplierId)
    {
        try
        {
            var returns = await _purchaseReturnService.GetReturnsBySupplierAsync(supplierId);
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات المورد", error = ex.Message });
        }
    }

    [HttpGet("purchases/date-range")]
    public async Task<ActionResult<IEnumerable<PurchaseReturnDto>>> GetPurchaseReturnsByDateRange(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        try
        {
            var returns = await _purchaseReturnService.GetReturnsByDateRangeAsync(startDate, endDate);
            return Ok(returns);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل مرتجعات المشتريات بالتاريخ", error = ex.Message });
        }
    }

    #endregion

    #region Reports & Summary

    [HttpGet("summary")]
    public async Task<ActionResult<ReturnsSummaryDto>> GetReturnsSummary()
    {
        try
        {
            var summary = await _returnsService.GetReturnsSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل ملخص المرتجعات", error = ex.Message });
        }
    }

    [HttpGet("top-products")]
    public async Task<ActionResult<IEnumerable<TopReturnedProductDto>>> GetTopReturnedProducts([FromQuery] int count = 10)
    {
        try
        {
            var topProducts = await _returnsService.GetTopReturnedProductsAsync(count);
            return Ok(topProducts);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل أكثر المنتجات إرجاعاً", error = ex.Message });
        }
    }

    [HttpGet("top-reasons")]
    public async Task<ActionResult<IEnumerable<TopReturnReasonDto>>> GetTopReturnReasons([FromQuery] int count = 10)
    {
        try
        {
            var topReasons = await _returnsService.GetTopReturnReasonsAsync(count);
            return Ok(topReasons);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل أكثر أسباب الإرجاع", error = ex.Message });
        }
    }

    [HttpGet("stats")]
    public async Task<ActionResult> GetReturnsStatsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        try
        {
            var stats = await _returnsService.GetReturnsStatsByDateRangeAsync(startDate, endDate);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل إحصائيات المرتجعات", error = ex.Message });
        }
    }

    [HttpGet("can-return-sales")]
    public async Task<ActionResult<bool>> CanReturnSalesItem(
        [FromQuery] int salesInvoiceId,
        [FromQuery] int productId,
        [FromQuery] int quantity)
    {
        try
        {
            var canReturn = await _returnsService.CanReturnSalesItemAsync(salesInvoiceId, productId, quantity);
            return Ok(new { canReturn = canReturn });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في التحقق من إمكانية الإرجاع", error = ex.Message });
        }
    }

    [HttpGet("can-return-purchase")]
    public async Task<ActionResult<bool>> CanReturnPurchaseItem(
        [FromQuery] int purchaseInvoiceId,
        [FromQuery] int productId,
        [FromQuery] int quantity)
    {
        try
        {
            var canReturn = await _returnsService.CanReturnPurchaseItemAsync(purchaseInvoiceId, productId, quantity);
            return Ok(new { canReturn = canReturn });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في التحقق من إمكانية الإرجاع", error = ex.Message });
        }
    }

    #endregion
}
