import { format, min } from 'date-fns';
import { IHasExpiration } from '../models/Shared';

export class DateUtil {
  public static formatDate(date: Date, convertToPST: boolean = false): string {
    if (date === null) {
      return '';
    }

    let dateToFormat = new Date(date);
    if (convertToPST) {
      // Convert from UTC to PST (UTC-8)
      dateToFormat = new Date(dateToFormat.getTime() - 8 * 60 * 60 * 1000);
    }

    return format(dateToFormat, 'MM/dd/yyyy');
  }

  public static formatExpiration(expiration: Date): string {
    if (expiration === null) {
      return '';
    }
    return format(new Date(expiration), 'MM/dd/yyyy');
  }

  public static formatAssignmentExpiration(assignment: IHasExpiration): string {
    if (!assignment || !assignment.expiresAt) {
      return '';
    }
    return format(new Date(assignment.expiresAt), 'MM/dd/yyyy');
  }

  public static formatFirstExpiration(expirations: Date[]): string {
    if (expirations.length === 0) {
      return '';
    }
    const dates = expirations.map(x => new Date(x));
    return format(min(dates), 'MM/dd/yyyy');
  }

  public static getFirstExpiration(expirations: Date[]): Date | string {
    if (expirations.length === 0) {
      return '';
    }
    const dates = expirations.map(x => new Date(x));
    return min(dates);
  }
}
