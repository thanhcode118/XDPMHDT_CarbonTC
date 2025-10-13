using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.BuyNow
{
    public class BuyNowCommandHandler : IRequestHandler<BuyNowCommand, Result>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWalletServiceClient _walletClient;

        public BuyNowCommandHandler(IUnitOfWork unitOfWork, IWalletServiceClient walletClient)
        {
            _unitOfWork = unitOfWork;
            _walletClient = walletClient;
        }

        public async Task<Result> Handle(BuyNowCommand request, CancellationToken cancellationToken)
        {
            // Lấy thông tin credit inventory
            var creditInventory = await _unitOfWork.CreditInventories.GetByCreditIdAsync(request.CreditId, cancellationToken);
            if (creditInventory == null)
                return Result.Failure(new Error("CreditInventory", "Credit inventory not found."));

            // Kiểm tra lượng credit còn lại
            if (!creditInventory.HasSufficientAvailable(request.Amount))
                return Result.Failure(new Error("CreditInventory", "Insufficient available credits."));

            // Lấy thông tin listing
            var listing = await _unitOfWork.Listings.GetByIdAsync(request.ListingId, cancellationToken);
            if (listing == null)
            {
                await _walletClient.RollbackReservationAsync(request.BuyerId, request.Amount, cancellationToken);
                return Result.Failure(new Error("Listing", "Listing not found."));
            }


            // Kiểm tra ví người dùng có đủ tiền không
            var toTalPrice = listing.PricePerUnit * request.Amount;
            var hasEnough = await _walletClient.HasSufficientBalanceAsync(request.BuyerId, toTalPrice, cancellationToken);
            if (!hasEnough)
                return Result.Failure(new Error("Wallet", "Insufficient funds."));

            // Khóa tiền tạm thời
            var reserved = await _walletClient.ReserveFundsAsync(request.BuyerId, toTalPrice, cancellationToken);
            if (!reserved)
                return Result.Failure(new Error("Wallet", "Unable to reserve funds."));

            try
            {
                // Cập nhật inventory, tạo transaction (domain logic)
                bool isSoldOut  = creditInventory.TotalAmount - request.Amount == 0 ? true : false;
                listing.BuyNow(request.BuyerId, listing.OwnerId, request.Amount, toTalPrice , isSoldOut);

                await _unitOfWork.SaveChangesAsync(cancellationToken);
                // Commit thanh toán
                await _walletClient.CommitPaymentAsync(request.BuyerId, toTalPrice, cancellationToken);

                return Result.Success();
            }
            catch (Exception ex)
            {
                // Rollback khi có lỗi
                await _walletClient.RollbackReservationAsync(request.BuyerId, toTalPrice, cancellationToken);
                return Result.Failure(new Error("BuyNow", $"Transaction failed: {ex.Message}"));
            }
        }
    }
}
