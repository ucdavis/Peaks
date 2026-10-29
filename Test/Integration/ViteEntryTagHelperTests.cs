using System.Collections.Generic;
using System.IO;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Configuration;
using Xunit;
using Moq;
using Keas.Mvc.TagHelpers;

namespace Test.Integration
{
    public class ViteEntryTagHelperTests
    {
        [Fact]
        public void DevelopmentEntriesShareOneRefreshRuntime()
        {
            var view = new ViewContext { HttpContext = new DefaultHttpContext() };
            Assert.Equal("", Render("src/shell.tsx", "Development", true, null, view, stylesOnly: true));
            var first = Render("src/shell.tsx", "Development", true, null, view, react: true);
            var second = Render("src/page.tsx", "Development", true, null, view, react: true);
            Assert.Contains("@react-refresh", first);
            Assert.Contains("@vite/client", first);
            Assert.Contains("http://localhost:5179/src/page.tsx", second);
            Assert.DoesNotContain("@react-refresh", second);
            Assert.DoesNotContain("@vite/client", second);
        }

        [Fact]
        public void DevelopmentStylesLoadBeforeModulesAndAreNotDuplicated()
        {
            var view = new ViewContext { HttpContext = new DefaultHttpContext() };
            view.HttpContext.Request.PathBase = "/peaks";
            var styles = Render("src/index.tsx", "Development", true, null, view,
                stylesOnly: true, devStylesheet: "/src/styles/main.css", devServerUrl: "http://localhost:5190/");
            Assert.Contains("rel=\"stylesheet\"", styles);
            Assert.Contains("href=\"http://localhost:5190/src/styles/main.css?direct\"", styles);
            Assert.DoesNotContain("<script", styles);
            Assert.Equal("", Render("src/other.tsx", "Development", true, null, view,
                stylesOnly: true, devStylesheet: "src/styles/main.css", devServerUrl: "http://localhost:5190"));

            var scripts = Render("src/index.tsx", "Development", true, null, view,
                react: true, devServerUrl: "http://localhost:5190");
            Assert.Contains("http://localhost:5190/src/index.tsx", scripts);
            Assert.Contains("@vite/client", scripts);
            Assert.Contains("@react-refresh", scripts);
            Assert.DoesNotContain("<link", scripts);
        }

        [Theory]
        [InlineData("Production", true)]
        [InlineData("Staging", true)]
        [InlineData("Development", false)]
        public void BuiltEntriesIncludeTransitiveCssAndNeverDevServer(string environment, bool enabled)
        {
            var root = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            Directory.CreateDirectory(Path.Combine(root, "vite", ".vite"));
            try
            {
                File.WriteAllText(Path.Combine(root, "vite", ".vite", "manifest.json"),
                    "{\"src/page.tsx\":{\"file\":\"assets/page-123.js\",\"css\":[\"assets/page-123.css\"],\"imports\":[\"shared\"]}," +
                    "\"shared\":{\"file\":\"assets/shared.js\",\"css\":[\"assets/shared.css\"],\"imports\":[\"nested\"]}," +
                    "\"nested\":{\"file\":\"assets/nested.js\",\"css\":[\"assets/nested.css\"]}}");
                var view = new ViewContext { HttpContext = new DefaultHttpContext() };
                view.HttpContext.Request.PathBase = "/peaks";
                var styles = Render("src/page.tsx", environment, enabled, root, view, stylesOnly: true,
                    devStylesheet: "src/styles/main.css");
                Assert.DoesNotContain("<script", styles);
                Assert.Contains("rel=\"stylesheet\"", styles);
                Assert.Equal("", Render("src/page.tsx", environment, enabled, root, view, stylesOnly: true));
                var html = Render("src/page.tsx", environment, enabled, root, view);
                Assert.Contains("/peaks/vite/assets/page-123.js", html);
                Assert.Contains("/peaks/vite/assets/page-123.css", styles);
                Assert.Contains("/peaks/vite/assets/shared.css", styles);
                Assert.Contains("/peaks/vite/assets/nested.css", styles);
                Assert.DoesNotContain("localhost", styles);
                Assert.DoesNotContain("?direct", styles);
                Assert.DoesNotContain("localhost", html);
                Assert.DoesNotContain("@vite", html);
                Assert.Equal("", Render("src/page.tsx", environment, enabled, root, view));
            }
            finally { Directory.Delete(root, recursive: true); }
        }

        private static string Render(string entry, string environment, bool enabled, string root, ViewContext view,
            bool react = false, bool stylesOnly = false, string devStylesheet = null, string devServerUrl = "http://localhost:5179")
        {
            var host = new Mock<IWebHostEnvironment>();
            host.SetupGet(x => x.EnvironmentName).Returns(environment);
            host.SetupGet(x => x.WebRootPath).Returns(root);
            var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string>
            {
                ["Vite:UseDevServer"] = enabled.ToString(),
                ["Vite:DevServerUrl"] = devServerUrl
            }).Build();
            var helper = new ViteEntryTagHelper(host.Object, config)
            {
                Src = entry, ViewContext = view, React = react, StylesOnly = stylesOnly, DevStylesheet = devStylesheet
            };
            var context = new TagHelperContext(new TagHelperAttributeList(), new Dictionary<object, object>(), "test");
            var output = new TagHelperOutput("vite-entry", new TagHelperAttributeList(),
                (_, _) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));
            helper.Process(context, output);
            using var writer = new StringWriter();
            output.WriteTo(writer, HtmlEncoder.Default);
            return writer.ToString();
        }
    }
}
