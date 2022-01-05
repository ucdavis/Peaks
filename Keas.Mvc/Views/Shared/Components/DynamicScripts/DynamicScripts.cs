using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

namespace Harvest.Web.Views.Shared.Components.DynamicScripts
{
    [ViewComponent(Name = "DynamicScripts")]
    public class DynamicScripts : ViewComponent
    {
        private readonly IFileProvider _fileProvider;

        public DynamicScripts(IFileProvider fileProvider)
        {
            this._fileProvider = fileProvider;
        }
        public async Task<IViewComponentResult> InvokeAsync()
        {
            // Get the CRA generated index file, which includes optimized scripts
            var indexPage = _fileProvider.GetFileInfo("ClientApp/build/index.html");

            // read the file
            var fileContents = await File.ReadAllTextAsync(indexPage.PhysicalPath);

            // find all script tags
            var scriptTags = Regex.Matches(fileContents, "<script.*?</script>", RegexOptions.Singleline);

            // get the script tags as strings
            var scriptTagsAsStrings = scriptTags.Select(m => m.Value).ToArray();

            var model = new DynamicScriptModel { Scripts = scriptTagsAsStrings };

            return View(model);
        }
    }

    public class DynamicScriptModel
    {
        public string[] Scripts { get; set; }
    }
}