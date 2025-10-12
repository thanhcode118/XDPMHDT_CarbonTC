using AutoMapper;
using CarbonTC.CarbonLifecycle.Service.Common.ApiResponse;
using CarbonTC.CarbonLifecycle.Service.Models.DTOs;
using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using CarbonTC.CarbonLifecycle.Service.Repositories;

namespace CarbonTC.CarbonLifecycle.Service.Services
{
    public class CVAStandardService : ICVAStandardService
    {
        private readonly ICVAStandardRepository _repository;
        private readonly IMapper _mapper;

        public CVAStandardService(ICVAStandardRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<CVAStandardDto>> CreateStandardAsync(CVAStandardCreateUpdateDto createDto)
        {
            var standard = _mapper.Map<CVAStandard>(createDto);
            await _repository.AddAsync(standard);

            var resultDto = _mapper.Map<CVAStandardDto>(standard);
            return ApiResponse<CVAStandardDto>.SuccessResponse(resultDto, "Standard created successfully.");
        }

        public async Task<ApiResponse<bool>> DeleteStandardAsync(Guid standardId)
        {
            var standard = await _repository.GetByIdAsync(standardId);
            if (standard == null)
            {
                return ApiResponse<bool>.FailResponse("Standard not found.");
            }

            await _repository.DeleteAsync(standard);
            return ApiResponse<bool>.SuccessResponse(true, "Standard deleted successfully.");
        }

        public async Task<ApiResponse<IEnumerable<CVAStandardDto>>> GetAllStandardsAsync()
        {
            var standards = await _repository.GetAllAsync();
            var resultDto = _mapper.Map<IEnumerable<CVAStandardDto>>(standards);
            return ApiResponse<IEnumerable<CVAStandardDto>>.SuccessResponse(resultDto);
        }

        public async Task<ApiResponse<CVAStandardDto>> GetStandardByIdAsync(Guid standardId)
        {
            var standard = await _repository.GetByIdAsync(standardId);
            if (standard == null)
            {
                return ApiResponse<CVAStandardDto>.FailResponse("Standard not found.");
            }

            var resultDto = _mapper.Map<CVAStandardDto>(standard);
            return ApiResponse<CVAStandardDto>.SuccessResponse(resultDto);
        }

        public async Task<ApiResponse<CVAStandardDto>> UpdateStandardAsync(Guid standardId, CVAStandardCreateUpdateDto updateDto)
        {
            var standard = await _repository.GetByIdAsync(standardId);
            if (standard == null)
            {
                return ApiResponse<CVAStandardDto>.FailResponse("Standard not found.");
            }

            _mapper.Map(updateDto, standard);
            await _repository.UpdateAsync(standard);

            var resultDto = _mapper.Map<CVAStandardDto>(standard);
            return ApiResponse<CVAStandardDto>.SuccessResponse(resultDto, "Standard updated successfully.");
        }
    }
}