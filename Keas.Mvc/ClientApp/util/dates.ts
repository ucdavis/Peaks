import { format, min } from 'date-fns';
import { IHasExpiration } from '../models/Shared';

export class DateUtil {
  public static formatExpiration(expiration: Date) {
    if (expiration === null) {
      return '';
    }
    return format(new Date(expiration), 'MM/dd/yyyy');
  }

  public static formatAssignmentExpiration(assignment: IHasExpiration) {
    if (!assignment || !assignment.expiresAt) {
      return '';
    }
    return format(new Date(assignment.expiresAt), 'MM/dd/yyyy');
  }

  public static formatFirstExpiration(expirations: Date[]) {
    if (expirations.length === 0) {
      return '';
    }
    const dates = expirations.map(x => new Date(x));
    return format(min(dates), 'MM/dd/yyyy');
  }

  public static getFirstExpiration(expirations: Date[]) {
    if (expirations.length === 0) {
      return '';
    }
    const dates = expirations.map(x => new Date(x));
    return min(dates);
  }
}
