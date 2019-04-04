using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Keas.Mvc.Models.ReportModels;

namespace Keas.Mvc.Extensions
{
    public static class AttributeReportExtensions
    {
        public static string Beautiful(this AttributeReportModel[] value)
        {
            if (value == null || value.Length <= 0)
            {
                return string.Empty;
            }

            var rtValue = new StringBuilder();
            foreach (var attributeReportModel in value)
            {
                rtValue.AppendLine($"(Key: {attributeReportModel.Key} Value: {attributeReportModel.Value}) ");
            }

            return rtValue.ToString();
        }
    }
}
