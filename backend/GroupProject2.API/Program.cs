using GroupProject2.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register MindFit database service
builder.Services.AddSingleton<MindFitDatabaseService>();

// Add CORS for frontend integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Disable HTTPS redirection for development
// app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Initialize MindFit database
using (var scope = app.Services.CreateScope())
{
    var mindFitDatabaseService = scope.ServiceProvider.GetRequiredService<MindFitDatabaseService>();
    await mindFitDatabaseService.InitializeDatabaseAsync();
}

app.MapControllers();

app.Run();
