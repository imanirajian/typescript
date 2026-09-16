using System.Collections.Concurrent;
using AddressBookChallenge;
using AddressBookChallenge.Models;
using FluentValidation;
using MicroElements.Swashbuckle.FluentValidation.AspNetCore;

const string localHostCorsPolicy = "localHostCorsPolicy";
var random = new Random();
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IValidator<UkAddressBody>, UkAddressBodyValidator>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddFluentValidationRulesToSwagger();
builder.Services.AddCors(options =>
    options.AddPolicy(localHostCorsPolicy, policy => 
        policy
            .WithOrigins("http://localhost:4200")
            .WithMethods("POST", "GET", "PUT", "DELETE")
            .WithHeaders("content-type")
        )
    );
var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = string.Empty;
});
app.UseCors(localHostCorsPolicy);
var dataStore = new ConcurrentDictionary<Guid, UkAddressBody>();

app.MapPost("/address", async (UkAddressBody address, IValidator<UkAddressBody> validator) => {
    var result = validator.Validate(address);
    if (result.IsValid)
    {
        var addressId = Guid.NewGuid();
        dataStore.TryAdd(addressId, address);
        await Task.Delay(500 + random.Next(500));
        return Results.Created(
            $"/address/{addressId}",
            new UkAddress(addressId, address)
        );
    }
    await Task.Delay(500 + random.Next(200));
    return Results.BadRequest(result.Errors);
});

app.MapGet("/address/{id:guid}", async (Guid id) => {
    if (dataStore.TryGetValue(id, out var address))
    {
        await Task.Delay(200 + random.Next(500));
        return Results.Ok(address);
    }
    await Task.Delay(200 + random.Next(200));
    return Results.NotFound(); 
});

app.Run();