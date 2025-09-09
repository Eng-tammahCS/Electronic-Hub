using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Application.Interfaces;
using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ISalesInvoiceService _salesInvoiceService;

    public CustomersController(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetAllCustomers()
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();
            
            // Extract unique customers from sales invoices
            var customers = invoices
                .Where(i => !string.IsNullOrEmpty(i.CustomerName))
                .GroupBy(i => i.CustomerName)
                .Select(g => new CustomerDto
                {
                    Id = g.Key.GetHashCode(), // Generate ID from name hash
                    Name = g.Key,
                    Phone = "", // Not available in current schema
                    Email = "", // Not available in current schema
                    Address = "", // Not available in current schema
                    IsActive = true, // Assume active if they have invoices
                    TotalOrders = g.Count(),
                    TotalSpent = g.Sum(i => i.TotalAmount),
                    FirstOrderDate = g.Min(i => i.InvoiceDate),
                    LastOrderDate = g.Max(i => i.InvoiceDate)
                })
                .OrderBy(c => c.Name)
                .ToList();

            return Ok(customers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل العملاء", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();
            var customerName = invoices
                .Where(i => !string.IsNullOrEmpty(i.CustomerName))
                .Select(i => i.CustomerName)
                .FirstOrDefault(name => name.GetHashCode() == id);

            if (string.IsNullOrEmpty(customerName))
                return NotFound(new { message = "العميل غير موجود" });

            var customerInvoices = invoices.Where(i => i.CustomerName == customerName).ToList();
            
            var customer = new CustomerDto
            {
                Id = id,
                Name = customerName,
                Phone = "", // Not available in current schema
                Email = "", // Not available in current schema
                Address = "", // Not available in current schema
                IsActive = true,
                TotalOrders = customerInvoices.Count,
                TotalSpent = customerInvoices.Sum(i => i.TotalAmount),
                FirstOrderDate = customerInvoices.Min(i => i.InvoiceDate),
                LastOrderDate = customerInvoices.Max(i => i.InvoiceDate)
            };

            return Ok(customer);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في تحميل العميل", error = ex.Message });
        }
    }

    [HttpGet("by-name/{customerName}")]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomersByName(string customerName)
    {
        try
        {
            var invoices = await _salesInvoiceService.GetAllSalesInvoicesAsync();
            var filteredInvoices = invoices.Where(i => 
                !string.IsNullOrEmpty(i.CustomerName) && 
                i.CustomerName.Contains(customerName, StringComparison.OrdinalIgnoreCase));

            var customers = filteredInvoices
                .GroupBy(i => i.CustomerName)
                .Select(g => new CustomerDto
                {
                    Id = g.Key.GetHashCode(),
                    Name = g.Key,
                    Phone = "", // Not available in current schema
                    Email = "", // Not available in current schema
                    Address = "", // Not available in current schema
                    IsActive = true,
                    TotalOrders = g.Count(),
                    TotalSpent = g.Sum(i => i.TotalAmount),
                    FirstOrderDate = g.Min(i => i.InvoiceDate),
                    LastOrderDate = g.Max(i => i.InvoiceDate)
                })
                .OrderBy(c => c.Name)
                .ToList();

            return Ok(customers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "خطأ في البحث عن العملاء", error = ex.Message });
        }
    }
}
