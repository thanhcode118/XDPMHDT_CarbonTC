using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public abstract class BaseApiController : ControllerBase
    {
        private IMediator? _mediator;

        // Sử dụng protected để các controller con có thể truy cập
        protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>();
    }
}