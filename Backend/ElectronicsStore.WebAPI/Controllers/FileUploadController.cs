using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileUploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FileUploadController> _logger;

    public FileUploadController(IWebHostEnvironment environment, ILogger<FileUploadController> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    #region User Profile Images

    [HttpPost("user-image")]
    [Authorize]
    public async Task<ActionResult> UploadUserImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "لم يتم اختيار ملف" });

            // التحقق من نوع الملف
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(new { message = "نوع الملف غير مدعوم. يُسمح فقط بـ: jpg, jpeg, png, gif, bmp" });

            // التحقق من حجم الملف (5MB كحد أقصى)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت" });

            // إنشاء مجلد الصور إذا لم يكن موجوداً
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "users");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // إنشاء اسم فريد للملف
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // حفظ الملف
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // إرجاع مسار الملف النسبي
            var relativePath = $"/uploads/users/{uniqueFileName}";

            return Ok(new
            {
                message = "تم رفع الصورة بنجاح",
                imagePath = relativePath,
                fileName = uniqueFileName,
                fileSize = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في رفع صورة المستخدم");
            return StatusCode(500, new { message = "خطأ في رفع الصورة", error = ex.Message });
        }
    }

    [HttpDelete("user-image")]
    [Authorize]
    public ActionResult DeleteUserImage([FromQuery] string imagePath)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return BadRequest(new { message = "مسار الصورة مطلوب" });

            // التأكد من أن المسار يبدأ بـ /uploads/users/
            if (!imagePath.StartsWith("/uploads/users/"))
                return BadRequest(new { message = "مسار الصورة غير صحيح" });

            // تحويل المسار النسبي إلى مسار فعلي
            var fileName = Path.GetFileName(imagePath);
            var filePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "users", fileName);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
                return Ok(new { message = "تم حذف الصورة بنجاح" });
            }
            else
            {
                return NotFound(new { message = "الصورة غير موجودة" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في حذف صورة المستخدم");
            return StatusCode(500, new { message = "خطأ في حذف الصورة", error = ex.Message });
        }
    }

    #endregion

    #region Product Images

    [HttpPost("product-image")]
    [Authorize]
    public async Task<ActionResult> UploadProductImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "لم يتم اختيار ملف" });

            // التحقق من نوع الملف
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(new { message = "نوع الملف غير مدعوم. يُسمح فقط بـ: jpg, jpeg, png, gif, bmp" });

            // التحقق من حجم الملف (10MB كحد أقصى للمنتجات)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت" });

            // إنشاء مجلد الصور إذا لم يكن موجوداً
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "products");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // إنشاء اسم فريد للملف
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // حفظ الملف
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // إرجاع مسار الملف النسبي
            var relativePath = $"/uploads/products/{uniqueFileName}";

            return Ok(new
            {
                message = "تم رفع صورة المنتج بنجاح",
                imagePath = relativePath,
                fileName = uniqueFileName,
                fileSize = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في رفع صورة المنتج");
            return StatusCode(500, new { message = "خطأ في رفع الصورة", error = ex.Message });
        }
    }

    [HttpDelete("product-image")]
    [Authorize]
    public ActionResult DeleteProductImage([FromQuery] string imagePath)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return BadRequest(new { message = "مسار الصورة مطلوب" });

            // التأكد من أن المسار يبدأ بـ /uploads/products/
            if (!imagePath.StartsWith("/uploads/products/"))
                return BadRequest(new { message = "مسار الصورة غير صحيح" });

            // تحويل المسار النسبي إلى مسار فعلي
            var fileName = Path.GetFileName(imagePath);
            var filePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "products", fileName);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
                return Ok(new { message = "تم حذف صورة المنتج بنجاح" });
            }
            else
            {
                return NotFound(new { message = "الصورة غير موجودة" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في حذف صورة المنتج");
            return StatusCode(500, new { message = "خطأ في حذف الصورة", error = ex.Message });
        }
    }

    #endregion

    #region General File Info

    [HttpGet("info")]
    public ActionResult GetFileInfo([FromQuery] string filePath)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(filePath))
                return BadRequest(new { message = "مسار الملف مطلوب" });

            var fileName = Path.GetFileName(filePath);
            var fullPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, filePath.TrimStart('/'));

            if (System.IO.File.Exists(fullPath))
            {
                var fileInfo = new FileInfo(fullPath);
                return Ok(new
                {
                    fileName = fileName,
                    filePath = filePath,
                    fileSize = fileInfo.Length,
                    createdAt = fileInfo.CreationTime,
                    lastModified = fileInfo.LastWriteTime
                });
            }
            else
            {
                return NotFound(new { message = "الملف غير موجود" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطأ في الحصول على معلومات الملف");
            return StatusCode(500, new { message = "خطأ في الحصول على معلومات الملف", error = ex.Message });
        }
    }

    #endregion
}
