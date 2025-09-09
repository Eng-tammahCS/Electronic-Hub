using System.Net;
using System.Text.Json;

namespace ElectronicsStore.WebAPI.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new
        {
            message = "حدث خطأ في الخادم",
            error = "خطأ داخلي في الخادم", // إزالة ex.Message لأسباب أمان
            timestamp = DateTime.UtcNow
        };

        switch (exception)
        {
            case ArgumentException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    message = "بيانات غير صحيحة",
                    error = "البيانات المرسلة غير صحيحة", // إزالة ex.Message
                    timestamp = DateTime.UtcNow
                };
                break;
            
            case KeyNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = new
                {
                    message = "العنصر المطلوب غير موجود",
                    error = "العنصر غير موجود في النظام", // إزالة ex.Message
                    timestamp = DateTime.UtcNow
                };
                break;
            
            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = new
                {
                    message = "غير مصرح لك بالوصول",
                    error = "صلاحيات غير كافية", // إزالة ex.Message
                    timestamp = DateTime.UtcNow
                };
                break;
            
            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}
