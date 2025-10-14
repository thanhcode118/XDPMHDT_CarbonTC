namespace Application.Common.Features.Listings.DTOs
{
    public class BuyNowRequestDto
    {
        public Guid CreditId { get; init; }
        public Guid BuyerId { get; init; }
        public decimal Amount { get; init; }
    }
}
