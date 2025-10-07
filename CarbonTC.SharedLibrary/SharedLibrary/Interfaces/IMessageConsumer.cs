﻿using System;
namespace SharedLibrary.Interfaces
{
    public interface IMessageConsumer
    {
        /// <summary>
        /// Phương thức bất đồng bộ để đăng ký một trình xử lý tin nhắn cho một hàng đợi cụ thể trong hệ thống RabbitMQ.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queueName"></param>
        /// <param name="handler"></param>
        /// <returns></returns>
        Task Subscribe<T>(string queueName, Func<T, Task> handler);

        /// <summary>
        /// Phương thức bất đồng bộ để đăng ký một trình xử lý tin nhắn cho một exchange và routing key cụ thể trong hệ thống RabbitMQ.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="exchange"></param>
        /// <param name="routingKey"></param>
        /// <param name="queueName"></param>
        /// <param name="handler"></param>
        /// <returns></returns>
        Task Subscribe<T>(string exchange, string routingKey, string queueName, Func<T, Task> handler);
    }
}
