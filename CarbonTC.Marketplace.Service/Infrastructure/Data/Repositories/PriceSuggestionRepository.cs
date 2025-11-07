using Domain.Repositories;

namespace Infrastructure.Data.Repositories
{
    public class PriceSuggestionRepository: IPriceSuggestionRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public PriceSuggestionRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
