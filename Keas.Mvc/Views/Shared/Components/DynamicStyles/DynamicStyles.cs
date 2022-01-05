using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

namespace Harvest.Web.Views.Shared.Components.DynamicStyles
{
    [ViewComponent(Name = "DynamicStyles")]
    public class DynamicStyles : ViewComponent
    {
        private readonly IFileProvider _fileProvider;

        public DynamicStyles(IFileProvider fileProvider)
        {
            this._fileProvider = fileProvider;
        }
        public async Task<IViewComponentResult> InvokeAsync()
        {
            // Get the CRA generated index file, which includes optimized scripts
            var indexPage = _fileProvider.GetFileInfo("ClientApp/build/index.html");

            // read the file
            var fileContents = await File.ReadAllTextAsync(indexPage.PhysicalPath);

            // find all link tags with the rel attribute set to stylesheet
            var linkTags = Regex.Matches(fileContents, "<link.*?>", RegexOptions.IgnoreCase);

            // make an array with just the stylesheet links
            var styleLinksAsStrings = linkTags.Where(m => m.Value.Contains("rel=\"stylesheet\""))
                .Select(m => m.Value)
                .ToArray();

            return View(styleLinksAsStrings);
        }
    }
}