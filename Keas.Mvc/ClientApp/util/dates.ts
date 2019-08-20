import { format, min } from "date-fns";
import { IHasExpiration } from "../Types";

export class DateUtil {
    public static formatExpiration(expiration: Date) {
        if (expiration === null) {
            return "";
        }
        return format(new Date(expiration), "MM/DD/YYYY");
    }

    public static formatAssignmentExpiration(assignment: IHasExpiration) {
        if (!assignment || !assignment.expiresAt) {
            return "";
        }
        return format(new Date(assignment.expiresAt), "MM/DD/YYYY");
    }

    public static formatFirstExpiration(expirations: Date[]) {
        if (expirations.length === 0) {
            return "";
        }
        const dates = expirations.map(x => new Date(x));
        return format(min(dates), "MM/DD/YYYY");
    }

    public static getFirstExpiration(expirations: Date[]) {
        if (expirations.length === 0) {
            return "";
        }
        const dates = expirations.map(x => new Date(x));
        return min(dates);
    }
}
