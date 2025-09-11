using ElectronicsStore.Application.DTOs;

namespace ElectronicsStore.Application.Interfaces;

public interface ISalesPredictionService
{
    Task<SalesPredictionDto> GetTomorrowPredictionAsync();
    Task<SalesPredictionDto> GetPredictionByDateAsync(DateTime date);
    Task<bool> IsServiceAvailableAsync();
}
