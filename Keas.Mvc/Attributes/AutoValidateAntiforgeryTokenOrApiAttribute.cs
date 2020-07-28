using System;
using Keas.Mvc.Handlers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace Keas.Mvc.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class AutoValidateAntiforgeryTokenOrApiAttribute : Attribute, IFilterFactory, IOrderedFilter
    {
        public int Order { get; set; } = 1000;

        /// <inheritdoc />
        public bool IsReusable => true;

        /// <inheritdoc />
        public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
        {
            return serviceProvider.GetRequiredService<AutoValidateAntiforgeryTokenOrApiAuthorizationFilter>();
        }
    }
}
