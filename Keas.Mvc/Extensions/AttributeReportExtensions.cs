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

            var rtValue = new List<string>();
            foreach (var attributeReportModel in value)
            {
                rtValue.Add($"{attributeReportModel.Key}={attributeReportModel.Value}");
            }

            return string.Join(',', rtValue);
        }

        public static string SafeKey(this AttributeReportModel[] value, int index)
        {
            if (value == null || value.Length <= index)
            {
                return string.Empty;
            }

            return value[index].Key;
        }
        public static string SafeValue(this AttributeReportModel[] value, int index)
        {
            if (value == null || value.Length <= index)
            {
                return string.Empty;
            }

            return value[index].Value;
        }
        public static string Beautiful(this AttributeReportModel[] value, int startIndex)
        {
            if (value == null || value.Length <= startIndex)
            {
                return string.Empty;
            }

            var rtValue = new List<string>();
            for (int i = startIndex; i < value.Length; i++)
            {
                rtValue.Add($"{value[i].Key}={value[i].Value}");
            }

            return string.Join(',', rtValue);
        }
    }
}
