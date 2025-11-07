using System.Collections.Generic;
using System.Linq;

namespace CarbonTC.CarbonLifecycle.Domain.ValueObjects
{
    public class AuditFindings : ValueObject<AuditFindings>
    {
        public string Summary { get; }
        public IReadOnlyList<string> Issues { get; }
        public bool IsSatisfactory { get; }

        public AuditFindings(string summary, IEnumerable<string> issues, bool isSatisfactory)
        {
            if (string.IsNullOrWhiteSpace(summary))
            {
                throw new ArgumentException("Summary cannot be null or empty.", nameof(summary));
            }
            Summary = summary;
            Issues = issues?.ToList().AsReadOnly() ?? new List<string>().AsReadOnly();
            IsSatisfactory = isSatisfactory;
        }

        public AuditFindings AddIssue(string issue)
        {
            var newIssues = Issues.ToList();
            newIssues.Add(issue);
            return new AuditFindings(Summary, newIssues, IsSatisfactory);
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Summary;
            yield return IsSatisfactory;
            foreach (var issue in Issues.OrderBy(i => i))
            {
                yield return issue;
            }
        }

        public override string ToString() => $"Summary: {Summary}, Satisfactory: {IsSatisfactory}, Issues: {string.Join(", ", Issues)}";
    }
}