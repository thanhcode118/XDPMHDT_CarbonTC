using OrderService.Messaging;

var builder = WebApplication.CreateBuilder(args);

// Thêm Producer vào DI Container
builder.Services.AddSingleton<IRabbitMqProducer, RabbitMqProducer>();
builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting();
app.MapControllers();

app.Run();