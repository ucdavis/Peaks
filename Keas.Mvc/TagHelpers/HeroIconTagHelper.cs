using System;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Keas.Mvc.TagHelpers
{
    [HtmlTargetElement("hero-icon", Attributes = "name")]
    public class HeroIconTagHelper : TagHelper
    {
        public string Name { get; set; }
        public string Label { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            if (!HeroIconPaths.All.TryGetValue(Name, out var paths))
                throw new ArgumentException($"Unknown Heroicon: {Name}", nameof(Name));

            output.TagName = "svg";
            output.TagMode = TagMode.StartTagAndEndTag;
            output.Attributes.RemoveAll("name");
            output.Attributes.RemoveAll("label");
            var classes = output.Attributes["class"]?.Value?.ToString();
            output.Attributes.SetAttribute("class", $"hero-icon {classes}".Trim());
            output.Attributes.SetAttribute("data-icon", Name);
            output.Attributes.SetAttribute("xmlns", "http://www.w3.org/2000/svg");
            output.Attributes.SetAttribute("viewBox", "0 0 24 24");
            output.Attributes.SetAttribute("fill", "none");
            output.Attributes.SetAttribute("stroke", "currentColor");
            output.Attributes.SetAttribute("stroke-width", "1.5");
            output.Attributes.SetAttribute("focusable", "false");
            if (string.IsNullOrWhiteSpace(Label))
            {
                output.Attributes.SetAttribute("aria-hidden", "true");
            }
            else
            {
                output.Attributes.RemoveAll("aria-hidden");
                output.Attributes.SetAttribute("role", "img");
                output.Attributes.SetAttribute("aria-label", Label);
            }
            output.Content.SetHtmlContent(paths);
        }
    }
}
