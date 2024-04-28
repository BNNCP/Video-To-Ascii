using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using YoutubeExplode;
using YoutubeExplode.Videos.Streams;

string videoAsciiCors = "_videoAsciiCors";
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
            name: videoAsciiCors,
            policy =>
            {
                policy.WithOrigins(
                    "https://bnnvidtoascii.netlify.app",
                    "http://127.0.0.1:5500"
                    ).AllowAnyHeader()
                     .AllowAnyMethod()
                     .AllowCredentials(); ;
            }
        );
});

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapGet("/getvideo",  () => {
    Console.WriteLine("getvideo");
    return;
});

app.MapGet("/getvideo/{_url}",  async(string _url) => {
    string url = HttpUtility.UrlDecode(_url);
    Stream result = await DownloadVideo(url);
    Console.WriteLine(result.CanRead);
    if(result is Stream)
    {
        Console.WriteLine("Download Successful!");
        return Results.Stream(result, "video/mp4");
    }
    Console.WriteLine("Download Failed!");
    throw new HttpResponseException(HttpStatusCode.NotFound);
});

app.UseCors(videoAsciiCors);

app.Run();


async Task<Stream> DownloadVideo(string videoUrl)
{   
    YoutubeClient youtube = new YoutubeClient();
    var streamManifest = await youtube.Videos.Streams.GetManifestAsync(videoUrl);
    var streamInfo = streamManifest.GetMuxedStreams().GetWithHighestVideoQuality();
    return await youtube.Videos.Streams.GetAsync(streamInfo);
}