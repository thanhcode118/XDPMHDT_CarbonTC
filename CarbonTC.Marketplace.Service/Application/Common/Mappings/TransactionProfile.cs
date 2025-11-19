using Application.Common.Features.Transactions.DTOs;
using AutoMapper;

namespace Application.Common.Mappings
{
    public class TransactionProfile : Profile
    {
        public TransactionProfile()
        {
            CreateMap<Domain.Entities.Transactions, TransactionDto>();
        }
    }
}
