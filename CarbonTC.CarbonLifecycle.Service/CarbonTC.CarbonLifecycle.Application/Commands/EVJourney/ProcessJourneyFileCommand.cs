using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs; 

namespace CarbonTC.CarbonLifecycle.Application.Commands.EVJourney
{
    public class ProcessJourneyFileCommand : IRequest<FileUploadResultDto>
    {
        public Stream FileStream { get; }
        public string FileName { get; }
        public string ContentType { get; }
        public string UserId { get; }

        public ProcessJourneyFileCommand(Stream fileStream, string fileName, string contentType, string userId)
        {
            FileStream = fileStream ?? throw new ArgumentNullException(nameof(fileStream));
            FileName = fileName ?? throw new ArgumentNullException(nameof(fileName));
            ContentType = contentType ?? throw new ArgumentNullException(nameof(contentType)); 
            UserId = userId ?? throw new ArgumentNullException(nameof(userId));
        }
    }
}
