using System;
using System.Collections.Generic;
using System.Text;

namespace Keas.Core.Extensions
{
    public static class DateTimeExtensions
    {
        private static TimeZoneInfo GetPacificTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById("America/Los_Angeles");
            }
        }

        public static DateTime? ToPacificTime(this DateTime? dateTime)
        {
            return dateTime.HasValue ? dateTime.Value.ToPacificTime() : (DateTime?)null;
        }

        public static DateTime ToPacificTime(this DateTime dateTime)
        {
            return TimeZoneInfo.ConvertTime(dateTime, TimeZoneInfo.Utc, GetPacificTimeZone());
        }

        public static DateTime FromPacificTime(this DateTime dateTime)
        {
            return TimeZoneInfo.ConvertTime(dateTime, GetPacificTimeZone(), TimeZoneInfo.Utc);
        }

        public static string Format(this DateTime? dateTime, string format = "g")
        {
            return dateTime?.ToString(format);
        }
        public static string Format(this DateTime dateTime, string format = "g")
        {
            return dateTime.ToString(format);
        }

        /// <summary>
        /// Compares the date against 1 (after) or 2 (between) dates.
        /// </summary>
        /// <param name="dateTime"></param>
        /// <param name="start">The starting date time</param>
        /// <param name="end">(Optional) The ending date time</param>
        /// <param name="dateInclusion">Inclusion or exclusion of start/end date.  Default is Inclusive if null.</param>
        /// <param name="timeZone">Timezone to convert all dates to.  (If used, ensure all dates are in utc)</param>
        /// <param name="dateOnly">Compare date only</param>
        /// <returns></returns>
        public static bool Between(this DateTime dateTime, DateTime start, DateTime? end, DateInclusion dateInclusion, TimeZoneInfo timeZone = null, bool dateOnly = false)
        {
            if (timeZone != null)
            {
                dateTime = TimeZoneInfo.ConvertTime(dateTime, timeZone);
                start = TimeZoneInfo.ConvertTime(start, timeZone);
                if (end.HasValue) end = TimeZoneInfo.ConvertTime(end.Value, timeZone);
            }

            bool begin, tail = true;

            switch (dateInclusion)
            {
                case DateInclusion.Inclusive:
                    if (dateOnly)
                    {
                        begin = dateTime.Date >= start.Date;
                        if (end.HasValue) tail = dateTime.Date <= end.Value.Date;
                    }
                    else
                    {
                        begin = dateTime >= start;
                        if (end.HasValue) tail = dateTime <= end.Value;
                    }

                    break;
                case DateInclusion.Exclusive:
                    if (dateOnly)
                    {
                        begin = dateTime.Date > start.Date;
                        if (end.HasValue) tail = dateTime.Date < end.Value.Date;
                    }
                    else
                    {
                        begin = dateTime > start;
                        if (end.HasValue) tail = dateTime < end.Value;
                    }
                    break;
                case DateInclusion.InclusiveStart:
                    if (dateOnly)
                    {
                        begin = dateTime.Date >= start.Date;
                        if (end.HasValue) tail = dateTime.Date < end.Value.Date;
                    }
                    else
                    {
                        begin = dateTime >= start;
                        if (end.HasValue) tail = dateTime < end.Value;
                    }
                    break;
                case DateInclusion.InclusiveEnd:
                    if (dateOnly)
                    {
                        begin = dateTime.Date > start.Date;
                        if (end.HasValue) tail = dateTime.Date <= end.Value.Date;
                    }
                    else
                    {
                        begin = dateTime > start;
                        if (end.HasValue) tail = dateTime <= end.Value;
                    }
                    break;
                default:
                    if (dateOnly)
                    {
                        begin = dateTime.Date >= start.Date;
                        if (end.HasValue) tail = dateTime.Date <= end.Value.Date;
                    }
                    else
                    {
                        begin = dateTime >= start;
                        if (end.HasValue) tail = dateTime <= end.Value;
                    }
                    break;
            }

            return begin && tail;
        }
    }

    public enum DateInclusion { Inclusive, Exclusive, InclusiveStart, InclusiveEnd }
}
