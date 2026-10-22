using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Keas.Mvc.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Xunit;

namespace Test.Integration
{
    public class HeroIconTagHelperTests
    {
        [Fact]
        public void DecorativeIconsRenderInlineAndPreserveTooltipTargetsAndAnimation()
        {
            var output = Render(new HeroIconTagHelper { Name = "arrow-path" },
                new TagHelperAttribute("id", "loading-tooltip"),
                new TagHelperAttribute("class", "size-6 animate-spin"));
            Assert.Equal("svg", output.TagName);
            Assert.Equal("loading-tooltip", output.Attributes["id"].Value);
            Assert.Equal("hero-icon size-6 animate-spin", output.Attributes["class"].Value);
            Assert.Equal("true", output.Attributes["aria-hidden"].Value);
            Assert.Equal("false", output.Attributes["focusable"].Value);
            Assert.Equal("currentColor", output.Attributes["stroke"].Value);
            Assert.Contains("<path", output.Content.GetContent());
            Assert.DoesNotContain("<use", output.Content.GetContent());
            Assert.False(output.Attributes.ContainsName("name"));
        }

        [Fact]
        public void NamedIconsHaveAnEncodedAccessibleLabel()
        {
            var output = Render(new HeroIconTagHelper { Name = "users", Label = "People & teams" },
                new TagHelperAttribute("aria-hidden", "true"));
            Assert.False(output.Attributes.ContainsName("aria-hidden"));
            Assert.Equal("img", output.Attributes["role"].Value);
            using var writer = new StringWriter();
            output.WriteTo(writer, HtmlEncoder.Default);
            Assert.Contains("aria-label=\"People &amp; teams\"", writer.ToString());
        }

        [Fact]
        public void UnknownIconsFailRatherThanRenderingAnEmptyGlyph()
        {
            Assert.Throws<ArgumentException>(() => Render(new HeroIconTagHelper { Name = "unknown-icon" }));
        }

        private static TagHelperOutput Render(HeroIconTagHelper helper, params TagHelperAttribute[] attributes)
        {
            var context = new TagHelperContext(new TagHelperAttributeList(), new Dictionary<object, object>(), "test");
            var output = new TagHelperOutput("hero-icon", new TagHelperAttributeList(attributes),
                (_, _) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));
            helper.Process(context, output);
            return output;
        }
    }
}
