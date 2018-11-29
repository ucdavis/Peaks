using System;
using System.Collections.Generic;
using System.Text;
using Humanizer;
using PhoneNumbers;

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
        public static string FormatPhone(this string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
            var phoneNumberUtil = PhoneNumbers.PhoneNumberUtil.GetInstance();
            var phoneNumber = phoneNumberUtil.ParseAndKeepRawInput(value, "US");
            var phone = phoneNumberUtil.Format(phoneNumber, PhoneNumberFormat.NATIONAL);
            if (!phoneNumberUtil.IsValidNumberForRegion(phoneNumber, "US"))
            {
                if (phoneNumberUtil.IsValidNumber(phoneNumber))
                {
                    return phoneNumberUtil.Format(phoneNumber, PhoneNumberFormat.INTERNATIONAL);
                }

                return phoneNumber.RawInput;
            }

            return phone;
        }
    }
}
