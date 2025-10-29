// File: CarbonTC.CarbonLifecycle.Application/Commands/CVAStandard/AddCVAStandardCommand.cs
using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs; // Cần DTOs CvaStandardDto và CVAStandardCreateDto

namespace CarbonTC.CarbonLifecycle.Application.Commands.CVAStandard
{
    // Trả về DTO của standard vừa tạo
    public class AddCVAStandardCommand : IRequest<CvaStandardDto>
    {
        public CVAStandardCreateDto StandardData { get; }

        public AddCVAStandardCommand(CVAStandardCreateDto standardData)
        {
            StandardData = standardData ?? throw new ArgumentNullException(nameof(standardData));
        }
    }
}