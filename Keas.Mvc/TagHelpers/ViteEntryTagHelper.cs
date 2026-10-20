using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Keas.Mvc.TagHelpers
{
    // The only Razor/Vite bridge. Views name source entries; this handles both
    // Fast Refresh in development and the complete asset graph after publishing.
    [HtmlTargetElement("vite-entry", Attributes = "src")]
    public class ViteEntryTagHelper : TagHelper
    {
        private static readonly object EmittedKey = new();
        private static readonly object ManifestKey = new();
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;

        public ViteEntryTagHelper(IWebHostEnvironment environment, IConfiguration configuration)
        {
            _environment = environment;
            _configuration = configuration;
        }

        public string Src { get; set; }

        public bool React { get; set; }

        public bool StylesOnly { get; set; }

        [ViewContext, HtmlAttributeNotBound]
        public ViewContext ViewContext { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = null;
            var html = new HtmlContentBuilder();
            var items = ViewContext.HttpContext.Items;
            if (!items.ContainsKey(EmittedKey)) items[EmittedKey] = new HashSet<string>();
            var emitted = (HashSet<string>)items[EmittedKey];

            if (_environment.IsDevelopment() && _configuration.GetValue<bool>("Vite:UseDevServer"))
            {
                var origin = (_configuration["Vite:DevServerUrl"] ?? "http://localhost:5179").TrimEnd('/');
                if (StylesOnly)
                {
                    var source = Src;
                    if ((source.EndsWith(".scss") || source.EndsWith(".css")) && emitted.Add(source))
                    {
                        var style = new TagBuilder("link");
                        style.Attributes["rel"] = "stylesheet";
                        style.Attributes["href"] = origin + "/" + source + "?direct";
                        html.AppendHtml(style);
                    }
                    output.Content.SetHtmlContent(html);
                    return;
                }
                if (emitted.Add("vite-dev-client"))
                    html.AppendHtml(Module(origin + "/@vite/client"));
                if (React && emitted.Add("vite-dev-preamble"))
                {
                    var refresh = new TagBuilder("script");
                    refresh.Attributes["type"] = "module";
                    refresh.InnerHtml.AppendHtml(
                        $"import RefreshRuntime from {JsonSerializer.Serialize(origin + "/@react-refresh")};\n" +
                        "RefreshRuntime.injectIntoGlobalHook(window);\n" +
                        "window.$RefreshReg$ = () => {};\n" +
                        "window.$RefreshSig$ = () => (type) => type;\n" +
                        "window.__vite_plugin_react_preamble_installed__ = true;");
                    html.AppendHtml(refresh);
                }
                if (emitted.Add(Src)) html.AppendHtml(Asset(origin + "/" + Src));
            }
            else
            {
                if (!items.ContainsKey(ManifestKey))
                {
                    var path = Path.Combine(_environment.WebRootPath, "vite", ".vite", "manifest.json");
                    if (!File.Exists(path))
                        throw new InvalidOperationException("Vite assets are missing. Run npm --prefix ClientApp run build, or start the development launch profile.");
                    items[ManifestKey] = JsonSerializer.Deserialize<Dictionary<string, Chunk>>(File.ReadAllText(path));
                }
                var manifest = (Dictionary<string, Chunk>)items[ManifestKey];
                if (!manifest.TryGetValue(Src, out var entry))
                    throw new InvalidOperationException($"Vite entry '{Src}' is not in the build manifest.");

                var visited = new HashSet<string>();
                void AppendStyles(string name)
                {
                    if (!visited.Add(name)) return;
                    var chunk = manifest[name];
                    foreach (var css in chunk.Css)
                    {
                        if (!emitted.Add(css)) continue;
                        html.AppendHtml(Asset(ViewContext.HttpContext.Request.PathBase + "/vite/" + css));
                    }
                    foreach (var import in chunk.Imports) AppendStyles(import);
                }
                if (StylesOnly) AppendStyles(Src);
                if ((!StylesOnly || IsStylesheet(entry.File)) && emitted.Add(entry.File))
                    html.AppendHtml(Asset(ViewContext.HttpContext.Request.PathBase + "/vite/" + entry.File));
            }
            output.Content.SetHtmlContent(html);
        }

        private static bool IsStylesheet(string source) => source.EndsWith(".css", StringComparison.OrdinalIgnoreCase);

        private static TagBuilder Asset(string source)
        {
            if (!IsStylesheet(source)) return Module(source);
            var tag = new TagBuilder("link");
            tag.TagRenderMode = TagRenderMode.SelfClosing;
            tag.Attributes["rel"] = "stylesheet";
            tag.Attributes["href"] = source;
            return tag;
        }

        private static TagBuilder Module(string source)
        {
            var tag = new TagBuilder("script");
            tag.Attributes["type"] = "module";
            tag.Attributes["src"] = source;
            return tag;
        }

        public class Chunk
        {
            [JsonPropertyName("file")] public string File { get; set; }
            [JsonPropertyName("css")] public string[] Css { get; set; } = Array.Empty<string>();
            [JsonPropertyName("imports")] public string[] Imports { get; set; } = Array.Empty<string>();
        }
    }
}
