using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ElectronicsStore.Infrastructure.Data;
using ElectronicsStore.Infrastructure.Repositories;
using ElectronicsStore.Domain.Interfaces;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.Services;
using ElectronicsStore.Application.Models;
using ElectronicsStore.WebAPI.Middleware;
using ElectronicsStore.Application.Observers;
using ElectronicsStore.Application.Strategies.PricingStrategies;
using ElectronicsStore.Application.Strategies.Facades;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add Entity Framework
builder.Services.AddDbContext<ElectronicsStoreDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("LocalHost")));

// Add Repository Pattern
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Add Application Services
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<IPurchaseInvoiceService, PurchaseInvoiceService>();
builder.Services.AddScoped<ISalesInvoiceService, SalesInvoiceService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();

// Add Returns Services
builder.Services.AddScoped<ISalesReturnService, SalesReturnService>();
builder.Services.AddScoped<IPurchaseReturnService, PurchaseReturnService>();
builder.Services.AddScoped<IReturnsService, ReturnsService>();

// Add Expense Services
builder.Services.AddScoped<IExpenseService, ExpenseService>();

// Add Authentication Services
builder.Services.AddScoped<IPasswordService, PasswordService>();

// Add User Services
builder.Services.AddScoped<IUserService, UserService>();

// Add ML Prediction Services
builder.Services.AddHttpClient<ISalesPredictionService, SalesPredictionService>(client =>
{
    var mlServiceUrl = builder.Configuration["MLService:BaseUrl"] ?? "http://localhost:5000";
    client.BaseAddress = new Uri(mlServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Add JWT Services
builder.Services.AddScoped<IJwtService, JwtService>();

// Add Strategy Pattern Services
builder.Services.AddScoped<PricingContext>();

// Add Facade Pattern Services
builder.Services.AddScoped<BusinessOperationsFacade>();

// Observer Pattern
builder.Services.AddScoped<IInventoryObserver, InventoryNotificationObserver>();


// Configure JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Configure JWT Authentication
var secretKey = builder.Configuration["JwtSettings:SecretKey"] ?? "ElectronicsStore_SuperSecretKey_2024_MustBe32CharactersOrMore_ForSecurity";
var issuer = builder.Configuration["JwtSettings:Issuer"] ?? "ElectronicsStore.API";
var audience = builder.Configuration["JwtSettings:Audience"] ?? "ElectronicsStore.Client";
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // في الإنتاج يجب أن يكون true
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

// Add Authorization
builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",    // Angular
                "http://localhost:3000",    // React
                "http://localhost:8080",    // Vue
                "http://127.0.0.1:5500",    // Live Server
                "http://localhost:5500"     // Live Server
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetIsOriginAllowed(origin =>
              {
                  // Allow file:// protocol for local HTML files
                  if (string.IsNullOrEmpty(origin)) return true;
                  if (origin.StartsWith("file://")) return true;
                  if (origin.StartsWith("http://localhost")) return true;
                  if (origin.StartsWith("http://127.0.0.1")) return true;
                  return false;
              });
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Add Error Handling Middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

// Enable serving static files (for uploaded images)
app.UseStaticFiles();

// Add Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Make Program class accessible for integration tests
public partial class Program { }