import { format, min } from 'date-fns';
import { IHasExpiration } from '../models/Shared';

export class DateUtil {
  public static formatDate(date: Date): string {
    if (date === null) {
      return '';
    }

    return format(new Date(date), 'MM/dd/yyyy');
  }

  public static formatDateFromUtc(date: Date): string {
    if (date === null) {
      return '';
    }

    let str = date.toString();
    if (!str.endsWith('Z')) {
      str += 'Z';
    }

    return format(
      new Date(str).toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles'
      }),
      'MM/dd/yyyy'
    );
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
