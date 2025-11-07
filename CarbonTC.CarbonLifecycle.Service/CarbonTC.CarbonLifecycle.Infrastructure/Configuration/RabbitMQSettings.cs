using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Configuration
{
    public class RabbitMQSettings
    {
        public string HostName { get; set; } = "localhost";
        public int Port { get; set; } = 5672;
        public string UserName { get; set; } = "guest";
        public string Password { get; set; } = "guest";
        public string VirtualHost { get; set; } = "/";
        public string ExchangeName { get; set; } = "carbonlifecycle.events";
        public string ExchangeType { get; set; } = "topic";
        public bool Durable { get; set; } = true;
        public bool AutoDelete { get; set; } = false;
        public int RetryCount { get; set; } = 3;
        public int RetryDelayMilliseconds { get; set; } = 1000;
        public bool EnablePublishing { get; set; } = true;
    }
}
