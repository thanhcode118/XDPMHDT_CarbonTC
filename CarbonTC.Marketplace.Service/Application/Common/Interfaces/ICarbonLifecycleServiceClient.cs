using Application.Common.DTOs;

namespace Application.Common.Interfaces
{
    public interface ICarbonLifecycleServiceClient
    {
        Task<CVAStandardDto?> GetCVAStandardsAsync(Guid creditId, CancellationToken cancellationToken = default);
    }
}
