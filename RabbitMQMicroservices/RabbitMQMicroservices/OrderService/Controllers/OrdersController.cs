using Microsoft.AspNetCore.Mvc;
using OrderService.Messaging;

namespace OrderService.Controllers;

// Đã sửa: Thay đổi Route để lắng nghe tại gốc (/) sau khi YARP xử lý
[Route("/")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly IRabbitMqProducer _producer;

    public OrdersController(IRabbitMqProducer producer)
    {
        _producer = producer;
    }

    [HttpPost]
    // Action này sẽ khớp với POST /
    public IActionResult CreateOrder([FromBody] Order order)
    {
        // 1. Logic xử lý đơn hàng: Validate, lưu vào database, v.v. (giả định thành công)
        Console.WriteLine($" [i] Received order for {order.ItemName} from {order.CustomerEmail}");

        // 2. Chuẩn bị message cho EmailService
        var orderMessage = new
        {
            order.ItemName,
            order.Quantity,
            order.CustomerEmail,
            OrderId = Guid.NewGuid() // ID đơn hàng giả định
        };

        // 3. Publish message lên RabbitMQ
        _producer.PublishMessage(orderMessage, "order_created_queue");

        return Ok(new { Message = "Order received and email notification queued successfully.", orderMessage.OrderId });
    }
}