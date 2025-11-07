using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Configuration
    .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddOcelot();
builder.Services.AddSwaggerForOcelot(builder.Configuration);      

//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer("JwtBearer", options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidateIssuerSigningKey = true,
//            ValidIssuer = "AuthService",         
//            ValidAudience = "MyMicroservice",     
//            IssuerSigningKey = new SymmetricSecurityKey(
//                Encoding.UTF8.GetBytes("super_secret_key_123"))
//        };
//    });

var app = builder.Build();
app.UseWebSockets();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.UseSwagger();
    //app.UseSwaggerUI();

    app.UseSwaggerForOcelotUI(opt =>
    {
        opt.PathToSwaggerGenerator = "/swagger/docs";
    });
}

app.UseHttpsRedirection();

//app.UseAuthentication();  
app.UseAuthorization();

app.MapControllers();

await app.UseOcelot();

app.Run();
