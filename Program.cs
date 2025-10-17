using Microsoft.Extensions.Hosting;
using NetCord.Hosting.Gateway;
using DotNetEnv;

Env.Load();

var builder = Host.CreateApplicationBuilder();
builder.Services.AddDiscordGateway();

var host = builder.Build();
await host.RunAsync();

