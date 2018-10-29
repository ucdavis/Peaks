using System;
using System.Collections.Generic;
using System.Text;
using Humanizer;

namespace Keas.Core.Extensions
{
    public static class StringExtensions
    {
        public static string SafeHumanizeTitle(this string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return value;
            }

            return value.ToLower().Humanize(LetterCasing.Title); //Lower it so all caps gets changed
        }
    }
}
