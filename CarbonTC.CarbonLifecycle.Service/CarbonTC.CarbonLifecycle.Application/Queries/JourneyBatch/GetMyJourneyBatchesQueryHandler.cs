using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Services; 
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System; 

namespace CarbonTC.CarbonLifecycle.Application.Queries.JourneyBatch
{
    public class GetMyJourneyBatchesQueryHandler : IRequestHandler<GetMyJourneyBatchesQuery, IEnumerable<JourneyBatchDto>>
    {
        private readonly IJourneyBatchRepository _batchRepository;
        private readonly IMapper _mapper;
        private readonly IIdentityService _identityService; // Inject IIdentityService

        public GetMyJourneyBatchesQueryHandler(
            IJourneyBatchRepository batchRepository,
            IMapper mapper,
            IIdentityService identityService) // Thêm IIdentityService vào constructor
        {
            _batchRepository = batchRepository;
            _mapper = mapper;
            _identityService = identityService; // Gán giá trị
        }

        public async Task<IEnumerable<JourneyBatchDto>> Handle(GetMyJourneyBatchesQuery request, CancellationToken cancellationToken)
        {
            // Lấy OwnerId từ service
            var ownerId = _identityService.GetUserId();
            if (string.IsNullOrEmpty(ownerId))
            {
                // Xử lý trường hợp người dùng chưa đăng nhập hoặc không lấy được ID
                // Có thể ném lỗi hoặc trả về danh sách rỗng tùy logic
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // Gọi repository để lấy dữ liệu theo ownerId
            // Giả sử GetByOwnerIdWithJourneysAsync đã có sẵn và đúng
            var batches = await _batchRepository.GetByOwnerIdWithJourneysAsync(ownerId);

            // Map kết quả sang DTO
            return _mapper.Map<IEnumerable<JourneyBatchDto>>(batches);
        }
    }
}